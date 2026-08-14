const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

// Replace t1RowsCandidate and create recordIdsT1C3
code = code.replace(/const t1RowsCandidate = Array\.from\(\{ length: t1RowCount \}, \(\_, i\) => \[\n.*?\n\s*\]\);/s, `const fixtureT1C3 = Array.from({ length: t1RowCount }, (_, i) => {
        return {
          recordId: JSON.stringify(['case3', 't0', String(i)]),
          row: [
            String(i + 1),
            \`معدة ثقيلة رقم \${i + 1} - صيانة دورية\`,
            'يعمل',
            String(Math.floor(Math.random() * 10) + 1)
          ]
        };
      });
      const t1RowsCandidate = fixtureT1C3.map(f => f.row);
      const recordIdsT1C3 = fixtureT1C3.map(f => f.recordId);`);

// For Case 3, t2RowsCandidate
code = code.replace(/const t2RowsCandidate = Array\.from\(\{ length: 6 \}, \(\_, i\) => \{(.*?)\}\);/s, `const fixtureT2C3 = Array.from({ length: 6 }, (_, i) => {
$1
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
        const recordIdsT2C3 = fixtureT2C3.map(f => f.recordId);`);

code = code.replace(/recordIds: recordIdsT1C3/g, "recordIds: recordIdsT1C3");
code = code.replace(/rows: t2RowsCandidate,\s*?\}\s*?\]/s, `rows: t2RowsCandidate, recordIds: recordIdsT2C3 } ]`);

fs.writeFileSync('tests/run_real_integration_test.ts', code);
