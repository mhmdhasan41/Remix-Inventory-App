const fs = require('fs');
let content = fs.readFileSync('src/pages/Reports.tsx', 'utf8');

// 1. Import requireStableStringPart
content = content.replace(
  "import { exportToExcel } from '../utils/exportExcel';",
  "import { exportToExcel } from '../utils/exportExcel';\nimport { requireStableStringPart } from '../utils/printHtml';"
);

// 2. Fix category_summary key inside useMemo (around line 348)
content = content.replace(
  "const cat = item.category || 'غير محدد';\n          const loc = item.storageLocation || 'المخزن الرئيسي';\n          const key = \`\${cat}_\${loc}\`;",
  "const cat = item.category || 'غير محدد';\n          const loc = item.storageLocation || 'المخزن الرئيسي';\n          const key = JSON.stringify([cat, loc]);"
);

// 3. Generate recordIds right before exportToPDF (around line 779)
const targetStr = `      await exportToPDF({`;
const idsLogic = `
      let recordIds: string[] = [];
      if (reportType === 'inventory' || reportType === 'low_stock' || reportType === 'expiry_warning') {
        recordIds = currentReportData.map((row: any) => {
          const originalId = requireStableStringPart(row._originalId, 'originalId');
          if (typeof row.isSubRow !== 'boolean') throw new Error('isSubRow is not boolean');
          if (row.isSubRow) {
            const wh = requireStableStringPart(row.storageLocation, 'storageLocation');
            return JSON.stringify([reportType, originalId, 'warehouse', wh]);
          } else {
            return JSON.stringify([reportType, originalId, 'parent']);
          }
        });
      } else if (reportType === 'opening_stock') {
        recordIds = currentReportData.map((row: any) => {
          const originalId = requireStableStringPart(row._originalId, 'originalId');
          if (typeof row.isSubRow !== 'boolean') throw new Error('isSubRow is not boolean');
          if (row.isSubRow) {
            const wh = requireStableStringPart(row.storageLocation, 'storageLocation');
            return JSON.stringify(['opening_stock', originalId, 'warehouse', wh]);
          } else {
            return JSON.stringify(['opening_stock', originalId, 'parent']);
          }
        });
      } else if (reportType === 'transactions') {
        recordIds = currentReportData.map((t: any) => {
          const txId = requireStableStringPart(t.id, 'txId');
          return JSON.stringify(['transaction_report', txId]);
        });
      } else if (reportType === 'category_summary') {
        recordIds = currentReportData.map((s: any) => {
          const cat = requireStableStringPart(s.category, 'category');
          const loc = requireStableStringPart(s.storageLocation, 'storageLocation');
          return JSON.stringify(['category_summary', cat, loc]);
        });
      }
`;

content = content.replace(targetStr, idsLogic + '\n' + targetStr);

// 4. Pass recordIds to exportToPDF tables array
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

fs.writeFileSync('src/pages/Reports.tsx', content);
