import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Button, TextField, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, IconButton, Card, CardContent, Avatar, Chip, Checkbox, DialogContentText, Tabs, Tab, FormControlLabel } from '@mui/material';
import LoadingSpinner from '../components/LoadingSpinner';
import Grid from '@mui/system/Grid';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import TuneIcon from '@mui/icons-material/Tune';
import LayersIcon from '@mui/icons-material/Layers';
import StoreIcon from '@mui/icons-material/Store';
import SecurityIcon from '@mui/icons-material/Security';
import KeyIcon from '@mui/icons-material/Key';
import BackupIcon from '@mui/icons-material/Backup';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { dataService } from '../services/dataService';
import NotificationToast from '../components/NotificationToast';

import { AppSettings, CategoryConfig, SystemUser } from '../types';
import { auth, isFirebaseAvailable } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useLocation } from 'react-router-dom';
import { renderOption } from '../utils/emoji';


const APP_PERMISSIONS = [
  { id: 'dashboard_view', name: 'لوحة التحكم - عرض وتحليل', desc: 'استعراض البيانات والتحليل الرصيدي وحالات الإنذار' },
  { id: 'materials_view', name: 'الأصناف - عرض كرت الصنف', desc: 'تصفح وجرد الأصناف والمواد الكيميائية بالمستودعات' },
  { id: 'materials_create', name: 'الأصناف - إضافة صنف جديد', desc: 'إنشاء بطاقة صنف جديدة بترميز رقمي تلقائي مرمز' },
  { id: 'materials_edit', name: 'الأصناف - تعديل صنف', desc: 'تغيير بيانات بطاقة الصنف وحد الأمان والمخزن' },
  { id: 'materials_delete', name: 'الأصناف - حذف صنف', desc: 'حذف الأصناف والمواد من السجل (تتطلب عدم وجود معاملات)' },
  { id: 'materials_stocktake', name: 'الأصناف - تسوية الجرد السنوي الفعلي', desc: 'الوصول لواجهة الجرد الفعلي السنوي لتسوية وتعديل أرصدة المستودعات لتطابق الواقع' },
  { id: 'transactions_view', name: 'الحركات - عرض الحركات', desc: 'استعراض الحركات المخزنية المسجلة من معاملات التوريد والصرف' },
  { id: 'transactions_create', name: 'الحركات - تسجيل معاملة', desc: 'تسجيل توريد مواد أو صرف أذونات إمداد للمراكز والبلديات' },
  { id: 'transactions_delete', name: 'الحركات - حذف / إلغاء حركة مخزنية', desc: 'حذف حركات التوريد والصرف وإعادة رصد أرصدة المخازن' },
  { id: 'reports_view', name: 'التقارير - عرض وإنتاج', desc: 'الوصول لصفحة دفاتر كشف الحركات السنوية الفورية' },
  { id: 'reports_export', name: 'التقارير - تصدير Excel', desc: 'تحميل ملفات الجرد الفعلي الكلية بصيغة Excel' },
  { id: 'reports_print', name: 'التقارير - طباعة ورقية', desc: 'توليد أوراق الصرف والتوريد للطباعة اليدوية أو الحفظ الرقمي' },
  { id: 'audit_view', name: 'سجل النظام - عرض التدقيق', desc: 'متابعة وفحص سجل التدقيق التاريخي لكافة الحركات بالثانية والملقم' },
  { id: 'generator_log', name: 'سجل تشغيل المولد - عرض وإدارة', desc: 'الوصول لصفحة سجل تشغيل المولد وتسجيل وقراءة عداد الساعات والإحصائيات' },
  { id: 'settings_view', name: 'الإعدادات - عرض التهيئة', desc: 'الوصول لخصائص التهيئة العامة للمنظمة والترويسات' },
  { id: 'settings_edit', name: 'الإعدادات - تعديل الهوية', desc: 'تعديل أسماء الأقسام وهوية المؤسسة وتحديث التصنيفات والمخازن' },
  { id: 'users_manage', name: 'الإعدادات - إدارة المستخدمين', desc: 'إنشاء وتعديل وحذف مستخدمي وموظفي النظام وتعيين كافة مصفوفات الصلاحيات' },
  { id: 'system_reset', name: 'الإعدادات - إعادة الضبط الشامل', desc: 'صلاحية تصفير المنظومة بالكامل وحذف كافة السجلات وإرجاعها للحالة التأسيسية الفارغة' },
];

export default function Settings() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [settings, setSettings] = useState<AppSettings>({
    organizationName: '',
    departmentName: '',
    expiryWarningThresholdDays: 90,
    categories: [],
    units: [],
    storehouses: [],
  });

  // Users State
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);

  // User form fields
  const [userFullName, setUserFullName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  

  // New Category input states
  const [catName, setCatName] = useState('');
  const [catPrefix, setCatPrefix] = useState('');
  const [catStart, setCatStart] = useState<number | string>('');
  const [catEnd, setCatEnd] = useState<number | string>('');

  const [newUnit, setNewUnit] = useState('');
  const [newStorehouse, setNewStorehouse] = useState('');
  
  type EditType = 'category' | 'storehouse' | 'unit' | null;
  const [editDialog, setEditDialog] = useState<{type: EditType, index: number, value: string, prefix?: string, startRange?: number, endRange?: number, open: boolean}>({type: null, index: -1, value: '', prefix: '', startRange: 0, endRange: 0, open: false});

  // Backup-Restore & Reset States
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetAdminPassword, setResetAdminPassword] = useState('');
  const [driveBackupDialogOpen, setDriveBackupDialogOpen] = useState(false);
  const [driveStep, setDriveStep] = useState(0);
    const [driveError, setDriveError] = useState<string | null>(null);
    const [isFactoryResetting, setIsFactoryResetting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingTx, setIsImportingTx] = useState(false);
  const [_googleClientIdSetting, _setGoogleClientIdSetting] = useState(() => {
    return localStorage.getItem('google_drive_client_id_setting') || '';
  });

  // Partners (Suppliers & Receivers) States
  const [partnerFormOpen, setPartnerFormOpen] = useState(false);
  const [partnerEditMode, setPartnerEditMode] = useState(false);
  const [partnerId, setPartnerId] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerType, setPartnerType] = useState<'مورد' | 'جهة مستلمة' | 'أخرى'>('جهة مستلمة');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerNotes, setPartnerNotes] = useState('');
  const [deletePartnerDialogOpen, setDeletePartnerDialogOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<any | null>(null);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');

  useEffect(() => {
    const load = () => {
      setSettings(dataService.getSettings());
      setUsers(dataService.getUsers());
    };
    load();
    return dataService.subscribe(load);
  }, []);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataService.hasPermission('settings_edit')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية تعديل الإعدادات العامة (settings_edit).');
      return;
    }
    try {
      if (!settings.organizationName || !settings.departmentName) {
        setErrorMsg('جميع بيانات المؤسسة والإدارة حقول إجبارية بالكامل');
        return;
      }
      if (settings.expiryWarningThresholdDays <= 0) {
        setErrorMsg('عتبة التنبيه يجب أن تكون يوماً واحداً على الأقل');
        return;
      }
      dataService.saveSettings(settings);
      setSuccessMsg('تم حفظ المتغيرات وإعدادات المنظمة بنجاح، ستنعكس على كافة التقارير الفورية المنسقة آلياً.');
      
      
    } catch (err: any) {
      setErrorMsg('فشلت تعبئة الإعدادات العامة للمتحدث');
    }
  };

  // Partner entities actions
  const handleOpenAddPartner = () => {
    setPartnerEditMode(false);
    setPartnerId('');
    setPartnerName('');
    setPartnerType('جهة مستلمة');
    setPartnerPhone('');
    setPartnerNotes('');
    setPartnerFormOpen(true);
  };

  const handleOpenEditPartner = (p: any) => {
    setPartnerEditMode(true);
    setPartnerId(p.id);
    setPartnerName(p.name);
    setPartnerType(p.type);
    setPartnerPhone(p.phone || '');
    setPartnerNotes(p.notes || '');
    setPartnerFormOpen(true);
  };

  const handleSavePartner = () => {
    if (!dataService.hasPermission('settings_edit')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية تعديل الإعدادات والجهات الشريكة.');
      return;
    }
    const trimmedName = partnerName.trim();
    if (!trimmedName) {
      setErrorMsg('الرجاء إدخال اسم الجهة أو المورد بشكل صحيح.');
      return;
    }

    const currentPartners = settings.partners || [];
    let updatedPartners = [...currentPartners];

    // Check duplicated name (excluding current being edited)
    const isDuplicate = currentPartners.some(p => p.name.trim().toLowerCase() === trimmedName.toLowerCase() && p.id !== partnerId);
    if (isDuplicate) {
      setErrorMsg('الجهة أو المورد مسجل بالفعل بهذا الاسم مسبقاً.');
      return;
    }

    if (partnerEditMode) {
      updatedPartners = updatedPartners.map(p => p.id === partnerId ? {
        id: partnerId,
        name: trimmedName,
        type: partnerType,
        phone: partnerPhone.trim(),
        notes: partnerNotes.trim()
      } : p);
    } else {
      const newPartner = {
        id: 'part-' + Math.random().toString(36).substr(2, 9),
        name: trimmedName,
        type: partnerType,
        phone: partnerPhone.trim(),
        notes: partnerNotes.trim()
      };
      updatedPartners.push(newPartner);
    }

    const updatedSettings = {
      ...settings,
      partners: updatedPartners
    };

    try {
      dataService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setSuccessMsg(partnerEditMode ? 'تم تعديل بيانات الجهة الشريكة بنجاح.' : 'تمت إضافة الجهة الشريكة الجديدة بنجاح.');
      
      setPartnerFormOpen(false);
      
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء حفظ بيانات الجهة.');
    }
  };

  const handleOpenDeletePartner = (p: any) => {
    setPartnerToDelete(p);
    setDeletePartnerDialogOpen(true);
  };

  const handleConfirmDeletePartner = () => {
    if (!dataService.hasPermission('settings_edit')) {
      setErrorMsg('عذراً، لا تملك الصلاحية لحذف جهات أو موردين شريكة.');
      return;
    }
    if (!partnerToDelete) return;

    const currentPartners = settings.partners || [];
    const updatedPartners = currentPartners.filter(p => p.id !== partnerToDelete.id);

    const updatedSettings = {
      ...settings,
      partners: updatedPartners
    };

    try {
      dataService.saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setSuccessMsg('تم حذف الجهة الشريكة بنجاح.');
      
      setDeletePartnerDialogOpen(false);
      setPartnerToDelete(null);
      
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء حذف الجهة الشريكة.');
    }
  };

  const handleAddCategory = () => {
    if (!dataService.hasPermission('settings_edit')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية تعديل الإعدادات والبيانات المرجعية.');
      return;
    }
    const trimmedName = catName.trim();
    const trimmedPrefix = catPrefix.trim().toUpperCase();

    if (!trimmedName) {
      setErrorMsg('الرجاء إدخال اسم تصنيف صالح');
      return;
    }
    if (!trimmedPrefix) {
      setErrorMsg('الرجاء إدخال بادئة كود صالحة (حرف أو أكثر)');
      return;
    }
    if (catStart >= catEnd) {
      setErrorMsg('نهاية المدى الرقمي يجب أن تكون أكبر من البداية');
      return;
    }

    // Check duplication
    const nameExists = settings.categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase());
    const prefixExists = settings.categories.some(c => c.prefix.toLowerCase() === trimmedPrefix.toLowerCase());

    if (nameExists) {
      setErrorMsg('التصنيف بهذا الإسم مدخل بالفعل مسبقاً.');
      return;
    }
    if (prefixExists) {
      setErrorMsg('البادئة لهذه الفئة مستخدمة بالفعل في تصنيف آخر.');
      return;
    }

    const newStart = Number(catStart);
    const newEnd = Number(catEnd);
    const rangeOverlap = settings.categories.find(c => newStart <= c.endRange && newEnd >= c.startRange);
    if (rangeOverlap) {
      setErrorMsg(`المدى الرقمي يتعارض مع تصنيف "${rangeOverlap.name}" (${rangeOverlap.startRange} - ${rangeOverlap.endRange})`);
      return;
    }

    const newConfig: CategoryConfig = {
      name: trimmedName,
      prefix: trimmedPrefix,
      startRange: Number(catStart),
      endRange: Number(catEnd)
    };

    const updatedCategories = [...settings.categories, newConfig];
    const updated = { ...settings, categories: updatedCategories };
    
    setSettings(updated);
    dataService.saveSettings(updated);
    
    // Reset inputs
    setCatName('');
    setCatPrefix('');
    setCatStart('');
    setCatEnd('');
    
    setSuccessMsg('تمت إضافة تصنيف الصنف الجديد وربطه ببادئة المدى التلقائي بنجاح.');
    
  };

  const handleMoveArrayItem = (type: 'category' | 'storehouse' | 'unit', index: number, direction: 'up' | 'down') => {
    if (!dataService.hasPermission('settings_edit')) return;
    const items = [...(type === 'category' ? settings.categories : type === 'storehouse' ? settings.storehouses : settings.units)];
    if (direction === 'up' && index > 0) {
      [items[index - 1], items[index]] = [items[index], items[index - 1]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    }
    const updated = { ...settings };
    if (type === 'category') updated.categories = items as CategoryConfig[];
    if (type === 'storehouse') updated.storehouses = items as string[];
    if (type === 'unit') updated.units = items as string[];
    setSettings(updated);
    dataService.saveSettings(updated);
  };

  const handleSaveEditDialog = () => {
    if (!editDialog.value.trim() || editDialog.index < 0) return;
    const trimmed = editDialog.value.trim();
    const updated = { ...settings };
    
    let oldValue = '';
    
    if (editDialog.type === 'storehouse') {
       oldValue = settings.storehouses[editDialog.index];
       if (settings.storehouses.includes(trimmed)) { setErrorMsg('موجود مسبقاً'); return; }
       updated.storehouses[editDialog.index] = trimmed;
    } else if (editDialog.type === 'unit') {
       oldValue = settings.units[editDialog.index];
       if (settings.units.includes(trimmed)) { setErrorMsg('موجود مسبقاً'); return; }
       updated.units[editDialog.index] = trimmed;
    } else if (editDialog.type === 'category') {
       oldValue = settings.categories[editDialog.index].name;
       if (settings.categories.some((c, i) => i !== editDialog.index && c.name === trimmed)) { setErrorMsg('موجود مسبقاً'); return; }

       const newStart = editDialog.startRange || updated.categories[editDialog.index].startRange;
       const newEnd = editDialog.endRange || updated.categories[editDialog.index].endRange;
       const rangeOverlap = settings.categories.find((c, i) => i !== editDialog.index && newStart <= c.endRange && newEnd >= c.startRange);
       if (rangeOverlap) {
         setErrorMsg(`المدى الرقمي يتعارض مع تصنيف "${rangeOverlap.name}" (${rangeOverlap.startRange} - ${rangeOverlap.endRange})`);
         return;
       }

       updated.categories[editDialog.index] = { 
         ...updated.categories[editDialog.index], 
         name: trimmed,
         prefix: editDialog.prefix || updated.categories[editDialog.index].prefix,
         startRange: editDialog.startRange || updated.categories[editDialog.index].startRange,
         endRange: editDialog.endRange || updated.categories[editDialog.index].endRange
       };
    }
    
    setSettings(updated);
    dataService.saveSettings(updated);
    
    if (oldValue && editDialog.type) {
      dataService.updateReferenceValues(editDialog.type, oldValue, trimmed);
    }
    
    setEditDialog({ ...editDialog, open: false });
    setSuccessMsg('تم التعديل بنجاح وتم تحديث السجلات المرتبطة تلقائياً.');
    
  };

  const handleDeleteCategory = (name: string) => {
    if (!dataService.hasPermission('settings_edit')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية تعديل الإعدادات والبيانات المرجعية.');
      return;
    }
    if (settings.categories.length <= 1) {
      setErrorMsg('يجب إبقاء تصنيف واحد على الأقل بالنظام كقيمة مرجعية افتراضية لبطاقات المواد والمبيدات.');
      return;
    }
    const updatedCategories = settings.categories.filter(c => c.name !== name);
    const updated = { ...settings, categories: updatedCategories };
    
    setSettings(updated);
    dataService.saveSettings(updated);
    setSuccessMsg('تم إقصاء التصنيف بنجاح من قائمة التهيئة بنجاح.');
    
  };

  const handleAddUnit = () => {
    if (!dataService.hasPermission('settings_edit')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية تعديل الإعدادات والبيانات المرجعية.');
      return;
    }
    if (!newUnit.trim()) return;
    if (settings.units.includes(newUnit.trim())) {
      setErrorMsg('الوحدة مدخلة بالفعل بقائمة الخيارات.');
      return;
    }
    const updatedUnits = [...settings.units, newUnit.trim()];
    const updated = { ...settings, units: updatedUnits };
    setSettings(updated);
    dataService.saveSettings(updated);
    setNewUnit('');
    
    setSuccessMsg('تمت إضافة وحدة القياس للمخزون');
    
  };

  const handleDeleteUnit = (unit: string) => {
    if (!dataService.hasPermission('settings_edit')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية تعديل الإعدادات والبيانات المرجعية.');
      return;
    }
    if (settings.units.length <= 1) {
      setErrorMsg('يجب الإبقاء على وحدة قياس واحدة على الأقل بالدائرة للمحاسبة.');
      return;
    }
    const updatedUnits = settings.units.filter(u => u !== unit);
    const updated = { ...settings, units: updatedUnits };
    setSettings(updated);
    dataService.saveSettings(updated);
    setSuccessMsg('تم إقصاء وحدة القياس القياسية');
    
  };

  const handleAddStorehouse = () => {
    if (!dataService.hasPermission('settings_edit')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية تعديل الإعدادات والبيانات المرجعية.');
      return;
    }
    if (!newStorehouse.trim()) return;
    if (settings.storehouses.includes(newStorehouse.trim())) {
      setErrorMsg('المخزن مدخل بالفعل مسبقاً بقائمة الخيارات.');
      return;
    }
    const updatedStorehouses = [...settings.storehouses, newStorehouse.trim()];
    const updated = { ...settings, storehouses: updatedStorehouses };
    setSettings(updated);
    dataService.saveSettings(updated);
    setNewStorehouse('');
    
    setSuccessMsg('تمت إضافة مخزن ومستودع اللوازم بنجاح');
    
  };

  const handleDeleteStorehouse = (store: string) => {
    if (!dataService.hasPermission('settings_edit')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية تعديل الإعدادات والبيانات المرجعية.');
      return;
    }
    if (settings.storehouses.length <= 1) {
      setErrorMsg('يجب الإبقاء على مخزن رئيسي واحد على الأقل بالنظام كقيمة مرجعية.');
      return;
    }
    const updatedStorehouses = settings.storehouses.filter(s => s !== store);
    const updated = { ...settings, storehouses: updatedStorehouses };
    setSettings(updated);
    dataService.saveSettings(updated);
    setSuccessMsg('تم حذف المخزن بنجاح');
    
  };

  // User Management Handlers
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataService.hasPermission('users_manage')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية إدارة المستخدمين وتعديل الصلاحيات (users_manage).');
      return;
    }

    const fullName = userFullName.trim();
    const username = userUsername.trim().toLowerCase();
    const role = userRole.trim();
    

    if (!fullName || !username || !role) {
      setErrorMsg('الرجاء تعبئة كافة حقول بيانات المستخدم (الاسم الكامل، اسم المستخدم، والدور الوظيفي)');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(username)) {
      setErrorMsg('يجب أن يكون اسم المستخدم بصيغة بريد إلكتروني صالح (مثال: name@domain.com)');
      return;
    }


    if (userPermissions.length === 0) {
      setErrorMsg('يجب تعيين صلاحية واحدة على الأقل للمستخدم لتصفح النظام');
      return;
    }

    const newUserObj: SystemUser = {
      id: editingUser ? editingUser.id : `u-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fullName,
      username,
      role,
      
      permissions: userPermissions,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString()
    };

    const res = await dataService.saveUser(newUserObj);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg(res.message);
    
    setUsers(dataService.getUsers());

    // Reset user form
    setEditingUser(null);
    setUserFullName('');
    setUserUsername('');
    setUserRole('');
    
    
    setUserPermissions([]);

    
  };

  const handleDeleteUser = (id: string) => {
    if (!dataService.hasPermission('users_manage')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية إدارة المستخدمين.');
      return;
    }

    const res = dataService.deleteUser(id);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg(res.message);
    
    setUsers(dataService.getUsers());
    
    if (editingUser?.id === id) {
      setEditingUser(null);
      setUserFullName('');
      setUserUsername('');
      setUserRole('');
    
      
      setUserPermissions([]);
    }

    
  };

  const handleEditUserClick = (u: SystemUser) => {
    setEditingUser(u);
    setUserFullName(u.fullName);
    setUserUsername(u.username);
    setUserRole(u.role);
    
    setUserPermissions(u.permissions);
    
  };

  const handleCancelUserEdit = () => {
    setEditingUser(null);
    setUserFullName('');
    setUserUsername('');
    setUserRole('');
    
    
    setUserPermissions([]);
    
  };

  const handleTogglePermission = (permId: string) => {
    if (userPermissions.includes(permId)) {
      setUserPermissions(userPermissions.filter(p => p !== permId));
    } else {
      setUserPermissions([...userPermissions, permId]);
    }
  };

  const handleSelectAllPermissions = () => {
    setUserPermissions(APP_PERMISSIONS.map(p => p.id));
  };

  const handleClearAllPermissions = () => {
    setUserPermissions([]);
  };

  const parseExcelDate = (val: any): string => {
    if (!val && val !== 0) return new Date().toISOString().split('T')[0];
    if (typeof val === 'number') {
      const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
      }
    }
    const str = String(val).trim();
    if (!str) return new Date().toISOString().split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const parts = str.split(/[\/\.-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
  };

  const handleDownloadItemsTemplate = () => {
    const ws_data = [
      ["الكود", "الاسم", "التصنيف", "الوحدة", "حد الأمان", "الرصيد الافتتاحي", "موقع التخزين", "ملاحظات", "الشركة المصنعة", "تاريخ الإنتاج", "تاريخ الانتهاء", "درجة الخطورة"],
      ["MAT-001", "كلور بودرة 65%", "كلور ومواد كيميائية", "كجم", "150", "200", "المخزن الرئيسي", "مادة معقمة مخصصة لآبار ومياه الشرب والتعقيم البيئي", "", "", "", ""],
      ["MAT-002", "صابون سائل طبي للتعقيم", "معقمات ومطهرات", "لتر", "50", "100", "المخزن الرئيسي", "معقم أيدي طبي للمرافق الصحية والفرق الميدانية", "", "", "", ""],
      ["MAT-003", "أقراص تعقيم مياه NaDCC", "كلور ومواد كيميائية", "علبة", "100", "500", "المخزن الرئيسي", "تستخدم في حالات الطوارئ لتعقيم المياه السريع من مسببات الأمراض", "", "", "", ""],
      ["MAT-004", "خرطوم رش ضغط عالي 15 متر", "أدوات ومعدات رش", "قطعة", "5", "10", "المخزن الرئيسي", "متوافق مع مضخات الديزل وبخاخات الرش الكبيرة", "", "", "", ""],
      ["MAT-005", "بدلات واقية كيميائية كاملة", "أدوات ومعدات رش", "قطعة", "20", "50", "المخزن الرئيسي", "معدات وقاية شخصية لفرق رش المبيدات والكلور", "", "", "", ""],
      ["PES-001", "دلتامثرين 2.5% مستحلب مركز", "مبيدات حشرية", "لتر", "80", "150", "المخزن الرئيسي", "مبيد حشري فعال لمكافحة البعوض والحشرات الطائرة", "شركة غزة الكيماوية", "2025-06-01", "2026-08-15", "متوسط"],
      ["PES-002", "سايبرمثرين 10% EC", "مبيدات حشرية", "لتر", "40", "60", "المخزن الرئيسي", "مبيد فعال لمكافحة الزواحف والصراصير في خطوط الصرف الصحي", "الشركة العربية للمبيدات", "2024-01-10", "2026-03-10", "مرتفع"],
      ["PES-003", "بروماديولون طعوم قوارض مقاوم للرطوبة", "مصائد قوارض", "كجم", "120", "300", "المخزن الرئيسي", "مكعبات شمعية لمكافحة الفئران والجرذان", "مبيدات الشرق الأوسط", "2025-05-15", "2027-05-15", "مرتفع"],
      ["PES-004", "تيميفوس 1% حبيبات رملية", "مبيدات حشرية", "كجم", "200", "120", "المخزن الرئيسي", "يستخدم لمكافحة يرقات البعوض في المياه الراكدة", "سنجنتا الأردن", "2025-09-01", "2026-09-18", "منخفض"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الأصناف");
    XLSX.writeFile(wb, "نموذج_أصناف_المستودع.xlsx");
    setSuccessMsg('تم تنزيل قالب إكسل للأصناف بنجاح! يمكن تعديله وحفظه لرفعه مرة أخرى.');
  };

  const handleDownloadTransactionsTemplate = () => {
    const ws_data = [
      ["كود الصنف", "نوع الحركة", "الكمية", "المستودع", "المورد أو المستلم", "التاريخ", "ملاحظات"],
      ["MAT-001", "وارد", "500", "المخزن الرئيسي", "شركة توريد الكيماويات الفلسطينية", "2026-01-12", "شحنة توريد جديدة لتطهير الآبار والمرافق"],
      ["MAT-002", "وارد", "120", "المخزن الرئيسي", "الهلال الأحمر الفلسطيني", "2026-02-18", "تسهيل ومساعدة مجتمعية لمكاتب وفرق الرش"],
      ["MAT-003", "وارد", "300", "المخزن الرئيسي", "منظمة اليونيسيف العالمية", "2026-03-05", "شحنة إمدادات المياه والوقاية البيئية"],
      ["MAT-004", "وارد", "10", "المخزن الرئيسي", "مؤسسة التعاون الدولية", "2026-04-10", "توريد خراطيم ومعدات ضغط عالي"],
      ["MAT-005", "صادر", "30", "المخزن الرئيسي", "قسم مكافحة المكاره والفرق الميدانية", "2026-05-01", "صرف وتسليم للميدان مع التأكيد على الاستلام"],
      ["PES-001", "مستهلك", "15", "المخزن الرئيسي", "حملة رش برك الصرف الصحي", "2026-05-10", "استهلاك مباشر خلال حملة المكافحة الاستثنائية"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "قيود الحركات");
    XLSX.writeFile(wb, "نموذج_الحركات_والمعاملات.xlsx");
    setSuccessMsg('تم تنزيل قالب إكسل للقيود والحركات بنجاح!');
  };

  const handleImportItemsCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: "" });
        if (rows.length < 2) {
          setErrorMsg('الملف فارغ أو لا يحتوي على صفوف بيانات.');  setIsImporting(false); return;
        }
        let importedCount = 0; let updatedCount = 0; let skippedCount = 0; const errorLines: string[] = [];
        const currentSettings = dataService.getSettings();
        let settingsChanged = false;
        const existingCategories = new Set(currentSettings.categories.map((c: any) => c.name));
        const existingStorehouses = new Set(currentSettings.storehouses);
        const existingUnits = new Set(currentSettings.units);

        const existingMaterials = dataService.getMaterials();

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 2 || (!row[0] && !row[1])) { skippedCount++; continue; }
          const code = String(row[0] || '').trim() || `MAT-${Math.floor(1000 + Math.random() * 9000)}`;
          const name = String(row[1] || '').trim();
          if (!name) { skippedCount++; errorLines.push(`السطر ${i + 1}: اسم الصنف مفقود`); continue; }

          const category = String(row[2] || 'غير مصنف').trim();
          const unit = String(row[3] || 'وحدة').trim();
          const safeStockStr = String(row[4] || '0');
          const safeStockLimit = parseFloat(safeStockStr) || 0;
          const currentStockStr = String(row[5] || '0');
          const currentStock = parseFloat(currentStockStr) || 0;
          const storageLocation = String(row[6] || 'المخزن الرئيسي').trim();
          const note = String(row[7] || "").trim();
          const manufacturer = String(row[8] || "").trim();
          const mfgDate = row[9] ? parseExcelDate(row[9]) : "";
          const expDate = row[10] ? parseExcelDate(row[10]) : "";
          const hazardLevel = String(row[11] || "").trim();
          
          const isPesticide = code.toUpperCase().startsWith('PES') || category.includes('مبيد') || name.includes('مبيد');
          const itemType = isPesticide ? 'pesticide' : 'material';

          if (!existingCategories.has(category)) { 
            existingCategories.add(category); 
            currentSettings.categories.push({ name: category, prefix: isPesticide ? "PES" : "MAT", startRange: 1000, endRange: 1999 }); 
            settingsChanged = true; 
          }
          if (!existingStorehouses.has(storageLocation)) { 
            existingStorehouses.add(storageLocation); 
            currentSettings.storehouses.push(storageLocation); 
            settingsChanged = true; 
          }
          if (!existingUnits.has(unit)) { 
            existingUnits.add(unit); 
            currentSettings.units.push(unit); 
            settingsChanged = true; 
          }

          const existingItem = existingMaterials.find(m => m.code.toLowerCase() === code.toLowerCase() || m.name.toLowerCase() === name.toLowerCase());

          const itemData: any = {
            id: existingItem ? existingItem.id : ('mat-' + Math.random().toString(36).substr(2, 9)),
            code, name, type: itemType, category, unit, minimumStock: safeStockLimit, currentStock: existingItem ? existingItem.currentStock : currentStock, storageLocation, notes: note,
            createdAt: existingItem ? existingItem.createdAt : new Date().toISOString(), 
            updatedAt: new Date().toISOString()
          };

          if (isPesticide) {
            itemData.manufacturer = manufacturer; itemData.productionDate = mfgDate; itemData.expiryDate = expDate; itemData.hazardLevel = hazardLevel as any;
          }

          await dataService.saveMaterial(itemData);
          
          if (existingItem) {
            updatedCount++;
          } else {
            importedCount++;
            if (currentStock > 0) {
              const txData = { 
                id: 'tx-' + Math.random().toString(36).substr(2, 9), 
                date: new Date().toISOString().split('T')[0], 
                itemType: itemType, 
                itemId: itemData.id, 
                itemCode: itemData.code, 
                itemName: itemData.name, 
                itemCategory: itemData.category, 
                storehouse: storageLocation, 
                transactionType: 'افتتاحي' as any, 
                quantity: currentStock, 
                unit: itemData.unit, 
                stockBefore: 0, 
                stockAfter: currentStock, 
                executedBy: dataService.getCurrentUser().fullName || 'استيراد إكسل', 
                supplierOrReceiver: 'رصيد مخزني أولي (رصيد افتتاحي)', 
                notes: 'تم توليده تلقائياً من القالب الجماعي كتمهيد رصيد افتتاحي', 
                createdAt: new Date().toISOString(), 
                updatedAt: new Date().toISOString() 
              };
              await dataService.saveTransaction(txData as any);
            }
          }
        }

        if (settingsChanged) await dataService.saveSettings(currentSettings);
        dataService.logAudit(
          'استيراد إكسل جماعي للأصناف',
          `تم استيراد ${importedCount} أصناف جديدة وتحديث ${updatedCount} أصناف وتخطي ${skippedCount} أسطر من ملف الإكسل.`,
          'إعدادات'
        );

        let completionMsg = `تم تحليل واستيراد الأصناف الجماعية بنجاح! تم إضافة (${importedCount}) أصناف جديدة، وتحديث (${updatedCount}) أصناف، وتخطي (${skippedCount}) سطور.\n`;
        if (errorLines.length > 0) completionMsg += `ملاحظات: ` + errorLines.slice(0, 3).join(' | ');
        setSuccessMsg(completionMsg); if (errorLines.length > 0) setErrorMsg('تم تخطي بعض الأسطر لعدم استيفاء البيانات، يرجى مراجعتها.');
        setTimeout(() => { setIsImporting(false); window.location.reload(); }, 1500);
      } catch (err: any) { setIsImporting(false); setErrorMsg(`فشل استيراد الأصناف: ${err.message}`);  }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportTransactionsCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImportingTx(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: "" });
        
        if (rows.length < 2) {
          setErrorMsg('الملف فارغ أو لا يحتوي على صفوف بيانات.');
          
          setIsImportingTx(false);
          return;
        }

        let importedCount = 0;
        let skippedCount = 0;
        const errorLines: string[] = [];

        const currentSettings = dataService.getSettings();
        const existingUnits = new Set(currentSettings.units);
        const existingStorehouses = new Set(currentSettings.storehouses);
        const existingCategories = new Set(currentSettings.categories.map((c: any) => c.name));
        let settingsChanged = false;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 3 || (!row[0] && !row[1] && !row[2])) {
            skippedCount++;
            continue;
          }

          const itemCode = String(row[0] || '').trim();
          let txTypeRaw = String(row[1] || '').trim(); 
          const qtyValue = parseFloat(String(row[2])) || 0;
          
          if (!itemCode) {
            skippedCount++;
            errorLines.push(`السطر ${i + 1}: كود الصنف مفقود`);
            continue;
          }

          const existingMaterials = dataService.getMaterials();
          const targetItem = existingMaterials.find(m => m.code.toLowerCase() === itemCode.toLowerCase() || m.name.toLowerCase() === itemCode.toLowerCase() || m.id === itemCode);
          if (!targetItem) {
            skippedCount++;
            errorLines.push(`السطر ${i + 1}: الصنف/الكود (${itemCode}) غير مسجل بالأصناف!`);
            continue;
          }

          // Normalize transaction type
          let txTypeStr: any = 'وارد';
          const lowerType = txTypeRaw.toLowerCase();
          if (lowerType.includes('وارد') || lowerType.includes('ادخال') || lowerType.includes('إدخال') || lowerType.includes('تزويد')) {
            txTypeStr = 'وارد';
          } else if (lowerType.includes('صادر') || lowerType.includes('اخراج') || lowerType.includes('إخراج') || lowerType.includes('صرف') || lowerType.includes('توزيع')) {
            txTypeStr = 'صادر';
          } else if (lowerType.includes('مستهلك') || lowerType.includes('اتلاف') || lowerType.includes('إتلاف') || lowerType.includes('استهلاك')) {
            txTypeStr = 'مستهلك';
          } else if (lowerType.includes('تحويل')) {
            txTypeStr = 'تحويل';
          } else if (lowerType.includes('تسوية')) {
            txTypeStr = 'تسوية';
          } else if (lowerType.includes('افتتاحي') || lowerType.includes('أولي') || lowerType.includes('اولية')) {
            txTypeStr = 'افتتاحي';
          } else {
            skippedCount++;
            errorLines.push(`السطر ${i + 1}: نوع الحركة (${txTypeRaw}) غير معروف`);
            continue;
          }

          if (qtyValue <= 0) {
            skippedCount++;
            errorLines.push(`السطر ${i + 1}: الكمية (${qtyValue}) سالبة أو صفر!`);
            continue;
          }

          const storehouse = String(row[3] || targetItem.storageLocation || "المخزن الرئيسي").trim();
          const supplierOrReceiver = String(row[4] || "").trim() || (txTypeStr === 'وارد' ? 'جهة موردة' : 'جهة مستلمة');
          const dateStr = row[5] ? parseExcelDate(row[5]) : new Date().toISOString().split("T")[0];
          const notesValue = String(row[6] || "").trim() || "استيراد حركة إكسل جماعي";
          
          if (targetItem.unit && !existingUnits.has(targetItem.unit)) {
             existingUnits.add(targetItem.unit);
             currentSettings.units.push(targetItem.unit);
             settingsChanged = true;
          }
          if (storehouse && !existingStorehouses.has(storehouse)) {
             existingStorehouses.add(storehouse);
             currentSettings.storehouses.push(storehouse);
             settingsChanged = true;
          }
          if (targetItem.category && !existingCategories.has(targetItem.category)) {
             existingCategories.add(targetItem.category);
             currentSettings.categories.push({ name: targetItem.category, prefix: targetItem.type === 'pesticide' ? "PES" : "MAT", startRange: 1000, endRange: 1999 });
             settingsChanged = true;
          }

          if (supplierOrReceiver && supplierOrReceiver !== 'جهة موردة' && supplierOrReceiver !== 'جهة مستلمة' && supplierOrReceiver !== 'رصيد مخزني أولي (رصيد افتتاحي)' && !supplierOrReceiver.includes('جرد')) {
             if (!currentSettings.partners.some(p => p.name === supplierOrReceiver)) {
                currentSettings.partners.push({
                   id: 'partner-' + Math.random().toString(36).substr(2, 9),
                   name: supplierOrReceiver,
                   type: txTypeStr === 'وارد' ? 'مورد' : 'جهة مستلمة'
                });
                settingsChanged = true;
             }
          }

          const id = 'tx-imported-' + Math.random().toString(36).substr(2, 9);
          const nowStr = new Date().toISOString();

          const txData = {
            id,
            date: dateStr,
            itemType: targetItem.type,
            itemId: targetItem.id,
            itemCode: targetItem.code,
            itemName: targetItem.name,
            itemCategory: targetItem.category,
            storehouse: storehouse,
            transactionType: txTypeStr,
            quantity: qtyValue,
            unit: targetItem.unit,
            executedBy: dataService.getCurrentUser().fullName || 'استيراد إكسل',
            supplierOrReceiver,
            notes: notesValue,
            createdAt: nowStr,
            updatedAt: nowStr
          };

          const res = await dataService.saveTransaction(txData as any);
          if (res.success) {
            importedCount++;
          } else {
            skippedCount++;
            errorLines.push(`السطر ${i + 1}: ${res.message}`);
          }
        }
        
        if (settingsChanged) {
          await dataService.saveSettings(currentSettings);
        }

        dataService.logAudit(
          'استيراد إكسل جماعي للحركات',
          `تم استيراد ${importedCount} حركات جديدة وتخطي ${skippedCount} أسطر من ملف الإكسل.`,
          'إعدادات'
        );

        let completionMsg = `تحليل واستيراد المعاملات الجماعية تم بنجاح! تم رصد وتسجيل (${importedCount}) حركات جديدة وتخطي (${skippedCount}) سطور.\n`;
        if (errorLines.length > 0) {
          completionMsg += `أخطاء: ` + errorLines.slice(0, 3).join(' | ');
        }

        setSuccessMsg(completionMsg);
        if (errorLines.length > 0) {
          setErrorMsg('تم تخطي بعض الأسطر لعدم تطابق القيود، يرجى مراجعتها.');
        } else {
          
        }

        setTimeout(() => {
          setIsImportingTx(false);
          window.location.reload();
        }, 1500);

      } catch (err: any) {
        setIsImportingTx(false);
        setErrorMsg(`فشل استيراد الحركات: ${err.message || 'يرجى مراجعة الصياغة والتأكد من أنه ملف إكسل صحيح.'}`);
        
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Local JSON Backup Export
  const handleExportBackup = () => {
    try {
      const backupData = {
        materials: JSON.parse(localStorage.getItem('remix_materials_v1') || '[]'),
        transactions: JSON.parse(localStorage.getItem('remix_transactions_v1') || '[]'),
        users: JSON.parse(localStorage.getItem('remix_users_v1') || '[]').map((u: any) => { delete u.password; return u; }),
        settings: JSON.parse(localStorage.getItem('remix_settings_v1') || '{}'),
        auditLogs: JSON.parse(localStorage.getItem('remix_audit_logs_v1') || '[]'),
        backupVersion: '1.0',
        exportedAt: new Date().toISOString()
      };
      
      const fileContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([fileContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      
      const sanitizeName = (str: string) => str.replace(/[\/\\?%*:|"<>\s]+/g, '_');
      const orgPart = sanitizeName(settings.organizationName || 'organization');
      const deptPart = sanitizeName(settings.departmentName || 'department');
      const fileName = `${orgPart}_${deptPart}_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      downloadAnchor.setAttribute('download', fileName);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      
      setSuccessMsg('تم توليد وتحميل النسخة الاحتياطية بنجاح بصيغة ملف JSON ورقي مفعّل!');
      
    } catch (err) {
      setErrorMsg('فشل تصدير البيانات الاحتياطية. يرجى مراجعة الصلاحيات أو التكرار.');
      
    }
  };

  // Local JSON Backup Import
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        setSuccessMsg('جاري تحليل ملف النسخة الاحتياطية ومزامنة البيانات محلياً وسحابياً...');
        
        
        const res = await dataService.restoreBackupData(parsed);
        if (res.success) {
          setSuccessMsg('تم استلام وفك تشفير النسخة الاحتياطية ومزامنتها بنجاح! سيتم إعادة تنشيط الصفحة لتطبيق التغييرات.');
          
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setErrorMsg(res.message);
          
        }
      } catch (err) {
        setErrorMsg('صياغة ملف JSON المرفق تالفة كلياً أو غير قابلة للقراءة العادية.');
        
      }
    };
    fileReader.readAsText(file);
  };

  // Real Google Drive Backup Flow (JSON & Excel sheets)
  const proceedWithDriveUpload = async (accessToken: string) => {
    setDriveStep(2); // Generating files
    try {
      // 1. Gather backup data
      const materials = JSON.parse(localStorage.getItem('remix_materials_v1') || '[]');
      const transactions = JSON.parse(localStorage.getItem('remix_transactions_v1') || '[]');
      const users = JSON.parse(localStorage.getItem('remix_users_v1') || '[]');
      const localSettings = JSON.parse(localStorage.getItem('remix_settings_v1') || '{}');
      const auditLogs = JSON.parse(localStorage.getItem('remix_audit_logs_v1') || '[]');

      const backupData = {
        materials,
        transactions,
        users: users.map(u => { delete (u as any).password; return u; }),
        settings: localSettings,
        auditLogs,
        backupVersion: '1.0',
        exportedAt: new Date().toISOString()
      };

      const fileContent = JSON.stringify(backupData, null, 2);
      
      // 2. Generate Excel Buffer
      const workbook = new ExcelJS.Workbook();
      const fontName = 'Cairo';

      // Sheet 1: Materials
      const matSheet = workbook.addWorksheet('الأصناف والمواد', {
        views: [{ showGridLines: true, rightToLeft: true }]
      });
      matSheet.addRow([settings.organizationName || 'الأونروا - وكالة الغوث']).font = { name: fontName, size: 12, bold: true, color: { argb: '007AB7' } };
      matSheet.addRow(['سجل الجرد الفعلي الكلي للأصناف والمواد الكيميائية بالمستودعات']).font = { name: fontName, size: 14, bold: true, color: { argb: '0F172A' } };
      matSheet.addRow([`تاريخ الإصدار والنسخ السحابي: ${new Date().toLocaleDateString('ar-EG')} ${new Date().toLocaleTimeString('ar-EG')}`]).font = { name: fontName, size: 10, color: { argb: '475569' } };
      matSheet.addRow([]);

      const matHeaders = ['المعرف', 'رمز الصنف', 'اسم الصنف', 'التصنيف', 'الوحدة', 'الرصيد الحالي', 'حد الأمان', 'المستودع', 'ملاحظات'];
      const matHeaderRow = matSheet.addRow(matHeaders);
      matHeaderRow.height = 26;
      matHeaderRow.eachCell((cell) => {
        cell.font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '007AB7' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      materials.forEach((m: any) => {
        const row = matSheet.addRow([
          m.id || '',
          m.code || '',
          m.name || '',
          m.category || '',
          m.unit || '',
          Number(m.currentStock) || 0,
          Number(m.minimumStock) || 0,
          m.storageLocation || '',
          m.notes || ''
        ]);
        row.height = 22;
      });

      // Sheet 2: Transactions
      const txSheet = workbook.addWorksheet('حركات المخزون', {
        views: [{ showGridLines: true, rightToLeft: true }]
      });
      txSheet.addRow([settings.organizationName || 'الأونروا - وكالة الغوث']).font = { name: fontName, size: 12, bold: true, color: { argb: '007AB7' } };
      txSheet.addRow(['سجل حركات المخزون - معاملات التوريد والصرف السنوية الكلية']).font = { name: fontName, size: 14, bold: true, color: { argb: '0F172A' } };
      txSheet.addRow([`تاريخ الإصدار والنسخ السحابي: ${new Date().toLocaleDateString('ar-EG')} ${new Date().toLocaleTimeString('ar-EG')}`]).font = { name: fontName, size: 10, color: { argb: '475569' } };
      txSheet.addRow([]);

      const txHeaders = ['رقم الحركة', 'رمز الصنف', 'اسم الصنف', 'نوع الحركة', 'الكمية', 'التاريخ', 'رقم المستند', 'الجهة المستلمة / جهة التوريد', 'بواسطة'];
      const txHeaderRow = txSheet.addRow(txHeaders);
      txHeaderRow.height = 26;
      txHeaderRow.eachCell((cell) => {
        cell.font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      transactions.forEach((t: any) => {
        const row = txSheet.addRow([
          t.id || '',
          t.itemCode || '',
          t.itemName || '',
          t.transactionType === 'وارد' ? 'توريد (+)' : t.transactionType === 'صادر' ? 'صرف (-)' : 'استهلاك (-)',
          Number(t.quantity) || 0,
          t.date || '',
          t.transactionNumber || '',
          t.supplierOrReceiver || '',
          t.executedBy || ''
        ]);
        row.height = 22;
      });

      // Sheet 3: Audit Logs
      const auditSheet = workbook.addWorksheet('سجل التدقيق والمراقبة', {
        views: [{ showGridLines: true, rightToLeft: true }]
      });
      auditSheet.addRow([settings.organizationName || 'الأونروا - وكالة الغوث']).font = { name: fontName, size: 12, bold: true, color: { argb: '007AB7' } };
      auditSheet.addRow(['سجل التدقيق التاريخي للعمليات وحركات النظام بالثانية']).font = { name: fontName, size: 14, bold: true, color: { argb: '0F172A' } };
      auditSheet.addRow([`تاريخ الإصدار والنسخ السحابي: ${new Date().toLocaleDateString('ar-EG')} ${new Date().toLocaleTimeString('ar-EG')}`]).font = { name: fontName, size: 10, color: { argb: '475569' } };
      auditSheet.addRow([]);

      const auditHeaders = ['الوقت والتاريخ', 'المستخدم', 'الإجراء الرئيسي', 'التفاصيل والعملية الجارية', 'العنوان والملقم'];
      const auditHeaderRow = auditSheet.addRow(auditHeaders);
      auditHeaderRow.height = 26;
      auditHeaderRow.eachCell((cell) => {
        cell.font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '475569' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      auditLogs.forEach((a: any) => {
        const row = auditSheet.addRow([
          a.timestamp || '',
          a.user || '',
          a.action || '',
          a.details || '',
          a.ipAddress || ''
        ]);
        row.height = 22;
      });

      // Auto-fit Column Widths across worksheets
      [matSheet, txSheet, auditSheet].forEach((ws) => {
        ws.columns.forEach((column: any) => {
          let maxLen = 12;
          column.eachCell({ includeEmpty: true }, (cell: any) => {
            if (cell.value) {
              const strLen = cell.value.toString().length;
              if (strLen > maxLen) {
                maxLen = strLen;
              }
            }
          });
          column.width = Math.min(Math.max(maxLen + 4, 13), 42);
        });
      });

      const excelBuffer = await workbook.xlsx.writeBuffer();

      // 3. Start JSON upload
      setDriveStep(3);
      const sanitizeName = (str: string) => str.replace(/[\/\\?%*:|"<>\s]+/g, '_');
      const orgPart = sanitizeName(settings.organizationName || 'organization');
      const deptPart = sanitizeName(settings.departmentName || 'department');
      const dateStr = new Date().toISOString().split('T')[0];
      
      const jsonFileName = `${orgPart}_${deptPart}_backup_${dateStr}.json`;
      const excelFileName = `${orgPart}_${deptPart}_backup_${dateStr}.xlsx`;

      // Upload JSON File
      const jsonMetadata = {
        name: jsonFileName,
        mimeType: 'application/json'
      };
      const jsonMetadataBlob = new Blob([JSON.stringify(jsonMetadata)], { type: 'application/json' });
      const jsonMediaBlob = new Blob([fileContent], { type: 'application/json' });

      const jsonFormData = new FormData();
      jsonFormData.append('metadata', jsonMetadataBlob);
      jsonFormData.append('file', jsonMediaBlob);

      const jsonResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: jsonFormData
      });

      if (!jsonResponse.ok) {
        const errorText = await jsonResponse.text();
        throw new Error(`تعذر رفع ملف JSON: ${errorText || jsonResponse.statusText}`);
      }

      // 4. Start Excel upload
      setDriveStep(4);

      const excelMetadata = {
        name: excelFileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      const excelMetadataBlob = new Blob([JSON.stringify(excelMetadata)], { type: 'application/json' });
      const excelMediaBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const excelFormData = new FormData();
      excelFormData.append('metadata', excelMetadataBlob);
      excelFormData.append('file', excelMediaBlob);

      const excelResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: excelFormData
      });

      if (!excelResponse.ok) {
        const errorText = await excelResponse.text();
        throw new Error(`تعذر رفع ملف Excel: ${errorText || excelResponse.statusText}`);
      }

      // 5. Completion!
      setDriveStep(5);
      dataService.recordGoogleDriveBackupTime();
      
      // Log audit
      dataService.logAudit(
        'نسخ احتياطي سحابي حقيقي', 
        `تم بنجاح تصدير وتأمين وحفظ ملفين (JSON و Excel للتقرير الكلي) في حساب Google Drive الخاص بالمستخدم`, 
        'إعدادات'
      );

    } catch (err: any) {

      setDriveError(err.message || 'حدث خطأ غير متوقع أثناء توليد أو رفع كشوف النسخ السحابي.');
    }
  };

  const handleGoogleDriveBackup = async () => {
    setDriveBackupDialogOpen(true);
    setDriveStep(1);
    setDriveError(null);

    try {
      if (!isFirebaseAvailable || !auth) {
        throw new Error('خدمة Firebase غير متوفرة حالياً لمزامنة البيانات.');
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');

      // Use standard Firebase signInWithPopup which handles domain callbacks seamlessly
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error('تعذر الحصول على رمز الوصول (Access Token) من Google.');
      }

      await proceedWithDriveUpload(accessToken);
    } catch (err: any) {

      let message = err.message || 'حدث خطأ غير متوقع أثناء الاتصال بـ Google.';
      if (err.code === 'auth/popup-blocked') {
        message = 'تم حظر نافذة تسجيل الدخول المنبثقة. يرجى السماح بالنوافذ المنبثقة (Popups) في متصفحك والمحاولة مجدداً.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'تم إغلاق نافذة تسجيل الدخول بواسطة المستخدم.';
      }
      setDriveError(message);
    }
  };

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('triggerBackup') === 'true') {
      // Trigger backup
      handleGoogleDriveBackup();
      // Remove query param to prevent re-triggering
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [location.search]);

  
  // Factory reset trigger
  const handlePerformFactoryReset = async () => {
    const cleanStr = resetConfirmText.trim().toLowerCase();
    if (cleanStr !== 'تاكيد' && cleanStr !== 'confirm' && resetConfirmText.trim() !== 'تأكيد' && resetConfirmText.trim() !== 'تاكيد') {
      setErrorMsg('النص المدخل غير صحيح! يرجى كتابة كلمة "تاكيد" بدقة لإتمام إعادة الضبط.');
      setResetDialogOpen(false);
      return;
    }

    if (!resetAdminPassword.trim()) {
      setErrorMsg('الرجاء إدخال كلمة المرور الحالية الخاصة بك كمدير للتحقق.');
      setResetDialogOpen(false);
      return;
    }
    
    try {
      setIsFactoryResetting(true);
      
      // Admin Password Verification layer
      const currentUser = dataService.getCurrentUser();
      if (currentUser) {
        const expected = currentUser.password || (currentUser.username === 'admin@system.com' ? 'admin' : '123456');
        if (resetAdminPassword !== expected) {
          setIsFactoryResetting(false);
          setErrorMsg('كلمة المرور غير صحيحة! لا يمكن إتمام العملية بدون التحقق من هوية المدير.');
          return;
        }
      }

      await dataService.resetToFactoryDefaults();
      setResetDialogOpen(false);
      setSuccessMsg('تمت إعادة تهيئة المنظومة بالكامل بنجاح واستعادة التهيئة التأسيسية! جاري إعادة التوجيه لصفحة تسجيل الدخول...');
      
      setTimeout(() => {
        setIsFactoryResetting(false);
        window.location.reload();
      }, 1500);
    } catch {
      setIsFactoryResetting(false);
      setErrorMsg('حدث خطأ أثناء إجراء المسح الكلي، يرجى تصفير ذاكرة المتصفح يدوياً.');
    }
  };

  return (
    <Box sx={{ p: 1, direction: 'rtl' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'start' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
          بوابة التهيئة الفنية وإدارة الفاقد والصلاحيات
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontFamily: '"Cairo", sans-serif' }}>
          تخصيص هوية المؤسسة لترويسات الفواتير والتقارير، وإدارة مستودعات التوزيع، وتحرير مصفوفات الأمان والمستخدمين والتبديل بينهم
        </Typography>
      </Box>

      {/* Tabs Menu Navigation */}
            <Tabs 
        value={activeTab} 
        onChange={(_, val) => setActiveTab(val)} 
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ 
          mb: 4, 
          borderBottom: '1px solid #e2e8f0',
          '& .MuiTabs-indicator': { bgcolor: '#007ab7' },
          '& .MuiTab-root': { fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' },
          '& .Mui-selected': { color: '#007ab7 !important' }
        }}
      >
        <Tab icon={<BusinessIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="الهوية المؤسسية والتوقيعات" />
        <Tab icon={<LayersIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="خيارات تهيئة المستودعات والأصناف" />
        <Tab icon={<PeopleIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="الجهات والموردين" />
        <Tab icon={<SecurityIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="الحسابات والصلاحيات" />
        <Tab icon={<BackupIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="النسخ الاحتياطي والاستعادة" />
      </Tabs>

      {/* Info messages */}
      

      {/* Tab 0: Core Reference Settings */}
      {activeTab === 0 && (
        <Grid container spacing={3} sx={{ pt: 1 }}>
          {/* Core Settings Form */}
          <Grid size={{ xs: 12, md: 10, lg: 8 }} sx={{ mx: 'auto' }}>
            <Paper sx={{ p: 3, border: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <BusinessIcon sx={{ color: '#007ab7' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                  هوية ومسميات الجهة والمؤسسة لترويسة التقارير
                </Typography>
              </Box>
              <form onSubmit={handleSaveGeneral}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="عنوان رئيسي (المؤسسة / الإدارة العليا)"
                    placeholder="مثال: جهود خدمات المستودعات"
                    value={settings.organizationName}
                    onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                    helperText="العنوان الأول الرئيسي الذي يظهر في أعلى تقارير الجرد والحركات"
                    slotProps={{
                      inputLabel: { style: { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } },
                      formHelperText: { style: { fontFamily: '"Cairo", sans-serif', textAlign: 'start' } }
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="عنوان فرعي (القسم / الدائرة التشغيلية)"
                    placeholder="مثال: قسم إصحاح ومكافحة الملاريا"
                    value={settings.departmentName}
                    onChange={(e) => setSettings({ ...settings, departmentName: e.target.value })}
                    helperText="العنوان الثاني الذي يظهر مباشرة تحت العنوان الأول في الترويسات"
                    slotProps={{
                      inputLabel: { style: { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } },
                      formHelperText: { style: { fontFamily: '"Cairo", sans-serif', textAlign: 'start' } }
                    }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="عتبة التنبيه لانتهاء صلاحية الأصناف والمواد (بالأيام)"
                    placeholder="مثال: 90 يوماً"
                    value={settings.expiryWarningThresholdDays}
                    onChange={(e) => setSettings({ ...settings, expiryWarningThresholdDays: parseInt(e.target.value, 10) || 90 })}
                    helperText="مراقبة الصلاحية التلقائية والتحذير بالمستودعات"
                    slotProps={{
                      inputLabel: { style: { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } },
                      formHelperText: { style: { fontFamily: '"Cairo", sans-serif', textAlign: 'start' } }
                    }}
                  />

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                    توقيعات التقارير الرسمية:
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1.5 }}>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField
                          fullWidth
                          label="مسمى التوقيع الأول"
                          placeholder="مثال: أمين المخزن"
                          value={settings.storekeeperRole || ''}
                          onChange={(e) => setSettings({ ...settings, storekeeperRole: e.target.value })}
                          slotProps={{
                            inputLabel: { style: { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } }
                          }}
                          sx={{ bgcolor: '#ffffff' }}
                        />
                        <TextField
                          fullWidth
                          label={settings.storekeeperRole?.trim() ? `اسم ${settings.storekeeperRole.trim()}` : "اسم صاحب التوقيع الأول"}
                          placeholder="مثال: م. فلان الفلاني"
                          value={settings.storekeeperName || ''}
                          onChange={(e) => setSettings({ ...settings, storekeeperName: e.target.value })}
                          slotProps={{
                            inputLabel: { style: { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } }
                          }}
                          sx={{ bgcolor: '#ffffff' }}
                        />
                      </Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={settings.showStorekeeperSignature !== false}
                            onChange={(e) => setSettings({ ...settings, showStorekeeperSignature: e.target.checked })}
                            size="small"
                            sx={{ color: '#007ab7', '&.Mui-checked': { color: '#007ab7' } }}
                          />
                        }
                        label={
                          <Typography sx={{ fontFamily: '"Cairo", sans-serif', fontSize: '0.85rem', color: '#475569' }}>
                            تفعيل وإظهار التوقيع الأول
                          </Typography>
                        }
                      />
                    </Box>

                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField
                          fullWidth
                          label="مسمى التوقيع الثاني"
                          placeholder="مثال: مدير النظام"
                          value={settings.systemManagerRole || ''}
                          onChange={(e) => setSettings({ ...settings, systemManagerRole: e.target.value })}
                          slotProps={{
                            inputLabel: { style: { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } }
                          }}
                          sx={{ bgcolor: '#ffffff' }}
                        />
                        <TextField
                          fullWidth
                          label={settings.systemManagerRole?.trim() ? `اسم ${settings.systemManagerRole.trim()}` : "اسم صاحب التوقيع الثاني"}
                          placeholder="مثال: م. فلان الفلاني"
                          value={settings.systemManagerName || ''}
                          onChange={(e) => setSettings({ ...settings, systemManagerName: e.target.value })}
                          slotProps={{
                            inputLabel: { style: { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } }
                          }}
                          sx={{ bgcolor: '#ffffff' }}
                        />
                      </Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={settings.showSystemManagerSignature !== false}
                            onChange={(e) => setSettings({ ...settings, showSystemManagerSignature: e.target.checked })}
                            size="small"
                            sx={{ color: '#007ab7', '&.Mui-checked': { color: '#007ab7' } }}
                          />
                        }
                        label={
                          <Typography sx={{ fontFamily: '"Cairo", sans-serif', fontSize: '0.85rem', color: '#475569' }}>
                            تفعيل وإظهار التوقيع الثاني
                          </Typography>
                        }
                      />
                    </Box>

                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1, flexDirection: { xs: 'column', md: 'row' } }}>
                        <TextField
                          fullWidth
                          label="مسمى التوقيع الثالث"
                          placeholder="مثال: مدير صحة البيئة"
                          value={settings.healthDirectorRole || ''}
                          onChange={(e) => setSettings({ ...settings, healthDirectorRole: e.target.value })}
                          slotProps={{
                            inputLabel: { style: { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } }
                          }}
                          sx={{ bgcolor: '#ffffff' }}
                        />
                        <TextField
                          fullWidth
                          label={settings.healthDirectorRole?.trim() ? `اسم ${settings.healthDirectorRole.trim()}` : "اسم صاحب التوقيع الثالث"}
                          placeholder="مثال: د. فلان الفلاني"
                          value={settings.healthDirectorName || ''}
                          onChange={(e) => setSettings({ ...settings, healthDirectorName: e.target.value })}
                          slotProps={{
                            inputLabel: { style: { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } }
                          }}
                          sx={{ bgcolor: '#ffffff' }}
                        />
                      </Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={settings.showHealthDirectorSignature !== false}
                            onChange={(e) => setSettings({ ...settings, showHealthDirectorSignature: e.target.checked })}
                            size="small"
                            sx={{ color: '#007ab7', '&.Mui-checked': { color: '#007ab7' } }}
                          />
                        }
                        label={
                          <Typography sx={{ fontFamily: '"Cairo", sans-serif', fontSize: '0.85rem', color: '#475569' }}>
                            تفعيل وإظهار التوقيع الثالث
                          </Typography>
                        }
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1 }} />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ bgcolor: '#007ab7', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', borderRadius: '10px', px: 3, py: 1.1, '&:hover': { bgcolor: '#006293' } }}
                  >
                    حفظ الهوية العامة والتوقيعات
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>

                  </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3} sx={{ pt: 1 }}>
          {/* Categories management Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, border: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <LayersIcon sx={{ color: '#007ab7' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                  خيارات وتصنيفات أصناف المخازن
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontFamily: '"Cairo", sans-serif' }}>
                قم بتخصيص مدى البادئة والترميز الرقمي لضمان توليد الكود آلياً عند إدخال كرت صنف جديد (مثال: MAT من 1000 إلى 2000)
              </Typography>

              {/* Structured Category Config Form */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc', mb: 3, borderColor: '#e2e8f0' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#334155', mb: 2, fontFamily: '"Cairo", sans-serif' }}>
                  إضافة تصنيف جديد بمدى رقمي مخصص للترميز:
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="اسم التصنيف"
                      placeholder="مثال: مبيدات حشرية"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      slotProps={{ inputLabel: { style: { fontFamily: '"Cairo", sans-serif' } } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="رمز البادئة الكودية"
                      placeholder="مثال: MAT أو PES"
                      value={catPrefix}
                      onChange={(e) => setCatPrefix(e.target.value)}
                      slotProps={{ inputLabel: { style: { fontFamily: '"Cairo", sans-serif' } } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="بداية التسلسل الرقمي"
                      placeholder="1000"
                      value={catStart}
                      onChange={(e) => setCatStart(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      onFocus={(e) => e.target.select()}
                      slotProps={{ inputLabel: { style: { fontFamily: '"Cairo", sans-serif' } } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="نهاية التسلسل الرقمي"
                      placeholder="2000"
                      value={catEnd}
                      onChange={(e) => setCatEnd(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      onFocus={(e) => e.target.select()}
                      slotProps={{ inputLabel: { style: { fontFamily: '"Cairo", sans-serif' } } }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleAddCategory}
                      startIcon={<AddIcon sx={{ ml: 1, mr: -0.5 }} />}
                      sx={{ bgcolor: '#007ab7', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', borderRadius: '8px', py: 0.8, '&:hover': { bgcolor: '#006293' } }}
                    >
                      حفظ وإدراج التصنيف
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* List rendered with detailed config information */}
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#475569', fontFamily: '"Cairo", sans-serif' }}>
                التصنيفات المفعلة حالياً ونطاق أكوادها الرقمية:
              </Typography>
              <List sx={{ maxHeight: 220, overflowY: 'auto', bgcolor: '#fdfdfd', borderRadius: '12px' }}>
                {settings.categories.map((cat, index) => (
                  <ListItem 
                    key={cat.name} 
                    divider 
                    sx={{ py: 1.5, px: 2 }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <IconButton size="small" onClick={() => handleMoveArrayItem('category', index, 'up')} disabled={index === 0}>
                          <ArrowUpwardIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleMoveArrayItem('category', index, 'down')} disabled={index === settings.categories.length - 1}>
                          <ArrowDownwardIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" color="primary" onClick={() => setEditDialog({type: 'category', index, value: cat.name, prefix: cat.prefix, startRange: cat.startRange, endRange: cat.endRange, open: true})}>
                          <EditIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteCategory(cat.name)}>
                          <DeleteIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                      </Box>
                    }
                  >
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                        {cat.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={`البادئة: ${cat.prefix}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '10px', color: '#007ab7', borderColor: '#b3d7ea', fontFamily: '"Cairo", sans-serif' }} />
                        <Chip label={`المدى: ${cat.startRange} - ${cat.endRange}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '10px', color: '#10b981', borderColor: '#a7f3d0', fontFamily: '"Cairo", sans-serif' }} />
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Storehouses Card Management */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, border: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <StoreIcon sx={{ color: '#007ab7' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                  مستودعات ومخازن التوزيع للأصناف بالجهة
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontFamily: '"Cairo", sans-serif' }}>
                إضافة وإقصاء مخازن الدائرة لتوزيع مواقع الحفظ
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="مثال: مخزن خان يونس المركزي..."
                  value={newStorehouse}
                  onChange={(e) => setNewStorehouse(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddStorehouse}
                  startIcon={<AddIcon sx={{ ml: 1, mr: -0.5 }} />}
                  sx={{ bgcolor: '#007ab7', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', borderRadius: '10px', '&:hover': { bgcolor: '#006293' } }}
                >
                  إضافة
                </Button>
              </Box>

              <List sx={{ maxHeight: 220, overflowY: 'auto', bgcolor: '#fdfdfd', borderRadius: '12px' }}>
                {settings.storehouses.map((store, index) => (
                  <ListItem 
                    key={store} 
                    divider 
                    sx={{ py: 1.5, px: 2 }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <IconButton size="small" onClick={() => handleMoveArrayItem('storehouse', index, 'up')} disabled={index === 0}>
                          <ArrowUpwardIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleMoveArrayItem('storehouse', index, 'down')} disabled={index === settings.storehouses.length - 1}>
                          <ArrowDownwardIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" color="primary" onClick={() => setEditDialog({type: 'storehouse', index, value: store, open: true})}>
                          <EditIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteStorehouse(store)}>
                          <DeleteIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText primary={<Typography sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold' }}>{store}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Units management Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, border: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <TuneIcon sx={{ color: '#007ab7' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                  وحدات التوزيع والمقاييس القياسية
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5, fontFamily: '"Cairo", sans-serif' }}>
                إدارة وحدات التعبئة والتوزيع في الكشوفات اليومية والتقارير العامة
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="أضف وحدة قياس: كجم، كرتونة، برميل..."
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleAddUnit}
                  startIcon={<AddIcon sx={{ ml: 1, mr: -0.5 }} />}
                  sx={{ bgcolor: '#007ab7', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', borderRadius: '10px', '&:hover': { bgcolor: '#006293' } }}
                >
                  إضافة
                </Button>
              </Box>

              <List sx={{ maxHeight: 220, overflowY: 'auto', bgcolor: '#fdfdfd', borderRadius: '12px' }}>
                {settings.units.map((un, index) => (
                  <ListItem 
                    key={un} 
                    divider 
                    sx={{ py: 1.5, px: 2 }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                        <IconButton size="small" onClick={() => handleMoveArrayItem('unit', index, 'up')} disabled={index === 0}>
                          <ArrowUpwardIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleMoveArrayItem('unit', index, 'down')} disabled={index === settings.units.length - 1}>
                          <ArrowDownwardIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" color="primary" onClick={() => setEditDialog({type: 'unit', index, value: un, open: true})}>
                          <EditIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteUnit(un)}>
                          <DeleteIcon sx={{ fontSize: '16px' }} />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText primary={<Typography sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold' }}>{un}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Box sx={{ pt: 1 }}>
          {/* Header Action Section */}
          <Paper sx={{ p: 3, mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'start' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                قاعدة بيانات الجهات والموردين الشركاء 🤝
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontFamily: '"Cairo", sans-serif' }}>
                إدارة شركاء التوريد والجهات الحكومية والأهلية المستلمة لتنظيم وتسهيل توثيق حركات الصرف والوارد
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleOpenAddPartner}
              startIcon={<AddIcon sx={{ ml: 1, mr: -0.5 }} />}
              sx={{
                bgcolor: '#007ab7',
                fontWeight: 'bold',
                fontFamily: '"Cairo", sans-serif',
                borderRadius: '10px',
                px: 3,
                py: 1.2,
                '&:hover': { bgcolor: '#005e8c' }
              }}
            >
              إضافة شريك جديد (جهة / مورد)
            </Button>
          </Paper>

          {/* Search bar */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', direction: 'rtl' }}>
            <TextField
              placeholder="ابحث باسم الشريك أو رقم الهاتف..."
              variant="outlined"
              size="small"
              value={partnerSearchQuery}
              onChange={(e) => setPartnerSearchQuery(e.target.value)}
              sx={{
                flexGrow: 1,
                minWidth: '250px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontFamily: '"Cairo", sans-serif',
                  bgcolor: 'white'
                }
              }}
            />
          </Box>

          {/* Grid list of Partners */}
          <Grid container spacing={3}>
            {(settings.partners || [])
              .filter(p => {
                const query = partnerSearchQuery.trim().toLowerCase();
                if (!query) return true;
                return p.name.toLowerCase().includes(query) || (p.phone && p.phone.includes(query)) || (p.notes && p.notes.toLowerCase().includes(query));
              })
              .map((p, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${p.id}-${idx}`}>
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      boxShadow: '0 10px 18px rgba(0,0,0,0.05)' 
                    }
                  }}>
                    <CardContent sx={{ p: 3, flexGrow: 1, textAlign: 'start' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip 
                          label={p.type === 'مورد' ? 'مورد شريك 🚚' : p.type === 'جهة مستلمة' ? 'جهة مستلمة 🏢' : 'شريك آخر ⚙️'} 
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            fontFamily: '"Cairo", sans-serif',
                            bgcolor: p.type === 'مورد' ? '#fef2f2' : p.type === 'جهة مستلمة' ? '#f0f9ff' : '#f1f5f9',
                            color: p.type === 'مورد' ? '#ef4444' : p.type === 'جهة مستلمة' ? '#0284c7' : '#64748b',
                            border: `1px solid ${p.type === 'مورد' ? '#fca5a5' : p.type === 'جهة مستلمة' ? '#bae6fd' : '#cbd5e1'}`
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif', mb: 1 }}>
                        {p.name}
                      </Typography>
                      {p.phone ? (
                        <Typography variant="body2" sx={{ color: '#475569', fontFamily: '"Cairo", sans-serif', display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <strong>الهاتف:</strong> {p.phone}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontFamily: '"Cairo", sans-serif', fontStyle: 'italic', mb: 1.5 }}>
                          لا يوجد رقم هاتف مسجل
                        </Typography>
                      )}
                      {p.notes ? (
                        <Typography variant="body2" sx={{ color: '#64748b', fontFamily: '"Cairo", sans-serif', fontSize: '0.85rem', bgcolor: '#f8fafc', p: 1.5, borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          {p.notes}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#cbd5e1', fontFamily: '"Cairo", sans-serif', fontSize: '0.85rem', fontStyle: 'italic' }}>
                          لا توجد ملاحظات إضافية
                        </Typography>
                      )}
                    </CardContent>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'flex-start', gap: 1, bgcolor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                      <Button
                        size="small"
                        onClick={() => handleOpenEditPartner(p)}
                        startIcon={<EditIcon sx={{ ml: 0.5, mr: -0.5, fontSize: 16 }} />}
                        sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold', color: '#007ab7' }}
                      >
                        تعديل
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeletePartner(p)}
                        startIcon={<DeleteIcon sx={{ ml: 0.5, mr: -0.5, fontSize: 16 }} />}
                        sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold' }}
                      >
                        حذف
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            {(settings.partners || []).length === 0 && (
              <Grid size={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="body1" sx={{ color: '#64748b', fontFamily: '"Cairo", sans-serif' }}>
                    لم يتم تسجيل أي جهة شريكة أو مورد حتى الآن في النظام.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        !dataService.hasPermission('users_manage') ? (
          <Paper sx={{ p: 5, textAlign: 'center', bgcolor: 'white' }}>
            <SecurityIcon sx={{ fontSize: 60, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', color: '#1e293b' }}>
              إدارة شؤون الموظفين ومصفوفة التفويضات محمية بالكامل
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 1.5, fontFamily: '"Cairo", sans-serif', maxWidth: '500px', mx: 'auto', lineHeight: 1.6 }}>
              عذراً، يتطلب الوصول لقاعدة الموظفين وتعديل مصفوفات الصلاحيات الحصول على رخصة تفويض <strong>إدارة المستخدمين (users_manage)</strong> المتاحة لمدير النظام الفني فقط.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
          {/* List of current users */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                  الحسابات النشطة بالخادم ({users.length})
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontFamily: '"Cairo", sans-serif' }}>
                  انقر فوق أي بطاقة مستخدم لتهيئة بياناتها، تعديل تفويضاتها بالكامل، أو سحب حسابه الفعلي.
                </Typography>
              </Box>
              <Divider />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '600px', overflowY: 'auto', pr: 0.5 }}>
                {users.map((u, idx) => {
                  const isSelf = dataService.getCurrentUser().id === u.id;
                  const isSelected = editingUser?.id === u.id;
                  return (
                    <Card 
                      className="user-card"
                      key={`${u.id}-${idx}`} 
                      onClick={() => handleEditUserClick(u)}
                      sx={{ 
                        cursor: 'pointer', 
                        border: isSelected ? '2px solid #007ab7' : '1px solid #e2e8f0',
                        boxShadow: isSelected ? '0 4px 12px rgba(0, 122, 183, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                        borderRadius: '12px',
                        bgcolor: isSelected ? '#f0f9ff' : 'white',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#007ab7', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }
                      }}
                    >
                      <CardContent sx={{ p: 2, pb: 3, '&:last-child': { pb: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                            <Avatar sx={{ bgcolor: isSelected ? '#007ab7' : '#e2e8f0', color: isSelected ? 'white' : '#475569', width: 40, height: 40, fontSize: '1rem', fontWeight: 'bold' }}>
                              {u.fullName.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a', fontFamily: '"Cairo", sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {u.fullName}
                                </Typography>
                                {isSelf && <Chip label="أنت حالياً" size="small" color="primary" sx={{ height: 18, fontSize: '9px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif' }} />}
                              </Box>
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0, fontFamily: '"Cairo", sans-serif', direction: 'ltr', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {u.username} 
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={u.role} 
                            size="small" 
                            sx={{ 
                              bgcolor: u.permissions.length === APP_PERMISSIONS.length ? '#ecfdf5' : '#f1f5f9', 
                              color: u.permissions.length === APP_PERMISSIONS.length ? '#059669' : '#475569', 
                              fontWeight: 'bold', 
                              fontSize: '11px',
                              fontFamily: '"Cairo", sans-serif',
                              flexShrink: 0
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mb: 1, fontFamily: '"Cairo", sans-serif', textAlign: 'start' }}>
                          الصلاحيات المفعّلة: ({u.permissions.length} من {APP_PERMISSIONS.length})
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, direction: 'rtl', justifyContent: 'flex-start' }}>
                          {u.permissions.slice(0, 4).map(pId => {
                            const pInfo = APP_PERMISSIONS.find(ap => ap.id === pId);
                            return (
                              <Chip 
                                key={pId} 
                                label={pInfo ? pInfo.name.split(' - ')[1] || pInfo.name : pId} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '10px', height: 20, color: '#007ab7', borderColor: '#b3d7ea', fontFamily: '"Cairo", sans-serif' }} 
                              />
                            );
                          })}
                          {u.permissions.length > 4 && (
                            <Chip 
                              label={`+${u.permissions.length - 4}`} 
                              size="small" 
                              sx={{ fontSize: '10px', height: 20 }} 
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', pt: 1, mt: 'auto', pb: 0.5 }}>
                          <Button 
                            size="small" 
                            color="error" 
                            startIcon={<DeleteIcon sx={{ ml: 0.5, mr: -0.5 }} />} 
                            disabled={isSelf}
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(u);
                              setDeleteUserDialogOpen(true);
                            }}
                            sx={{ fontSize: '11px', py: 0, fontFamily: '"Cairo", sans-serif' }}
                          >
                            حذف الموظف
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          {/* Create / Edit Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 3, border: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <KeyIcon sx={{ color: '#007ab7' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                  {editingUser ? `تحديث صلاحيات الحساب وتعديله: ${editingUser.fullName}` : 'صياغة بطاقة حساب جديدة للموظف'}
                </Typography>
              </Box>
              
              <form onSubmit={handleSaveUser}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="الاسم الرباعي للموظف"
                      placeholder="أدخل اسم الموظف بالكامل"
                      value={userFullName}
                      onChange={(e) => setUserFullName(e.target.value)}
                      required
                      slotProps={{ inputLabel: { style: { fontFamily: '"Cairo", sans-serif' } } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="البريد الإلكتروني (لتسجيل الدخول)"
                      placeholder="مثال: name@domain.com"
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      required
                      type="email"
                      disabled={!!editingUser}
                      slotProps={{ inputLabel: { style: { fontFamily: '"Cairo", sans-serif' } } }}
                    />
                  </Grid>
                  {!editingUser && (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info" sx={{ fontFamily: '"Cairo", sans-serif', borderRadius: '8px' }}>
                        سيتمكن هذا الموظف من تعيين كلمة المرور الخاصة به تلقائياً عند أول عملية تسجيل دخول يقوم بها.
                      </Alert>
                    </Grid>
                  )}
                  {editingUser && (
                    <Grid size={{ xs: 12 }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        startIcon={<KeyIcon />}
                        onClick={() => {
                          const users = dataService.getUsers();
                          const idx = users.findIndex(u => u.id === editingUser?.id);
                          if (idx !== -1) {
                            users[idx].password = '123456';
                            localStorage.setItem('remix_users_v1', JSON.stringify(users));
                            setSuccessMsg('تم إعادة تعيين كلمة المرور إلى الافتراضية: 123456');
                          } else {
                            setErrorMsg('يرجى حفظ المستخدم أولاً قبل إعادة التعيين.');
                          }
                        }}
                        sx={{ fontFamily: '"Cairo", sans-serif', mb: 2 }}
                      >
                        إعادة التعيين للكلمة الافتراضية (123456)
                      </Button>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ fontFamily: '"Cairo", sans-serif' }}>الدور والمسمى الوظيفي المعتمد</InputLabel>
                      <Select
                        value={userRole}
                        label="الدور والمسمى الوظيفي المعتمد"
                        onChange={(e) => {
                          const val = e.target.value;
                          setUserRole(val);
                          if (val === 'مدير نظام') {
                            setUserPermissions(APP_PERMISSIONS.map(p => p.id));
                          } else if (val === 'أمين مستودع') {
                            setUserPermissions(['dashboard_view', 'materials_view', 'materials_create', 'materials_edit', 'materials_stocktake', 'transactions_view', 'transactions_create', 'reports_view', 'reports_export', 'reports_print']);
                          } else if (val === 'مراجع/مُشاهد') {
                            setUserPermissions(['dashboard_view', 'materials_view', 'transactions_view', 'reports_view', 'audit_view']);
                          }
                        }}
                        sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold' }}
                      >
                        <MenuItem value="مدير نظام">{renderOption("مدير نظام")}</MenuItem>
                        <MenuItem value="أمين مستودع">{renderOption("أمين مستودع")}</MenuItem>
                        <MenuItem value="مراجع/مُشاهد">{renderOption("مراجع/مُشاهد")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ textAlign: 'start' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                          مصفوفة تفويض الصلاحيات الفنية 🗝️
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontFamily: '"Cairo", sans-serif' }}>
                          اختر الصلاحيات المحددة التي يُسمح لهذا الحساب بالقيام بها على النظام.
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={handleSelectAllPermissions} sx={{ borderRadius: '6px', fontSize: '11px', fontFamily: '"Cairo", sans-serif' }}>
                          منح الكل 🎖️
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={handleClearAllPermissions} sx={{ borderRadius: '6px', fontSize: '11px', fontFamily: '"Cairo", sans-serif' }}>
                          سحب الكل ❌
                        </Button>
                      </Box>
                    </Box>

                    {/* Permissions Checklist Layout */}
                    <Grid container spacing={2} sx={{ maxHeight: '350px', overflowY: 'auto', p: 2, borderRadius: '12px', bgcolor: '#fdfdfd' }}>
                      {APP_PERMISSIONS.map((p, idx) => {
                        const isChecked = userPermissions.includes(p.id);
                        return (
                          <Grid size={{ xs: 12, sm: 6 }} key={`${p.id}-${idx}`}>
                            <Paper 
                              variant="outlined" 
                              onClick={() => handleTogglePermission(p.id)}
                              sx={{ 
                                p: 1.5, 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                transition: '0.15s',
                                bgcolor: isChecked ? '#f0f9ff' : 'white',
                                borderColor: isChecked ? '#007ab7' : '#e2e8f0',
                                '&:hover': { bgcolor: '#f1f5f9' },
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1
                              }}
                            >
                              <Checkbox 
                                checked={isChecked}
                                onChange={() => {}} // parent Paper handled
                                sx={{ p: 0.2 }}
                              />
                              <Box sx={{ textAlign: 'start' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b', fontSize: '0.8rem', fontFamily: '"Cairo", sans-serif' }}>
                                  {p.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '10px', display: 'block', mt: 0.2, fontFamily: '"Cairo", sans-serif' }}>
                                  {p.desc}
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>

                  <Grid size={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                    {editingUser && (
                      <>
                        <Button 
                          variant="outlined" 
                          color="error"
                          onClick={() => {
                            const isSelf = dataService.getCurrentUser().id === editingUser.id;
                            if (isSelf) {
                              setErrorMsg("لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول منه!");
                              return;
                            }
                            setUserToDelete(editingUser);
                            setDeleteUserDialogOpen(true);
                          }}
                          startIcon={<DeleteIcon sx={{ ml: 0.5, mr: -0.5 }} />}
                          sx={{ borderRadius: '10px', fontFamily: '"Cairo", sans-serif', borderColor: 'error.main' }}
                        >
                          حذف المستخدم 🗑️
                        </Button>
                        <Button 
                          variant="outlined" 
                          onClick={handleCancelUserEdit}
                          sx={{ borderRadius: '10px', fontFamily: '"Cairo", sans-serif' }}
                        >
                          إلغاء التعديل
                        </Button>
                      </>
                    )}
                    
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon sx={{ ml: 1, mr: -0.5 }} />}
                      sx={{ bgcolor: '#007ab7', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', borderRadius: '10px', px: 3, py: 1.1, '&:hover': { bgcolor: '#006293' } }}
                    >
                      {editingUser ? 'حفظ الصلاحيات المُعدّلة' : 'توليد وتفعيل الحساب والمصفوفة'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
        )
      )}

      {activeTab === 4 && (
        <Grid container spacing={3} sx={{ pt: 1 }}>
          
          {/* Card 1: Local Backup & Restore */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 4, borderRadius: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ p: 1, bgcolor: '#f0f9ff', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                  <BackupIcon sx={{ color: '#007ab7' }} />
                </Box>
                <Box sx={{ textAlign: 'start' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                    النسخ الاحتياطي المحلي واستيراد البيانات
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontFamily: '"Cairo", sans-serif' }}>
                    تصدير سجل المستودعات الحالي وحفظه كملف جيسون (JSON)
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flexGrow: 1, textAlign: 'start' }}>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, fontFamily: '"Cairo", sans-serif' }}>
                  يمكنك إنشاء نسخة احتياطية كاملة من قاعدة بيانات التطبيق، تشمل بيانات المواد والمعاملات وحسابات الموظفين وصلاحياتهم وسجلات تدقيق العمليات، وحفظها كملف رقمي مستقل على جهازك.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mt: 'auto', pt: 2, width: '100%' }}>
                  <Button
                    variant="contained"
                    onClick={handleExportBackup}
                    startIcon={<CloudDownloadIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ 
                      bgcolor: '#007ab7', 
                      fontWeight: 'bold', 
                      fontFamily: '"Cairo", sans-serif', 
                      borderRadius: '12px', 
                      px: 3, 
                      py: 1.5, 
                      flex: 1,
                      '&:hover': { bgcolor: '#006293' } 
                    }}
                  >
                    تنزيل النسخة الاحتياطية (.json)
                  </Button>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ 
                      borderColor: '#475569',
                      color: '#475569',
                      fontWeight: 'bold', 
                      fontFamily: '"Cairo", sans-serif', 
                      borderRadius: '12px', 
                      px: 3, 
                      py: 1.5, 
                      flex: 1,
                      '&:hover': { borderColor: '#1e293b', bgcolor: '#f8fafc' } 
                    }}
                  >
                    رفع واستعادة نسخة سابقة
                    <input
                      type="file"
                      accept=".json"
                      hidden
                      onChange={handleImportBackup}
                    />
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Card 2: Google Drive Cloud Backup */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 4, borderRadius: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ p: 1, bgcolor: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                  <AutorenewIcon sx={{ color: '#16a34a' }} />
                </Box>
                <Box sx={{ textAlign: 'start' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e293b', fontFamily: '"Cairo", sans-serif' }}>
                    مُزامنة التخزين السحابي (Google Drive)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontFamily: '"Cairo", sans-serif' }}>
                    تأمين الأرصدة عبر الرفع المباشر لسجل الجرد إلى حساب غوغل درايف
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, textAlign: 'start' }}>
                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, fontFamily: '"Cairo", sans-serif' }}>
                  تتيح لك هذه الميزة تسجيل الدخول المباشر والآمن بحساب Google Drive الخاص بك (أو أي حساب ترغب بالرفع إليه) لرفع وحفظ كشوف الحركات والأصناف تلقائياً؛ كإجراء وقائي ضد تلف الأجهزة المحلية. يقوم النظام برفع ملفين معاً بضغطة زر واحدة: نسخة قاعدة البيانات الشاملة لغرض الاسترجاع (JSON)، وتقرير الجرد السنوي الكلي المنسق كجدول إلكتروني (Excel).
                </Typography>



                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', width: '100%' }}>
                  <Button
                    variant="contained"
                    onClick={handleGoogleDriveBackup}
                    startIcon={<CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ 
                      bgcolor: '#16a34a', 
                      fontWeight: 'bold', 
                      color: 'white',
                      fontFamily: '"Cairo", sans-serif', 
                      borderRadius: '12px', 
                      px: 3, 
                      py: 1.5, 
                      width: '100%',
                      '&:hover': { bgcolor: '#15803d' },
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
                    }}
                  >
                    تصدير ومزامنة لـ Google Drive السحابي
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Card 5: Excel Bulk Import & Export Templates */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Paper sx={{ p: 4, borderRadius: '20px', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ p: 1, bgcolor: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                  <CloudDownloadIcon sx={{ color: '#16a34a' }} />
                </Box>
                <Box sx={{ textAlign: 'start' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827', fontFamily: '"Cairo", sans-serif' }}>
                    استيراد وتصدير الجرد جماعياً عبر قالب إكسل
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontFamily: '"Cairo", sans-serif' }}>
                    تغذية المنظومة بالأصناف والحركات دفعة واحدة، أو تنزيل القوالب القياسية المعتمدة للتعبئة اليدوية
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* Section 1: Items Template & Import */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 3, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#0f172a', fontFamily: '"Cairo", sans-serif' }}>
                      ١. مصفوفة بطاقات الأصناف والمواد
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontSize: '0.82rem', fontFamily: '"Cairo", sans-serif', lineHeight: 1.6 }}>
                      تنزيل الملف القياسي لتعبئة الأصناف والمواد المخزنية والمستودعات بشكل جماعي، ثم إعادة رفعه لتأسيس الأرصدة التلقائية دون الحاجة لإدخالها فرادى.
                    </Typography>

                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, flexDirection: { xs: 'column', xl: 'row' }, width: '100%' }}>
                      <Button
                        variant="outlined"
                        onClick={handleDownloadItemsTemplate}
                        startIcon={<CloudDownloadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ borderColor: '#007ab7', color: '#007ab7', borderRadius: '12px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', py: 1.5, flex: 1, '&:hover': { bgcolor: 'rgba(0,122,183,0.05)', borderColor: '#006293' } }}
                      >
                        تنزيل قالب الأصناف
                      </Button>

                      <Button
                        variant="contained"
                        component="label"
                        disabled={isImporting}
                        startIcon={isImporting ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ bgcolor: '#007ab7', borderRadius: '12px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', py: 1.5, flex: 1, '&:hover': { bgcolor: '#006293' } }}
                      >
                        {isImporting ? 'جاري الاستيراد...' : 'رفع واستيراد الأصناف (.xlsx)'}
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          hidden
                          onChange={handleImportItemsCSV}
                        />
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {/* Section 2: Transactions Template & Import */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ p: 3, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#0f172a', fontFamily: '"Cairo", sans-serif' }}>
                      ٢. قيود المعاملات والحركات المخزنية (توريد وصرف)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontSize: '0.82rem', fontFamily: '"Cairo", sans-serif', lineHeight: 1.6 }}>
                      تنزيل القالب المعد لتسجيل عمليات التوريد والصرف والاستهلاك جماعياً. تأكد من مطابقة أكواد الأصناف المكتوبة هنا بما هو معرف مسبقاً بقاعدة بيانات النظام لإجراء محاسبة الرصيد بدقة.
                    </Typography>

                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, flexDirection: { xs: 'column', xl: 'row' }, width: '100%' }}>
                      <Button
                        variant="outlined"
                        onClick={handleDownloadTransactionsTemplate}
                        startIcon={<CloudDownloadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ borderColor: '#16a34a', color: '#16a34a', borderRadius: '12px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', py: 1.5, flex: 1, '&:hover': { bgcolor: 'rgba(22,163,74,0.05)', borderColor: '#15803d' } }}
                      >
                        تنزيل قالب الحركات
                      </Button>

                      <Button
                        variant="contained"
                        component="label"
                        disabled={isImportingTx}
                        startIcon={isImportingTx ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ bgcolor: '#16a34a', borderRadius: '12px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', py: 1.5, flex: 1, '&:hover': { bgcolor: '#15803d' } }}
                      >
                        {isImportingTx ? 'جاري الاستيراد...' : 'رفع واستيراد الحركات (.xlsx)'}
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          hidden
                          onChange={handleImportTransactionsCSV}
                        />
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Card 3: Dangerous Factory Reset */}
          {dataService.hasPermission('system_reset') && (
            <Grid size={12}>
              <Paper 
                sx={{ 
                  p: 4, 
                  borderRadius: '20px', 
                  border: '1px solid #fee2e2', 
                  bgcolor: '#fffbfb',
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  alignItems: { xs: 'flex-start', md: 'center' },
                  justifyContent: 'space-between',
                  gap: 3 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1.5, bgcolor: '#fee2e2', borderRadius: '14px', display: 'flex', alignItems: 'center' }}>
                    <DeleteForeverIcon sx={{ color: '#dc2626', fontSize: 28 }} />
                  </Box>
                  <Box sx={{ textAlign: 'start' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#991b1b', fontFamily: '"Cairo", sans-serif' }}>
                      منطقة العمليات الخطرة: إعادة الضبط الشامل للمنظومة (المحو الكلي المرتجع)
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f1d1d', mt: 0.5, fontFamily: '"Cairo", sans-serif' }}>
                      يؤدي الضغط على هذا الخيار إلى مسح كافة القيوز، وتصفير الأرصدة، وحذف جميع المبرمجات والمعزل والعودة للافتراضيات التأسيسية للمديرية.
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  onClick={() => {
                    setResetConfirmText('');
                    setResetDialogOpen(true);
                  }}
                  startIcon={<DeleteForeverIcon sx={{ ml: 1, mr: -0.5 }} />}
                  sx={{ 
                    bgcolor: '#dc2626', 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontFamily: '"Cairo", sans-serif', 
                    borderRadius: '12px', 
                    width: '100%',
                    px: 4, 
                    py: 1.5, 
                    '&:hover': { bgcolor: '#b91c1c' },
                    boxShadow: '0 6px 16px rgba(220, 38, 38, 0.2)'
                  }}
                >
                  بدء إجراء إعادة الضبط الشامل
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Google Drive Status Dialog */}
      <Dialog 
        open={driveBackupDialogOpen} 
        onClose={() => {
          if (driveStep === 5 || driveError) {
            setDriveBackupDialogOpen(false);
          }
        }}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '20px',
            p: 1,
            maxWidth: '460px',
            width: '100%',
            direction: 'rtl'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold', textAlign: 'center', color: driveError ? '#ef4444' : '#16a34a' }}>
          {driveError ? '⚠️ فشل الاتصال أو الرفع السحابي' : '📤 تصدير ومزامنة البيانات سحابياً'}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', mb: 3 }}>
              {driveError ? (
                <Box 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    bgcolor: '#fef2f2', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '3px solid #ef4444'
                  }}
                >
                  <Typography variant="h4" sx={{ color: '#ef4444' }}>✕</Typography>
                </Box>
              ) : driveStep < 5 ? (
                <LoadingSpinner message="جاري تجهيز النسخة الاحتياطية..." />
              ) : (
                <Box 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: '50%', 
                    bgcolor: '#f0fdf4', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '3px solid #16a34a'
                  }}
                >
                  <Typography variant="h4" sx={{ color: '#16a34a' }}>✓</Typography>
                </Box>
              )}
            </Box>

            {driveError ? (
              <Alert severity="error" sx={{ width: '100%', fontFamily: '"Cairo", sans-serif', textAlign: 'start', borderRadius: '12px', mb: 2 }}>
                {driveError}
              </Alert>
            ) : (
              <>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#334155', mb: 1, fontFamily: '"Cairo", sans-serif' }}>
                  {driveStep === 1 && 'جاري التحقق من الهوية وفتح نافذة تسجيل الدخول من Google...'}
                  {driveStep === 2 && 'جاري توليد ملفات النسخ الاحتياطي (JSON و Excel)...'}
                  {driveStep === 3 && 'جاري رفع ملف البيانات الشامل (JSON) إلى Google Drive...'}
                  {driveStep === 4 && 'جاري رفع تقرير الجرد المنسق (Excel) إلى Google Drive...'}
                  {driveStep === 5 && 'اكتمل النسخ السحابي بنجاح وتأمين الكشوفات! 🎉'}
                </Typography>

                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2, fontFamily: '"Cairo", sans-serif' }}>
                  {driveStep < 5 
                    ? 'يرجى عدم إغلاق هذه النافذة ريثما تكتمل جميع خطوات الرفع والتأمين السحابي...' 
                    : `تم حفظ وتأمين ملفات البيانات والتقارير بنجاح باسم: ${settings.organizationName || 'backup'}_${new Date().toISOString().split('T')[0]}.xlsx / .json`}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setDriveBackupDialogOpen(false)} 
            variant="contained"
            disabled={driveStep < 5 && !driveError}
            sx={{ 
              bgcolor: driveError ? '#ef4444' : '#16a34a', 
              fontWeight: 'bold', 
              fontFamily: '"Cairo", sans-serif', 
              borderRadius: '10px', 
              px: 4, 
              '&:hover': { bgcolor: driveError ? '#dc2626' : '#15803d' } 
            }}
          >
            إغلاق النافذة
          </Button>
        </DialogActions>
      </Dialog>

      {/* Factory Reset Safe Confirm Dialog */}
      <Dialog 
        open={resetDialogOpen} 
        onClose={() => setResetDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            p: 1,
            maxWidth: '500px',
            width: '100%',
            direction: 'rtl'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold', color: '#991b1b', display: 'flex', alignItems: 'center', gap: 1, textAlign: 'start' }}>
          ⚠️ تأكيد إجراء عملية إعادة الضبط الفورية والشاملة
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'start' }}>
          <DialogContentText sx={{ fontFamily: '"Cairo", sans-serif', color: '#475569', fontSize: '0.9rem', mb: 3, mt: 1, lineHeight: 1.7 }}>
            أنت على وشك تنفيذ عملية <strong>مدمرة ولا يمكن التراجع عنها</strong>. ستؤدي هذه المعاملة إلى:
            <br />
            1. حذف كافة الأصناف والكميات المدخلة حالياً.
            <br />
            2. إفراغ الدفاتر المحاسبية وأرشيف حركة الوارد والصرف.
            <br />
            3. إلغاء جميع حسابات المستخدمين عدا حساب المسؤول التأسيسي.
            <br />
            4. إعادة ضبط إعدادات التهيئة للقسم والمؤسسة وقائمة التصنيفات والمستودعات والعودة إلى الافتراضيات التأسيسية المعتمدة (التصنيفات الافتراضية، المخزن الرئيسي، وحدات القياس، ومستلم افتراضي <strong>Admin/Admin</strong>).
          </DialogContentText>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#334155', fontFamily: '"Cairo", sans-serif' }}>
              كلمة المرور الحالية للمدير (للتحقق من الصلاحية):
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="password"
              placeholder="أدخل كلمة المرور الحالية"
              value={resetAdminPassword}
              onChange={(e) => setResetAdminPassword(e.target.value)}
              sx={{ '& input': { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' }, mb: 2 }}
            />

            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#334155', fontFamily: '"Cairo", sans-serif' }}>
              الرجاء كتابة كلمة <span style={{ color: '#dc2626', fontWeight: 'bold' }}>"تاكيد"</span> في الحقل أدناه لإكمال الإجراء:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="اكتب تاكيد هنا"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              sx={{ '& input': { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, direction: 'rtl' }}>
          <Button 
            onClick={() => setResetDialogOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: '10px', fontFamily: '"Cairo", sans-serif', flexGrow: 1 }}
          >
            إلغاء وتراجع 🛡️
          </Button>
          <Button 
            onClick={handlePerformFactoryReset} 
            variant="contained"
            disabled={isFactoryResetting || (resetConfirmText.trim() !== 'تاكيد' && resetConfirmText.trim().toLowerCase() !== 'confirm' && resetConfirmText.trim() !== 'تأكيد')}
            startIcon={isFactoryResetting ? <CircularProgress size={20} color="inherit" sx={{ ml: 1, mr: -1 }} /> : undefined}
            sx={{ 
              bgcolor: '#dc2626', 
              '&:hover': { bgcolor: '#b91c1c' }, 
              fontWeight: 'bold', 
              fontFamily: '"Cairo", sans-serif',
              borderRadius: '10px',
              flexGrow: 1
            }}
          >
            {isFactoryResetting ? 'جاري إعادة الضبط...' : 'موافق، إعادة الضبط والمسح 🗑️'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Deletion Elegant Confirmation Dialog */}
      <Dialog 
        open={deleteUserDialogOpen} 
        onClose={() => setDeleteUserDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            p: 1.5,
            maxWidth: '480px',
            width: '100%',
            direction: 'rtl'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 1, textAlign: 'start' }}>
          ⚠️ تأكيد حذف حساب الموظف
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'start' }}>
          <DialogContentText sx={{ fontFamily: '"Cairo", sans-serif', color: '#475569', fontSize: '0.95rem', mt: 1, lineHeight: 1.7 }}>
            هل أنت متأكد من رغبتك في حذف حساب الموظف <strong>"{userToDelete?.fullName}"</strong> وسحب كافة صلاحياته من النظام بالكامل؟
            <br />
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>تنبيه:</span> هذا الإجراء سيمنع المستخدم فوراً من الدخول إلى المنظومة (الحساب المرتبط: <code>{userToDelete?.username}</code>).
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, direction: 'rtl' }}>
          <Button 
            onClick={() => setDeleteUserDialogOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: '10px', fontFamily: '"Cairo", sans-serif', flexGrow: 1, color: '#64748b', borderColor: '#cbd5e1' }}
          >
            إلغاء الأمر 🛡️
          </Button>
          <Button 
            onClick={() => {
              if (userToDelete) {
                handleDeleteUser(userToDelete.id);
              }
              setDeleteUserDialogOpen(false);
            }} 
            variant="contained"
            sx={{ 
              bgcolor: '#dc2626', 
              '&:hover': { bgcolor: '#b91c1c' }, 
              fontWeight: 'bold', 
              fontFamily: '"Cairo", sans-serif',
              borderRadius: '10px',
              flexGrow: 1
            }}
          >
            تأكيد الحذف 🗑️
          </Button>
        </DialogActions>
      </Dialog>

      {/* Partner Add/Edit Dialog */}
      <Dialog
        open={partnerFormOpen}
        onClose={() => setPartnerFormOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            p: 1.5,
            maxWidth: '520px',
            width: '100%',
            direction: 'rtl'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold', color: '#1e293b', textAlign: 'start' }}>
          {partnerEditMode ? '📝 تعديل بيانات الشريك' : '➕ إضافة شريك جديد (مورد / جهة)'}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'start', pt: 1 }}>
          <TextField
            fullWidth
            label="اسم الشريك / الجهة"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            margin="dense"
            onFocus={(e) => e.target.select()}
            sx={{ mb: 2.5, '& input': { fontFamily: '"Cairo", sans-serif' }, '& label': { fontFamily: '"Cairo", sans-serif' } }}
          />

          <Box sx={{ mb: 2.5, textAlign: 'start' }}>
            <Typography variant="body2" sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold', color: '#475569', mb: 1 }}>
              نوع الشريك:
            </Typography>
            <Grid container spacing={2}>
              {(['جهة مستلمة', 'مورد', 'أخرى'] as const).map((type) => (
                <Grid size={4} key={type}>
                  <Paper
                    onClick={() => setPartnerType(type)}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: partnerType === type ? '#007ab7' : '#e2e8f0',
                      bgcolor: partnerType === type ? '#f0f9ff' : 'white',
                      fontWeight: 'bold',
                      fontFamily: '"Cairo", sans-serif',
                      color: partnerType === type ? '#007ab7' : '#475569',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#007ab7', bgcolor: '#f0f9ff' }
                    }}
                  >
                    {type}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <TextField
            fullWidth
            label="رقم الهاتف (اختياري)"
            value={partnerPhone}
            onChange={(e) => setPartnerPhone(e.target.value)}
            margin="dense"
            sx={{ mb: 2.5, '& input': { fontFamily: '"Cairo", sans-serif' }, '& label': { fontFamily: '"Cairo", sans-serif' } }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="ملاحظات تفصيلية (اختياري)"
            value={partnerNotes}
            onChange={(e) => setPartnerNotes(e.target.value)}
            margin="dense"
            sx={{ '& textarea': { fontFamily: '"Cairo", sans-serif' }, '& label': { fontFamily: '"Cairo", sans-serif' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, direction: 'rtl' }}>
          <Button
            onClick={() => setPartnerFormOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '10px', fontFamily: '"Cairo", sans-serif', flexGrow: 1, color: '#64748b', borderColor: '#cbd5e1' }}
          >
            إلغاء التعديل 🛡️
          </Button>
          <Button
            onClick={handleSavePartner}
            variant="contained"
            sx={{
              bgcolor: '#007ab7',
              '&:hover': { bgcolor: '#005e8c' },
              fontWeight: 'bold',
              fontFamily: '"Cairo", sans-serif',
              borderRadius: '10px',
              flexGrow: 1
            }}
          >
            حفظ البيانات 💾
          </Button>
        </DialogActions>
      </Dialog>

      {/* Partner Deletion Elegant Confirmation Dialog */}
      <Dialog
        open={deletePartnerDialogOpen}
        onClose={() => setDeletePartnerDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            p: 1.5,
            maxWidth: '480px',
            width: '100%',
            direction: 'rtl'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 1, textAlign: 'start' }}>
          ⚠️ تأكيد حذف الشريك / الجهة
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'start' }}>
          <DialogContentText sx={{ fontFamily: '"Cairo", sans-serif', color: '#475569', fontSize: '0.95rem', mt: 1, lineHeight: 1.7 }}>
            هل أنت متأكد من رغبتك في حذف الشريك <strong>"{partnerToDelete?.name}"</strong> بالكامل من النظام وسجل العناوين الرئيسي؟
            <br />
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>تنبيه:</span> هذا الإجراء لن يحذف الحركات السابقة المرتبطة بهذا الاسم، ولكنه سيزيله من خيارات التعبئة التلقائية عند إنشاء الحركات الجديدة.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5, direction: 'rtl' }}>
          <Button
            onClick={() => setDeletePartnerDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '10px', fontFamily: '"Cairo", sans-serif', flexGrow: 1, color: '#64748b', borderColor: '#cbd5e1' }}
          >
            إلغاء الأمر 🛡️
          </Button>
          <Button
            onClick={handleConfirmDeletePartner}
            variant="contained"
            sx={{
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' },
              fontWeight: 'bold',
              fontFamily: '"Cairo", sans-serif',
              borderRadius: '10px',
              flexGrow: 1
            }}
          >
            تأكيد الحذف 🗑️
          </Button>
        </DialogActions>
      </Dialog>

      {/* Array Edit Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ ...editDialog, open: false })}
        slotProps={{ paper: { sx: { p: 1, minWidth: {xs: 'auto', sm: '350px'}, direction: 'rtl' } } }}
      >
        <DialogTitle sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold' }}>
          {editDialog.type === 'category' ? 'تعديل اسم التصنيف' : editDialog.type === 'storehouse' ? 'تعديل اسم المستودع' : 'تعديل وحدة القياس'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="الاسم"
            margin="dense"
            value={editDialog.value}
            onChange={(e) => setEditDialog({ ...editDialog, value: e.target.value })}
            onFocus={(e) => e.target.select()}
            sx={{ mb: editDialog.type === 'category' ? 2 : 0, '& input': { fontFamily: '"Cairo", sans-serif' } }}
          />
          {editDialog.type === 'category' && (
            <>
              <TextField
                fullWidth
                label="البادئة (الحروف)"
                margin="dense"
                value={editDialog.prefix || ''}
                onChange={(e) => setEditDialog({ ...editDialog, prefix: e.target.value })}
                onFocus={(e) => e.target.select()}
                sx={{ mb: 2, '& input': { fontFamily: '"Cairo", sans-serif' } }}
              />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="بداية المدى الرقمي"
                    value={editDialog.startRange || ''}
                    onChange={(e) => setEditDialog({ ...editDialog, startRange: Number(e.target.value) })}
                    onFocus={(e) => e.target.select()}
                    sx={{ '& input': { fontFamily: '"Cairo", sans-serif' } }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="نهاية المدى الرقمي"
                    value={editDialog.endRange || ''}
                    onChange={(e) => setEditDialog({ ...editDialog, endRange: Number(e.target.value) })}
                    onFocus={(e) => e.target.select()}
                    sx={{ '& input': { fontFamily: '"Cairo", sans-serif' } }}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog({ ...editDialog, open: false })} variant="outlined" sx={{ borderRadius: '8px', fontFamily: '"Cairo", sans-serif' }}>
            إلغاء
          </Button>
          <Button onClick={handleSaveEditDialog} variant="contained" sx={{ borderRadius: '8px', fontFamily: '"Cairo", sans-serif' }}>
            حفظ التعديل
          </Button>
        </DialogActions>
      </Dialog>

      <NotificationToast open={!!successMsg} message={successMsg || ''} severity="success" onClose={() => setSuccessMsg(null)} />
      <NotificationToast open={!!errorMsg} message={errorMsg || ''} severity="error" onClose={() => setErrorMsg(null)} />
    </Box>
  );
}
