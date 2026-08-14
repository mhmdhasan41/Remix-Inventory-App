import re

with open('src/pages/Reports.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the button and upload logic
start_str = "                            {setupCategories.length > 0 ? ("
end_str = "          </Box>\n        </Paper>\n      )}"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx == -1 or end_idx == -1:
    print(f"Could not find the target section. start_idx={start_idx}, end_idx={end_idx}")
    exit(1)

new_section = """                            {setupCategories.length > 0 ? (
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
                                const targetStorehouses = selectedStorehouse !== 'all' ? [selectedStorehouse] : (settings.storehouses.length > 0 ? settings.storehouses : ['المخزن الرئيسي']);
                                
                                setupCategories.forEach(cat => {
                                   targetStorehouses.forEach(wh => {
                                      currentAttachments[`${wh}_${cat}`] = compressedBase64;
                                   });
                                });
                                
                                const updatedSettings = { ...settings, openingStockAttachments: currentAttachments };
                                
                                const totalSize = JSON.stringify(updatedSettings).length;
                                if (totalSize > 850000) {
                                   setErrorMessage('عذراً! تم الوصول للحد الأقصى للمساحة المسموحة للسندات (1 ميجابايت). يرجى حذف بعض السندات القديمة أولاً.');
                                   return;
                                }
                                dataService.saveSettings(updatedSettings);
                                setSettings(updatedSettings);
                                
                                const allTransactions = dataService.getTransactions();
                                const materialsList = dataService.getMaterials();
                                let txUpdatedCount = 0;
                                const updatedTransactions = allTransactions.map(tx => {
                                   const txSupplier = tx.supplierOrReceiver || '';
                                   const txNotes = tx.notes || '';
                                   const isOpeningStock = txSupplier.includes('افتتاحي') || txSupplier.includes('إفتتاحي') || txSupplier.includes('أولي') || txNotes.includes('افتتاحي') || txNotes.includes('إفتتاحي') || txNotes.includes('تأسيس');
                                   if (isOpeningStock) {
                                       const txStorehouse = tx.storehouse || 'المخزن الرئيسي';
                                       const txCategory = tx.itemCategory || materialsList.find(m => m.id === tx.itemId)?.category || tx.itemType || '';
                                       if (targetStorehouses.includes(txStorehouse) && setupCategories.includes(txCategory)) {
                                           tx.attachment = `opening_ref:${txStorehouse}_${txCategory}`;
                                           txUpdatedCount++;
                                       }
                                   }
                                   return tx;
                                });
                                
                                if (txUpdatedCount > 0) {
                                   localStorage.setItem('remix_transactions_v1', JSON.stringify(updatedTransactions));
                                }
                                
                                setSuccessMessage(`تم رفع السند بنجاح! تم ربط (${txUpdatedCount}) من السندات السابقة المنطبقة. (السندات اللاحقة ستحتاج إرفاقاً يدوياً).`);
                              }
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#64748b', fontFamily: '"Cairo", sans-serif', fontStyle: 'italic' }}>
                  الرجاء اختيار تصنيف لرفع السند الخاص به.
                </Typography>
              )}
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5, color: '#475569', fontFamily: '"Cairo", sans-serif' }}>
            📋 مصفوفة الأرصدة الافتتاحية المعتمدة (المستودعات × الفئات):
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: '"Cairo", sans-serif' }}>التصنيف / الفئة</TableCell>
                  {(settings.storehouses || []).map(wh => (
                     <TableCell key={wh} align="center" sx={{ fontWeight: 'bold', fontFamily: '"Cairo", sans-serif' }}>{wh}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.categories.map(cat => (
                  <TableRow key={cat.name}>
                    <TableCell sx={{ fontFamily: '"Cairo", sans-serif' }}>{cat.name}</TableCell>
                    {(settings.storehouses || []).map(wh => {
                       const key = `${wh}_${cat.name}`;
                       const attachmentData = settings.openingStockAttachments?.[key];
                       return (
                         <TableCell key={wh} align="center">
                           {attachmentData ? (
                             <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <IconButton size="small" onClick={() => {
                                   setViewingAttachment(attachmentData);
                                   setOpenAttachmentDialog(true);
                                }}>
                                  <VisibilityIcon fontSize="small" sx={{ color: '#16a34a' }} />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => {
                                   const currentAttachments = { ...settings.openingStockAttachments };
                                   delete currentAttachments[key];
                                   const updatedSettings = { ...settings, openingStockAttachments: currentAttachments };
                                   dataService.saveSettings(updatedSettings);
                                   setSettings(updatedSettings);
                                   setSuccessMessage('تم حذف سند توثيق الرصيد الافتتاحي بنجاح.');
                                }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                             </Box>
                           ) : (
                             <Typography variant="caption" sx={{ color: '#94a3b8' }}>-</Typography>
                           )}
                         </TableCell>
                       );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
"""

content = content[:start_idx] + new_section + content[end_idx:]

with open('src/pages/Reports.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

