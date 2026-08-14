const fs = require('fs');
let content = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

content = content.replace(/const c4Integrity = snapshot4\.pageTexts \? verifyContentIntegrity\([^)]+\) : \{\};/g, 'const c4Integrity: any = snapshot4.pageTexts ? verifyContentIntegrity($1) : {};');
content = content.replace(/const c4Integrity = snapshot4\.pageTexts \? verifyContentIntegrity\(/g, 'const c4Integrity: any = snapshot4.pageTexts ? verifyContentIntegrity(');

fs.writeFileSync('tests/run_real_integration_test.ts', content);
