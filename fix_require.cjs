const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

code = code.replace(/const crypto = require\('crypto'\);/, "import crypto from 'crypto';");

fs.writeFileSync('tests/run_real_integration_test.ts', code);
