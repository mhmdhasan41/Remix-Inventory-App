const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

code = code.replace(/console\.error\("DOM row "[^;]+;/g, `console.log("DOM ROW CHECK: " + domIdx + " record: " + identity.recordId);`);
code = code.replace(/console\.error\("TR has attributes[^;]+;/g, '');

fs.writeFileSync('src/utils/printHtml.ts', code);
