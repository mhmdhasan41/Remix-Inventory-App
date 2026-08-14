const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

content = content.replace(/editingUserId/g, 'editingUser');
fs.writeFileSync('src/pages/Settings.tsx', content);

