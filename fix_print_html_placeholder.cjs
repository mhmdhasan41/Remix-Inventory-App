const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');
code = code.replace(/<div class="page-num-placeholder"([^>]*)><\/div>/g, '<div class="page-num-placeholder"$1>&nbsp;</div>');
fs.writeFileSync('src/utils/printHtml.ts', code);
