const fs = require('fs');

let ds = fs.readFileSync('src/services/dataService.ts', 'utf8');
ds = ds.replace(/dataService\.logAudit\('تسجيل الدخول', \`تم تسجيل دخول المستخدم: \$\{found\.fullName\}\`, 'نظام'\);/g, "dataService.logAudit('تسجيل الدخول', `تم تسجيل دخول المستخدم: ${found.fullName}`, 'إعدادات');");
ds = ds.replace(/login: async \(username: string, password: string, rememberMe: boolean = true\)/g, "login: async (username: string, password: string)");

fs.writeFileSync('src/services/dataService.ts', ds);
