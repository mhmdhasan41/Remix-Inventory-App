const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const targetBtn = `<Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        startIcon={<KeyIcon />}
                        onClick={async () => {
                          try {
                            if (auth) {
                              auth.languageCode = 'ar';
                              const cleanEmail = userUsername.trim().toLowerCase();
                              await sendPasswordResetEmail(auth, cleanEmail);
                              setSuccessMsg('تم إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني بنجاح (يرجى التحقق من صندوق البريد غير الهام Spam).');
                            } else {
                              setErrorMsg('خدمة المصادقة غير متوفرة حالياً.');
                            }
                          } catch (e: any) {
                            if (e.code === 'auth/user-not-found' || e.message?.includes('not found')) {
                              setErrorMsg('لم يتم العثور على هذا الحساب في Firebase. يمكنك حفظ المستخدم مرة أخرى لإنشاء حسابه، أو أن يقوم المستخدم بتسجيل الدخول بالكلمة الافتراضية.');
                            } else {
                              setErrorMsg('حدث خطأ أثناء إرسال رابط إعادة التعيين: ' + e.message);
                            }
                          }
                        }}
                        sx={{ fontFamily: '"Cairo", sans-serif', mb: 2 }}
                      >
                        إرسال رابط إعادة تعيين كلمة المرور
                      </Button>`;

const replaceBtn = `<Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        startIcon={<KeyIcon />}
                        onClick={() => {
                          const users = dataService.getUsers();
                          const idx = users.findIndex(u => u.id === editingUserId);
                          if (idx !== -1) {
                            users[idx].password = '123456';
                            localStorage.setItem('remix_users_v1', JSON.stringify(users));
                            setSuccessMsg('تم إعادة تعيين كلمة المرور إلى الافتراضية: 123456');
                          } else {
                            setErrorMsg('يرجى حفظ المستخدم أولاً قبل إعادة التعيين.');
                          }
                        }}
                        sx={{ fontFamily: '"Cairo", sans-serif', mb: 2 }}
                      >
                        إعادة التعيين للكلمة الافتراضية (123456)
                      </Button>`;

content = content.replace(targetBtn, replaceBtn);
content = content.replace(`import { sendPasswordResetEmail } from 'firebase/auth';\n`, '');
fs.writeFileSync('src/pages/Settings.tsx', content);
