import re

with open('src/components/MaterialFormDialog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add setFocus to useForm destruct
old_useform = "const { register, handleSubmit, formState: { errors }, reset, watch, setValue, trigger } = useForm<MaterialFormValues>({"
new_useform = "const { register, handleSubmit, formState: { errors }, reset, watch, setValue, trigger, setFocus } = useForm<MaterialFormValues>({"
content = content.replace(old_useform, new_useform)

# Add setFocus('name') to onSuccess block for new item
old_success = """      if (selectedMaterial) {
        onClose();
      } else {
        setValue('name', '');
        setValue('code', dataService.generateItemCode(data.category));
        setValue('initialStock', 0);
        setValue('notes', '');
        setValue('manufacturer', 'جهة غير محددة');
        setNewSupplierName('');
        setSaveNewSupplier(false);
      }"""

new_success = """      if (selectedMaterial) {
        onClose();
      } else {
        setValue('name', '');
        setValue('code', dataService.generateItemCode(data.category));
        setValue('initialStock', 0);
        setValue('notes', '');
        setValue('manufacturer', 'جهة غير محددة');
        setNewSupplierName('');
        setSaveNewSupplier(false);
        setTimeout(() => setFocus('name'), 50);
      }"""
content = content.replace(old_success, new_success)

with open('src/components/MaterialFormDialog.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("done")
