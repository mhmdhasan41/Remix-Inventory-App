const fs = require('fs');

// 1. Fix Reports.tsx import
let rep = fs.readFileSync('src/pages/Reports.tsx', 'utf8');
if (!rep.includes('requireStableStringPart')) {
  rep = "import { requireStableStringPart } from '../utils/printHtml';\n" + rep;
} else if (rep.includes("Cannot find name 'requireStableStringPart'")) {
  // wait, the error is TS error, it means the import is missing.
  rep = "import { requireStableStringPart } from '../utils/printHtml';\n" + rep;
}
fs.writeFileSync('src/pages/Reports.tsx', rep);

// 2. Fix Transactions.tsx tables
let tx = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');
tx = "import { requireStableStringPart } from '../utils/printHtml';\n" + tx;

const badTables = `        tables: [
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
            columnAlignments: ['center', 'center', 'center', 'center', 'center', 'center']
          },
          {
            title: 'ملخص الحركة والأرصدة الدفترية والميدانية للصنف:',
            headers: balanceHeaders,
            rows: balanceRows,
            columnAlignments: balanceAlignments as any,
            rowBgColors: balanceRowBgColors
          }
        ],`;
const goodTables = `        tables: [
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
tx = tx.replace(badTables, goodTables);
fs.writeFileSync('src/pages/Transactions.tsx', tx);

// 3. Fix tests regex errors (the $1 bug)
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');
test = test.replace(/verifyContentIntegrity\(\$1\)/g, 'verifyContentIntegrity(snapshot4.pageTexts, c4Title, c4Header, c4FirstRow, t1Rows.map(r => r[0]).concat(t2Rows.map(r => r[0])))');
test = test.replace(/fixC1.map/g, 'recordIdsC1'); // wait, I replaced with fixC1 but it's not defined? 
fs.writeFileSync('tests/run_real_integration_test.ts', test);

