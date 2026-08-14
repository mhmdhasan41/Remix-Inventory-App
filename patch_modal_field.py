import sys

file_path = "src/components/CreateTransactionModal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target_field = """            {/* Supplier / Receiver */}
            {['وارد', 'صادر'].includes(watchTxType) && (
              <Box className="col-span-1 md:col-span-12">
                <Controller
                  name="supplierOrReceiver"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label={watchTxType === 'وارد' ? 'المورد 👤' : 'الجهة المستلمة 👤'}
                      {...field}
                      value={field.value || ''}
                    >
                      {getPartnerEntityOptions().map(opt => (
                        <MenuItem key={opt} value={opt}>
                          {opt === 'OTHER' ? (watchTxType === 'وارد' ? '➕ مورد آخر...' : '➕ جهة مستلمة أخرى...') : opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                
                {watchSupplier === 'OTHER' && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, p: 2, bgcolor: '#f8fafc', borderRadius: '10px' }}>
                    <TextField
                      fullWidth
                      size="small"
                      label={watchTxType === 'وارد' ? 'اسم المورد الجديد' : 'اسم الجهة المستلمة الجديدة'}
                      value={customPartnerEntityName}
                      onChange={(e) => setCustomPartnerEntityName(e.target.value)}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={savePartnerEntity} onChange={(e) => setSavePartnerEntity(e.target.checked)} />}
                      label="حفظ هذه الجهة في الإعدادات لاستخدامها مستقبلاً"
                    />
                  </Box>
                )}
              </Box>
            )}"""

replacement_field = """            {/* Supplier / Receiver / Consumer */}
            {['وارد', 'صادر', 'مستهلك'].includes(watchTxType) && (
              <Box className="col-span-1 md:col-span-12">
                {watchTxType === 'مستهلك' ? (
                  <Controller
                    name="supplierOrReceiver"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label="جهة الاستهلاك / نص السند"
                        placeholder="استهلاك مخزني داخلي"
                        {...field}
                        value={field.value || ''}
                        error={!!errors.supplierOrReceiver}
                        helperText={errors.supplierOrReceiver?.message}
                      />
                    )}
                  />
                ) : (
                  <>
                    <Controller
                      name="supplierOrReceiver"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          fullWidth
                          label={watchTxType === 'وارد' ? 'المورد 👤' : 'الجهة المستلمة 👤'}
                          {...field}
                          value={field.value || ''}
                          error={!!errors.supplierOrReceiver}
                          helperText={errors.supplierOrReceiver?.message}
                        >
                          {getPartnerEntityOptions().map(opt => (
                            <MenuItem key={opt} value={opt}>
                              {opt === 'OTHER' ? (watchTxType === 'وارد' ? '➕ مورد آخر...' : '➕ جهة مستلمة أخرى...') : opt}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                    
                    {watchSupplier === 'OTHER' && (
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, p: 2, bgcolor: '#f8fafc', borderRadius: '10px' }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={watchTxType === 'وارد' ? 'اسم المورد الجديد' : 'اسم الجهة المستلمة الجديدة'}
                          value={customPartnerEntityName}
                          onChange={(e) => setCustomPartnerEntityName(e.target.value)}
                        />
                        <FormControlLabel
                          control={<Checkbox checked={savePartnerEntity} onChange={(e) => setSavePartnerEntity(e.target.checked)} />}
                          label="حفظ هذه الجهة في الإعدادات لاستخدامها مستقبلاً"
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}"""

if target_field in content:
    content = content.replace(target_field, replacement_field)
    print("field replaced")
else:
    print("field not found")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
