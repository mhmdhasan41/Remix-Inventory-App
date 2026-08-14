const fs = require('fs');

// 1. Update Types
let typesContent = fs.readFileSync('src/types/index.ts', 'utf8');
if (!typesContent.includes('password?: string;')) {
    typesContent = typesContent.replace('createdAt: string;', 'createdAt: string;\n  password?: string;');
    fs.writeFileSync('src/types/index.ts', typesContent);
}

// 2. Update dataService imports
let dataServiceContent = fs.readFileSync('src/services/dataService.ts', 'utf8');
dataServiceContent = dataServiceContent.replace(
    /import \{ signInWithEmailAndPassword, createUserWithEmailAndPassword \} from 'firebase\/auth';/,
    `import { signInAnonymously } from 'firebase/auth';`
);

// 3. Update saveUser in dataService
const targetSave = `    // Create Firebase Auth user proactively so password resets work immediately!
    if (isFirebaseAvailable && secondaryAuth && index === -1) {
      try {
        await createUserWithEmailAndPassword(secondaryAuth, user.username.trim().toLowerCase(), '123456');
      } catch (e: any) {
        if (e.code === 'auth/operation-not-allowed') {
          return { success: false, message: 'يجب تفعيل Email/Password في إعدادات Firebase أولاً!' };
        } else if (e.code !== 'auth/email-already-in-use') {
          return { success: false, message: 'فشل إنشاء حساب المستخدم في Firebase: ' + e.message };
        }
      }
    }`;
dataServiceContent = dataServiceContent.replace(targetSave, `    if (index === -1) {
      updatedUser.password = '123456';
    }`);

// 4. Update login in dataService
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

const replaceLogin = `    // Validate password locally since we are using Anonymous Auth
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
        await signInAnonymously(auth);
      }
    } catch (e: any) {
      console.error("Auth error:", e);
      return { success: false, message: 'خطأ في الاتصال بقاعدة البيانات: ' + e.message };
    }`;

dataServiceContent = dataServiceContent.replace(targetLogin, replaceLogin);

fs.writeFileSync('src/services/dataService.ts', dataServiceContent);

// 5. Fix Settings.tsx to remove signInWithEmailAndPassword usage
let settingsContent = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
settingsContent = settingsContent.replace(/import \{ sendPasswordResetEmail, signInWithEmailAndPassword \} from 'firebase\/auth';/, `import { sendPasswordResetEmail } from 'firebase/auth';`);

const targetSettingsReset = `      // Admin Password Verification layer
      const currentUser = dataService.getCurrentUser();
      if (isFirebaseAvailable && auth && currentUser) {
        try {
          await signInWithEmailAndPassword(auth, currentUser.username, resetAdminPassword);
        } catch (authError: any) {
          setIsFactoryResetting(false);
          setErrorMsg('كلمة المرور غير صحيحة! لا يمكن إتمام العملية بدون التحقق من هوية المدير.');
          return;
        }
      }`;

const replaceSettingsReset = `      // Admin Password Verification layer
      const currentUser = dataService.getCurrentUser();
      if (currentUser) {
        const expected = currentUser.password || (currentUser.username === 'admin@system.com' ? 'admin' : '123456');
        if (resetAdminPassword !== expected) {
          setIsFactoryResetting(false);
          setErrorMsg('كلمة المرور غير صحيحة! لا يمكن إتمام العملية بدون التحقق من هوية المدير.');
          return;
        }
      }`;
      
settingsContent = settingsContent.replace(targetSettingsReset, replaceSettingsReset);
fs.writeFileSync('src/pages/Settings.tsx', settingsContent);
