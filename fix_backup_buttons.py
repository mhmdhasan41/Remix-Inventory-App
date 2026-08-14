import re

with open('src/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Card 1 buttons
target_card1 = """                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 'auto', pt: 2, justifyContent: 'flex-start' }}>
                  <Button
                    variant="contained"
                    onClick={handleExportBackup}
                    startIcon={<CloudDownloadIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ 
                      bgcolor: '#007ab7', 
                      fontWeight: 'bold', 
                      fontFamily: '"Cairo", sans-serif', 
                      borderRadius: '12px', 
                      px: 3, 
                      py: 1.2, 
                      '&:hover': { bgcolor: '#006293' } 
                    }}
                  >
                    تنزيل النسخة الاحتياطية (.json)
                  </Button>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ 
                      borderColor: '#475569',
                      color: '#475569',
                      fontWeight: 'bold', 
                      fontFamily: '"Cairo", sans-serif', 
                      borderRadius: '12px', 
                      px: 3, 
                      py: 1.2, 
                      '&:hover': { borderColor: '#1e293b', bgcolor: '#f8fafc' } 
                    }}
                  >"""

replacement_card1 = """                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mt: 'auto', pt: 2, width: '100%' }}>
                  <Button
                    variant="contained"
                    onClick={handleExportBackup}
                    startIcon={<CloudDownloadIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ 
                      bgcolor: '#007ab7', 
                      fontWeight: 'bold', 
                      fontFamily: '"Cairo", sans-serif', 
                      borderRadius: '12px', 
                      px: 3, 
                      py: 1.5, 
                      flex: 1,
                      '&:hover': { bgcolor: '#006293' } 
                    }}
                  >
                    تنزيل النسخة الاحتياطية (.json)
                  </Button>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ 
                      borderColor: '#475569',
                      color: '#475569',
                      fontWeight: 'bold', 
                      fontFamily: '"Cairo", sans-serif', 
                      borderRadius: '12px', 
                      px: 3, 
                      py: 1.5, 
                      flex: 1,
                      '&:hover': { borderColor: '#1e293b', bgcolor: '#f8fafc' } 
                    }}
                  >"""
content = content.replace(target_card1, replacement_card1)

# Fix Card 2 button
target_card2 = """                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'flex-start' }}>
                  <Button
                    variant="contained"
                    onClick={handleGoogleDriveBackup}
                    startIcon={<CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ 
                      bgcolor: '#16a34a', 
                      fontWeight: 'bold', 
                      color: 'white',
                      fontFamily: '"Cairo", sans-serif', 
                      borderRadius: '12px', 
                      px: 3, 
                      py: 1.2, 
                      '&:hover': { bgcolor: '#15803d' },
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
                    }}
                  >
                    تصدير ومزامنة لـ Google Drive السحابي
                  </Button>"""

replacement_card2 = """                <Box sx={{ mt: 'auto', pt: 2, display: 'flex', width: '100%' }}>
                  <Button
                    variant="contained"
                    onClick={handleGoogleDriveBackup}
                    startIcon={<CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                    sx={{ 
                      bgcolor: '#16a34a', 
                      fontWeight: 'bold', 
                      color: 'white',
                      fontFamily: '"Cairo", sans-serif', 
                      borderRadius: '12px', 
                      px: 3, 
                      py: 1.5, 
                      width: '100%',
                      '&:hover': { bgcolor: '#15803d' },
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
                    }}
                  >
                    تصدير ومزامنة لـ Google Drive السحابي
                  </Button>"""
content = content.replace(target_card2, replacement_card2)

# Fix Card 3 button
target_card3 = """                <Button
                  variant="contained"
                  onClick={() => {
                    setResetConfirmText('');
                    setResetDialogOpen(true);
                  }}
                  startIcon={<DeleteForeverIcon sx={{ ml: 1, mr: -0.5 }} />}
                  sx={{ 
                    bgcolor: '#dc2626', 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontFamily: '"Cairo", sans-serif', 
                    borderRadius: '12px', 
                    alignSelf: { xs: 'stretch', md: 'center' },
                    px: 4, 
                    py: 1.5, 
                    '&:hover': { bgcolor: '#b91c1c' },
                    boxShadow: '0 6px 16px rgba(220, 38, 38, 0.2)'
                  }}
                >
                  بدء إجراء إعادة الضبط الشامل
                </Button>"""

replacement_card3 = """                <Button
                  variant="contained"
                  onClick={() => {
                    setResetConfirmText('');
                    setResetDialogOpen(true);
                  }}
                  startIcon={<DeleteForeverIcon sx={{ ml: 1, mr: -0.5 }} />}
                  sx={{ 
                    bgcolor: '#dc2626', 
                    fontWeight: 'bold', 
                    color: 'white',
                    fontFamily: '"Cairo", sans-serif', 
                    borderRadius: '12px', 
                    width: '100%',
                    px: 4, 
                    py: 1.5, 
                    '&:hover': { bgcolor: '#b91c1c' },
                    boxShadow: '0 6px 16px rgba(220, 38, 38, 0.2)'
                  }}
                >
                  بدء إجراء إعادة الضبط الشامل
                </Button>"""
content = content.replace(target_card3, replacement_card3)

with open('src/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
