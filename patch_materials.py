import sys

file_path = "src/pages/Materials.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add state variables
target1 = """  // Dialogs state
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialViewRow | null>(null);"""
replacement1 = """  // Dialogs state
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialViewRow | null>(null);
  const [isNewSupplier, setIsNewSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [saveNewSupplier, setSaveNewSupplier] = useState(false);"""
content = content.replace(target1, replacement1)

# 2. Add watch variables
target2 = """  const watchCategory = watch('category');

  // Load data on start and on updates"""
replacement2 = """  const watchCategory = watch('category');
  const watchManufacturer = watch('manufacturer');
  const watchInitialStock = watch('initialStock');

  // Load data on start and on updates"""
content = content.replace(target2, replacement2)

# 3. Handle defaultValues in useForm
target3 = """    defaultValues: {
      category: '',
      code: '',
      name: '',
      initialStock: 1,
      minimumStock: 10,
      storageLocation: '',
      unit: '',
      notes: '',
      isEditMode: false,
    }"""
replacement3 = """    defaultValues: {
      category: '',
      code: '',
      name: '',
      initialStock: 0,
      minimumStock: 10,
      storageLocation: '',
      unit: '',
      notes: '',
      manufacturer: 'جهة غير محددة',
      isEditMode: false,
    }"""
content = content.replace(target3, replacement3)

# 4. handleOpenAddDialog
target4 = """      initialStock: 1, // Default to a valid positive value of 1 for convenience
      minimumStock: 0,
      storageLocation: settings.storehouses[0] || '',
      unit: settings.units?.[0] || 'قطعة',
      notes: '',
      productionDate: '',
      expiryDate: '',
      hazardLevel: '',
      manufacturer: '',
      isEditMode: false,
    });
    setOpenFormDialog(true);"""
replacement4 = """      initialStock: 0, // Default to a valid positive value of 0 for convenience
      minimumStock: 0,
      storageLocation: settings.storehouses[0] || '',
      unit: settings.units?.[0] || 'قطعة',
      notes: '',
      productionDate: '',
      expiryDate: '',
      hazardLevel: '',
      manufacturer: 'جهة غير محددة',
      isEditMode: false,
    });
    setIsNewSupplier(false);
    setNewSupplierName('');
    setSaveNewSupplier(false);
    setOpenFormDialog(true);"""
content = content.replace(target4, replacement4)

# 5. handleOpenEditDialog
target5 = """      manufacturer: item.manufacturer || '',
      isEditMode: true,
    });
    setOpenFormDialog(true);"""
replacement5 = """      manufacturer: item.manufacturer || 'جهة غير محددة',
      isEditMode: true,
    });
    setIsNewSupplier(false);
    setNewSupplierName('');
    setSaveNewSupplier(false);
    setOpenFormDialog(true);"""
content = content.replace(target5, replacement5)

# 6. onSubmitForm
target6 = """  const onSubmitForm: SubmitHandler<MaterialFormValues> = (data) => {
    try {
      const code = selectedMaterial ? selectedMaterial.code : (data.code || dataService.generateItemCode(data.category));"""
replacement6 = """  const onSubmitForm: SubmitHandler<MaterialFormValues> = (data) => {
    try {
      let finalManufacturer = data.manufacturer || 'جهة غير محددة';

      if (data.manufacturer === 'new_supplier...') {
        const trimmedName = newSupplierName.trim().replace(/\s+/g, ' ');
        if (!trimmedName) {
           setErrorMessage('يرجى إدخال اسم المورد الجديد');
           return;
        }

        const existingPartner = (settings.partners || []).find(p => p.name === trimmedName && p.type === 'مورد');
        if (existingPartner) {
           finalManufacturer = existingPartner.name;
        } else {
           finalManufacturer = trimmedName;
           if (saveNewSupplier) {
             const newPartner: import('../types').PartnerEntity = {
               id: `pt-${Date.now()}`,
               name: trimmedName,
               type: 'مورد',
               notes: 'تمت الإضافة من بطاقة الصنف',
             };
             const updatedSettings = {
               ...settings,
               partners: [...(settings.partners || []), newPartner]
             };
             dataService.saveSettings(updatedSettings);
             setSettings(updatedSettings);
           }
        }
      }

      const code = selectedMaterial ? selectedMaterial.code : (data.code || dataService.generateItemCode(data.category));"""
content = content.replace(target6, replacement6)

# 7. onSubmitForm manufacturer
target7 = """        expiryDate: data.expiryDate,
        hazardLevel: data.hazardLevel || '',
        manufacturer: data.manufacturer,
        createdAt: selectedMaterial ? selectedMaterial.createdAt : new Date().toISOString(),"""
replacement7 = """        expiryDate: data.expiryDate,
        hazardLevel: data.hazardLevel || '',
        manufacturer: finalManufacturer,
        createdAt: selectedMaterial ? selectedMaterial.createdAt : new Date().toISOString(),"""
content = content.replace(target7, replacement7)

# 8. code visual change
target8 = """              {/* 2. Readonly Autogenerated Code */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="كود الصنف الآلي (توليد تلقائي حسب التصنيف)"
                  {...register('code')}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{ bgcolor: '#f8fafc' }}
                  helperText="يتم حسابه تلقائياً بناءً على الحروف والمدى المدخل بالتصنيف في الإعدادات"
                />
              </Grid>"""
replacement8 = """              {/* 2. Readonly Autogenerated Code */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="كود الصنف الآلي (توليد تلقائي حسب التصنيف)"
                  {...register('code')}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{ 
                    bgcolor: '#f8fafc',
                    '& .MuiInputBase-root': {
                      pointerEvents: 'none',
                      color: '#64748b'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e2e8f0 !important'
                    }
                  }}
                  helperText="يتم حسابه تلقائياً بناءً على الحروف والمدى المدخل بالتصنيف في الإعدادات"
                />
              </Grid>"""
content = content.replace(target8, replacement8)

# 9. Initial stock banner
target9 = """              {/* 4. Initial Stock */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="الرصيد الإبتدائي الافتتاحي بالمستودع"
                  placeholder="مثال: 100"
                  disabled={!!selectedMaterial}
                  {...register('initialStock')}
                  error={!!errors.initialStock}
                  helperText={selectedMaterial ? "الرصيد الابتدائي مسجل مسبقاً" : errors.initialStock?.message || "سيقوم النظام بتوريد رصيد بداية أوتوماتيكي"}
                />
              </Grid>"""
replacement9 = """              {/* 4. Initial Stock */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="الرصيد الإبتدائي الافتتاحي بالمستودع"
                  placeholder="مثال: 100"
                  disabled={!!selectedMaterial}
                  {...register('initialStock')}
                  error={!!errors.initialStock}
                  helperText={selectedMaterial ? "الرصيد الابتدائي مسجل مسبقاً" : errors.initialStock?.message || "سيقوم النظام بتوريد رصيد بداية أوتوماتيكي"}
                />
              </Grid>

            {watchInitialStock > 0 && (
              <Grid size={12}>
                <Box sx={{ p: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', width: '100%' }}>
                  <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 'bold', mb: 0.5 }}>
                    بيان الرصيد الافتتاحي
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#0369a1' }}>
                    رصيد مخزني أولي (رصيد افتتاحي)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0ea5e9', display: 'block', mt: 0.5 }}>
                    يتم اعتماد هذا البيان تلقائياً عند وجود رصيد افتتاحي
                  </Typography>
                </Box>
              </Grid>
            )}"""
content = content.replace(target9, replacement9)

# 10. Manufacturer field
target10 = """              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="الشركة الصانعة / المورد"
                  {...register('manufacturer')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                />
              </Grid>"""
replacement10 = """              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="الشركة الصانعة / المورد"
                  {...register('manufacturer')}
                  value={watchManufacturer || 'جهة غير محددة'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'new_supplier...') {
                      setValue('manufacturer', 'new_supplier...');
                      setIsNewSupplier(true);
                    } else {
                      setValue('manufacturer', val);
                      setIsNewSupplier(false);
                      setNewSupplierName('');
                      setSaveNewSupplier(false);
                    }
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                >
                  <MenuItem value="جهة غير محددة">جهة غير محددة</MenuItem>
                  {(settings.partners || []).filter(p => p.type === 'مورد').map((partner) => (
                    <MenuItem key={partner.id} value={partner.name}>{partner.name}</MenuItem>
                  ))}
                  <MenuItem value="new_supplier...">مورد جديد...</MenuItem>
                </TextField>

                {watchManufacturer === 'new_supplier...' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <TextField
                      fullWidth
                      label="اسم المورد الجديد"
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      size="small"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <input 
                        type="checkbox" 
                        id="saveSupplier"
                        checked={saveNewSupplier}
                        onChange={(e) => setSaveNewSupplier(e.target.checked)}
                        style={{ marginLeft: '8px' }}
                      />
                      <label htmlFor="saveSupplier" style={{ fontSize: '14px', color: '#64748b', cursor: 'pointer' }}>حفظ هذا المورد في الإعدادات</label>
                    </Box>
                  </Box>
                )}
              </Grid>"""
content = content.replace(target10, replacement10)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch applied.")
