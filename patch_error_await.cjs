const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');
code = code.replace(/console\.error\("PAGE " \+ \(i\+1\) \+ " USED HEIGHT: " \+ pageUsedHeight, "HTML: ", p\.innerHTML\); throw new Error\(errorMsg\);/g, `console.error("PAGE " + (i+1) + " USED HEIGHT: " + pageUsedHeight, "HTML: " + p.innerHTML); await new Promise(r => setTimeout(r, 500)); throw new Error(errorMsg);`);
fs.writeFileSync('src/utils/printHtml.ts', code);
