const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

code = code.replace(/if \(!identity\) throw new Error\(\`صف DOM \$\{trDomIdx\} ضمن الجدول \$\{tableIndex\} مجهول الهوية \(غير مسجل في WeakMap\)\`\);/, `if (!identity) throw new Error(\`صف DOM \${trDomIdx} ضمن الجدول \${tableIndex} مجهول الهوية. محتوى الصف: \${tr.innerHTML}\`);`);

fs.writeFileSync('src/utils/printHtml.ts', code);

// Also let's fix run_real_integration_test.ts srcPath definition
let runCode = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');
const defs = `
const srcPath = 'src/utils/printHtml.ts';
const sha256Hash = require('crypto').createHash('sha256').update(require('fs').readFileSync(srcPath)).digest('hex');
`;
runCode = runCode.replace(/import { runExportWithPromise, savePdfFile, parsePdfInfoAndExtractJpegs }/, `${defs}\nimport { runExportWithPromise, savePdfFile, parsePdfInfoAndExtractJpegs }`);

// Remove the inline ones that I tried to insert before
runCode = runCode.replace(/import fsSync from 'fs';/, '');
runCode = runCode.replace(/import crypto from 'crypto';/, '');
runCode = runCode.replace(/const srcPath = 'src\/utils\/printHtml\.ts';\nconst sha256Hash.*?;/, '');

fs.writeFileSync('tests/run_real_integration_test.ts', runCode);
