const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

// We need to replace the messy block. Let's match from "const fixtureT2C3" to "const recordIdsT2C3 = fixtureT2C3.map(f => f.recordId);"
const regex = /const fixtureT2C3 = Array\.from\(\{ length: 6 \}, \(\_, i\) => \{[\s\S]*?const recordIdsT2C3 = fixtureT2C3\.map\(f => f\.recordId\);/s;

const replacement = `const fixtureT2C3 = Array.from({ length: 6 }, (_, i) => {
          return {
             recordId: JSON.stringify(['case3', 't1', String(i)]),
             row: i === 0 ? [
              '1',
              \`C3_T2_ROW1_UNIQUE C3_T2_R1_UNIQUE قطع غيار صيانة رقم 1\${row1Span}\`,
              'تحت الطلب',
              '2'
            ] : [
              \`\${i + 1}\`,
              \`C3_T2_R\${i + 1}_UNIQUE قطع غيار صيانة رقم \${i + 1}\`,
              'تحت الطلب',
              \`\${(i + 1) * 2}\`
            ]
          };
        });
        const t2RowsCandidate = fixtureT2C3.map(f => f.row);
        const recordIdsT2C3 = fixtureT2C3.map(f => f.recordId);`;

code = code.replace(regex, replacement);
fs.writeFileSync('tests/run_real_integration_test.ts', code);
