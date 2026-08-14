const fs = require('fs');
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

test = test.replace(/fixC3T1\.map\(f => f\.id\)/g, "t1RowsCandidate.map((r, i) => JSON.stringify(['case3', 't0', String(i)]))");
test = test.replace(/fixC3T2\.map\(f => f\.id\)/g, "t2RowsCandidate.map((r, i) => JSON.stringify(['case3', 't1', String(i)]))");

fs.writeFileSync('tests/run_real_integration_test.ts', test);
