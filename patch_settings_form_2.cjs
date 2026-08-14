const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const target = `                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required>`;

const replacement = `                    />
                  </Grid>
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
                  )}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Settings.tsx', content);
