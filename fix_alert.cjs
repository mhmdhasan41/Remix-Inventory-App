const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

code = code.replace(/console\.log\("DOM ROW CHECK: " \+ domIdx \+ " record: " \+ identity\.recordId\);/g, `
    if (!identity.recordId) {
       window.alert("DOM ROW CHECK FAILED: domIdx=" + domIdx + " outerHTML: " + tr.outerHTML);
    }
`);

fs.writeFileSync('src/utils/printHtml.ts', code);
