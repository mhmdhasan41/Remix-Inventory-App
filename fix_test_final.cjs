const fs = require('fs');
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

// I replaced `recordIdsC1` with `fixC1.map(f => f.id)` but `fixC1` is not defined in the original file. The original file only has `rowsC1`.
test = test.replace(/fixC1\.map\(f => f\.id\)/g, "rowsC1.map((r, i) => JSON.stringify(['case1', 't0', String(i)]))");
test = test.replace(/fixC2\.map\(f => f\.id\)/g, "rowsC2.map((r, i) => JSON.stringify(['case2', 't0', String(i)]))");
test = test.replace(/fixC4T1\.map\(f => f\.id\)/g, "t1Rows.map((r, i) => JSON.stringify(['case4', 't0', String(i)]))");
test = test.replace(/fixC4T2\.map\(f => f\.id\)/g, "t2Rows.map((r, i) => JSON.stringify(['case4', 't1', String(i)]))");
test = test.replace(/fixC5\.map\(f => f\.id\)/g, "rowsC5.map((r, i) => JSON.stringify(['case5', 't0', String(i)]))");
test = test.replace(/fixRec\.map\(f => f\.id\)/g, "rowsRec.map((r, i) => JSON.stringify(['rec', 't0', String(i)]))");

fs.writeFileSync('tests/run_real_integration_test.ts', test);
