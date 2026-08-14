const fs = require('fs');

let settingsContent = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
settingsContent = settingsContent.replace(/const \[newUserPassword, setNewUserPassword\] = useState\('123456'\);/, '');
settingsContent = settingsContent.replace(/import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase\/auth';/, `import { sendPasswordResetEmail } from 'firebase/auth';`);
fs.writeFileSync('src/pages/Settings.tsx', settingsContent);

let dataServiceContent = fs.readFileSync('src/services/dataService.ts', 'utf8');
dataServiceContent = dataServiceContent.replace(/import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase\/auth';/, `import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';`);
fs.writeFileSync('src/services/dataService.ts', dataServiceContent);
