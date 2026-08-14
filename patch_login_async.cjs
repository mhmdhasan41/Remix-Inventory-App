const fs = require('fs');
let content = fs.readFileSync('src/services/dataService.ts', 'utf8');

const targetLogin = `    try {
      if (isFirebaseAvailable && auth) {
        await signInWithEmailAndPassword(auth, cleanInput, password);
      }
    } catch (e: any) {
      // If login fails, check if the account doesn't exist in Firebase yet.
      // Since they exist in our local users DB (found is true), this is their first login!
      // Let's create the account for them in Firebase auth using the provided password.
      if (isFirebaseAvailable && auth) {
        try {
          await createUserWithEmailAndPassword(auth, cleanInput, password);
        } catch (innerErr: any) {
          if (innerErr.code === 'auth/operation-not-allowed') {
            console.warn('Firebase Email/Password auth is not enabled. Bypassing for local login.');
          } else if (innerErr.code === 'auth/email-already-in-use') {
            // The account exists in Firebase, meaning the password was actually wrong
            return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
          } else {
            return { success: false, message: 'حدث خطأ في المصادقة: ' + innerErr.message };
          }
        }
      } else {
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
      }
    }`;

const replacementLogin = `    try {
      if (isFirebaseAvailable && auth) {
        await signInWithEmailAndPassword(auth, cleanInput, password);
      } else if (!isFirebaseAvailable) {
        // Offline / No Firebase mode fallback
        if (password !== 'admin' && password !== '123456') {
          return { success: false, message: 'في وضع عدم الاتصال، كلمة المرور هي admin أو 123456' };
        }
      }
    } catch (e: any) {
      if (isFirebaseAvailable && auth) {
        // Enforce default passwords for first-time creation to prevent random password hijack
        const isDefaultPassword = (cleanInput === 'admin@system.com' && password === 'admin') || password === '123456';
        if (!isDefaultPassword) {
           return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
        }

        try {
          await createUserWithEmailAndPassword(auth, cleanInput, password);
        } catch (innerErr: any) {
          if (innerErr.code === 'auth/operation-not-allowed') {
            return { success: false, message: 'عذراً، تسجيل الدخول معطل: يجب تفعيل المصادقة (Email/Password) في إعدادات Firebase ليعمل النظام.' };
          } else if (innerErr.code === 'auth/email-already-in-use') {
            return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
          } else {
            return { success: false, message: 'حدث خطأ في المصادقة: ' + innerErr.message };
          }
        }
      } else {
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
      }
    }`;

content = content.replace(targetLogin, replacementLogin);
fs.writeFileSync('src/services/dataService.ts', content);
