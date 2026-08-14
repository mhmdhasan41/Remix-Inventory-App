import sys

file_path = "src/components/CreateTransactionModal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """  // Auto-fill supplier when item or txType changes in "Inbound" transaction
  useEffect(() => {
    if (watchItem && watchTxType === 'وارد') {
      const selectedMat = materials.find(m => m.id === watchItem.id);
      if (selectedMat && selectedMat.manufacturer && selectedMat.manufacturer !== 'جهة غير محددة') {
        const availableOptions = settings.partners.filter(p => p.type === 'مورد').map(p => p.name);
        if (availableOptions.includes(selectedMat.manufacturer)) {
          setValue('supplierOrReceiver', selectedMat.manufacturer);
        } else {
          setValue('supplierOrReceiver', '');
        }
      } else {
        setValue('supplierOrReceiver', '');
      }
    }
  }, [watchItem, watchTxType, materials, settings.partners, setValue]);"""

replacement = """  // Auto-fill supplier when item or txType changes in "Inbound" transaction
  useEffect(() => {
    if (watchItem && watchTxType === 'وارد') {
      const selectedMat = materials.find(m => m.id === watchItem.id);
      if (selectedMat && selectedMat.manufacturer && selectedMat.manufacturer !== 'جهة غير محددة') {
        const availableOptions = settings.partners.filter(p => p.type === 'مورد').map(p => p.name);
        if (availableOptions.includes(selectedMat.manufacturer)) {
          setValue('supplierOrReceiver', selectedMat.manufacturer);
          setCustomPartnerEntityName('');
          setSavePartnerEntity(false);
        } else {
          setValue('supplierOrReceiver', 'OTHER');
          setCustomPartnerEntityName(selectedMat.manufacturer);
          setSavePartnerEntity(false);
        }
      } else {
        setValue('supplierOrReceiver', '');
        setCustomPartnerEntityName('');
        setSavePartnerEntity(false);
      }
    }
  }, [watchItem, watchTxType, materials, settings.partners, setValue]);"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patch applied successfully.")
else:
    print("Target not found.")

