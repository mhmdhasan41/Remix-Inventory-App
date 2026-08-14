const fs = require('fs');

let content = fs.readFileSync('src/services/dataService.ts', 'utf8');

const loginMethod = `
  login: async (username: string, password: string, rememberMe: boolean = true): Promise<{ success: boolean; message: string }> => {
    const cleanInput = username.trim().toLowerCase();
    
    // Enforce email format strictly
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailPattern.test(cleanInput)) {
      return { success: false, message: 'ممنوع تسجيل الدخول بحسابات ليست على صيغة بريد إلكتروني!' };
    }

    try {
      if (isFirebaseAvailable && auth) {
        await signInWithEmailAndPassword(auth, cleanInput, password);
      }
    } catch (e: any) {
      return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة!' };
    }

    const users = dataService.getUsers();
    const found = users.find(u => u.username.trim().toLowerCase() === cleanInput);

    if (!found) {
      return { success: false, message: 'هذا المستخدم غير مسجل في النظام' };
    }
    
    if (rememberMe) {
      localStorage.setItem('remix_is_logged_in', 'true');
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, found.id);
      sessionStorage.removeItem('remix_is_logged_in');
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      sessionStorage.setItem('remix_is_logged_in', 'true');
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, found.id);
      localStorage.removeItem('remix_is_logged_in');
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    dataService.logAudit('تسجيل الدخول', \`تم تسجيل الدخول بنجاح للمستخدم: \${found.fullName}\`, 'إعدادات');
    
    return { success: true, message: 'تم تسجيل الدخول بنجاح' };
  },
`;

content = content.replace("  isLoggedIn:", loginMethod + "  isLoggedIn:");

// Also add import for Firebase auth methods
if (!content.includes('signInWithEmailAndPassword')) {
  content = content.replace(
    "import { db, isFirebaseAvailable, auth } from './firebase';",
    "import { db, isFirebaseAvailable, auth } from './firebase';\nimport { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';"
  );
}

fs.writeFileSync('src/services/dataService.ts', content);
