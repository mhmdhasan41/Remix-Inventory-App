const fs = require('fs');
let tx = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

tx = tx.replace(/rowBgColors: balanceRowBgColors,\n            recordIds: recordIds1ForIds\n          }\n        \],/g, 'rowBgColors: balanceRowBgColors\n          }\n        ],');

// Okay, that brute force replace earlier was broken because recordIds1ForIds was missing in scope. Wait! I declared it before `if (isAllStorehouses)`.
// Let me just manually inject it.
const targetTableStart = `tables: [
          {
            title: 'تفاصيل وجرد الصنف المحرّك مخزنياً:',`;
const targetTableEnd = `rowBgColors: balanceRowBgColors
          }
        ],`;
const startIndex = tx.indexOf(targetTableStart);
const endIndex = tx.indexOf(targetTableEnd) + targetTableEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newTables = `tables: [
          {
            title: 'تفاصيل وجرد الصنف المحرّك مخزنياً:',
            headers: ['كود الصنف', 'الاسم الفني التجاري المعتمد', 'المستودع', 'التصنيف', 'الكمية المستندة', 'الوحدة'],
            rows: [
              [
                item.itemCode || '-',
                item.itemName || '-',
                storehouseName,
                item.itemCategory || item.itemType || 'تصنيف عام',
                \`\${item.quantity} \${itemUnit}\`,
                itemUnit
              ]
            ],
            recordIds: [JSON.stringify(['voucher_detail', txIdForIds])],
            columnAlignments: ['center', 'center', 'center', 'center', 'center', 'center']
          },
          {
            title: 'ملخص الحركة والأرصدة الدفترية والميدانية للصنف:',
            headers: balanceHeaders,
            rows: balanceRows,
            recordIds: recordIds1ForIds,
            columnAlignments: balanceAlignments as any,
            rowBgColors: balanceRowBgColors
          }
        ],`;
  tx = tx.slice(0, startIndex) + newTables + tx.slice(endIndex);
  fs.writeFileSync('src/pages/Transactions.tsx', tx);
}

