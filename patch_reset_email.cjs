const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
const target = `setSuccessMsg('في حال كان الحساب مفعلاً، تم إرسال رابط إعادة التعيين إلى البريد الإلكتروني (الرجاء التحقق من صندوق البريد غير الهام Spam). ملاحظة: لن تصل الرسالة للحسابات الجديدة التي لم تسجل دخولها لأول مرة.');`;
const replacement = `setSuccessMsg('تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني بنجاح (يرجى التحقق من صندوق البريد غير الهام Spam).');`;
content = content.replace(target, replacement);

const targetError = `setErrorMsg('هذا الحساب جديد ولم يقم بتسجيل الدخول بعد. يتم تعيين كلمة المرور لأول مرة بمجرد أن يقوم المستخدم بتسجيل الدخول لحسابه بأي كلمة مرور يختارها.');`;
const replacementError = `setErrorMsg('لم يتم العثور على هذا الحساب في Firebase. يمكنك حفظ المستخدم مرة أخرى لإنشاء حسابه، أو أن يقوم المستخدم بتسجيل الدخول بالكلمة الافتراضية.');`;
content = content.replace(targetError, replacementError);

fs.writeFileSync('src/pages/Settings.tsx', content);
