const fs = require('fs');
let content = fs.readFileSync('src/pages/Reports.tsx', 'utf8');
content = content.replace(/\{setupCategory \? \(\n[\s\S]*?الرجاء اختيار تصنيف لرفع السند الخاص به\.\n\s*<\/Typography>\n\s*\)\}/, 
`              {setupCategories.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: '100%' }}>
                    <Button
                      component="label"
                      variant="contained"
                      size="small"
                      startIcon={<CloudUploadIcon sx={{ ml: 1, mr: -0.5 }} />}
                      sx={{ bgcolor: '#007ab7', color: 'white', fontWeight: 'bold', borderRadius: '10px', px: 3, py: 1, '&:hover': { bgcolor: '#006293' }, fontFamily: '"Cairo", sans-serif' }}
                    >
                      رفع سند موحد لـ ({setupCategories.length}) تصنيفات
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (file.size > 2 * 1024 * 1024) {
                            setErrorMessage('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              let width = img.width;
                              let height = img.height;
                              const MAX_SIZE = 800; // max width/height
                              if (width > height) {
                                if (width > MAX_SIZE) {
                                  height *= MAX_SIZE / width;
                                  width = MAX_SIZE;
                                }
                              } else {
                                if (height > MAX_SIZE) {
                                  width *= MAX_SIZE / height;
                                  height = MAX_SIZE;
                                }
                              }
                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              if (ctx) {
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, width, height);
                                ctx.drawImage(img, 0, 0, width, height);
                                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
                                
                                const currentAttachments = settings.openingStockAttachments ? { ...settings.openingStockAttachments } : {};
                                setupCategories.forEach(cat => {
                                   currentAttachments[cat] = compressedBase64;
                                });
                                const updatedSettings = { ...settings, openingStockAttachments: currentAttachments };
                                
                                const totalSize = JSON.stringify(updatedSettings).length;
                                if (totalSize > 850000) {
                                   setErrorMessage('عذراً! تم الوصول للحد الأقصى للمساحة المسموحة للسندات (1 ميجابايت). يرجى حذف بعض السندات القديمة أولاً.');
                                   return;
                                }
                                dataService.saveSettings(updatedSettings);
                                setSettings(updatedSettings);
                                setSuccessMessage('تم رفع وحفظ سند توثيق الرصيد الافتتاحي لـ (' + setupCategories.length + ') تصنيفات بنجاح! تم ربطه بجميع حركاته تلقائياً.');
                              }
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {setupCategories.map(cat => {
                      const currentAttachment = settings.openingStockAttachments?.[cat];
                      if (!currentAttachment) return null;
                      return (
                        <Box key={cat} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f1f5f9', p: 1, borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <Chip label={cat} size="small" color="success" />
                          <IconButton size="small" onClick={() => {
                            setViewingAttachment(currentAttachment || null);
                            setOpenAttachmentDialog(true);
                          }}>
                            <VisibilityIcon fontSize="small" sx={{ color: '#0284c7' }} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => {
                            const currentAttachments = settings.openingStockAttachments ? { ...settings.openingStockAttachments } : {};
                            delete currentAttachments[cat];
                            const updatedSettings = { ...settings, openingStockAttachments: currentAttachments };
                            dataService.saveSettings(updatedSettings);
                            setSettings(updatedSettings);
                            setSuccessMessage('تم حذف سند توثيق الرصيد الافتتاحي لتصنيف (' + cat + ') بنجاح.');
                          }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b', fontFamily: '"Cairo", sans-serif', fontStyle: 'italic' }}>
                  الرجاء اختيار تصنيف لرفع السند الخاص به.
                </Typography>
              )}`);
fs.writeFileSync('src/pages/Reports.tsx', content);
