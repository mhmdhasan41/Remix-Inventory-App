import re

with open('src/pages/Materials.tsx', 'r') as f:
    content = f.read()

# Let's extract the part before onSubmitForm and the part after
start_idx = content.find('const onSubmitForm: SubmitHandler<MaterialFormValues> =')
end_idx = content.find('const handleOpenDeleteDialog = (item: Material) => {')

if start_idx != -1 and end_idx != -1:
    new_func = """  const onSubmitForm: SubmitHandler<MaterialFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      let finalManufacturer = data.manufacturer || 'جهة غير محددة';

      if (data.manufacturer === 'new_supplier...') {
        const trimmedName = newSupplierName.trim().replace(/\s+/g, ' ');
        if (!trimmedName) {
           setErrorMessage('يرجى إدخال اسم المورد الجديد');
           setIsSubmitting(false);
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

      let code = selectedMaterial ? selectedMaterial.code : (data.code || dataService.generateItemCode(data.category));
      const isNew = !selectedMaterial;
      const itemId = selectedMaterial ? (selectedMaterial._originalId || selectedMaterial.id) : `mat-${Date.now()}`;
      const itemUnit = data.unit;
      
      let success = false;
      let payload: any = null;
      let retries = 0;
      
      while (!success && retries < 3) {
        payload = {
          id: itemId,
          code,
          name: data.name,
          category: data.category,
          unit: itemUnit,
          minimumStock: data.minimumStock,
          initialStock: isNew ? data.initialStock : (selectedMaterial?.initialStock || 0),
          currentStock: selectedMaterial ? (materials.find(m=>m.id === (selectedMaterial._originalId || selectedMaterial.id))?.currentStock || selectedMaterial.currentStock) : data.initialStock,
          warehouseStocks: selectedMaterial ? materials.find(m=>m.id === (selectedMaterial._originalId || selectedMaterial.id))?.warehouseStocks : undefined,
          storageLocation: data.storageLocation,
          notes: data.notes || '',
          productionDate: data.productionDate,
          expiryDate: data.expiryDate,
          hazardLevel: data.hazardLevel || '',
          manufacturer: finalManufacturer,
          createdAt: selectedMaterial ? selectedMaterial.createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: data.category,
        };

        try {
          dataService.saveMaterial(payload as Material);
          success = true;
        } catch (err: any) {
          if (err.message === 'UNIQUE_CODE_COLLISION' && isNew) {
             code = dataService.generateItemCode(data.category);
             retries++;
          } else {
             throw err;
          }
        }
      }
      
      if (!success) {
         throw new Error('فشل توليد كود فريد بعد عدة محاولات، يرجى المحاولة مرة أخرى.');
      }

      if (isNew && data.initialStock > 0) {
        const initTx: import('../types').InventoryTransaction = {
          id: `tr-init-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          itemType: (data.category?.includes('مبيد') || data.category?.includes('مبيدات')) ? 'مبيد' : 'مادة',
          itemCategory: data.category,
          itemId: itemId,
          itemCode: code,
          itemName: data.name,
          transactionType: 'افتتاحي',
          transferType: 'in',
          quantity: data.initialStock,
          unit: itemUnit,
          storehouse: data.storageLocation,
          stockBefore: 0,
          stockAfter: data.initialStock,
          executedBy: dataService.getCurrentUser().fullName || 'النظام',
          supplierOrReceiver: 'رصيد مخزني أولي (رصيد افتتاحي)',
          notes: 'تأسيس رصيد الصنف التلقائي عند التسجيل الأول للصنف في بطاقة البيانات',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dataService.saveTransaction(initTx);
      }

      setSuccessMessage(selectedMaterial ? 'تم تحديث بيانات الصنف بنجاح' : 'تم حفظ الصنف بنجاح، ويمكنك الآن إضافة صنف آخر أو إغلاق النافذة');
      
      if (selectedMaterial) {
        setOpenFormDialog(false);
      } else {
        setValue('name', '');
        setValue('code', dataService.generateItemCode(data.category));
        setValue('initialStock', 0);
        setValue('notes', '');
      }
      
      loadMaterials();
      
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ الصنف');
    } finally {
      setIsSubmitting(false);
    }
  };

"""
    new_content = content[:start_idx] + new_func + content[end_idx:]
    with open('src/pages/Materials.tsx', 'w') as f:
        f.write(new_content)
    print("Materials.tsx fixed")
else:
    print("Could not find start or end index.")
