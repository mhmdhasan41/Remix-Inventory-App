const fs = require('fs');
let runCode = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');
const defs = `
const srcPath = 'src/utils/printHtml.ts';
const crypto = require('crypto');
const sha256Hash = fs.existsSync(srcPath) ? crypto.createHash('sha256').update(fs.readFileSync(srcPath)).digest('hex') : 'N/A';
`;
runCode = runCode.replace(/const EXPECTED_PRINT_HTML_HASH = '.*?';/, match => defs + '\n' + match);
fs.writeFileSync('tests/run_real_integration_test.ts', runCode);
