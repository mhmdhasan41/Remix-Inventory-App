const fs = require('fs');

// Fix Reports.tsx
let rep = fs.readFileSync('src/pages/Reports.tsx', 'utf8');
if (!rep.includes('import { requireStableStringPart }')) {
  rep = "import { requireStableStringPart } from '../utils/printHtml';\n" + rep;
}
fs.writeFileSync('src/pages/Reports.tsx', rep);

// Fix Transactions.tsx
let tx = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');
// Remove duplicate import if any
tx = tx.replace(/import \{ requireStableStringPart \} from '\.\.\/utils\/printHtml';\n/g, '');
tx = "import { requireStableStringPart } from '../utils/printHtml';\n" + tx;

// Fix the tables object correctly
// The easiest way is to use regex to find the tables array and replace the whole block up to columnAlignments
tx = tx.replace(/tables: \[\s*\{\s*title: 'تفاصيل وجرد الصنف المحرّك مخزنياً:',\s*headers: \['كود الصنف', 'الاسم الفني التجاري المعتمد', 'المستودع', 'التصنيف', 'الكمية المستندة', 'الوحدة'\],\s*rows: \[([\s\S]*?)\],\s*columnAlignments: \['center', 'center', 'center', 'center', 'center', 'center'\]\s*\},/m, 
`tables: [
          {
            title: 'تفاصيل وجرد الصنف المحرّك مخزنياً:',
            headers: ['كود الصنف', 'الاسم الفني التجاري المعتمد', 'المستودع', 'التصنيف', 'الكمية المستندة', 'الوحدة'],
            rows: [$1],
            recordIds: [JSON.stringify(['voucher_detail', txIdForIds])],
            columnAlignments: ['center', 'center', 'center', 'center', 'center', 'center']
          },`);

tx = tx.replace(/\{\s*title: 'ملخص الحركة والأرصدة الدفترية والميدانية للصنف:',\s*headers: balanceHeaders,\s*rows: balanceRows,\s*columnAlignments: balanceAlignments as any,\s*rowBgColors: balanceRowBgColors\s*\}/m, 
`{
            title: 'ملخص الحركة والأرصدة الدفترية والميدانية للصنف:',
            headers: balanceHeaders,
            rows: balanceRows,
            recordIds: recordIds1ForIds,
            columnAlignments: balanceAlignments as any,
            rowBgColors: balanceRowBgColors
          }`);
fs.writeFileSync('src/pages/Transactions.tsx', tx);


// Fix tests
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');
// Fix c4Title, c4Header, etc.
test = test.replace(/verifyContentIntegrity\(snapshot4.pageTexts, c4Title, c4Header, c4FirstRow, t1Rows.map\(r => r\[0\]\).concat\(t2Rows.map\(r => r\[0\]\)\)\)/g, 
"verifyContentIntegrity(snapshot4.pageTexts, 'FirstRowOverflow_Engine', 'الكمية المستندة', 'ITEM-A-1', t1Rows.map(r => r[0]).concat(t2Rows.map(r => r[0])))");
test = test.replace(/recordIds: recordIdsC1,/g, `recordIds: fixC1.map(f => f.id),`);
fs.writeFileSync('tests/run_real_integration_test.ts', test);
