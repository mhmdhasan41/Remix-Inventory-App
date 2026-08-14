import re

with open('src/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Card 5 Section 1 buttons
target_card5_1 = """                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        onClick={handleDownloadItemsTemplate}
                        startIcon={<CloudDownloadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ borderColor: '#007ab7', color: '#007ab7', borderRadius: '10px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(0,122,183,0.05)', borderColor: '#006293' } }}
                      >
                        تنزيل قالب الأصناف
                      </Button>

                      <Button
                        variant="contained"
                        component="label"
                        disabled={isImporting}
                        startIcon={isImporting ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ bgcolor: '#007ab7', borderRadius: '10px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', fontSize: '0.8rem', '&:hover': { bgcolor: '#006293' } }}
                      >"""

replacement_card5_1 = """                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, flexDirection: { xs: 'column', xl: 'row' }, width: '100%' }}>
                      <Button
                        variant="outlined"
                        onClick={handleDownloadItemsTemplate}
                        startIcon={<CloudDownloadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ borderColor: '#007ab7', color: '#007ab7', borderRadius: '12px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', py: 1.5, flex: 1, '&:hover': { bgcolor: 'rgba(0,122,183,0.05)', borderColor: '#006293' } }}
                      >
                        تنزيل قالب الأصناف
                      </Button>

                      <Button
                        variant="contained"
                        component="label"
                        disabled={isImporting}
                        startIcon={isImporting ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ bgcolor: '#007ab7', borderRadius: '12px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', py: 1.5, flex: 1, '&:hover': { bgcolor: '#006293' } }}
                      >"""
content = content.replace(target_card5_1, replacement_card5_1)

# Fix Card 5 Section 2 buttons
target_card5_2 = """                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        onClick={handleDownloadTransactionsTemplate}
                        startIcon={<CloudDownloadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ borderColor: '#16a34a', color: '#16a34a', borderRadius: '10px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(22,163,74,0.05)', borderColor: '#15803d' } }}
                      >
                        تنزيل قالب الحركات
                      </Button>

                      <Button
                        variant="contained"
                        component="label"
                        disabled={isImportingTx}
                        startIcon={isImportingTx ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ bgcolor: '#16a34a', borderRadius: '10px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', fontSize: '0.8rem', '&:hover': { bgcolor: '#15803d' } }}
                      >"""

replacement_card5_2 = """                    <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5, flexDirection: { xs: 'column', xl: 'row' }, width: '100%' }}>
                      <Button
                        variant="outlined"
                        onClick={handleDownloadTransactionsTemplate}
                        startIcon={<CloudDownloadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ borderColor: '#16a34a', color: '#16a34a', borderRadius: '12px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', py: 1.5, flex: 1, '&:hover': { bgcolor: 'rgba(22,163,74,0.05)', borderColor: '#15803d' } }}
                      >
                        تنزيل قالب الحركات
                      </Button>

                      <Button
                        variant="contained"
                        component="label"
                        disabled={isImportingTx}
                        startIcon={isImportingTx ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                        sx={{ bgcolor: '#16a34a', borderRadius: '12px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', py: 1.5, flex: 1, '&:hover': { bgcolor: '#15803d' } }}
                      >"""
content = content.replace(target_card5_2, replacement_card5_2)

with open('src/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
