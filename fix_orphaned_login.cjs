const fs = require('fs');

let content = fs.readFileSync('src/services/dataService.ts', 'utf8');

const target = `  isLoggedIn: (): boolean => {
    return sessionStorage.getItem('remix_is_logged_in') === 'true' || localStorage.getItem('remix_is_logged_in') === 'true';
  },

    const cleanInput = username.trim().toLowerCase();
    
    // Enforce email format strictly
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailPattern.test(cleanInput)) {
      return { success: false, message: 'ممنوع تسجيل الدخول بحسابات ليست على صيغة بريد إلكتروني!' };
    }

    const users = dataService.getUsers();
    const found = users.find(u => u.username.trim().toLowerCase() === cleanInput);

    if (!found) {
      return { success: false, message: 'اسم المستخدم أو البريد الإلكتروني غير صحيح!' };
    }
    const userPass = found.password || found.username; // fallback if password field not set
    if (userPass !== password) {
      return { success: false, message: 'كلمة المرور غير صحيحة!' };
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
  },`;

const replacement = `  isLoggedIn: (): boolean => {
    return sessionStorage.getItem('remix_is_logged_in') === 'true' || localStorage.getItem('remix_is_logged_in') === 'true';
  },`;

content = content.replace(target, replacement);

fs.writeFileSync('src/services/dataService.ts', content);
