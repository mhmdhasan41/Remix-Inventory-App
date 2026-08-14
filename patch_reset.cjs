const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const target = `                        onClick={async () => {
                          try {
                            const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
                            const { auth } = await import('../services/firebase');
                            if (auth) {
                              await sendPasswordResetEmail(auth, userUsername);
                              alert('تم إرسال رابط إعادة التعيين إلى البريد الإلكتروني.');
                            } else {
                              alert('خدمة المصادقة غير متوفرة حالياً.');
                            }
                          } catch (e: any) {
                            alert('حدث خطأ أثناء إرسال رابط إعادة التعيين: ' + e.message);
                          }
                        }}`;

const replacement = `                        onClick={async () => {
                          try {
                            if (auth) {
                              await sendPasswordResetEmail(auth, userUsername);
                              alert('تم إرسال رابط إعادة التعيين إلى البريد الإلكتروني.');
                            } else {
                              alert('خدمة المصادقة غير متوفرة حالياً.');
                            }
                          } catch (e: any) {
                            if (e.code === 'auth/user-not-found' || e.message?.includes('not found')) {
                              alert('هذا الحساب جديد ولم يقم بتسجيل الدخول بعد. يتم تعيين كلمة المرور لأول مرة بمجرد أن يقوم المستخدم بتسجيل الدخول لحسابه بأي كلمة مرور يختارها.');
                            } else {
                              alert('حدث خطأ أثناء إرسال رابط إعادة التعيين: ' + e.message);
                            }
                          }
                        }}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Settings.tsx', content);
