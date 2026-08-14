const fs = require('fs');

let ds = fs.readFileSync('src/services/dataService.ts', 'utf8');

const lines = ds.split('\n');
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('login: async (username: string, password: string,')) {
    startIdx = i;
  }
  if (startIdx !== -1 && i > startIdx && lines[i].includes('logout: () => {')) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const newLoginFn = `  login: async (username: string, password: string, rememberMe: boolean = true): Promise<{ success: boolean; message: string }> => {
    const cleanInput = username.trim().toLowerCase();
    
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailPattern.test(cleanInput)) {
      return { success: false, message: 'ممنوع تسجيل الدخول بحسابات ليست على صيغة بريد إلكتروني!' };
    }

    const users = dataService.getUsers();
    const found = users.find(u => u.username.trim().toLowerCase() === cleanInput);

    if (!found) {
      return { success: false, message: 'هذا المستخدم غير مسجل في النظام' };
    }

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
    }

    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
    
    dataService.logAudit('تسجيل الدخول', \`تم تسجيل دخول المستخدم: \${found.fullName}\`, 'نظام');
    return { success: true, message: 'تم تسجيل الدخول بنجاح' };
  },
`;

  lines.splice(startIdx, endIdx - startIdx, newLoginFn);
  fs.writeFileSync('src/services/dataService.ts', lines.join('\n'));
  console.log("Successfully replaced login function");
} else {
  console.log("Could not find login function boundaries", startIdx, endIdx);
}
