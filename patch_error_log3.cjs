const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');
code = code.replace(/if \(pageUsedHeight > USABLE_HEIGHT \+ 2\) \{/, `if (pageUsedHeight > USABLE_HEIGHT + 2) {
      console.error("PAGE " + (i+1) + " USED HEIGHT: " + pageUsedHeight + " LAST CHILD CLASS: " + (p.lastElementChild ? p.lastElementChild.className : 'none') + " HTML: " + p.innerHTML.substring(0, 1000));
`);
fs.writeFileSync('src/utils/printHtml.ts', code);
