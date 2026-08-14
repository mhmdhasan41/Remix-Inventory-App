const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const target = `                              await sendPasswordResetEmail(auth, userUsername);
                              setSuccessMsg('تم إرسال رابط إعادة التعيين إلى البريد الإلكتروني.');`;

const replacement = `                              await sendPasswordResetEmail(auth, userUsername);
                              setSuccessMsg('في حال كان الحساب مفعلاً، تم إرسال رابط إعادة التعيين إلى البريد الإلكتروني (الرجاء التحقق من صندوق البريد غير الهام Spam). ملاحظة: لن تصل الرسالة للحسابات الجديدة التي لم تسجل دخولها لأول مرة.');`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/Settings.tsx', content);
