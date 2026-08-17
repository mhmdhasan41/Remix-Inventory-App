import { Material, InventoryTransaction, AuditLog, AppSettings, SystemUser, GeneratorLogEntry } from '../types';
import { db, isFirebaseAvailable, auth } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  const stringifiedErr = JSON.stringify(errInfo);

  throw new Error(stringifiedErr);
}

type DataChangeListener = () => void;
const changeListeners = new Set<DataChangeListener>();

let settingsUnsubscribe: (() => void) | null = null;
let materialsUnsubscribe: (() => void) | null = null;
let transactionsUnsubscribe: (() => void) | null = null;
let auditLogsUnsubscribe: (() => void) | null = null;
let usersUnsubscribe: (() => void) | null = null;

const STORAGE_KEYS = {
  MATERIALS: 'remix_materials_v1',
  PESTICIDES: 'remix_pesticides_v1',
  TRANSACTIONS: 'remix_transactions_v1',
  AUDIT_LOGS: 'remix_audit_logs_v1',
  SETTINGS: 'remix_settings_v1',
  USERS: 'remix_users_v1',
  GENERATOR_LOGS: 'remix_generator_logs_v1',
  IS_LOGGED_IN: 'remix_is_logged_in',
  CURRENT_USER: 'remix_current_user_v1',
};

const DEFAULT_SETTINGS: AppSettings = {
  organizationName: 'مكتب صحة البيئة - خان يونس',
  departmentName: 'دائرة البنى التحتية والتخطيط والتطوير',
  expiryWarningThresholdDays: 90,
  categories: [
    { name: 'مبيدات حشرية', prefix: 'PES', startRange: 1000, endRange: 1999 },
    { name: 'معقمات ومطهرات', prefix: 'SAN', startRange: 2000, endRange: 2999 },
    { name: 'أدوات ومعدات رش', prefix: 'EQP', startRange: 3000, endRange: 3999 },
    { name: 'مصائد قوارض', prefix: 'TRP', startRange: 4000, endRange: 4999 },
    { name: 'كلور ومواد كيميائية', prefix: 'CHM', startRange: 5000, endRange: 5999 }
  ],
  units: ['لتر', 'كجم', 'قطعة', 'علبة', 'جالون'],
  storehouses: ['المخزن الرئيسي', 'مستودع السموم والمبيدات', 'مستودع الأجهزة والمعدات', 'مستودع طعوم القوارض', 'مخزن أدوات السلامة', 'مخزن ب'],
  cloudSyncEnabled: true,
  storekeeperName: 'م. أحمد خالد',
  systemManagerName: 'م. محمود علي',
  healthDirectorName: 'د. سامي حسن',
  showStorekeeperSignature: true,
  showSystemManagerSignature: true,
  showHealthDirectorSignature: true,
  transactionCounters: { inbound: 0, outbound: 0, consumed: 0 },
  partners: [
    { id: 'part-1', name: 'شركة توريد الكيماويات الفلسطينية', type: 'مورد', phone: '0599000111', notes: 'شركة توريد رئيسية للمواد الكيميائية والمطهرات الكيميائية' },
    { id: 'part-2', name: 'منظمة اليونيسيف العالمية', type: 'مورد', notes: 'جهة دولية مانحة وموردة للمستلزمات الطبية والبيئية ومعقمات المياه ومحطات التحلية' },
    { id: 'part-3', name: 'مخازن الأمانة للمبيدات', type: 'مورد', phone: '0599000222', notes: 'شريك محلي لتوريد مبيدات الصحة العامة ومكافحة القوارض والحشرات' },
    { id: 'part-4', name: 'مصلحة مياه بلديات الساحل', type: 'جهة مستلمة', notes: 'الشريك الاستراتيجي لتعقيم وضبط جودة آبار ومحطات مياه الشرب' },
    { id: 'part-5', name: 'الهلال الأحمر الفلسطيني', type: 'جهة مستلمة', notes: 'الشريك الإنساني لتوزيع معقمات ومواد الإغاثة الصحية والبيئية' },
    { id: 'part-6', name: 'الجمعية الزراعية للتنمية والري', type: 'جهة مستلمة', notes: 'حملات الوقاية ومكافحة الآفات الزراعية والرش المشترك للبرك العشوائية' }
  ]
};

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'u-1',
    username: 'admin@system.com',
    fullName: 'أحمد المحاسب',
    role: 'مدير النظام',
    permissions: [
      'dashboard_view',
      'materials_view',
      'materials_create',
      'materials_edit',
      'materials_delete',
      'transactions_view',
      'transactions_create',
      'transactions_delete',
      'reports_view',
      'reports_export',
      'reports_print',
      'audit_view',
      'generator_log',
      'settings_view',
      'settings_edit',
      'users_manage',
      'system_reset'
    ],
    createdAt: '2026-06-20T08:00:00Z',
  },
  {
    id: 'u-2',
    username: 'keeper@system.com',
    fullName: 'محمد أمين المخزن',
    role: 'أمين مستودع',
    permissions: [
      'dashboard_view',
      'materials_view',
      'materials_create',
      'materials_edit',
      'transactions_view',
      'transactions_create',
      'reports_view',
      'reports_print'
    ],
    createdAt: '2026-06-20T08:15:00Z',
  },
  {
    id: 'u-3',
    username: 'auditor@system.com',
    fullName: 'سارة المدققة',
    role: 'مدقق حسابات',
    permissions: [
      'dashboard_view',
      'materials_view',
      'transactions_view',
      'reports_view',
      'reports_export',
      'reports_print',
      'audit_view',
      'settings_view'
    ],
    createdAt: '2026-06-20T08:20:00Z',
  }
];

// Initial realistic seed data if localStorage is empty
const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    code: 'MAT-001',
    name: 'كلور بودرة 65%',
    category: 'كلور ومواد كيميائية',
    unit: 'كجم',
    minimumStock: 150,
    currentStock: 0, // calculated from transactions
    storageLocation: 'المخزن الرئيسي - الرف أ',
    notes: 'مادة معقمة مخصصة لآبار ومياه الشرب والتعقيم البيئي',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-06-15T12:00:00Z',
    type: 'مادة',
  },
  {
    id: 'mat-2',
    code: 'MAT-002',
    name: 'صابون سائل طبي للتعقيم',
    category: 'معقمات ومطهرات',
    unit: 'لتر',
    minimumStock: 50,
    currentStock: 0,
    storageLocation: 'مخزن ب - قسم المطهرات',
    notes: 'معقم أيدي طبي للمرافق الصحية والفرق الميدانية',
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-06-12T10:00:00Z',
    type: 'مادة',
  },
  {
    id: 'mat-3',
    code: 'MAT-003',
    name: 'أقراص تعقيم مياه NaDCC',
    category: 'كلور ومواد كيميائية',
    unit: 'علبة',
    minimumStock: 100,
    currentStock: 0,
    storageLocation: 'المخزن الرئيسي - الرف ب',
    notes: 'تستخدم في حالات الطوارئ لتعقيم المياه السريع من مسببات الأمراض',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-05-20T08:00:00Z',
    type: 'مادة',
  },
  {
    id: 'mat-4',
    code: 'MAT-004',
    name: 'خرطوم رش ضغط عالي 15 متر',
    category: 'أدوات ومعدات رش',
    unit: 'قطعة',
    minimumStock: 5,
    currentStock: 0,
    storageLocation: 'مستودع الأجهزة والمعدات',
    notes: 'متوافق مع مضخات الديزل وبخاخات الرش الكبيرة',
    createdAt: '2026-04-10T11:00:00Z',
    updatedAt: '2026-04-10T11:00:00Z',
    type: 'مادة',
  },
  {
    id: 'mat-5',
    code: 'MAT-005',
    name: 'بدلات واقية كيميائية كاملة',
    category: 'أدوات ومعدات رش',
    unit: 'قطعة',
    minimumStock: 20,
    currentStock: 0,
    storageLocation: 'مخزن أدوات السلامة',
    notes: 'معدات وقاية شخصية لفرق رش المبيدات والكلور',
    createdAt: '2026-01-20T14:00:00Z',
    updatedAt: '2026-06-18T09:00:00Z',
    type: 'مادة',
  }
];


const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  // MAT-001 (Chlorine Powder) transactions
  {
    id: 'tr-1',
    date: '2026-01-12',
    itemType: 'مادة',
    itemId: 'mat-1',
    itemCode: 'MAT-001',
    itemName: 'كلور بودرة 65%',
    transactionType: 'وارد',
    quantity: 500,
    stockBefore: 0,
    stockAfter: 500,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'شركة توريد الكيماويات الفلسطينية',
    notes: 'حصة الربع الأول المخصصة لتطهير الآبار',
    createdAt: '2026-01-12T08:30:00Z',
    updatedAt: '2026-01-12T08:30:00Z',
  },
  {
    id: 'tr-2',
    date: '2026-03-15',
    itemType: 'مادة',
    itemId: 'mat-1',
    itemCode: 'MAT-001',
    itemName: 'كلور بودرة 65%',
    transactionType: 'مستهلك',
    quantity: 250,
    stockBefore: 500,
    stockAfter: 250,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'حملة تعقيم آبار منطقة المعسكر وبني سهيلا',
    notes: 'استهلاك لتطهير شبكات ومحطات المياه الفرعية',
    createdAt: '2026-03-15T13:00:00Z',
    updatedAt: '2026-03-15T13:00:00Z',
  },
  {
    id: 'tr-3',
    date: '2026-06-15',
    itemType: 'مادة',
    itemId: 'mat-1',
    itemCode: 'MAT-001',
    itemName: 'كلور بودرة 65%',
    transactionType: 'وارد',
    quantity: 150,
    stockBefore: 250,
    stockAfter: 400,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'مصلحة مياه بلديات الساحل',
    notes: 'توريد حرج لمكافحة التلوث الحاصل بالشبكة العامة',
    createdAt: '2026-06-15T12:00:00Z',
    updatedAt: '2026-06-15T12:00:00Z',
  },
  {
    id: 'tr-4',
    date: '2026-06-18',
    itemType: 'مادة',
    itemId: 'mat-1',
    itemCode: 'MAT-001',
    itemName: 'كلور بودرة 65%',
    transactionType: 'صادر',
    quantity: 300,
    stockBefore: 400,
    stockAfter: 100, // Now below minimumStock (150)
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'قسم المياه وصحة البيئة',
    notes: 'صرف طارئ للبلدية لتوزيع أقراص رملية وكلور سائل على الأحياء الشرقية والمخيم',
    createdAt: '2026-06-18T14:30:00Z',
    updatedAt: '2026-06-18T14:30:00Z',
  },

  // MAT-002 (Soap) transactions
  {
    id: 'tr-5',
    date: '2026-02-18',
    itemType: 'مادة',
    itemId: 'mat-2',
    itemCode: 'MAT-002',
    itemName: 'صابون سائل طبي للتعقيم',
    transactionType: 'وارد',
    quantity: 120,
    stockBefore: 0,
    stockAfter: 120,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'الهلال الأحمر الفلسطيني',
    notes: 'تسهيل ومساعدة مجتمعية لمكاتب وفرق الرش والوقاية',
    createdAt: '2026-02-18T09:40:00Z',
    updatedAt: '2026-02-18T09:40:00Z',
  },
  {
    id: 'tr-6',
    date: '2026-06-12',
    itemType: 'مادة',
    itemId: 'mat-2',
    itemCode: 'MAT-002',
    itemName: 'صابون سائل طبي للتعقيم',
    transactionType: 'صادر',
    quantity: 80,
    stockBefore: 120,
    stockAfter: 40, // Below minimum (50)
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'عيادة الصحة العامة والبيئية المتنقلة',
    notes: 'تأمين سلامة الكادر الطبي الميداني للفرق البيئية',
    createdAt: '2026-06-12T10:00:00Z',
    updatedAt: '2026-06-12T10:00:00Z',
  },

  // MAT-003 NaDCC
  {
    id: 'tr-7',
    date: '2026-03-05',
    itemType: 'مادة',
    itemId: 'mat-3',
    itemCode: 'MAT-003',
    itemName: 'أقراص تعقيم مياه NaDCC',
    transactionType: 'وارد',
    quantity: 300,
    stockBefore: 0,
    stockAfter: 300,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'منظمة اليونيسيف العالمية',
    notes: 'شحنة إمدادات الصيف للمياه والوقاية البيئية',
    createdAt: '2026-03-05T10:00:00Z',
    updatedAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 'tr-8',
    date: '2026-05-20',
    itemType: 'مادة',
    itemId: 'mat-3',
    itemCode: 'MAT-003',
    itemName: 'أقراص تعقيم مياه NaDCC',
    transactionType: 'مستهلك',
    quantity: 150,
    stockBefore: 300,
    stockAfter: 150,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'لجنة حماية الآبار الأهلية والبلدية',
    notes: 'توزيع أقراص للمواطنين لتنقية وتطهير الآبار السطحية ومياه الخزانات',
    createdAt: '2026-05-20T08:00:00Z',
    updatedAt: '2026-05-20T08:00:00Z',
  },

  // PES-001 (Deltamethrin) transactions
  {
    id: 'tr-9',
    date: '2026-01-08',
    itemType: 'مبيد',
    itemId: 'pes-1',
    itemCode: 'PES-001',
    itemName: 'دلتامثرين 2.5% مستحلب مركز',
    transactionType: 'وارد',
    quantity: 200,
    stockBefore: 0,
    stockAfter: 200,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'شركة المجد العالمية للاستيراد والتصدير',
    notes: 'توريد دفعة ربيعية مبكرة مكافحة البعوض والحشرات الطائرة',
    createdAt: '2026-01-08T09:00:00Z',
    updatedAt: '2026-01-08T09:00:00Z',
  },
  {
    id: 'tr-10',
    date: '2026-04-14',
    itemType: 'مبيد',
    itemId: 'pes-1',
    itemCode: 'PES-001',
    itemName: 'دلتامثرين 2.5% مستحلب مركز',
    transactionType: 'مستهلك',
    quantity: 130,
    stockBefore: 200,
    stockAfter: 70, // Below minimum (80)
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'حملة مكافحة مكاب الأوساخ العشوائية ببلدة القرارة وحي الأمل',
    notes: 'استهلاك مكثف للرش الجوي الفضائي في المناطق السكنية المجاورة للمكاب',
    createdAt: '2026-04-14T11:00:00Z',
    updatedAt: '2026-04-14T11:00:00Z',
  },

  // PES-002 Cybermethrin (expired)
  {
    id: 'tr-11',
    date: '2026-01-15',
    itemType: 'مبيد',
    itemId: 'pes-2',
    itemCode: 'PES-002',
    itemName: 'سايبرمثرين 10% EC',
    transactionType: 'وارد',
    quantity: 50,
    stockBefore: 0,
    stockAfter: 50,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'مخازن الأمانة للمبيدات',
    notes: 'توريد قديم، متبقي منه كمية مع حذر انتهاء الصلاحية',
    createdAt: '2026-01-15T09:12:00Z',
    updatedAt: '2026-01-15T09:12:00Z',
  },

  // PES-003 Bromadiolone
  {
    id: 'tr-12',
    date: '2026-02-22',
    itemType: 'مبيد',
    itemId: 'pes-3',
    itemCode: 'PES-003',
    itemName: 'بروماديولون طعوم قوارض مقاوم للرطوبة',
    transactionType: 'وارد',
    quantity: 150,
    stockBefore: 0,
    stockAfter: 150,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'الجمعية الزراعية للتنمية والري',
    notes: 'طعوم قوارض عالية الجودة لمكافحة الآفات بمواسم الحصاد والصيف والمجازر',
    createdAt: '2026-02-22T10:15:00Z',
    updatedAt: '2026-02-22T10:15:00Z',
  },

  // MAT-004 Hose
  {
    id: 'tr-13',
    date: '2026-04-12',
    itemType: 'مادة',
    itemId: 'mat-4',
    itemCode: 'MAT-004',
    itemName: 'خرطوم رش ضغط عالي 15 متر',
    transactionType: 'وارد',
    quantity: 10,
    stockBefore: 0,
    stockAfter: 10,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'محلات القدس لمعدات الري والرش الأوتوماتيكي',
    notes: 'استلام عتاد وأدوات ميدانية للآليات والسيارات الخاصة بالدائرة',
    createdAt: '2026-04-12T11:00:00Z',
    updatedAt: '2026-04-12T11:00:00Z',
  },

  // MAT-005 Suit
  {
    id: 'tr-14',
    date: '2026-05-01',
    itemType: 'مادة',
    itemId: 'mat-5',
    itemCode: 'MAT-005',
    itemName: 'بدلات واقية كيميائية كاملة',
    transactionType: 'وارد',
    quantity: 30,
    stockBefore: 0,
    stockAfter: 30,
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'برنامج حماية العمال البيئيين التابع للأونروا',
    notes: 'تبرع ومعدات سلامة مهنية لفرق الاستجابة الطارئة',
    createdAt: '2026-05-01T14:00:00Z',
    updatedAt: '2026-05-01T14:00:00Z',
  },
  {
    id: 'tr-15',
    date: '2026-06-18',
    itemType: 'مادة',
    itemId: 'mat-5',
    itemCode: 'MAT-005',
    itemName: 'بدلات واقية كيميائية كاملة',
    transactionType: 'مستهلك',
    quantity: 12,
    stockBefore: 30,
    stockAfter: 18, // Below minimum (20)
    executedBy: 'أحمد المحاسب',
    supplierOrReceiver: 'قسم الوقاية ورش الأحياء والمبيد بالبلدية والقرارة وبني سهيلا',
    notes: 'تخصيص بدلات واقية جديدة للعمال بعد اهتراء البدلات السابقة لحرارة الأجواء وصعوبة البيئة',
    createdAt: '2026-06-18T09:00:00Z',
    updatedAt: '2026-06-18T09:00:00Z',
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'al-1',
    timestamp: '2026-06-20T08:00:00Z',
    user: 'أحمد المحاسب',
    action: 'تثبيت النظام',
    details: 'تمت تهيئة قاعدة البيانات والتثبيت الأولي للنظام وتفعيل مستويات الأمان',
    itemType: 'إعدادات',
  },
  {
    id: 'al-2',
    timestamp: '2026-06-20T08:30:00Z',
    user: 'أحمد المحاسب',
    action: 'شحن بيانات مرجعية',
    details: 'تم توريد ملفات التعريف الأساسية للمواد والمبيدات وبداية الأرصدة الافتتاحية للموسم',
    itemType: 'حركة',
  }
];

let firebaseOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    firebaseOnline = true;
    dataService.notify();
  });
  window.addEventListener('offline', () => {
    firebaseOnline = false;
    dataService.notify();
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timeout'));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Recursively removes all properties with 'undefined' value from an object
 * to prevent Firestore "unsupported field value: undefined" errors.
 */
function cleanUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  
  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      cleaned[key] = cleanUndefined(value);
    }
  }
  return cleaned;
}

/**
 * Safely writes a document to Firestore using Optimistic Concurrency Control (OCC).
 * It fetches the latest version of the document directly from the server first.
 * If the server document exists and has a newer updatedAt timestamp than the local version,
 * it skips the write to prevent overwriting newer concurrent updates during synchronization.
 */
async function saveDocWithOCC(collectionName: string, docId: string, localData: any): Promise<void> {
  if (!isFirebaseAvailable) return;
  
  const cleanedData = cleanUndefined(localData);
  
  // If the browser reports we are completely offline, don't block on getDoc, write directly to Firestore's offline queue
  if (!firebaseOnline) {

    await setDoc(doc(db, collectionName, docId), cleanedData);
    return;
  }
  
  try {
    const docRef = doc(db, collectionName, docId);
    // Fetch document with a strict 2-second timeout to prevent stalling if connectivity is poor or blocked
    const docSnap = await withTimeout(getDoc(docRef), 2000);
    
    if (docSnap.exists()) {
      const serverData = docSnap.data();
      const serverUpdatedAt = serverData.updatedAt || serverData.timestamp || serverData.createdAt;
      const localUpdatedAt = cleanedData.updatedAt || cleanedData.timestamp || cleanedData.createdAt;
      
      // If the server's update is newer than our local update, do not overwrite!
      if (serverUpdatedAt && localUpdatedAt && new Date(serverUpdatedAt) > new Date(localUpdatedAt)) {

        return;
      }
    }
    
    // Server document is older or doesn't exist, safe to write
    await setDoc(docRef, cleanedData);
    
    // Re-confirm we are online since the write or fetch succeeded
    if (!firebaseOnline) {
      firebaseOnline = true;
      dataService.notify();
    }
  } catch (err: any) {

    // If it's a timeout or network error, we are likely offline or experiencing network constraints
    if (err.message === 'Timeout' || !navigator.onLine) {
      if (firebaseOnline) {
        firebaseOnline = false;
        dataService.notify();
      }
    }
    // Fallback: write directly to keep in sync if getDoc fails or times out (e.g. offline queue)
    await setDoc(doc(db, collectionName, docId), cleanedData);
  }
}

export const dataService = {
  // DATA CHANGE SUBSCRIPTIONS
  subscribe: (listener: DataChangeListener) => {
    changeListeners.add(listener);
    return () => {
      changeListeners.delete(listener);
    };
  },

  notify: () => {
    changeListeners.forEach((listener) => {
      try {
        listener();
      } catch (_) {

      }
    });
  },

  // SETTINGS
  getSettings: (): AppSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(data);
      if (!parsed.storehouses || !Array.isArray(parsed.storehouses)) {
        parsed.storehouses = DEFAULT_SETTINGS.storehouses;
      }
      // Seamless migration for category configs (if array of strings, convert to objects)
      if (parsed.categories && Array.isArray(parsed.categories)) {
        parsed.categories = parsed.categories.map((cat: any, index: number) => {
          if (typeof cat === 'string') {
            const names = ['مبيدات حشرية', 'معقمات ومطهرات', 'أدوات ومعدات رش', 'مصائد قوارض', 'كلور ومواد كيميائية'];
            const idx = names.indexOf(cat);
            const prefix = idx !== -1 ? ['PES', 'SAN', 'EQP', 'TRP', 'CHM'][idx] : 'GEN';
            const startRange = idx !== -1 ? [1000, 2000, 3000, 4000, 5000][idx] : (index + 1) * 1000;
            return {
              name: cat,
              prefix,
              startRange,
              endRange: startRange + 999
            };
          }
          return cat;
        });
      } else {
        parsed.categories = DEFAULT_SETTINGS.categories;
      }

      // Sanitize organizationName and departmentName if they contain the deleted phrases
      const forbiddenPhrases = ['سلطة المياه والبيئة والبلديات', 'بلدية خان يونس'];
      let needsSave = false;

      // Always force cloudSyncEnabled to true as requested by the user to make cloud sync mandatory
      if (parsed.cloudSyncEnabled !== true) {
        parsed.cloudSyncEnabled = true;
        needsSave = true;
      }

      if (parsed.organizationName) {
        for (const phrase of forbiddenPhrases) {
          if (parsed.organizationName.includes(phrase)) {
            parsed.organizationName = DEFAULT_SETTINGS.organizationName;
            needsSave = true;
            break;
          }
        }
      } else {
        parsed.organizationName = DEFAULT_SETTINGS.organizationName;
        needsSave = true;
      }

      if (parsed.departmentName) {
        for (const phrase of forbiddenPhrases) {
          if (parsed.departmentName.includes(phrase)) {
            parsed.departmentName = DEFAULT_SETTINGS.departmentName;
            needsSave = true;
            break;
          }
        }
      } else {
        parsed.departmentName = DEFAULT_SETTINGS.departmentName;
        needsSave = true;
      }
      
      if (!parsed.transactionCounters) {
        parsed.transactionCounters = { inbound: 0, outbound: 0, consumed: 0 };
        needsSave = true;
      }

      if (!parsed.partners || !Array.isArray(parsed.partners)) {
        parsed.partners = DEFAULT_SETTINGS.partners || [];
        needsSave = true;
      }

      if (needsSave) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings: (settings: AppSettings) => {
    settings.cloudSyncEnabled = true; // Always force cloud sync to true as requested
    
    // Safety check: if settings is too large for Firestore, drop large image attachments to recover
    let settingsToSave = { ...settings };
    let stringified = JSON.stringify(settingsToSave);

    // Firestore limit is 1,048,576 bytes. JavaScript strings are UTF-16, so characters often map 1:1 or 1:2 to bytes for ASCII (Base64).
    // Let's use a safe threshold of ~950,000 characters to be well under the 1MB limit.
    const SIZE_LIMIT = 950000;
    
    if (stringified.length > SIZE_LIMIT) {
      if (settingsToSave.openingStockAttachments) {
        settingsToSave.openingStockAttachments = {};
        stringified = JSON.stringify(settingsToSave);
      }
    }

    if (stringified.length > SIZE_LIMIT) {
      if (settingsToSave.openingStockAttachment) {
        delete settingsToSave.openingStockAttachment;
        stringified = JSON.stringify(settingsToSave);
      }
    }

    if (stringified.length > SIZE_LIMIT) {
      if ((settingsToSave as any).logo) {
        (settingsToSave as any).logo = '';
        stringified = JSON.stringify(settingsToSave);
      }
    }

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settingsToSave));
    dataService.logAudit('تحديث الإعدادات', 'تم تحديث الإعدادات العامة للمنظمة وحقول التنبيه والتصنيفات', 'إعدادات');

    if (isFirebaseAvailable && settingsToSave.cloudSyncEnabled) {
      setDoc(doc(db, 'settings', 'app_config'), cleanUndefined(settingsToSave))
        .catch(() => {});
    }
    dataService.recordLocalWrite();
  },

  updateReferenceValues: (type: 'category' | 'unit' | 'storehouse', oldValue: string, newValue: string) => {
    const materials = dataService.getMaterials();
    materials.forEach(m => {
      if (type === 'category' && m.category === oldValue) { m.category = newValue; dataService.saveMaterial(m); }
      if (type === 'unit' && m.unit === oldValue) { m.unit = newValue; dataService.saveMaterial(m); }
      if (type === 'storehouse' && m.storageLocation === oldValue) { m.storageLocation = newValue; dataService.saveMaterial(m); }
    });

    const transactions = dataService.getTransactions();
    transactions.forEach(t => {
      if (type === 'category' && t.itemCategory === oldValue) { t.itemCategory = newValue; dataService.saveTransaction(t); }
      if (type === 'unit' && t.unit === oldValue) { t.unit = newValue; dataService.saveTransaction(t); }
    });
  },

  // MATERIALS
  getMaterials: (): Material[] => {
    let data = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    let items: Material[] = [];
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(INITIAL_MATERIALS));
      items = INITIAL_MATERIALS;
    } else {
      try {
        items = JSON.parse(data);
      } catch (e) {
        items = INITIAL_MATERIALS;
      }
    }

    // SILENT DATA MIGRATION: Merge old pesticides into standard items/materials
    const pData = localStorage.getItem(STORAGE_KEYS.PESTICIDES);
    if (pData) {
      try {
        const pesticidesList = JSON.parse(pData);
        if (Array.isArray(pesticidesList) && pesticidesList.length > 0) {
          let updated = false;
          pesticidesList.forEach((pes) => {
            const alreadyExists = items.some(item => item.code === pes.code || item.name === pes.name || item.id === pes.id);
            if (!alreadyExists) {
              items.push({
                id: pes.id,
                code: pes.code,
                name: pes.name,
                category: pes.category || 'مبيدات حشرية',
                unit: pes.unit || 'لتر',
                minimumStock: pes.minimumStock || 10,
                currentStock: 0,
                storageLocation: pes.storageLocation || 'مستودع السموم والمبيدات',
                notes: pes.notes || 'مستورد ومرحل من شاشة المبيدات المستقلة السابقة',
                createdAt: pes.createdAt || new Date().toISOString(),
                updatedAt: pes.updatedAt || new Date().toISOString(),
                type: 'مادة',
              });
              updated = true;
            }
          });
          if (updated) {
            localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(items));
          }
        }
        localStorage.removeItem(STORAGE_KEYS.PESTICIDES); // Done migration, clear key!
      } catch (_) {

      }
    }

    // Calculate currentStock dynamically from transaction logs
    const transactions = dataService.getTransactions();
    return items.map((item) => {
      // Find all transactions matching this item's ID
      const itemTransactions = transactions.filter((t) => t.itemId === item.id);
      
      // Separate initial transactions from standard transactions
      const initTransactions = itemTransactions.filter((t) => t.id.startsWith('tr-init') || t.transactionType === 'افتتاحي');
      const nonInitTransactions = itemTransactions.filter((t) => !t.id.startsWith('tr-init') && t.transactionType !== 'افتتاحي');
      
      const warehouseStocks: Record<string, number> = {};
      const defaultLoc = item.storageLocation || 'المخزن الرئيسي';

      // Process opening transactions per storehouse
      if (initTransactions.length > 0) {
        for (const tx of initTransactions) {
          const loc = tx.storehouse || defaultLoc;
          warehouseStocks[loc] = (warehouseStocks[loc] || 0) + tx.quantity;
        }
      } else if (item.initialStock !== undefined && item.initialStock > 0) {
        warehouseStocks[defaultLoc] = item.initialStock;
      }

      // Process non-init transactions per storehouse
      for (const tx of nonInitTransactions) {
        const loc = tx.storehouse || defaultLoc;
        if (tx.transactionType === 'وارد' || (tx.transactionType === 'تحويل' && tx.transferType === 'in') || (tx.transactionType === 'تسوية' && (tx.transferType === 'in' || tx.quantity >= 0))) {
          warehouseStocks[loc] = (warehouseStocks[loc] || 0) + tx.quantity;
        } else {
          warehouseStocks[loc] = (warehouseStocks[loc] || 0) - tx.quantity;
        }
      }

      let currentStock = 0;
      Object.values(warehouseStocks).forEach((val) => {
        currentStock += val;
      });

      return { ...item, currentStock, warehouseStocks };
    });
  },

  saveMaterial: (material: Material) => {
    const materials = dataService.getMaterials();
    const index = materials.findIndex((m) => m.id === material.id);
    const isNew = index === -1;

    if (isNew) {
      if (materials.some(m => m.code.toLowerCase() === material.code.toLowerCase())) {
        throw new Error('UNIQUE_CODE_COLLISION');
      }
      materials.push(material);
      dataService.logAudit('إضافة مادة جديدة', `تمت إضافة المادة: ${material.name} (${material.code})`, 'مادة');
    } else {
      materials[index] = material;
      dataService.logAudit('تعديل مادة', `تم تعديل بيانات المادة: ${material.name} (${material.code})`, 'مادة');
    }

    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      setDoc(doc(db, 'materials', material.id), cleanUndefined(material))
        .catch(() => {});
    }
    dataService.recordLocalWrite();
  },

  deleteMaterial: (id: string, force: boolean = false): { success: boolean; message: string } => {
    const transactions = dataService.getTransactions();
    const hasTransactions = transactions.some((t) => t.itemId === id);
    if (hasTransactions && !force) {
      return {
        success: false,
        message: 'لا يمكن حذف المادة بسبب وجود حركات مخزنية مسجلة عليها. يرجى حذف الحركات أولاً لضمان سلامة الدفاتر المحاسبية.',
      };
    }

    const materials = dataService.getMaterials();
    const material = materials.find((m) => m.id === id);
    if (!material) return { success: false, message: 'المادة غير موجودة' };

    // If forcing and has transactions, delete them
    if (hasTransactions && force) {
      const remainingTransactions = transactions.filter((t) => t.itemId !== id);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(remainingTransactions));
      
      const settings = dataService.getSettings();
      if (isFirebaseAvailable && settings.cloudSyncEnabled) {
        const toDelete = transactions.filter((t) => t.itemId === id);
        toDelete.forEach((t) => {
          deleteDoc(doc(db, 'transactions', t.id))
            .catch(() => {});
        });
      }
    }

    const filtered = materials.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(filtered));

    dataService.logAudit('حذف مادة', `تم حذف المادة: ${material.name} (${material.code})`, 'مادة');

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      deleteDoc(doc(db, 'materials', id))
        .catch(() => {});
    }
    dataService.recordLocalWrite();

    return { success: true, message: 'تم حذف المادة بنجاح' };
  },

  generateMaterialCode: (): string => {
    const settings = dataService.getSettings();
    const firstCat = settings.categories[0]?.name || 'معقمات ومطهرات';
    return dataService.generateItemCode(firstCat);
  },

  generateItemCode: (categoryName: string): string => {
    const settings = dataService.getSettings();
    const catConfig = settings.categories.find(c => c.name === categoryName);
    
    const prefix = catConfig?.prefix || 'GEN';
    const startRange = catConfig ? Number(catConfig.startRange) : 1000;
    const endRange = catConfig ? Number(catConfig.endRange) : 9999;

    const items = dataService.getMaterials();
    const codes = items
      .map((item) => {
        const regex = new RegExp(`^${prefix}-?(\\d+)$`, 'i');
        const match = item.code.match(regex);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => n >= startRange && n <= endRange);

    const max = codes.length > 0 ? Math.max(...codes) : (startRange - 1);
    const nextVal = max + 1;
    return `${prefix}-${nextVal}`;
  },

  // TRANSACTIONS
  getTransactions: (): InventoryTransaction[] => {
    let data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      data = JSON.stringify(INITIAL_TRANSACTIONS);
    }
    
    let parsed: InventoryTransaction[] = JSON.parse(data);
    let needsSave = false;
    
    // Migration for transaction numbers and suffixes
    parsed = parsed.map(tx => {
      let modified = false;
      if (tx.transactionNumber && tx.transactionNumber.includes('-صادر')) {
        tx.transactionNumber = tx.transactionNumber.replace('-صادر', '-OUT');
        modified = true;
      }
      if (tx.transactionNumber && tx.transactionNumber.includes('-وارد')) {
        tx.transactionNumber = tx.transactionNumber.replace('-وارد', '-IN');
        modified = true;
      }
      if (!tx.transactionNumber) {
        // Generate a pseudo-number if totally missing based on its ID so it has something
        let prefix = 'GEN';
        if (tx.transactionType === 'وارد') prefix = 'W';
        else if (tx.transactionType === 'صادر') prefix = 'O';
        else if (tx.transactionType === 'مستهلك') prefix = 'C';
        else if (tx.transactionType === 'تحويل') prefix = 'T';
        else if (tx.transactionType === 'تسوية') prefix = 'A';
        else if (tx.transactionType === 'افتتاحي') prefix = 'OP';
        
        tx.transactionNumber = `${prefix}-${tx.id.replace(/[^0-9]/g, '') || Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;
        if (tx.transactionType === 'تحويل') {
           if (tx.transferType === 'in') tx.transactionNumber += '-IN';
           else tx.transactionNumber += '-OUT';
        }
        modified = true;
      }
      if (modified) needsSave = true;
      return tx;
    });

    if (needsSave) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(parsed));
    }

    return parsed.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  },
  saveTransaction: (transaction: InventoryTransaction): { success: boolean; message: string } => {
    const transactions = dataService.getTransactions();
    
    // Get the item to ensure we know its default storage location if storehouse is missing
    const materials = dataService.getMaterials();
    const item = materials.find(m => m.id === transaction.itemId);
    if (!transaction.storehouse && item) {
       transaction.storehouse = item.storageLocation;
    }

    const currentStorehouseStock = dataService.getStorehouseStockExcludingTransaction(
      transaction.itemId,
      transaction.storehouse,
      transaction.id
    );

    // Validate quantities and stock balances
    if (transaction.quantity <= 0) {
      return { success: false, message: 'يجب أن تكون الكمية أكبر من صفر' };
    }

    const isInbound = 
      transaction.transactionType === 'وارد' || 
      transaction.transactionType === 'افتتاحي' ||
      (transaction.transactionType === 'تسوية' && (transaction.transferType === 'in' || transaction.quantity >= 0)) ||
      (transaction.transactionType === 'تحويل' && transaction.transferType === 'in');

    let calculatedStockAfter = currentStorehouseStock;
    if (isInbound) {
       calculatedStockAfter += transaction.quantity;
    } else { // صادر, مستهلك, or تسوية out, or تحويل out
       if (currentStorehouseStock < transaction.quantity) {
         return {
           success: false,
           message: `عذراً! الرصيد الحالي المتوفر في مستودع (${transaction.storehouse}) هو (${currentStorehouseStock} ${transaction.unit || ''}) ولا يكفي لإتمام هذه العملية بصرف/استهلاك/تنزيل (${transaction.quantity} ${transaction.unit || ''}).`,
         };
       }
       calculatedStockAfter -= transaction.quantity;
    }

    transaction.stockBefore = currentStorehouseStock;
    transaction.stockAfter = calculatedStockAfter;

    const index = transactions.findIndex((t) => t.id === transaction.id);
    const isNew = index === -1;

    if (isNew) {
      if (!transaction.transactionNumber) {
         const settings = dataService.getSettings();
         if (!settings.transactionCounters) settings.transactionCounters = { inbound: 0, outbound: 0, consumed: 0, transfer: 0, adjustment: 0, opening: 0 } as any;
         let seq = 1;
         let prefix = 'I';
         if (transaction.transactionType === 'وارد') {
            settings.transactionCounters.inbound = (settings.transactionCounters.inbound || 0) + 1;
            seq = settings.transactionCounters.inbound;
            prefix = 'W';
         } else if (transaction.transactionType === 'صادر') {
            settings.transactionCounters.outbound = (settings.transactionCounters.outbound || 0) + 1;
            seq = settings.transactionCounters.outbound;
            prefix = 'O';
         } else if (transaction.transactionType === 'مستهلك') {
            settings.transactionCounters.consumed = (settings.transactionCounters.consumed || 0) + 1;
            seq = settings.transactionCounters.consumed;
            prefix = 'C';
         } else if (transaction.transactionType === 'تحويل') {
            settings.transactionCounters.transfer = (settings.transactionCounters.transfer || 0) + 1;
            seq = settings.transactionCounters.transfer;
            prefix = 'T';
         } else if (transaction.transactionType === 'تسوية') {
            settings.transactionCounters.adjustment = (settings.transactionCounters.adjustment || 0) + 1;
            seq = settings.transactionCounters.adjustment;
            prefix = 'A';
         } else if (transaction.transactionType === 'افتتاحي') {
            settings.transactionCounters.opening = (settings.transactionCounters.opening || 0) + 1;
            seq = settings.transactionCounters.opening;
            prefix = 'OP';
         }
         transaction.transactionNumber = `${prefix}-${seq.toString().padStart(4, '0')}`;
         dataService.saveSettings(settings); // persist counter
      }
      transactions.unshift(transaction); // standard add at start
      dataService.logAudit(
        'إضافة حركة مخزنية',
        `تم تسجيل حركة (${transaction.transactionType}) رقم ${transaction.transactionNumber} على صنف: ${transaction.itemName} بقيمة: ${transaction.quantity} ${transaction.unit || ''}`,
        'حركة',
        transaction.attachment
      );
    } else {
      transactions[index] = transaction;
      dataService.logAudit(
        'تعديل حركة مخزنية',
        `تم تعديل الحركة (${transaction.transactionType}) على صنف: ${transaction.itemName}. الكمية الجديدة: ${transaction.quantity} ${transaction.unit || ''}`,
        'حركة',
        transaction.attachment
      );
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      setDoc(doc(db, 'transactions', transaction.id), cleanUndefined(transaction))
        .catch(() => {});
    }

    dataService.recordLocalWrite();
    dataService.recalculateTransactionBalances(transaction.itemId, transaction.storehouse || 'المخزن الرئيسي');
    const message = isNew ? 'تم إنشاء الحركة المخزنية بنجاح' : 'تم تعديل الحركة المخزنية بنجاح';
    return { success: true, message };
  },

  
  // Helper to recalculate all stock balances for a specific item in a specific storehouse
  recalculateTransactionBalances: (itemId: string, storehouse: string) => {
    const transactions = dataService.getTransactions();
    const item = dataService.getMaterials().find(m => m.id === itemId);
    
    // Get all transactions for this item and storehouse
    // Sort them chronologically (oldest first)
    const itemTxs = transactions
      .filter(t => t.itemId === itemId && (t.storehouse || 'المخزن الرئيسي') === storehouse)
      .sort((a, b) => {
        const tA = new Date(a.date).getTime();
        const tB = new Date(b.date).getTime();
        if (tA !== tB) return tA - tB;
        return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      });

    let currentStock = 0;
    
    // Add initial stock if the storehouse is the default one and not using a tr-init/افتتاحي tx
    if (item && (item.storageLocation || 'المخزن الرئيسي') === storehouse && item.initialStock !== undefined) {
      const hasInitTx = itemTxs.some(t => t.id.startsWith('tr-init') || t.transactionType === 'افتتاحي');
      if (!hasInitTx) {
        currentStock = item.initialStock;
      }
    }

    let changed = false;
    const updatedTxs: InventoryTransaction[] = [];

    for (const tx of itemTxs) {
      const stockBefore = currentStock;
      
      const isInit = tx.id.startsWith('tr-init') || tx.transactionType === 'افتتاحي';
      if (isInit) {
         currentStock += tx.quantity;
      } else {
         const isInbound = 
           tx.transactionType === 'وارد' || 
           (tx.transactionType === 'تحويل' && tx.transferType === 'in') || 
           (tx.transactionType === 'تسوية' && (tx.transferType === 'in' || tx.quantity >= 0));
         if (isInbound) {
            currentStock += tx.quantity;
         } else {
            currentStock -= tx.quantity;
         }
      }
      
      const stockAfter = currentStock;
      
      if (tx.stockBefore !== stockBefore || tx.stockAfter !== stockAfter) {
        tx.stockBefore = stockBefore;
        tx.stockAfter = stockAfter;
        
        // Update in main array
        const idx = transactions.findIndex(t => t.id === tx.id);
        if (idx !== -1) {
          transactions[idx] = tx;
          changed = true;
          updatedTxs.push(tx);
        }
      }
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      const settings = dataService.getSettings();
      if (isFirebaseAvailable && settings.cloudSyncEnabled) {
        const batch = writeBatch(db);
        updatedTxs.forEach(tx => {
          batch.set(doc(db, 'transactions', tx.id), cleanUndefined(tx), { merge: true });
        });
        batch.commit().catch(() => {});
      }
    }
  },

  deleteTransaction: (id: string): { success: boolean; message: string } => {
    const transactions = dataService.getTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return { success: false, message: 'الحركة المخزنية غير موجودة' };

    const transaction = transactions[index];

    // Safety Check: check if deleting this transaction causes subsequent stock to go negative
    const currentStorehouseStock = dataService.getStorehouseStockExcludingTransaction(
      transaction.itemId,
      transaction.storehouse,
      transaction.id
    );

    const isInbound = 
      transaction.transactionType === 'وارد' || 
      transaction.transactionType === 'افتتاحي' || 
      (transaction.transactionType === 'تحويل' && transaction.transferType === 'in') || 
      (transaction.transactionType === 'تسوية' && transaction.transferType === 'in');

    if (isInbound) {
      if (currentStorehouseStock < 0) {
        return {
          success: false,
          message: 'لا يمكن حذف هذه الحركة لأن حذفها سيتسبب برصيد سالب للأصناف اللاحقة في هذا المستودع.',
        };
      }
    }

    // If deleting an opening transaction (or initial transaction), update the material's initialStock property
    if (transaction.transactionType === 'افتتاحي' || transaction.id.startsWith('tr-init')) {
      let data = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      let materials: any[] = data ? JSON.parse(data) : [];
      const matIndex = materials.findIndex((m) => m.id === transaction.itemId);
      if (matIndex !== -1) {
        const mat = materials[matIndex];
        const remainingInitTxs = transactions.filter(
          (t) => t.id !== id && t.itemId === transaction.itemId && (t.transactionType === 'افتتاحي' || t.id.startsWith('tr-init'))
        );
        const newInitSum = remainingInitTxs.reduce((sum, t) => sum + t.quantity, 0);
        materials[matIndex] = { ...mat, initialStock: newInitSum };
        localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
        const settings = dataService.getSettings();
        if (isFirebaseAvailable && settings.cloudSyncEnabled) {
          setDoc(doc(db, 'materials', mat.id), cleanUndefined(materials[matIndex]))
            .catch(() => {});
        }
      }
    }

    const filtered = transactions.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
    dataService.recalculateTransactionBalances(transaction.itemId, transaction.storehouse || 'المخزن الرئيسي');

    dataService.logAudit(
      'حذف حركة مخزنية',
      `تم حذف حركة (${transaction.transactionType}) المسجلة على صنف: ${transaction.itemName} بقيمة: ${transaction.quantity}`,
      'حركة',
      transaction.attachment
    );

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      deleteDoc(doc(db, 'transactions', id))
        .catch(() => {});
    }

    dataService.recordLocalWrite();
    return { success: true, message: 'تم حذف الحركة بنجاح وإعادة حساب أرصدة الصنف' };
  },

  getStorehouseInitialStock: (itemId: string, storehouse: string | undefined): number => {
    const materials = dataService.getMaterials();
    const item = materials.find((m) => m.id === itemId);
    if (!item) return 0;

    const defaultLoc = item.storageLocation || 'المخزن الرئيسي';
    const itemTxs = dataService.getTransactions().filter((t) => t.itemId === itemId);
    const initTransactions = itemTxs.filter((t) => t.id.startsWith('tr-init') || t.transactionType === 'افتتاحي');

    if (storehouse && storehouse !== 'all') {
      const storehouseInitTxs = initTransactions.filter((t) => (t.storehouse || defaultLoc) === storehouse);
      if (storehouseInitTxs.length > 0) {
        return dataService.calculateStock(storehouseInitTxs);
      }
      if (initTransactions.length === 0 && storehouse === defaultLoc && item.initialStock !== undefined && item.initialStock > 0) {
        return item.initialStock;
      }
      return 0;
    } else {
      if (initTransactions.length > 0) {
        return dataService.calculateStock(initTransactions);
      }
      return item.initialStock || 0;
    }
  },

  getStorehouseStockExcludingTransaction: (itemId: string, storehouse: string | undefined, excludeTxId: string): number => {
    const materials = dataService.getMaterials();
    const item = materials.find((m) => m.id === itemId);
    if (!item) return 0;

    const defaultLoc = item.storageLocation || 'المخزن الرئيسي';
    const allItemTxs = dataService.getTransactions().filter((t) => t.itemId === itemId);
    const itemTxs = allItemTxs.filter((t) => t.id !== excludeTxId);
    
    const excludedTx = allItemTxs.find((t) => t.id === excludeTxId);
    const isExcludedTxInit = excludedTx ? (excludedTx.id.startsWith('tr-init') || excludedTx.transactionType === 'افتتاحي') : false;

    const initTransactions = itemTxs.filter((t) => t.id.startsWith('tr-init') || t.transactionType === 'افتتاحي');
    const nonInitTransactions = itemTxs.filter((t) => !t.id.startsWith('tr-init') && t.transactionType !== 'افتتاحي');

    let initialStock = 0;
    if (storehouse && storehouse !== 'all') {
      const storehouseInitTxs = initTransactions.filter((t) => (t.storehouse || defaultLoc) === storehouse);
      if (storehouseInitTxs.length > 0) {
        initialStock = dataService.calculateStock(storehouseInitTxs);
      } else if (initTransactions.length === 0 && storehouse === defaultLoc && item.initialStock !== undefined && !isExcludedTxInit) {
        initialStock = item.initialStock;
      }
      const storehouseNonInitTxs = nonInitTransactions.filter((t) => (t.storehouse || defaultLoc) === storehouse);
      return initialStock + dataService.calculateStock(storehouseNonInitTxs);
    } else {
      if (initTransactions.length > 0) {
        initialStock = dataService.calculateStock(initTransactions);
      } else if (item.initialStock !== undefined && !isExcludedTxInit) {
        initialStock = item.initialStock;
      }
      return initialStock + dataService.calculateStock(nonInitTransactions);
    }
  },

  getItemStockExcludingTransaction: (itemId: string, _itemType: string | undefined, excludeTxId: string): number => {
    return dataService.getStorehouseStockExcludingTransaction(itemId, undefined, excludeTxId);
  },

  getItemStock: (itemId: string, _itemType: string | undefined): number => {
    const materials = dataService.getMaterials();
    const found = materials.find((m) => m.id === itemId);
    return found ? found.currentStock : 0;
  },

  getItemStockByStorehouse: (itemId: string, storehouse: string): number => {
    return dataService.getStorehouseStockExcludingTransaction(itemId, storehouse, 'non-existent-id');
  },

  calculateStock: (transactions: InventoryTransaction[]): number => {
    let stock = 0;
    // To calculate correctly, let's process transactions in chronological order if sorted differently
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (const t of sorted) {
      if (
        t.transactionType === 'وارد' ||
        t.transactionType === 'افتتاحي' ||
        (t.transactionType === 'تحويل' && t.transferType === 'in') ||
        (t.transactionType === 'تسوية' && (t.transferType === 'in' || t.quantity >= 0))
      ) {
        stock += t.quantity;
      } else {
        stock -= t.quantity;
      }
    }
    return stock;
  },

  // AUDIT LOGS
  getAuditLogs: (): AuditLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(data);
  },

  logAudit: (action: string, details: string, itemType?: 'مادة' | 'مبيد' | 'حركة' | 'إعدادات' | 'مولد', attachment?: string) => {
    const logs = dataService.getAuditLogs();
    const currentUser = dataService.getCurrentUser();
    const newLog: AuditLog = {
      id: `al-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      user: currentUser ? currentUser.fullName : 'أحمد المحاسب',
      action,
      details,
      itemType,
      attachment,
    };
    logs.unshift(newLog); // push on top
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      setDoc(doc(db, 'audit_logs', newLog.id), cleanUndefined(newLog))
        .catch(() => {});
    }
  },

  // USERS MANAGEMENT
  getUsers: (): SystemUser[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      const parsed = JSON.parse(data) as SystemUser[];
      if (!parsed || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        return INITIAL_USERS;
      }
      let needsSave = false;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      const migrated = parsed.map(user => {
        if (!emailPattern.test(user.username)) {
          needsSave = true;
          return { ...user, username: `${user.username.replace(/\s/g, '').toLowerCase()}@system.com` };
        }
        return user;
      });

      if (needsSave) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(migrated));
      }
      return migrated;
    } catch (e) {
      return INITIAL_USERS;
    }
  },


  login: async (username: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; message: string; requirePasswordChange?: boolean; tempUser?: any }> => {
    const cleanInput = username.trim().toLowerCase();
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanInput)) {
      return { success: false, message: 'ممنوع تسجيل الدخول بحسابات ليست على صيغة بريد إلكتروني!' };
    }

    const users = dataService.getUsers();
    const found = users.find(u => u.username.trim().toLowerCase() === cleanInput);

    if (!found) {
      return { success: false, message: 'هذا المستخدم غير مسجل في النظام' };
    }

    const isDefaultPassword = (cleanInput === 'admin@system.com' && password === 'admin') || password === '123456';
    if (found.password) {
      if (found.password !== password) {
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
      }
    } else {
      if (!isDefaultPassword) {
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
      }
    }

    try {
      if (isFirebaseAvailable && auth) {
        await signInAnonymously(auth);
      }
    } catch (e: any) {
      console.warn("Auth warning (anonymous login might be disabled):", e.message);
      // Continue locally even if Firebase auth fails (e.g. if Anonymous auth is not enabled in Firebase Console)
    }

    if (isDefaultPassword) {
      return { success: true, message: 'يرجى تغيير كلمة المرور', requirePasswordChange: true, tempUser: found };
    }

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, found.id);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, found.id);
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, found.id);
    }
    
    dataService.logAudit('تسجيل الدخول', `تم تسجيل دخول المستخدم: ${found.fullName}`, 'إعدادات');
    return { success: true, message: 'تم تسجيل الدخول بنجاح' };
  },

  
  completeLogin: (user: SystemUser) => {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, user.id);
    sessionStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, user.id);
    dataService.logAudit('تسجيل الدخول', `تم تسجيل دخول المستخدم: ${user.fullName}`, 'إعدادات');
    dataService.notify();
  },

  isLoggedIn: (): boolean => {
    return localStorage.getItem('remix_is_logged_in') === 'true' || sessionStorage.getItem('remix_is_logged_in') === 'true';
  },
  logout: () => {
    dataService.logAudit('تسجيل الخروج', 'تم تسجيل الخروج من الجلسة', 'إعدادات');
    localStorage.removeItem('remix_is_logged_in');
    sessionStorage.removeItem('remix_is_logged_in');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    
    if (navigator.onLine) {
      window.location.reload();
    } else {
      // Offline-friendly fallback: update client state immediately without a hard reload
      window.location.hash = '#/';
      dataService.notify();
    }
  },

  getCurrentUser: (): SystemUser => {
    const users = dataService.getUsers();
    // Prioritize sessionStorage over localStorage as sessionStorage represents current non-remembered login
    const rawVal = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (rawVal) {
      let targetId = rawVal;
      if (rawVal.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(rawVal);
          if (parsed && parsed.id) {
            targetId = parsed.id;
          } else if (parsed && parsed.username) {
            targetId = parsed.username;
          }
        } catch (e) {
          // ignore error and use rawVal
        }
      }
      const found = users.find(u => u.id === targetId || u.username.trim().toLowerCase() === targetId.trim().toLowerCase());
      if (found) return found;
    }
    // Default to admin (first user) if none selected or not found
    const defaultUser = users[0] || INITIAL_USERS[0];
    if (defaultUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, defaultUser.id);
    }
    return defaultUser;
  },

  setCurrentUser: (userId: string) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    dataService.notify();
  },

  saveUser: async (user: SystemUser): Promise<{ success: boolean; message: string }> => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(user.username.trim().toLowerCase())) {
      return { success: false, message: 'ممنوع إنشاء أو حفظ حسابات ليست على صيغة بريد إلكتروني!' };
    }

    const users = dataService.getUsers();
    const duplicate = users.find(u => u.username.trim().toLowerCase() === user.username.trim().toLowerCase() && u.id !== user.id);
    if (duplicate) {
      return { success: false, message: 'اسم المستخدم مسجل مسبقاً لمستخدم آخر!' };
    }

    const index = users.findIndex(u => u.id === user.id);
    const updatedUser = { ...user };
    
    if (index === -1) {
      updatedUser.password = '123456';
    }

    if (index !== -1) {
      users[index] = updatedUser;
    } else {
      updatedUser.createdAt = new Date().toISOString();
      users.push(updatedUser);
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    dataService.logAudit('تثبيت/تعديل مستخدم', `تم تعديل أو إضافة المستخدم: ${user.fullName} بنظام الصلاحيات المُخصّص له`, 'إعدادات');

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      setDoc(doc(db, 'users', updatedUser.id), cleanUndefined(updatedUser))
        .catch(() => {});
    }

    dataService.recordLocalWrite();
    return { success: true, message: 'تم حفظ بيانات المستخدم بنجاح (كلمة المرور الافتراضية للجدد هي 123456)' };
  },

  deleteUser: (id: string): { success: boolean; message: string } => {
    const users = dataService.getUsers();
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) {
      return { success: false, message: 'المستخدم غير موجود!' };
    }

    // Protect last remaining admin!
    if (userToDelete.permissions.includes('users_manage')) {
      const otherAdmins = users.filter(u => u.id !== id && u.permissions.includes('users_manage'));
      if (otherAdmins.length === 0) {
        return { success: false, message: 'لا يمكن حذف آخر مستخدم يمتلك صلاحية إدارة النظام وإدارة المستخدمين!' };
      }
    }

    const currentActive = dataService.getCurrentUser();
    if (currentActive.id === id) {
      return { success: false, message: 'لا يمكن حذف المستخدم النشط حالياً الذي تستعرض به النظام!' };
    }

    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    dataService.logAudit('حذف مستخدم', `تم حذف المستخدم: ${userToDelete.fullName} من الأنظمة والصلاحيات`, 'إعدادات');

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      deleteDoc(doc(db, 'users', id))
        .catch(() => {});
    }

    dataService.recordLocalWrite();
    return { success: true, message: 'تم إقصاء وحذف المستخدم وسحب هويته من الدوائر بنجاح' };
  },

  hasPermission: (permission: string): boolean => {
    const u = dataService.getCurrentUser();
    return u ? u.permissions.includes(permission) : false;
  },

  // EXPIRE LOGIC HELPERS
  getPesticideExpiryStatus: (expiryDateStr: string, warningThresholdDays: number): 'safe' | 'warning' | 'critical' | 'expired' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      return 'expired';
    }

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return 'critical';
    }
    if (diffDays <= warningThresholdDays) {
      return 'warning';
    }
    return 'safe';
  },

  resetToFactoryDefaults: async () => {
    // 1. Unsubscribe active Firestore listeners
    if (settingsUnsubscribe) { settingsUnsubscribe(); settingsUnsubscribe = null; }
    if (materialsUnsubscribe) { materialsUnsubscribe(); materialsUnsubscribe = null; }
    if (transactionsUnsubscribe) { transactionsUnsubscribe(); transactionsUnsubscribe = null; }
    if (auditLogsUnsubscribe) { auditLogsUnsubscribe(); auditLogsUnsubscribe = null; }
    if (usersUnsubscribe) { usersUnsubscribe(); usersUnsubscribe = null; }

    const currentSettings = dataService.getSettings();
    const wasCloudSyncEnabled = currentSettings.cloudSyncEnabled;
    
    // 2. Clear Firestore collections if enabled
    if (isFirebaseAvailable && wasCloudSyncEnabled) {
      const collections = ['materials', 'transactions', 'audit_logs', 'users', 'settings'];
      for (const colName of collections) {
        try {
          const querySnapshot = await getDocs(collection(db, colName));
          const docs = querySnapshot.docs;
          for (let i = 0; i < docs.length; i += 400) {
            const batch = writeBatch(db);
            const chunk = docs.slice(i, i + 400);
            chunk.forEach((d) => batch.delete(d.ref));
            await batch.commit();
          }
        } catch (e) {
          console.error(`Error deleting collection ${colName} during reset:`, e);
        }
      }
    }

    // 3. Pristine default settings
    const resetSettings: AppSettings = {
      ...DEFAULT_SETTINGS,
      organizationName: currentSettings.organizationName || DEFAULT_SETTINGS.organizationName,
      departmentName: currentSettings.departmentName || DEFAULT_SETTINGS.departmentName,
      storekeeperName: currentSettings.storekeeperName || DEFAULT_SETTINGS.storekeeperName,
      systemManagerName: currentSettings.systemManagerName || DEFAULT_SETTINGS.systemManagerName,
      healthDirectorName: currentSettings.healthDirectorName || DEFAULT_SETTINGS.healthDirectorName,
      cloudSyncEnabled: wasCloudSyncEnabled,
      transactionCounters: { inbound: 0, outbound: 0, consumed: 0 },
      openingStockAttachments: {},
    };
    
    const resetUsers: SystemUser[] = [
      {
        id: 'u-admin-1',
        username: 'admin@system.com',
        fullName: 'مدير النظام (Admin)',
        role: 'مدير الصلاحيات الكاملة',
        permissions: [
          'dashboard_view',
          'materials_view',
          'materials_create',
          'materials_edit',
          'materials_delete',
          'transactions_view',
          'transactions_create',
          'reports_view',
          'reports_export',
          'reports_print',
          'audit_view',
          'settings_view',
          'settings_edit',
          'users_manage',
          'system_reset'
        ],
        createdAt: new Date().toISOString()
      }
    ];

    const resetMaterials: Material[] = [];
    const resetTransactions: InventoryTransaction[] = [];

    const resetAuditLogs: AuditLog[] = [
      {
        id: `al-reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: 'مدير النظام (Admin)',
        action: 'إعادة ضبط شاملة للمنظومة',
        details: 'تم إجراء تفريغ وإعادة تهيئة كاملة للمستودعات والدفاتر وإعادة ضبط جميع البيانات للافتراضيات التأسيسية للمديرية وتعميم الخروج التلقائي.',
        itemType: 'إعدادات',
      }
    ];

    // 4. Fully clear browser storages
    localStorage.clear();
    sessionStorage.clear();

    // 5. Save pristine baseline data
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(resetMaterials));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(resetTransactions));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(resetUsers));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(resetSettings));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(resetAuditLogs));
    
    // 6. Set flag for Login screen to show reset banner and default admin credentials
    localStorage.setItem('show_reset_credentials', 'true');
    sessionStorage.setItem('show_reset_credentials', 'true');

    // 7. Seed fresh default state to Firestore if Firebase enabled
    if (isFirebaseAvailable && wasCloudSyncEnabled) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'settings', 'system_settings'), resetSettings);
        batch.set(doc(db, 'users', resetUsers[0].id), resetUsers[0]);
        batch.set(doc(db, 'audit_logs', resetAuditLogs[0].id), resetAuditLogs[0]);
        await batch.commit();
      } catch (e) {
        console.error("Error seeding clean cloud state during reset:", e);
      }
    }

    // 8. Notify subscribers so loggedIn state updates immediately
    dataService.notify();
  },

  uploadAllLocalDataToCloud: async (): Promise<{ success: boolean; message: string }> => {
    if (!isFirebaseAvailable) {
      return { success: false, message: 'خدمة Firebase غير مهيأة بعد' };
    }
    try {

      // 1. Settings
      const settings = dataService.getSettings();
      await saveDocWithOCC('settings', 'app_config', settings);
      
      // 2. Materials
      const materials = dataService.getMaterials();
      for (const m of materials) {
        await saveDocWithOCC('materials', m.id, m);
      }
      
      // 3. Transactions
      const transactions = dataService.getTransactions();
      for (const t of transactions) {
        await saveDocWithOCC('transactions', t.id, t);
      }
      
      // 4. Audit Logs
      const auditLogs = dataService.getAuditLogs();
      for (const log of auditLogs) {
        await saveDocWithOCC('audit_logs', log.id, log);
      }
      
      // 5. Users
      const users = dataService.getUsers();
      for (const u of users) {
        await saveDocWithOCC('users', u.id, u);
      }

      // 6. Generator Logs
      const generatorLogs = dataService.getGeneratorLogs();
      for (const g of generatorLogs) {
        await saveDocWithOCC('generator_logs', g.id, g);
      }

      return { success: true, message: 'تم رفع كافة البيانات المحلية ومزامنتها على السحابة بنجاح!' };
    } catch (err: any) {

      return { success: false, message: `فشل التصدير للسحابة: ${err.message}` };
    }
  },

  restoreBackupData: async (parsed: any): Promise<{ success: boolean; message: string }> => {
    try {
      if (!parsed.materials || !parsed.transactions || !parsed.users) {
        return { success: false, message: 'ملف جيسون المرفق غير صالح، يفتقد لحقول المواد أو المعاملات أو الموظفين الأساسية للتشغيل.' };
      }

      const settings = dataService.getSettings();
      const isCloudSync = isFirebaseAvailable && settings.cloudSyncEnabled;

      if (isCloudSync) {
        const collectionsToClear = ['materials', 'transactions', 'audit_logs', 'users', 'generator_logs'];
        for (const colName of collectionsToClear) {
          try {
            const querySnapshot = await getDocs(collection(db, colName));
            const batch = writeBatch(db);
            querySnapshot.forEach((d) => {
              batch.delete(d.ref);
            });
            await batch.commit();
          } catch (e) {

          }
        }

        for (const m of parsed.materials) {
          await setDoc(doc(db, 'materials', m.id), cleanUndefined(m));
        }
        for (const t of parsed.transactions) {
          await setDoc(doc(db, 'transactions', t.id), cleanUndefined(t));
        }
        for (const u of parsed.users) {
          await setDoc(doc(db, 'users', u.id), cleanUndefined(u));
        }
        if (parsed.auditLogs) {
          for (const l of parsed.auditLogs) {
            await setDoc(doc(db, 'audit_logs', l.id), cleanUndefined(l));
          }
        }
        if (parsed.generatorLogs && Array.isArray(parsed.generatorLogs)) {
          for (const g of parsed.generatorLogs) {
            await setDoc(doc(db, 'generator_logs', g.id), cleanUndefined(g));
          }
        }
        if (parsed.settings) {
          await setDoc(doc(db, 'settings', 'app_config'), cleanUndefined(parsed.settings));
        }
      }

      // Save locally
      localStorage.setItem('remix_materials_v1', JSON.stringify(parsed.materials));
      localStorage.setItem('remix_transactions_v1', JSON.stringify(parsed.transactions));
      localStorage.setItem('remix_users_v1', JSON.stringify(parsed.users));
      if (parsed.settings) {
        localStorage.setItem('remix_settings_v1', JSON.stringify(parsed.settings));
      }
      if (parsed.auditLogs) {
        localStorage.setItem('remix_audit_logs_v1', JSON.stringify(parsed.auditLogs));
      }
      if (parsed.generatorLogs && Array.isArray(parsed.generatorLogs)) {
        localStorage.setItem(STORAGE_KEYS.GENERATOR_LOGS, JSON.stringify(parsed.generatorLogs));
      }

      dataService.logAudit('استعادة نسخة احتياطية', 'تم استيراد واستعادة قاعدة بيانات مخزنية ومصفوفات صلاحيات كاملة من منفذ خارجي يدوي عاجل', 'إعدادات');

      return { success: true, message: 'تم استيراد واستعادة النسخة الاحتياطية بنجاح!' };
    } catch (err: any) {

      return { success: false, message: `فشل استعادة النسخة الاحتياطية: ${err.message}` };
    }
  },

  toggleCloudSync: async (_enabled: boolean): Promise<{ success: boolean; message: string }> => {
    const settings = dataService.getSettings();
    settings.cloudSyncEnabled = true; // Force always enabled as requested
    
    if (!isFirebaseAvailable) {
      return { success: false, message: 'تعذر تنشيط السحابة: ملقم جوجل سحابة غير مهيأ' };
    }
    
    // Upload local data to Firestore so the user doesn't see blank page
    if (!settings.firebaseInitialized) {
      const res = await dataService.uploadAllLocalDataToCloud();
      if (!res.success) {
        return res;
      }
      settings.firebaseInitialized = true;
    }
    
    // Save settings locally
    localStorage.setItem('remix_settings_v1', JSON.stringify(settings));
    
    // Initialize or teardown cloud sync listeners
    initCloudSync();
    
    dataService.notify();
    return { success: true, message: 'التزامن السحابي المباشر مفعل دائماً وإلزامي لضمان دقة وتطابق البيانات بين الأجهزة.' };
  },

  recordLocalWrite: () => {
    localStorage.setItem('last_local_write_time', new Date().toISOString());
  },

  recordGoogleDriveBackupTime: () => {
    localStorage.setItem('last_google_drive_backup_time', new Date().toISOString());
  },

  hasUnbackedUpChanges: (): boolean => {
    // If real-time cloud sync is enabled and Firebase is available, everything is synced automatically in real-time
    const settings = dataService.getSettings();
    if (settings.cloudSyncEnabled && isFirebaseAvailable) {
      return false;
    }
    const lastWrite = localStorage.getItem('last_local_write_time');
    if (!lastWrite) return false;
    const lastBackup = localStorage.getItem('last_google_drive_backup_time');
    if (!lastBackup) return true;
    return new Date(lastWrite) > new Date(lastBackup);
  },
  saveTransfer: (
    itemId: string,
    quantity: number,
    sourceStorehouse: string,
    destStorehouse: string,
    executedBy: string,
    notes: string,
    transactionDate?: string
  ): { success: boolean; message: string } => {
    const materials = dataService.getMaterials();
    const item = materials.find(m => m.id === itemId);
    if (!item) return { success: false, message: 'الصنف غير موجود' };
    
    if (quantity <= 0) return { success: false, message: 'الكمية يجب أن تكون أكبر من صفر' };
    if (sourceStorehouse === destStorehouse) return { success: false, message: 'لا يمكن التحويل لنفس المستودع' };
    
    const sourceStock = dataService.getItemStockByStorehouse(itemId, sourceStorehouse);
    if (sourceStock < quantity) {
       return { success: false, message: `الرصيد في مستودع (${sourceStorehouse}) غير كافٍ. المتوفر: ${sourceStock}` };
    }

    const transactions = dataService.getTransactions();
    
    const settings = dataService.getSettings();
    if (!settings.transactionCounters) settings.transactionCounters = { inbound: 0, outbound: 0, consumed: 0, transfer: 0, adjustment: 0, opening: 0 } as any;
    settings.transactionCounters.transfer = (settings.transactionCounters.transfer || 0) + 1;
    const seq = settings.transactionCounters.transfer;
    const txNum = `T-${seq.toString().padStart(4, '0')}`;
    dataService.saveSettings(settings);

    const dateStr = transactionDate || new Date().toISOString().split('T')[0];
    const timestamp = Date.now();

    const sourceTx: InventoryTransaction = {
       id: 'tx-' + timestamp + '-src',
       transactionNumber: txNum + '-OUT',
       date: dateStr,
       itemId: item.id,
       itemCode: item.code,
       itemName: item.name,
       itemCategory: item.category,
       transactionType: 'تحويل',
       transferType: 'out',
       quantity: quantity,
       storehouse: sourceStorehouse,
       stockBefore: 0, // will be recalc
       stockAfter: 0,
       executedBy: executedBy,
       supplierOrReceiver: `تحويل إلى ${destStorehouse}`,
       notes: notes,
       createdAt: new Date(timestamp).toISOString(),
       updatedAt: new Date(timestamp).toISOString(),
       unit: item.unit
    };

    const destTx: InventoryTransaction = {
       id: 'tx-' + timestamp + '-dst',
       transactionNumber: txNum + '-IN',
       date: dateStr,
       itemId: item.id,
       itemCode: item.code,
       itemName: item.name,
       itemCategory: item.category,
       transactionType: 'تحويل',
       transferType: 'in',
       quantity: quantity,
       storehouse: destStorehouse,
       stockBefore: 0,
       stockAfter: 0,
       executedBy: executedBy,
       supplierOrReceiver: `تحويل من ${sourceStorehouse}`,
       notes: notes,
       createdAt: new Date(timestamp + 1000).toISOString(),
       updatedAt: new Date(timestamp + 1000).toISOString(),
       unit: item.unit
    };

    transactions.unshift(destTx, sourceTx);
    localStorage.setItem('remix_transactions_v1', JSON.stringify(transactions));

    dataService.recalculateTransactionBalances(itemId, sourceStorehouse);
    dataService.recalculateTransactionBalances(itemId, destStorehouse);

    dataService.logAudit('تحويل مخزني', `تحويل ${quantity} ${item.unit} من ${sourceStorehouse} إلى ${destStorehouse} لصنف ${item.name}`, 'حركة');
    return { success: true, message: 'تم التحويل بنجاح' };
  },
  isFirebaseOnline: (): boolean => {
    return isFirebaseAvailable && firebaseOnline;
  },

  // GENERATOR LOGS
  getGeneratorLogs: (): GeneratorLogEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.GENERATOR_LOGS);
    let logs: GeneratorLogEntry[] = [];
    if (data) {
      try {
        logs = JSON.parse(data);
      } catch (_) {
        logs = [];
      }
    }
    return logs.sort((a, b) => a.date.localeCompare(b.date));
  },

  getLatestGeneratorLog: (): GeneratorLogEntry | undefined => {
    const logs = dataService.getGeneratorLogs();
    if (logs.length === 0) return undefined;
    return logs[logs.length - 1]; // Already sorted by date ascending in getGeneratorLogs
  },

  recalculateGeneratorChain: (inputLogs: GeneratorLogEntry[]): GeneratorLogEntry[] => {
    const sorted = [...inputLogs].sort((a, b) => a.date.localeCompare(b.date));
    const result: GeneratorLogEntry[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const current = { ...sorted[i] };
      if (i === 0) {
        // First record keeps its previousReading (either manual if system started empty, or 0)
        current.operatingHours = Number((current.currentReading - current.previousReading).toFixed(2));
      } else {
        const prev = result[i - 1];
        current.previousReading = prev.currentReading;
        current.operatingHours = Number((current.currentReading - current.previousReading).toFixed(2));
      }

      if (current.currentReading < current.previousReading) {
        throw new Error(`INVALID_SEQUENCE:${current.date}:${current.currentReading}:${current.previousReading}`);
      }
      result.push(current);
    }
    return result;
  },

  simulateSaveGeneratorLog: (
    entry: Partial<GeneratorLogEntry> & { date: string; currentReading: number; previousReading?: number }
  ): GeneratorLogSimulationResult => {
    const logs = dataService.getGeneratorLogs();
    const isEditing = Boolean(entry.id && logs.some((l) => l.id === entry.id));

    // Duplicate date check
    const duplicate = logs.find((l) => l.date === entry.date && l.id !== entry.id);
    if (duplicate) {
      throw new Error('DUPLICATE_DATE_EXISTS');
    }

    const getDayName = (dStr: string) => {
      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const dt = new Date(dStr + 'T00:00:00');
      return days[dt.getDay()] || '';
    };

    const now = new Date().toISOString();
    const currentUser = dataService.getCurrentUser();
    const createdBy = entry.createdBy || currentUser?.fullName || currentUser?.username || 'مستخدم النظام';

    let candidateLogs: GeneratorLogEntry[] = [];
    let targetId = entry.id || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    if (isEditing) {
      candidateLogs = logs.map((l) => {
        if (l.id === entry.id) {
          const prevReading = entry.previousReading !== undefined ? entry.previousReading : l.previousReading;
          return {
            ...l,
            ...entry,
            date: entry.date,
            dayName: entry.dayName || getDayName(entry.date),
            previousReading: prevReading,
            currentReading: entry.currentReading,
            operatingHours: Number((entry.currentReading - prevReading).toFixed(2)),
            updatedAt: now,
          };
        }
        return l;
      });
    } else {
      // Determine initial previousReading if adding
      let initialPrevReading = entry.previousReading ?? 0;
      const sortedBefore = logs.filter((l) => l.date < entry.date).sort((a, b) => a.date.localeCompare(b.date));
      if (logs.length > 0) {
        if (sortedBefore.length > 0) {
          initialPrevReading = sortedBefore[sortedBefore.length - 1].currentReading;
        } else {
          // Inserting before all existing logs
          initialPrevReading = entry.previousReading ?? 0;
        }
      }

      const newLog: GeneratorLogEntry = {
        id: targetId,
        date: entry.date,
        dayName: entry.dayName || getDayName(entry.date),
        previousReading: initialPrevReading,
        currentReading: entry.currentReading,
        operatingHours: Number((entry.currentReading - initialPrevReading).toFixed(2)),
        notes: entry.notes || '',
        createdAt: now,
        updatedAt: now,
        createdBy,
      };
      candidateLogs = [...logs, newLog];
    }

    // Run recalculation chain
    const proposedLogs = dataService.recalculateGeneratorChain(candidateLogs);

    // Compute Impact
    const oldLogsMap = new Map(logs.map((l) => [l.id, l]));
    const impactedItems: any[] = [];

    proposedLogs.forEach((newLog) => {
      const oldLog = oldLogsMap.get(newLog.id);
      if (!oldLog) {
        // Newly added log
        impactedItems.push({
          id: newLog.id,
          date: newLog.date,
          dayName: newLog.dayName,
          oldPreviousReading: 0,
          newPreviousReading: newLog.previousReading,
          oldCurrentReading: 0,
          newCurrentReading: newLog.currentReading,
          oldOperatingHours: 0,
          newOperatingHours: newLog.operatingHours,
          isNew: true,
        });
      } else if (
        oldLog.previousReading !== newLog.previousReading ||
        oldLog.currentReading !== newLog.currentReading ||
        oldLog.operatingHours !== newLog.operatingHours ||
        oldLog.date !== newLog.date
      ) {
        impactedItems.push({
          id: newLog.id,
          date: newLog.date,
          dayName: newLog.dayName,
          oldPreviousReading: oldLog.previousReading,
          newPreviousReading: newLog.previousReading,
          oldCurrentReading: oldLog.currentReading,
          newCurrentReading: newLog.currentReading,
          oldOperatingHours: oldLog.operatingHours,
          newOperatingHours: newLog.operatingHours,
          isNew: false,
        });
      }
    });

    const lastAffected = impactedItems.length > 0 ? impactedItems[impactedItems.length - 1].date : undefined;

    return {
      actionType: isEditing ? 'edit_old' : (logs.some((l) => l.date > entry.date) ? 'add_old' : 'normal_save'),
      affectedCount: impactedItems.length,
      lastAffectedRecordDate: lastAffected,
      impactedItems,
      proposedLogs,
    };
  },

  simulateDeleteGeneratorLog: (id: string): GeneratorLogSimulationResult => {
    const logs = dataService.getGeneratorLogs();
    const target = logs.find((l) => l.id === id);
    if (!target) {
      throw new Error('RECORD_NOT_FOUND');
    }

    const candidateLogs = logs.filter((l) => l.id !== id);
    const proposedLogs = candidateLogs.length > 0 ? dataService.recalculateGeneratorChain(candidateLogs) : [];

    const oldLogsMap = new Map(logs.map((l) => [l.id, l]));
    const impactedItems: any[] = [];

    proposedLogs.forEach((newLog) => {
      const oldLog = oldLogsMap.get(newLog.id);
      if (
        oldLog &&
        (oldLog.previousReading !== newLog.previousReading ||
          oldLog.currentReading !== newLog.currentReading ||
          oldLog.operatingHours !== newLog.operatingHours)
      ) {
        impactedItems.push({
          id: newLog.id,
          date: newLog.date,
          dayName: newLog.dayName,
          oldPreviousReading: oldLog.previousReading,
          newPreviousReading: newLog.previousReading,
          oldCurrentReading: oldLog.currentReading,
          newCurrentReading: newLog.currentReading,
          oldOperatingHours: oldLog.operatingHours,
          newOperatingHours: newLog.operatingHours,
          isNew: false,
        });
      }
    });

    const lastAffected = impactedItems.length > 0 ? impactedItems[impactedItems.length - 1].date : undefined;

    return {
      actionType: 'delete',
      affectedCount: impactedItems.length + 1, // Including deleted target
      lastAffectedRecordDate: lastAffected,
      impactedItems,
      proposedLogs,
    };
  },

  commitGeneratorLogs: (logs: GeneratorLogEntry[], auditActionMessage?: string) => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(STORAGE_KEYS.GENERATOR_LOGS, JSON.stringify(sorted));

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      sorted.forEach((savedLog) => {
        setDoc(doc(db, 'generator_logs', savedLog.id), cleanUndefined(savedLog)).catch(() => {});
      });
    }

    if (auditActionMessage) {
      dataService.logAudit('تحديث سجلات المولد', auditActionMessage, 'مولد');
    }
    dataService.recordLocalWrite();
    dataService.notify();
  },

  saveGeneratorLog: (entry: Partial<GeneratorLogEntry> & { date: string; currentReading: number; previousReading?: number }): GeneratorLogEntry => {
    const sim = dataService.simulateSaveGeneratorLog(entry);
    dataService.commitGeneratorLogs(
      sim.proposedLogs,
      `تم حفظ/تحديث سجل المولد بتاريخ ${entry.date} مع إعادة حساب ${sim.affectedCount} سجل متأثر`
    );
    return sim.proposedLogs.find((l) => l.date === entry.date) || sim.proposedLogs[sim.proposedLogs.length - 1];
  },

  deleteGeneratorLog: (id: string) => {
    const sim = dataService.simulateDeleteGeneratorLog(id);
    dataService.commitGeneratorLogs(
      sim.proposedLogs,
      `تم حذف سجل المولد وإعادة حساب ${sim.affectedCount} سجل متأثر`
    );
    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      deleteDoc(doc(db, 'generator_logs', id)).catch(() => {});
    }
  },
};

export async function initCloudSync() {

  if (settingsUnsubscribe) {
    try { settingsUnsubscribe(); } catch (e) {}
    settingsUnsubscribe = null;
  }
  if (materialsUnsubscribe) {
    try { materialsUnsubscribe(); } catch (e) {}
    materialsUnsubscribe = null;
  }
  if (transactionsUnsubscribe) {
    try { transactionsUnsubscribe(); } catch (e) {}
    transactionsUnsubscribe = null;
  }
  if (auditLogsUnsubscribe) {
    try { auditLogsUnsubscribe(); } catch (e) {}
    auditLogsUnsubscribe = null;
  }
  if (usersUnsubscribe) {
    try { usersUnsubscribe(); } catch (e) {}
    usersUnsubscribe = null;
  }

  // Initialize sync even if not logged in so that we can sync the user list for login!
  const settings = dataService.getSettings();
  if (!isFirebaseAvailable || !settings.cloudSyncEnabled) {

    return;
  }

  const registerCloudListeners = () => {

    try {
      // 1. Settings listener
      settingsUnsubscribe = onSnapshot(doc(db, 'settings', 'app_config'), (snapshot) => {
        const currentSettings = dataService.getSettings();
        if (!currentSettings.cloudSyncEnabled) return;

        if (snapshot.exists()) {
          const cloudSettings = snapshot.data() as AppSettings;
          cloudSettings.cloudSyncEnabled = true;
          cloudSettings.firebaseInitialized = true;
          localStorage.setItem('remix_settings_v1', JSON.stringify(cloudSettings));
          dataService.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/app_config'));

      // 2. Materials listener
      materialsUnsubscribe = onSnapshot(collection(db, 'materials'), (snapshot) => {
        const currentSettings = dataService.getSettings();
        if (!currentSettings.cloudSyncEnabled) return;

        const list: Material[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Material);
        });
        if (list.length > 0 || snapshot.metadata.fromCache === false) {
          localStorage.setItem('remix_materials_v1', JSON.stringify(list));
          dataService.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'materials'));

      // 3. Transactions listener
      transactionsUnsubscribe = onSnapshot(collection(db, 'transactions'), (snapshot) => {
        const currentSettings = dataService.getSettings();
        if (!currentSettings.cloudSyncEnabled) return;

        const list: InventoryTransaction[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as InventoryTransaction);
        });
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (list.length > 0 || snapshot.metadata.fromCache === false) {
          localStorage.setItem('remix_transactions_v1', JSON.stringify(list));
          dataService.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));

      // 4. Audit Logs listener
      auditLogsUnsubscribe = onSnapshot(collection(db, 'audit_logs'), (snapshot) => {
        const currentSettings = dataService.getSettings();
        if (!currentSettings.cloudSyncEnabled) return;

        const list: AuditLog[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as AuditLog);
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (list.length > 0 || snapshot.metadata.fromCache === false) {
          localStorage.setItem('remix_audit_logs_v1', JSON.stringify(list));
          dataService.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'audit_logs'));

      // 5. Users listener
      usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const currentSettings = dataService.getSettings();
        if (!currentSettings.cloudSyncEnabled) return;

        const list: SystemUser[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as SystemUser);
        });
        if (list.length > 0 || snapshot.metadata.fromCache === false) {
          localStorage.setItem('remix_users_v1', JSON.stringify(list));
          dataService.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

      // 6. Generator Logs listener
      onSnapshot(collection(db, 'generator_logs'), (snapshot) => {
        const currentSettings = dataService.getSettings();
        if (!currentSettings.cloudSyncEnabled) return;

        const list: GeneratorLogEntry[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as GeneratorLogEntry);
        });
        list.sort((a, b) => a.date.localeCompare(b.date));
        if (list.length > 0 || snapshot.metadata.fromCache === false) {
          localStorage.setItem('remix_generator_logs_v1', JSON.stringify(list));
          dataService.notify();
        }
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'generator_logs'));
    } catch (error) {

    }
  };

  // Check if cloud database config exists. If not, this is a newly provisioned/empty database.
  // In that case, we MUST upload our local data first so we don't wipe it out!
  getDoc(doc(db, 'settings', 'app_config'))
    .then((configDoc) => {
      if (!configDoc.exists()) {

        dataService.uploadAllLocalDataToCloud()
          .then((res) => {
            if (res.success) {

              registerCloudListeners();
            } else {

              registerCloudListeners();
            }
          })
          .catch((_err) => {

            registerCloudListeners();
          });
      } else {
        registerCloudListeners();
      }
    })
    .catch((_err) => {

      // Fallback to registering listeners anyway
      registerCloudListeners();
    });
}

// Automatically start cloud sync listeners on module import
setTimeout(() => {
  initCloudSync();
}, 200);

  // Atomic Transfer

