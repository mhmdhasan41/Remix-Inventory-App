const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const target = `                  {!editingUser && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="كلمة المرور المبدئية"
                        placeholder="أدخل كلمة المرور"
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        required
                        slotProps={{ inputLabel: { style: { fontFamily: '"Cairo", sans-serif' } } }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                  )}`;

const replacement = `                  {!editingUser && (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info" sx={{ fontFamily: '"Cairo", sans-serif', borderRadius: '8px' }}>
                        سيتمكن هذا الموظف من تعيين كلمة المرور الخاصة به تلقائياً عند أول عملية تسجيل دخول يقوم بها.
                      </Alert>
                    </Grid>
                  )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Settings.tsx', content);
