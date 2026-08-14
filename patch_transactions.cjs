const fs = require('fs');
let content = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

content = content.replace(
  "import { exportToExcel } from '../utils/exportExcel';",
  "import { exportToExcel } from '../utils/exportExcel';\nimport { requireStableStringPart } from '../utils/printHtml';"
);

// Fix bulk exportToPDF
const targetStr1 = `      await exportToPDF({`;
const idsLogic1 = `
      const recordIds = selectedItems.map((t: any) => {
        const txId = requireStableStringPart(t.id, 'txId');
        return JSON.stringify(['bulk_transactions', txId]);
      });
`;
content = content.replace(targetStr1, idsLogic1 + '\n' + targetStr1);

content = content.replace(
  /tables: \[\s*\{\s*headers,\s*rows,\s*columnAlignments: alignments\s*\}\s*\]/,
  `tables: [
          {
            headers,
            rows,
            recordIds,
            columnAlignments: alignments
          }
        ]`
);

// Fix voucher exportToPDF
const targetStr2 = `      await exportToPDF({
        title: voucherName,`;

const idsLogic2 = `
      const txId = requireStableStringPart(item.id, 'txId');
      const recordIds0 = [JSON.stringify(['voucher_detail', txId])];
      let recordIds1: string[] = [];
      if (isAllStorehouses) {
        recordIds1 = [
          ...activeList.map(wh => JSON.stringify(['voucher_balance', txId, 'warehouse', requireStableStringPart(wh, 'warehouse')])),
          JSON.stringify(['voucher_balance', txId, 'total'])
        ];
      } else {
        recordIds1 = [
          JSON.stringify(['voucher_balance', txId, 'before']),
          JSON.stringify(['voucher_balance', txId, 'after'])
        ];
      }
`;
content = content.replace(targetStr2, idsLogic2 + '\n' + targetStr2);

content = content.replace(
  /tables: \[\s*\{\s*title: 'تفاصيل وجرد الصنف المحرّك مخزنياً:',\s*headers: \['كود الصنف', 'الاسم الفني التجاري المعتمد', 'المستودع', 'التصنيف', 'الكمية المستندة', 'الوحدة'\],\s*rows: \[([^\]]+)\],\s*columnAlignments: \['center', 'center', 'center', 'center', 'center', 'center'\]\s*\},\s*\{\s*title: 'ملخص الحركة والأرصدة الدفترية والميدانية للصنف:',\s*headers: \['البيان والمرحلة', 'الوقت', 'نظام الجرد', 'الرصيد المؤكد الفعلي'\],\s*rows: balanceRows,\s*columnAlignments: \['right', 'center', 'center', 'center'\],\s*rowBgColors\s*\}\s*\]/,
  `tables: [
          {
            title: 'تفاصيل وجرد الصنف المحرّك مخزنياً:',
            headers: ['كود الصنف', 'الاسم الفني التجاري المعتمد', 'المستودع', 'التصنيف', 'الكمية المستندة', 'الوحدة'],
            rows: [$1],
            recordIds: recordIds0,
            columnAlignments: ['center', 'center', 'center', 'center', 'center', 'center']
          },
          {
            title: 'ملخص الحركة والأرصدة الدفترية والميدانية للصنف:',
            headers: ['البيان والمرحلة', 'الوقت', 'نظام الجرد', 'الرصيد المؤكد الفعلي'],
            rows: balanceRows,
            recordIds: recordIds1,
            columnAlignments: ['right', 'center', 'center', 'center'],
            rowBgColors
          }
        ]`
);


fs.writeFileSync('src/pages/Transactions.tsx', content);
