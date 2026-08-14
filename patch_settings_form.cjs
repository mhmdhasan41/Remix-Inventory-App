const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const emailFieldRegex = /<TextField[\s\S]*?label="البريد الإلكتروني"[\s\S]*?onChange=\{\(e\) => setUserUsername\(e\.target\.value\)\}[\s\S]*?\/>/g;

const matched = content.match(emailFieldRegex);

if (matched && matched[0]) {
  const replacement = matched[0] + `
                  {!editingUser && (
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
  content = content.replace(matched[0], replacement);
}

fs.writeFileSync('src/pages/Settings.tsx', content);
