export type Category = string;
export type Unit = string;
export type HazardLevel = 'منخفض' | 'متوسط' | 'مرتفع' | '';

export interface Item {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  minimumStock: number;
  currentStock: number;
  initialStock?: number;
  storageLocation: string; // Kept as default/primary location
  warehouseStocks?: Record<string, number>; // New: Stock per warehouse
  notes?: string;
  createdAt: string;
  password?: string;
  updatedAt: string;
  type?: string; // Keep for backward compatibility or remove
}

export interface Material extends Item {
  manufacturer?: string;
  productionDate?: string;
  expiryDate?: string;
  hazardLevel?: HazardLevel;
}

export type TransactionType = 'وارد' | 'صادر' | 'مستهلك' | 'تحويل' | 'تسوية' | 'افتتاحي';

export interface InventoryTransaction {
  id: string;
  transactionNumber?: string;
  date: string;
  itemType?: string; // Kept for report generation compatibility
  itemId: string;
  itemCode: string;
  itemName: string;
  itemCategory?: string; // Extracted from items
  transactionType: TransactionType;
  transferType?: 'in' | 'out';
  quantity: number;
  unit?: string;
  storehouse?: string; // New: which warehouse this transaction occurred in
  stockBefore: number;
  stockAfter: number;
  executedBy: string;
  supplierOrReceiver: string;
  notes?: string;
  attachment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  itemType?: string;
  attachment?: string;
}

export interface CategoryConfig {
  name: string;
  prefix: string;
  startRange: number;
  endRange: number;
}

export interface PartnerEntity {
  id: string;
  name: string;
  type: 'مورد' | 'جهة مستلمة' | 'أخرى';
  phone?: string;
  notes?: string;
}

export interface AppSettings {
  organizationName: string;
  departmentName: string;
  expiryWarningThresholdDays: number;
  categories: CategoryConfig[];
  units: string[];
  storehouses: string[];
  cloudSyncEnabled?: boolean;
  firebaseInitialized?: boolean;
  storekeeperName?: string;
  systemManagerName?: string;
  healthDirectorName?: string;
  storekeeperRole?: string;
  systemManagerRole?: string;
  healthDirectorRole?: string;
  showStorekeeperSignature?: boolean;
  showSystemManagerSignature?: boolean;
  showHealthDirectorSignature?: boolean;
  transactionCounters?: {
    inbound: number;
    outbound: number;
    consumed: number;
    transfer?: number;
    adjustment?: number;
    opening?: number;
  };
  partners?: PartnerEntity[];
  openingStockAttachment?: string;
  openingStockAttachments?: Record<string, string>;
}

export interface SystemUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  permissions: string[];
  createdAt: string;
  password?: string;
}

export interface GeneratorLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string; // Arabic day name
  previousReading: number;
  currentReading: number;
  operatingHours: number; // currentReading - previousReading
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface GeneratorLogImpactItem {
  id: string;
  date: string;
  dayName: string;
  oldPreviousReading: number;
  newPreviousReading: number;
  oldCurrentReading: number;
  newCurrentReading: number;
  oldOperatingHours: number;
  newOperatingHours: number;
}

export interface GeneratorLogSimulationResult {
  actionType: 'add_old' | 'edit_old' | 'delete' | 'normal_save';
  affectedCount: number;
  lastAffectedRecordDate?: string;
  impactedItems: GeneratorLogImpactItem[];
  proposedLogs: GeneratorLogEntry[];
}




