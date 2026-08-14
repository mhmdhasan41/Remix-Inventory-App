const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const target = `                      <CardContent sx={{ p: 2, pb: 3, '&:last-child': { pb: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: isSelected ? '#007ab7' : '#e2e8f0', color: isSelected ? 'white' : '#475569', width: 32, height: 32, fontSize: '0.85rem', fontWeight: 'bold' }}>
                              {u.fullName.charAt(0)}
                            </Avatar>
                            <Box sx={{ textAlign: 'start' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a', fontFamily: '"Cairo", sans-serif' }}>
                                {u.fullName} {isSelf && <Chip label="أنت حالياً" size="small" color="primary" sx={{ height: 18, fontSize: '9px', fontWeight: 'bold', mr: 0.5, fontFamily: '"Cairo", sans-serif' }} />}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: -0.5, fontFamily: '"Cairo", sans-serif', direction: 'ltr', textAlign: 'right' }}>
                                {u.username} 
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={u.role} 
                            size="small" 
                            sx={{ 
                              bgcolor: u.permissions.length === APP_PERMISSIONS.length ? '#ecfdf5' : '#f1f5f9', 
                              color: u.permissions.length === APP_PERMISSIONS.length ? '#059669' : '#475569', 
                              fontWeight: 'bold', 
                              fontSize: '11px',
                              fontFamily: '"Cairo", sans-serif'
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mb: 1, fontFamily: '"Cairo", sans-serif', textAlign: 'start' }}>
                          الصلاحيات المفعّلة: ({u.permissions.length} من {APP_PERMISSIONS.length})
                        </Typography>`;

const replacement = `                      <CardContent sx={{ p: 2, pb: 3, '&:last-child': { pb: 3 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
                            <Avatar sx={{ bgcolor: isSelected ? '#007ab7' : '#e2e8f0', color: isSelected ? 'white' : '#475569', width: 40, height: 40, fontSize: '1rem', fontWeight: 'bold' }}>
                              {u.fullName.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a', fontFamily: '"Cairo", sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {u.fullName}
                                </Typography>
                                {isSelf && <Chip label="أنت حالياً" size="small" color="primary" sx={{ height: 18, fontSize: '9px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif' }} />}
                              </Box>
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0, fontFamily: '"Cairo", sans-serif', direction: 'ltr', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {u.username} 
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={u.role} 
                            size="small" 
                            sx={{ 
                              bgcolor: u.permissions.length === APP_PERMISSIONS.length ? '#ecfdf5' : '#f1f5f9', 
                              color: u.permissions.length === APP_PERMISSIONS.length ? '#059669' : '#475569', 
                              fontWeight: 'bold', 
                              fontSize: '11px',
                              fontFamily: '"Cairo", sans-serif',
                              flexShrink: 0
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mb: 1, fontFamily: '"Cairo", sans-serif', textAlign: 'start' }}>
                          الصلاحيات المفعّلة: ({u.permissions.length} من {APP_PERMISSIONS.length})
                        </Typography>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/Settings.tsx', content);
