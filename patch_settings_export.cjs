const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const target1 = `        users: JSON.parse(localStorage.getItem('remix_users_v1') || '[]'),`;
const replacement1 = `        users: JSON.parse(localStorage.getItem('remix_users_v1') || '[]').map((u: any) => { delete u.password; return u; }),`;
content = content.replace(target1, replacement1);

const target2 = `        users,
        settings: localSettings,`;
const replacement2 = `        users: users.map(u => { delete (u as any).password; return u; }),
        settings: localSettings,`;
content = content.replace(target2, replacement2);

fs.writeFileSync('src/pages/Settings.tsx', content);
