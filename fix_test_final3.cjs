const fs = require('fs');
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

test = test.replace(/t1Rows\.map/g, "t1RowsC4.map");
test = test.replace(/t2Rows\.map/g, "t2RowsC4.map");

fs.writeFileSync('tests/run_real_integration_test.ts', test);
