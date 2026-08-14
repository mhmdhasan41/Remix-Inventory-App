const fs = require('fs');
let mat = fs.readFileSync('src/pages/Materials.tsx', 'utf8');
mat = mat.replace(/import \{ requireStableStringPart \} from '\.\.\/utils\/printHtml';\n/, '');
fs.writeFileSync('src/pages/Materials.tsx', mat);
