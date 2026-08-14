const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

// Fix Case 1
code = code.replace(/const rowsC1 = Array\.from.*?\]\);/s, `const fixtureC1 = Array.from({ length: 45 }, (_, i) => {
      return {
        recordId: JSON.stringify(['case1', 't0', String(i)]),
        row: [
          (i + 1).toString(),
          \`TX-\${2000 + i}\`,
          '2026-08-01',
          \`صرف مستلزمات طبية لقسم الطوارئ - دفعة \${i + 1}\`,
          (10 * (i + 1)).toString()
        ]
      };
    });
    const rowsC1 = fixtureC1.map(f => f.row);
    const recordIdsC1 = fixtureC1.map(f => f.recordId);`);

code = code.replace(/recordIds: rowsC1\.map\(\(r, i\) => JSON\.stringify\(\['case1', 't0', String\(i\)\]\)\),/, `recordIds: recordIdsC1,`);

// Fix Case 2
code = code.replace(/rows: \[\n\s*\['MED-01', 'محلول ملحي معقم 500 مل', '100'\],\n\s*\['MED-02', 'مشرط جراحي قياس 11', '50'\]\n\s*\]/s, `rows: [
          ['MED-01', 'محلول ملحي معقم 500 مل', '100'],
          ['MED-02', 'مشرط جراحي قياس 11', '50']
        ],
        recordIds: [JSON.stringify(['case2', 't0', '0']), JSON.stringify(['case2', 't0', '1'])]`);

// Fix Case 3
code = code.replace(/const t1RowsCandidate = Array\.from\(\{ length: t1RowsCount \}, \(\_, i\) => \[\n(.*?)\n\s*\]\);/s, `const fixtureT1C3 = Array.from({ length: t1RowsCount }, (_, i) => {
            return {
              recordId: JSON.stringify(['case3', 't0', String(i)]),
              row: [
$1
              ]
            };
          });
          const t1RowsCandidate = fixtureT1C3.map(f => f.row);
          const recordIdsT1C3 = fixtureT1C3.map(f => f.recordId);`);
code = code.replace(/const t2RowsCandidate = Array\.from\(\{ length: 5 \}, \(\_, i\) => \[\n(.*?)\n\s*\]\);/s, `const fixtureT2C3 = Array.from({ length: 5 }, (_, i) => {
            return {
              recordId: JSON.stringify(['case3', 't1', String(i)]),
              row: [
$1
              ]
            };
          });
          const t2RowsCandidate = fixtureT2C3.map(f => f.row);
          const recordIdsT2C3 = fixtureT2C3.map(f => f.recordId);`);
code = code.replace(/recordIds: t1RowsCandidate\.map[^\n]+/s, `recordIds: recordIdsT1C3`);
code = code.replace(/recordIds: t2RowsCandidate\.map[^\n]+/s, `recordIds: recordIdsT2C3`);

// Fix Case 4
code = code.replace(/const t1Rows = Array\.from\(\{ length: t1RowsCount \}, \(\_, i\) => \[\n(.*?)\n\s*\]\);/s, `const fixtureT1C4 = Array.from({ length: t1RowsCount }, (_, i) => {
          return {
            recordId: JSON.stringify(['case4', 't0', String(i)]),
            row: [
$1
            ]
          };
        });
        const t1Rows = fixtureT1C4.map(f => f.row);
        const recordIdsT1C4 = fixtureT1C4.map(f => f.recordId);`);
code = code.replace(/const t2Rows = Array\.from\(\{ length: 4 \}, \(\_, i\) => \[\n(.*?)\n\s*\]\);/s, `const fixtureT2C4 = Array.from({ length: 4 }, (_, i) => {
          return {
            recordId: JSON.stringify(['case4', 't1', String(i)]),
            row: [
$1
            ]
          };
        });
        const t2Rows = fixtureT2C4.map(f => f.row);
        const recordIdsT2C4 = fixtureT2C4.map(f => f.recordId);`);
code = code.replace(/recordIds: t1Rows\.map[^\n]+/s, `recordIds: recordIdsT1C4`);
code = code.replace(/recordIds: t2Rows\.map[^\n]+/s, `recordIds: recordIdsT2C4`);

// srcPath & sha256Hash
const insertVars = `
import fsSync from 'fs';
import crypto from 'crypto';
const srcPath = 'src/utils/printHtml.ts';
const sha256Hash = fsSync.existsSync(srcPath) ? crypto.createHash('sha256').update(fsSync.readFileSync(srcPath)).digest('hex') : 'N/A';
`;
code = code.replace(/import fs from 'fs\/promises';/, `import fs from 'fs/promises';\n${insertVars}`);

code = code.replace(/Source File: N\/A/g, 'Source File: ${srcPath}');
code = code.replace(/SHA-256 Hash: N\/A/g, 'SHA-256 Hash: ${sha256Hash}');

// Replace fake success text
code = code.replace(/console\.log\('All tests passed cleanly.'\);\n?/g, '');
code = code.replace(/process\.exit\(0\);/g, ''); // We will handle exit code

code = code.replace(/console\.log\('\\nALL REAL INTEGRATION TESTS PASSED SUCCESSFULLY!'\);/, `if (overallPassed) {
      console.log('\\nPHASE2_REAL_INTEGRATION_PASSED');
      process.exitCode = 0;
    } else {
      console.log('\\nPHASE2_REAL_INTEGRATION_FAILED');
      process.exitCode = 1;
    }`);

fs.writeFileSync('tests/run_real_integration_test.ts', code);
