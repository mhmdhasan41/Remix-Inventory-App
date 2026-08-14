const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const target = `                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required>`;

const replacement = `                  {editingUser && (
                    <Grid size={{ xs: 12 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={async () => {
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
                        }}
                        sx={{ fontFamily: '"Cairo", sans-serif', mb: 2 }}
                      >
                        إرسال رابط إعادة تعيين كلمة المرور
                      </Button>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required>`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/Settings.tsx', content);
