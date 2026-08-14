const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

const replacement = `
import fsSync from 'fs';
import crypto from 'crypto';
const srcPath = 'src/utils/printHtml.ts';
const sha256Hash = fsSync.existsSync(srcPath) ? crypto.createHash('sha256').update(fsSync.readFileSync(srcPath)).digest('hex') : 'N/A';
`;

// Insert after imports
code = code.replace(/import \{.*?\} from 'jspdf';/, match => match + '\n' + replacement);

// And wait, the one I tried before was:
code = code.replace(/Source File: \$\{srcPath\}/, 'Source File: ${srcPath}');

fs.writeFileSync('tests/run_real_integration_test.ts', code);
