const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');
code = code.replace(/throw new Error\(errorMsg\);/, `console.error("PAGE " + (i+1) + " USED HEIGHT: " + pageUsedHeight, "HTML: ", p.innerHTML); throw new Error(errorMsg);`);
fs.writeFileSync('src/utils/printHtml.ts', code);
