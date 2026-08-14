const fs = require('fs');

// Materials.tsx
let mat = fs.readFileSync('src/pages/Materials.tsx', 'utf8');
mat = "import { requireStableStringPart } from '../utils/printHtml';\n" + mat;
mat = mat.replace(
  `        tables: [
          {
            headers,
            rows,
            columnAlignments: alignments
          }
        ]`,
  `        tables: [
          {
            headers,
            rows,
            recordIds,
            columnAlignments: alignments
          }
        ]`
);
fs.writeFileSync('src/pages/Materials.tsx', mat);

// run_real_integration_test.ts
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');
// Fix recordIdsC1 not defined. In line 306 we changed fixC1.map to recordIdsC1 but it seems recordIdsC1 is not defined because we might have messed up the original replacement. Let's redefine fixC1 if it's missing.
test = test.replace(`            recordIds: recordIdsC1,`, `            recordIds: Array.from({length: 28}, (_, i) => JSON.stringify(['case1', 't0', String(i)])),`);
fs.writeFileSync('tests/run_real_integration_test.ts', test);

