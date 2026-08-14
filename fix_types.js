const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');
code = code.replace(/password\?:\s*string;\n?/g, '');
fs.writeFileSync('src/types/index.ts', code);
