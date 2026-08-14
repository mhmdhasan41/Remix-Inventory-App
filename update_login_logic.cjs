const fs = require('fs');
let code = fs.readFileSync('src/services/dataService.ts', 'utf8');

const loginSigRegex = /login: async \(username: string, password: string\): Promise<\{ success: boolean; message: string \}> => \{/;
code = code.replace(loginSigRegex, "login: async (username: string, password: string): Promise<{ success: boolean; message: string; requirePasswordChange?: boolean; tempUser?: SystemUser }> => {");

const loginEndRegex = /    localStorage\.setItem\(STORAGE_KEYS\.IS_LOGGED_IN, 'true'\);\n    localStorage\.setItem\(STORAGE_KEYS\.CURRENT_USER, JSON\.stringify\(found\)\);\n    \n    dataService\.logAudit\('تسجيل الدخول', `تم تسجيل دخول المستخدم: \$\{found\.fullName\}`, 'إعدادات'\);\n    return \{ success: true, message: 'تم تسجيل الدخول بنجاح' \};/;

const newLoginEnd = `    if (isDefaultPassword) {
      return { success: true, message: 'يرجى تغيير كلمة المرور', requirePasswordChange: true, tempUser: found };
    }

    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
    
    dataService.logAudit('تسجيل الدخول', \`تم تسجيل دخول المستخدم: \${found.fullName}\`, 'إعدادات');
    return { success: true, message: 'تم تسجيل الدخول بنجاح' };`;

code = code.replace(loginEndRegex, newLoginEnd);

// We also need a helper to complete login after password change.
const completeLoginFunc = `
  completeLogin: (user: SystemUser) => {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    dataService.logAudit('تسجيل الدخول', \`تم تسجيل دخول المستخدم: \${user.fullName}\`, 'إعدادات');
    dataService.notify();
  },
`;

code = code.replace("  isLoggedIn: (): boolean => {", completeLoginFunc + "\n  isLoggedIn: (): boolean => {");

fs.writeFileSync('src/services/dataService.ts', code);
