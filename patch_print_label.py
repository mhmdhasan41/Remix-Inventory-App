import sys

file_path = "src/pages/Transactions.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

helper_fn = """import { printHtml, exportToPDF } from '../utils/printHtml';

const getSupplierOrReceiverLabel = (txType: string, transferType?: string) => {
  if (txType === 'وارد') return 'الجهة الموردة';
  if (txType === 'صادر') return 'الجهة المستلمة';
  if (txType === 'مستهلك') return 'جهة الاستهلاك / بيان السند';
  if (txType === 'افتتاحي') return 'الجهة الموردة / بيان الرصيد الافتتاحي';
  if (txType === 'تسوية') return 'بيان التسوية';
  if (txType === 'تحويل') return 'جهة التحويل';
  return 'الجهة المعنية بالعملية';
};
"""

content = content.replace("import { printHtml, exportToPDF } from '../utils/printHtml';", helper_fn)

target_pdf = """          { label: item.transactionType === 'وارد' ? 'الجهة الموردة / مصدر المواد:' : 'الجهة المستلمة / بلدية الشراكة:', value: item.supplierOrReceiver || '-' },"""
replacement_pdf = """          { label: getSupplierOrReceiverLabel(item.transactionType, item.transferType) + ':', value: item.supplierOrReceiver || '-' },"""
content = content.replace(target_pdf, replacement_pdf)

target_view = """                    {transactionToPrint.transactionType === 'وارد' || transactionToPrint.transactionType === 'افتتاحي' ? 'الجهة الموردة / مصدر المواد:' : 
                     transactionToPrint.transactionType === 'تحويل' ? (transactionToPrint.transferType === 'in' ? 'المستودع المُحول منه:' : 'المستودع المُحول إليه:') :
                     transactionToPrint.transactionType === 'تسوية' ? 'سبب التسوية / ملاحظات:' :
                     'الجهة المستلمة / بلدية الشراكة / الفرقة:'}
                  </Typography>"""
replacement_view = """                    {getSupplierOrReceiverLabel(transactionToPrint.transactionType, transactionToPrint.transferType)}:
                  </Typography>"""
content = content.replace(target_view, replacement_view)

target_print = """                    <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold', width: '25%', backgroundColor: '#f1f5f9' }}>الجهة المعنية بالعملية:</td>"""
replacement_print = """                    <td style={{ border: '1px solid #000', padding: '10px', fontWeight: 'bold', width: '25%', backgroundColor: '#f1f5f9' }}>{getSupplierOrReceiverLabel(transactionToPrint.transactionType, transactionToPrint.transferType)}:</td>"""
content = content.replace(target_print, replacement_print)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Print labels replaced")
