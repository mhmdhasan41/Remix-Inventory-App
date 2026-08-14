const fs = require('fs');
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

test = test.replace(/Source File: \$\{srcPath\}/g, "Source File: N/A");
test = test.replace(/SHA-256 Hash: \$\{sha256Hash\}/g, "SHA-256 Hash: N/A");

fs.writeFileSync('tests/run_real_integration_test.ts', test);
