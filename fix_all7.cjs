const fs = require('fs');
let tx = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');
// Clean up all tables: [] definitions for exportToPDF

const tableRegex = /tables: \[\s*\{\s*title: 'تفاصيل وجرد الصنف المحرّك مخزنياً:',[\s\S]*?rowBgColors: balanceRowBgColors\s*\}\s*\],/g;
const correctTable = `tables: [
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

tx = tx.replace(tableRegex, correctTable);
fs.writeFileSync('src/pages/Transactions.tsx', tx);
