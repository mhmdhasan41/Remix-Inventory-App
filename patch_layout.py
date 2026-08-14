import re

with open('src/layouts/AppLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Bell icon in Popover
content = content.replace(
    '''<Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, fontFamily: '"Cairo", sans-serif', color: '#1e293b', textAlign: 'right' }}>
                🔔 التنبيهات والإنذارات المخزنية
              </Typography>''',
    '''<Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1, justifyContent: 'flex-start' }}>
                <Typography variant="body1" sx={{ fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif' }}>🔔</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', color: '#1e293b' }}>
                  التنبيهات والإنذارات المخزنية
                </Typography>
              </Box>'''
)

# Fix empty alerts text alignment
content = content.replace(
    '''<Box sx={{ textAlign: 'right', py: 4, direction: 'rtl' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', fontFamily: '"Cairo", sans-serif' }}>
                    لا توجد تنبيهات عاجلة، الأرصدة آمنة.
                  </Typography>
                </Box>''',
    '''<Box sx={{ py: 4, display: 'flex', justifyContent: 'flex-start', width: '100%', direction: 'rtl' }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic', fontFamily: '"Cairo", sans-serif' }}>
                    لا توجد تنبيهات عاجلة، الأرصدة آمنة.
                  </Typography>
                </Box>'''
)

# Fix ExitToApp icons
content = content.replace(
    '<ExitToAppIcon sx={{ fontSize: 16 }} />',
    '<ExitToAppIcon sx={{ fontSize: 16, transform: "scaleX(-1)" }} />'
)
content = content.replace(
    '<ExitToAppIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />',
    '<ExitToAppIcon sx={{ fontSize: { xs: 20, sm: 24 }, transform: "scaleX(-1)" }} />'
)

with open('src/layouts/AppLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
