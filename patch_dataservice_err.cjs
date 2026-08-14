const fs = require('fs');
let content = fs.readFileSync('src/services/dataService.ts', 'utf8');

const target = `        try {
          await createUserWithEmailAndPassword(auth, cleanInput, password);
        } catch (innerErr) {
          return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
        }`;

const replacement = `        try {
          await createUserWithEmailAndPassword(auth, cleanInput, password);
        } catch (innerErr: any) {
          return { success: false, message: 'خطأ في حساب الطوارئ: ' + innerErr.message };
        }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/services/dataService.ts', content);
