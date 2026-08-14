const fs = require('fs');
let settingsContent = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
settingsContent = settingsContent.replace(/setNewUserPassword\(''\);/g, '');
fs.writeFileSync('src/pages/Settings.tsx', settingsContent);
