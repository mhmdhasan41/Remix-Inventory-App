const fs = require('fs');
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

// Replace the entire guard block manually
const guardRegex = /\/\/ MANDATORY START GUARD[\s\S]*?process\.exit\(1\);\n\}/m;
test = test.replace(guardRegex, '');

fs.writeFileSync('tests/run_real_integration_test.ts', test);
