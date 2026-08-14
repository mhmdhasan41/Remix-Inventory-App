const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

code = code.replace(/const t2RowsC4 = \[\n.*?\];/s, `const fixtureT2C4 = Array.from({ length: 1 }, (_, i) => {
      return {
        recordId: JSON.stringify(['case4', 't1', String(i)]),
        row: ['1', longTextC4, 'تم الفحص', '50']
      };
    });
    const t2RowsC4 = fixtureT2C4.map(f => f.row);
    const recordIdsT2C4 = fixtureT2C4.map(f => f.recordId);`);

fs.writeFileSync('tests/run_real_integration_test.ts', code);
