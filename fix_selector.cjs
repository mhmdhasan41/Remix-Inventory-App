const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');
code = code.replace(/querySelectorAll\('tbody > tr'\)/g, `querySelectorAll('.table-container tbody > tr')`);
fs.writeFileSync('src/utils/printHtml.ts', code);
