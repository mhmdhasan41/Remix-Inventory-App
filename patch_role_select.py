import re

with open("src/pages/Settings.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_role = """                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="المسمى والدور الوظيفي"
                      placeholder="مثال: أمين المخزن الكيميائي، محاسب الميزانية"
                      value={userRole}
                      onChange={(e) => setUserRole(e.target.value)}
                      required
                      slotProps={{ inputLabel: { style: { fontFamily: '"Cairo", sans-serif' } } }}
                    />
                  </Grid>"""

new_role = """                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth required>
                      <InputLabel sx={{ fontFamily: '"Cairo", sans-serif' }}>الدور والمسمى الوظيفي المعتمد</InputLabel>
                      <Select
                        value={userRole}
                        label="الدور والمسمى الوظيفي المعتمد"
                        onChange={(e) => {
                          const val = e.target.value;
                          setUserRole(val);
                          if (val === 'مدير نظام') {
                            setUserPermissions(APP_PERMISSIONS.map(p => p.id));
                          } else if (val === 'أمين مستودع') {
                            setUserPermissions(['dashboard_view', 'materials_view', 'materials_create', 'materials_edit', 'materials_stocktake', 'transactions_view', 'transactions_create', 'reports_view', 'reports_export', 'reports_print']);
                          } else if (val === 'مراجع/مُشاهد') {
                            setUserPermissions(['dashboard_view', 'materials_view', 'transactions_view', 'reports_view', 'audit_view']);
                          }
                        }}
                        sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold' }}
                      >
                        <MenuItem value="مدير نظام">مدير نظام (صلاحيات كاملة)</MenuItem>
                        <MenuItem value="أمين مستودع">أمين مستودع (قراءة وإضافة وتعديل)</MenuItem>
                        <MenuItem value="مراجع/مُشاهد">مراجع/مُشاهد (قراءة واستعراض فقط)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>"""

if old_role in content:
    content = content.replace(old_role, new_role)
    print("Replaced role input successfully!")
else:
    print("Could not find the role input block.")

with open("src/pages/Settings.tsx", "w", encoding="utf-8") as f:
    f.write(content)
