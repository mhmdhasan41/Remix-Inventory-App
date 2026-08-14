const fs = require('fs');
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');
test = test.replace(`recordIds: recordIdsC1(f => f.id),`, `recordIds: fixC1.map(f => f.id),`);
fs.writeFileSync('tests/run_real_integration_test.ts', test);
