const fs = require('fs');

let ds = fs.readFileSync('src/services/dataService.ts', 'utf8');

const targetLogin = `    try {
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
            return { success: false, message: 'خطأ في إنشاء الحساب: ' + innerErr.message };
          }
        }
      } else {
         return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
      }
    }`;

const replaceLogin = `    // Validate password locally since we are using Anonymous Auth for Managed Projects
    const isDefaultPassword = (cleanInput === 'admin@system.com' && password === 'admin') || password === '123456';
    if (found.password) {
      if (found.password !== password) {
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
      }
    } else {
      if (!isDefaultPassword) {
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
      }
    }

    try {
      if (isFirebaseAvailable && auth) {
        await import('firebase/auth').then(({ signInAnonymously }) => signInAnonymously(auth));
      }
    } catch (e: any) {
      console.error("Auth error:", e);
      return { success: false, message: 'خطأ في الاتصال بقاعدة البيانات: ' + e.message };
    }`;

ds = ds.replace(targetLogin, replaceLogin);
fs.writeFileSync('src/services/dataService.ts', ds);
