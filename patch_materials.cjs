const fs = require('fs');
let content = fs.readFileSync('src/pages/Materials.tsx', 'utf8');

content = content.replace(
  "import { exportToExcel } from '../utils/exportExcel';",
  "import { exportToExcel } from '../utils/exportExcel';\nimport { requireStableStringPart } from '../utils/printHtml';"
);

const targetStr = `      await exportToPDF({`;
const idsLogic = `
      const recordIds = selectedItems.map((item: any) => {
        const originalId = requireStableStringPart(item._originalId, 'originalId');
        if (typeof item.isSubRow !== 'boolean') throw new Error('isSubRow is not boolean');
        if (item.isSubRow) {
          const wh = requireStableStringPart(item.storageLocation, 'storageLocation');
          return JSON.stringify(['bulk_materials', originalId, 'warehouse', wh]);
        } else {
          return JSON.stringify(['bulk_materials', originalId, 'parent']);
        }
      });
`;

content = content.replace(targetStr, idsLogic + '\n' + targetStr);

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

fs.writeFileSync('src/pages/Materials.tsx', content);
