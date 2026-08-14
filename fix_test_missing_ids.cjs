const fs = require('fs');
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

test = test.replace(/rows: t1RowsCandidate\n\s*\},/g, "rows: t1RowsCandidate,\n                recordIds: t1RowsCandidate.map((_, i) => JSON.stringify(['case3', 't0', String(i)]))\n              },");
test = test.replace(/rows: t2RowsCandidate\n\s*\}\n/g, "rows: t2RowsCandidate,\n                recordIds: t2RowsCandidate.map((_, i) => JSON.stringify(['case3', 't1', String(i)]))\n              }\n");

test = test.replace(/rows: t1Rows\n\s*\},/g, "rows: t1Rows,\n              recordIds: t1Rows.map((_, i) => JSON.stringify(['case4', 't0', String(i)]))\n            },");
test = test.replace(/rows: t2Rows\n\s*\}\n/g, "rows: t2Rows,\n              recordIds: t2Rows.map((_, i) => JSON.stringify(['case4', 't1', String(i)]))\n            }\n");

// Any other missing? Let's check Case 5.
test = test.replace(/rows: rowsC5\n\s*\}\],/g, "rows: rowsC5,\n            recordIds: rowsC5.map((_, i) => JSON.stringify(['case5', 't0', String(i)]))\n          }],");

fs.writeFileSync('tests/run_real_integration_test.ts', test);
