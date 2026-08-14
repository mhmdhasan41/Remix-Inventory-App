const fs = require('fs');

let settingsContent = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
settingsContent = settingsContent.replace(/const \[newUserPassword, setNewUserPassword\] = useState\(''\);/, '');
settingsContent = settingsContent.replace(/import { sendPasswordResetEmail } from 'firebase\/auth';/, `import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';`);

fs.writeFileSync('src/pages/Settings.tsx', settingsContent);
