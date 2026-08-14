const fs = require('fs');

let content = fs.readFileSync('src/components/CreateTransactionModal.tsx', 'utf-8');

// 1. Add attachmentSize state
content = content.replace(
  "const [selectedImage, setSelectedImage] = useState<string | null>(null);",
  "const [selectedImage, setSelectedImage] = useState<string | null>(null);\n  const [attachmentSize, setAttachmentSize] = useState<string | null>(null);"
);

// 2. Set attachmentSize and display it
const fileChangeOld = `                          const compressed = await compressImage(file);
                          setSelectedImage(compressed);
                        } catch (err) {`;

const fileChangeNew = `                          const compressed = await compressImage(file);
                          setSelectedImage(compressed);
                          const sizeInKB = ((compressed.length * 3 / 4) / 1024).toFixed(2);
                          setAttachmentSize(sizeInKB + ' KB');
                        } catch (err) {`;
content = content.replace(fileChangeOld, fileChangeNew);

const imgBoxOld = `<Typography variant="body2" sx={{ fontWeight: 'bold', color: '#166534' }}>تم إرفاق صورة السند بنجاح</Typography>`;
const imgBoxNew = `<Typography variant="body2" sx={{ fontWeight: 'bold', color: '#166534' }}>تم إرفاق صورة السند بنجاح {attachmentSize && \`(\${attachmentSize})\`}</Typography>`;
content = content.replace(imgBoxOld, imgBoxNew);


// 3. Auto text for مستهلك
const autoTextOld = `{/* Auto text display for fixed types */}
            {['مستهلك', 'افتتاحي', 'تسوية', 'تحويل'].includes(watchTxType) && (
              <Box className="col-span-1 md:col-span-12">
                <TextField
                  fullWidth
                  disabled
                  label="نص السند التلقائي"
                  value={
                    watchTxType === 'تحويل' 
                     ? \`تحويل من [\${watchStorehouse || '...'}] إلى [\${watchDestStorehouse || '...'}]\`
                    : watchSupplier
                  }
                  sx={{ bgcolor: '#f1f5f9' }}
                />
              </Box>
            )}`;

const autoTextNew = `{/* Auto text display for fixed types */}
            {['مستهلك', 'افتتاحي', 'تسوية', 'تحويل'].includes(watchTxType) && (
              <Box className="col-span-1 md:col-span-12">
                {watchTxType === 'مستهلك' ? (
                  <TextField
                    fullWidth
                    label="جهة الاستهلاك / نص السند"
                    {...register('supplierOrReceiver')}
                    error={!!errors.supplierOrReceiver}
                    helperText={errors.supplierOrReceiver?.message}
                  />
                ) : (
                  <TextField
                    fullWidth
                    disabled
                    label="نص السند التلقائي"
                    value={
                      watchTxType === 'تحويل' 
                       ? \`تحويل من [\${watchStorehouse || '...'}] إلى [\${watchDestStorehouse || '...'}]\`
                      : watchSupplier
                    }
                    sx={{ bgcolor: '#f1f5f9' }}
                  />
                )}
              </Box>
            )}`;
content = content.replace(autoTextOld, autoTextNew);


// 4. Simulation Table row for all storehouses
const simTableOld = `                      {watchTxType === 'تحويل' && watchDestStorehouse && (
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px' }}>{watchDestStorehouse}</td>
                          <td style={{ padding: '8px' }}>{dataService.getItemStockByStorehouse(watchItem.id, watchDestStorehouse)} {liveStockSim.unit}</td>
                          <td style={{ padding: '8px', color: '#10b981' }}>+{watchQty || 0}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>
                            {dataService.getItemStockByStorehouse(watchItem.id, watchDestStorehouse) + (Number(watchQty) || 0)} {liveStockSim.unit}
                          </td>
                        </tr>
                      )}
                    </tbody>`;

const simTableNew = `                      {watchTxType === 'تحويل' && watchDestStorehouse && (
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px' }}>{watchDestStorehouse}</td>
                          <td style={{ padding: '8px' }}>{dataService.getItemStockByStorehouse(watchItem.id, watchDestStorehouse)} {liveStockSim.unit}</td>
                          <td style={{ padding: '8px', color: '#10b981' }}>+{watchQty || 0}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>
                            {dataService.getItemStockByStorehouse(watchItem.id, watchDestStorehouse) + (Number(watchQty) || 0)} {liveStockSim.unit}
                          </td>
                        </tr>
                      )}
                      {globalStorehouseScope === 'all' && liveStockSim.globalStock !== null && liveStockSim.simulatedGlobalAfter !== null && (
                        <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0f9ff', fontWeight: 'bold' }}>
                          <td style={{ padding: '8px' }}>جميع المستودعات (الإجمالي)</td>
                          <td style={{ padding: '8px' }}>{liveStockSim.globalStock} {liveStockSim.unit}</td>
                          <td style={{ padding: '8px', color: (watchTxType === 'صادر' || watchTxType === 'مستهلك' || (watchTxType==='تسوية'&&watchQty<0)) ? '#ef4444' : (watchTxType === 'تحويل' ? 'inherit' : '#10b981') }}>
                            {watchTxType === 'تحويل' ? '0' : ((watchTxType === 'صادر' || watchTxType === 'مستهلك' || (watchTxType==='تسوية'&&watchQty<0)) ? '-' : '+') + (watchQty || 0)}
                          </td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>
                            {liveStockSim.simulatedGlobalAfter} {liveStockSim.unit}
                          </td>
                        </tr>
                      )}
                    </tbody>`;
content = content.replace(simTableOld, simTableNew);


// Save
fs.writeFileSync('src/components/CreateTransactionModal.tsx', content);
console.log("Done");
