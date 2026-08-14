import sys

file_path = "src/components/CreateTransactionModal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target_schema = """}).refine(data => {
  if (data.transactionType === 'تحويل' && !data.destStorehouse) return false;
  return true;
}, { message: 'يجب تحديد مستودع الوجهة للتحويل', path: ['destStorehouse'] }).refine(data => {
  if (data.transactionType === 'تحويل' && data.destStorehouse === data.storehouse) return false;
  return true;
}, { message: 'لا يمكن التحويل لنفس المستودع', path: ['destStorehouse'] });"""

replacement_schema = """}).refine(data => {
  if (data.transactionType === 'تحويل' && !data.destStorehouse) return false;
  return true;
}, { message: 'يجب تحديد مستودع الوجهة للتحويل', path: ['destStorehouse'] }).refine(data => {
  if (data.transactionType === 'تحويل' && data.destStorehouse === data.storehouse) return false;
  return true;
}, { message: 'لا يمكن التحويل لنفس المستودع', path: ['destStorehouse'] }).refine(data => {
  if (data.transactionType === 'مستهلك' && !data.supplierOrReceiver?.trim()) return false;
  return true;
}, { message: 'جهة الاستهلاك مطلوبة', path: ['supplierOrReceiver'] });"""

if target_schema in content:
    content = content.replace(target_schema, replacement_schema)
    print("schema replaced")
else:
    print("schema not found")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
