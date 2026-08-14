const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

code = code.replace(/if \(!identity.recordId\) throw new Error/, `
    console.error("DOM row " + domIdx + " HTML: " + tr.outerHTML);
    console.error("TR has attributes: ", tr.getAttributeNames());
    if (!identity.recordId) throw new Error`);

fs.writeFileSync('src/utils/printHtml.ts', code);
