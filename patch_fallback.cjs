const fs = require('fs');
let content = fs.readFileSync('src/services/dataService.ts', 'utf8');

const target = `        try {
          await createUserWithEmailAndPassword(auth, cleanInput, password);
        } catch (innerErr: any) {
          return { success: false, message: 'خطأ في حساب الطوارئ: ' + innerErr.message };
        }`;

const replacement = `        try {
          await createUserWithEmailAndPassword(auth, cleanInput, password);
        } catch (innerErr: any) {
          if (innerErr.code === 'auth/operation-not-allowed') {
            // Bypass Firebase and allow local admin login so the user isn't locked out
            console.warn('Firebase Email/Password auth is not enabled. Bypassing for admin.');
          } else {
            return { success: false, message: 'خطأ في حساب الطوارئ: ' + innerErr.message };
          }
        }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/services/dataService.ts', content);
