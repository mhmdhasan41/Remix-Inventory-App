const fs = require('fs');
let content = fs.readFileSync('src/services/dataService.ts', 'utf8');

const target = `  login: async (username: string, password: string, rememberMe: boolean = true): Promise<{ success: boolean; message: string }> => {
    const cleanInput = username.trim().toLowerCase();
    
    // Enforce email format strictly
    const emailPattern = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;
    if (!emailPattern.test(cleanInput)) {
      return { success: false, message: 'ممنوع تسجيل الدخول بحسابات ليست على صيغة بريد إلكتروني!' };
    }

    try {
      if (isFirebaseAvailable && auth) {
        await signInWithEmailAndPassword(auth, cleanInput, password);
      }
    } catch (e: any) {
      // Emergency fallback: Create admin account if it doesn't exist
      if (cleanInput === 'admin@system.com' && isFirebaseAvailable && auth) {
        try {
          await createUserWithEmailAndPassword(auth, cleanInput, password);
        } catch (innerErr: any) {
          if (innerErr.code === 'auth/operation-not-allowed') {
            // Bypass Firebase and allow local admin login so the user isn't locked out
            console.warn('Firebase Email/Password auth is not enabled. Bypassing for admin.');
          } else {
            return { success: false, message: 'خطأ في حساب الطوارئ: ' + innerErr.message };
          }
        }
      } else {
        return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
      }
    }

    const users = dataService.getUsers();
    const found = users.find(u => u.username.trim().toLowerCase() === cleanInput);

    if (!found) {
      return { success: false, message: 'هذا المستخدم غير مسجل في النظام' };
    }`;

const replacement = `  login: async (username: string, password: string, rememberMe: boolean = true): Promise<{ success: boolean; message: string }> => {
    const cleanInput = username.trim().toLowerCase();
    
    // Enforce email format strictly
    const emailPattern = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;
    if (!emailPattern.test(cleanInput)) {
      return { success: false, message: 'ممنوع تسجيل الدخول بحسابات ليست على صيغة بريد إلكتروني!' };
    }

    const users = dataService.getUsers();
    const found = users.find(u => u.username.trim().toLowerCase() === cleanInput);

    if (!found) {
      return { success: false, message: 'هذا المستخدم غير مسجل في النظام' };
    }

    try {
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

content = content.replace(target, replacement);
fs.writeFileSync('src/services/dataService.ts', content);
