# Input Fields Report

### /components/CreateTransactionModal.tsx (Line 427)
- **Label**: نوع الحركة المخزنية
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            
            {/* Transaction Type */}
            <Box className="col-span-1 md:col-span-4">
              <TextField
                select
                fullWidth
                label="نوع الحركة المخزنية"
                {...register('transactionType')}
                value={watchTxType || ''}
              >
```

### /components/CreateTransactionModal.tsx (Line 444)
- **Label**: تاريخ تسجيل الحركة
- **Name**: Unknown Name
- **Type**: date
- **Controlled**: No
```tsx
            </Box>

            <Box className="col-span-1 md:col-span-4">
              <TextField
                fullWidth
                type="date"
                label="تاريخ تسجيل الحركة"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('date')}
                error={!!errors.date}
```

### /components/CreateTransactionModal.tsx (Line 472)
- **Label**: اختر الصنف المخزني 📦
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: No
```tsx
                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="اختر الصنف المخزني 📦"
                        error={!!errors.itemSelection}
                        helperText={errors.itemSelection ? errors.itemSelection.message : 'البحث بالكود أو الاسم'}
                      />
                    )}
```

### /components/CreateTransactionModal.tsx (Line 557)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

            {/* Storehouses */}
            <Box className="col-span-1 md:col-span-4">
              <TextField
                select
                fullWidth
                label={watchTxType === 'تحويل' ? "المستودع المصدر 🏢" : "المستودع 🏢"}
                {...register('storehouse')}
                value={watchStorehouse || ''}
                error={!!errors.storehouse}
```

### /components/CreateTransactionModal.tsx (Line 574)
- **Label**: المستودع المستهدف 🏢
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

            {watchTxType === 'تحويل' && (
              <Box className="col-span-1 md:col-span-4">
                <TextField
                  select
                  fullWidth
                  label="المستودع المستهدف 🏢"
                  {...register('destStorehouse')}
                  value={watchDestStorehouse || ''}
                  error={!!errors.destStorehouse}
```

### /components/CreateTransactionModal.tsx (Line 591)
- **Label**: الكمية
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: No
```tsx
            )}

            <Box className="col-span-1 md:col-span-4">
              <TextField
                fullWidth
                type="number"
                label="الكمية"
                {...register('quantity', { valueAsNumber: true })}
                error={!!errors.quantity}
                helperText={errors.quantity?.message}
```

### /components/CreateTransactionModal.tsx (Line 611)
- **Label**: جهة الاستهلاك / نص السند
- **Name**: supplierOrReceiver
- **Type**: text
- **Controlled**: Yes
```tsx
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
```

### /components/CreateTransactionModal.tsx (Line 628)
- **Label**: Unknown Label
- **Name**: supplierOrReceiver
- **Type**: text
- **Controlled**: Yes
```tsx
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
```

### /components/CreateTransactionModal.tsx (Line 648)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
                    
                    {watchSupplier === 'OTHER' && (
                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1, p: 2, bgcolor: '#f8fafc', borderRadius: '10px' }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={watchTxType === 'وارد' ? 'اسم المورد الجديد' : 'اسم الجهة المستلمة الجديدة'}
                          value={customPartnerEntityName}
                          onChange={(e) => setCustomPartnerEntityName(e.target.value)}
                        />
```

### /components/CreateTransactionModal.tsx (Line 669)
- **Label**: نص السند التلقائي
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            {/* Auto text display for fixed types */}
            {['افتتاحي', 'تسوية', 'تحويل'].includes(watchTxType) && (
              <Box className="col-span-1 md:col-span-12">
                <TextField
                  fullWidth
                  disabled
                  label="نص السند التلقائي"
                  value={
                    watchTxType === 'تحويل' 
                    ? `تحويل من [${watchStorehouse || '...'}] إلى [${watchDestStorehouse || '...'}]`
```

### /components/CreateTransactionModal.tsx (Line 684)
- **Label**: ملاحظات تفصيلية (اختياري)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: No
```tsx
            )}

            <Box className="col-span-1 md:col-span-12">
              <TextField
                fullWidth
                multiline
                rows={2}
                label="ملاحظات تفصيلية (اختياري)"
                {...register('notes')}
              />
```

### /components/CreateTransactionModal.tsx (Line 704)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: file
- **Controlled**: No
```tsx
                  sx={{ border: '2px dashed #cbd5e1', borderRadius: '10px', p: 3, textAlign: 'center', bgcolor: '#f8fafc', cursor: 'pointer', '&:hover': { borderColor: '#0284c7', bgcolor: '#f0f9ff' } }}
                  onClick={() => document.getElementById('receipt-image-upload')?.click()}
                >
                  <input
                    type="file"
                    id="receipt-image-upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
```

### /components/MaterialFormDialog.tsx (Line 259)
- **Label**: تصنيف الصنف
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
        <DialogContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="تصنيف الصنف"
                {...register('category')}
                value={watchCategory || ''}
                error={!!errors.category}
```

### /components/MaterialFormDialog.tsx (Line 275)
- **Label**: كود الصنف الآلي (توليد تلقائي حسب التصنيف)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: No
```tsx
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="كود الصنف الآلي (توليد تلقائي حسب التصنيف)"
                {...register('code')}
                slotProps={{ input: { readOnly: true } }}
                sx={{ 
                  bgcolor: '#f8fafc',
```

### /components/MaterialFormDialog.tsx (Line 294)
- **Label**: اسم الصنف بالكامل
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: No
```tsx
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="اسم الصنف بالكامل"
                placeholder="مثال: دلتامثرين 2.5% مستحلب مركز"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
```

### /components/MaterialFormDialog.tsx (Line 304)
- **Label**: الرصيد الإبتدائي الافتتاحي بالمستودع
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: No
```tsx
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="الرصيد الإبتدائي الافتتاحي بالمستودع"
                placeholder="مثال: 100"
                disabled={!!selectedMaterial}
                {...register('initialStock')}
```

### /components/MaterialFormDialog.tsx (Line 317)
- **Label**: حد الأمان الأدنى
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: No
```tsx
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="حد الأمان الأدنى"
                placeholder="مثال: 10"
                {...register('minimumStock', { valueAsNumber: true })}
                error={!!errors.minimumStock}
```

### /components/MaterialFormDialog.tsx (Line 328)
- **Label**: وحدة القياس
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label="وحدة القياس"
                {...register('unit')}
                value={watch('unit') || ''}
                error={!!errors.unit}
```

### /components/MaterialFormDialog.tsx (Line 359)
- **Label**: مستودع وموقع التخزين الرئيسي
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              </Grid>
            )}
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="مستودع وموقع التخزين الرئيسي"
                {...register('storageLocation')}
                value={watch('storageLocation') || ''}
                error={!!errors.storageLocation}
```

### /components/MaterialFormDialog.tsx (Line 378)
- **Label**: تاريخ الإنتاج
- **Name**: Unknown Name
- **Type**: date
- **Controlled**: No
```tsx
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#64748b', mb: 1, mt: 1 }}>بيانات الجودة والسلامة (اختياري)</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="تاريخ الإنتاج"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('productionDate')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
```

### /components/MaterialFormDialog.tsx (Line 388)
- **Label**: تاريخ الإنتهاء
- **Name**: Unknown Name
- **Type**: date
- **Controlled**: No
```tsx
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="تاريخ الإنتهاء"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('expiryDate')}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
```

### /components/MaterialFormDialog.tsx (Line 398)
- **Label**: الشركة الصانعة / المورد
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="الشركة الصانعة / المورد"
                {...register('manufacturer')}
                value={watchManufacturer || 'جهة غير محددة'}
                onChange={(e) => {
```

### /components/MaterialFormDialog.tsx (Line 425)
- **Label**: اسم المورد الجديد
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

              {watchManufacturer === 'new_supplier...' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <TextField
                    fullWidth
                    label="اسم المورد الجديد"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    size="small"
                  />
```

### /components/MaterialFormDialog.tsx (Line 433)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: checkbox
- **Controlled**: No
```tsx
                    size="small"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <input 
                      type="checkbox" 
                      id="saveSupplier"
                      checked={saveNewSupplier}
                      onChange={(e) => setSaveNewSupplier(e.target.checked)}
                      style={{ marginLeft: '8px' }}
                    />
```

### /components/MaterialFormDialog.tsx (Line 446)
- **Label**: درجة الخطورة
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="درجة الخطورة"
                {...register('hazardLevel')}
                value={watch('hazardLevel') || ''}
                defaultValue=""
```

### /components/MaterialFormDialog.tsx (Line 474)
- **Label**: ملاحظات تفصيلية بطاقة صنف
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: No
```tsx
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="ملاحظات تفصيلية بطاقة صنف"
                placeholder="اكتب أي مواصفات فنية إضافية، تعليمات سلامة مخزنية، أو ملاحظات أخرى..."
                {...register('notes')}
```

### /components/Login.tsx (Line 192)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              >
                البريد الإلكتروني
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                id="username-field"
                placeholder="مثال: name@domain.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
```

### /components/Login.tsx (Line 234)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              >
                كلمة المرور
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                id="password-field"
                type={showPassword ? 'text' : 'password'}
                placeholder="أدخل كلمة المرور"
                value={password}
```

### /pages/Materials.tsx (Line 819)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              placeholder="ابحث بالاسم، الكود (بما فيه أرقام فقط)..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
```

### /pages/Materials.tsx (Line 834)
- **Label**: التصنيف
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="التصنيف"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
```

### /pages/Materials.tsx (Line 850)
- **Label**: حالة المخزن
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="حالة المخزن"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
```

### /pages/Materials.tsx (Line 1230)
- **Label**: تصنيف الصنف
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            <Grid container spacing={3}>
              {/* 1. Category select */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="تصنيف الصنف"
                  {...register('category')}
                  value={watchCategory || ''}
                  error={!!errors.category}
```

### /pages/Materials.tsx (Line 1248)
- **Label**: كود الصنف الآلي (توليد تلقائي حسب التصنيف)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: No
```tsx

              {/* 2. Readonly Autogenerated Code */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="كود الصنف الآلي (توليد تلقائي حسب التصنيف)"
                  {...register('code')}
                  slotProps={{ input: { readOnly: true } }}
                  sx={{ 
                    bgcolor: '#f8fafc',
```

### /pages/Materials.tsx (Line 1269)
- **Label**: اسم الصنف بالكامل
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: No
```tsx

              {/* 3. Name */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="اسم الصنف بالكامل"
                  placeholder="مثال: دلتامثرين 2.5% مستحلب مركز"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
```

### /pages/Materials.tsx (Line 1281)
- **Label**: الرصيد الإبتدائي الافتتاحي بالمستودع
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: No
```tsx

              {/* 4. Initial Stock */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="الرصيد الإبتدائي الافتتاحي بالمستودع"
                  placeholder="مثال: 100"
                  disabled={!!selectedMaterial}
                  {...register('initialStock')}
```

### /pages/Materials.tsx (Line 1311)
- **Label**: حد الأمان الأدنى
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: No
```tsx

              {/* 5. Minimum Stock */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="حد الأمان الأدنى"
                  placeholder="مثال: 10"
                  {...register('minimumStock', { valueAsNumber: true })}
                  error={!!errors.minimumStock}
```

### /pages/Materials.tsx (Line 1324)
- **Label**: وحدة القياس
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

              {/* 5.1 Unit Of Measurement */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="وحدة القياس"
                  {...register('unit')}
                  value={watch('unit') || ''}
                  error={!!errors.unit}
```

### /pages/Materials.tsx (Line 1342)
- **Label**: مستودع وموقع التخزين الرئيسي
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

              {/* 6. Storage Location / Warehouse */}
              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  label="مستودع وموقع التخزين الرئيسي"
                  {...register('storageLocation')}
                  value={watch('storageLocation') || ''}
                  error={!!errors.storageLocation}
```

### /pages/Materials.tsx (Line 1364)
- **Label**: تاريخ الإنتاج
- **Name**: Unknown Name
- **Type**: date
- **Controlled**: No
```tsx
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="تاريخ الإنتاج"
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('productionDate')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
```

### /pages/Materials.tsx (Line 1375)
- **Label**: تاريخ الإنتهاء
- **Name**: Unknown Name
- **Type**: date
- **Controlled**: No
```tsx
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="تاريخ الإنتهاء"
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('expiryDate')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
```

### /pages/Materials.tsx (Line 1386)
- **Label**: الشركة الصانعة / المورد
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="الشركة الصانعة / المورد"
                  {...register('manufacturer')}
                  value={watchManufacturer || 'جهة غير محددة'}
                  onChange={(e) => {
```

### /pages/Materials.tsx (Line 1415)
- **Label**: اسم المورد الجديد
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

                {watchManufacturer === 'new_supplier...' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <TextField
                      fullWidth
                      label="اسم المورد الجديد"
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      size="small"
                    />
```

### /pages/Materials.tsx (Line 1423)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: checkbox
- **Controlled**: No
```tsx
                      size="small"
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <input 
                        type="checkbox" 
                        id="saveSupplier"
                        checked={saveNewSupplier}
                        onChange={(e) => setSaveNewSupplier(e.target.checked)}
                        style={{ marginLeft: '8px' }}
                      />
```

### /pages/Materials.tsx (Line 1437)
- **Label**: درجة الخطورة
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="درجة الخطورة"
                  {...register('hazardLevel')}
                  value={watch('hazardLevel') || ''}
                  defaultValue=""
```

### /pages/Materials.tsx (Line 1467)
- **Label**: ملاحظات تفصيلية بطاقة صنف
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: No
```tsx

              {/* 7. Notes */}
              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="ملاحظات تفصيلية بطاقة صنف"
                  placeholder="اكتب أي مواصفات فنية إضافية، تعليمات سلامة مخزنية، أو ملاحظات أخرى..."
                  {...register('notes')}
```

### /pages/Materials.tsx (Line 1724)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: Yes
```tsx
                        {systemStock} {row.unit}
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={physicalVal}
                          onChange={(e) => handlePhysicalCountChange(row.rowKey, e.target.value)}
                          slotProps={{
```

### /pages/Materials.tsx (Line 1754)
- **Label**: ملاحظات عامة حول محضر الجرد السنوي والتسوية
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            </Table>
          </TableContainer>

          <TextField
            fullWidth
            label="ملاحظات عامة حول محضر الجرد السنوي والتسوية"
            multiline
            rows={2}
            value={stocktakeNotes}
            onChange={(e) => setStocktakeNotes(e.target.value)}
```

### /pages/Reports.tsx (Line 889)
- **Label**: تحديد نوع التقرير الفني المراد توليده
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
          
          {/* Main selection of report type */}
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="تحديد نوع التقرير الفني المراد توليده"
              value={reportType}
              onChange={(e) => {
```

### /pages/Reports.tsx (Line 934)
- **Label**: تصفية حسب الفئة / التصنيف
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

          {/* Advanced Multi-Filters Block */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="تصفية حسب الفئة / التصنيف"
              value={categoryFilter}
              onChange={(e) => {
```

### /pages/Reports.tsx (Line 954)
- **Label**: بحث وتحديد صنف معين
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="بحث وتحديد صنف معين"
              value={itemIdFilter}
              onChange={(e) => {
```

### /pages/Reports.tsx (Line 1000)
- **Label**: نوع الحركة (لتقرير العمليات)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx


          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="نوع الحركة (لتقرير العمليات)"
              value={transactionTypeFilter}
              onChange={(e) => {
```

### /pages/Reports.tsx (Line 1025)
- **Label**: من تاريخ الحركة / التلقيم
- **Name**: Unknown Name
- **Type**: date
- **Controlled**: Yes
```tsx

          {/* Date range filters & Partner Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              size="small"
              label="من تاريخ الحركة / التلقيم"
              slotProps={{ inputLabel: { shrink: true } }}
              value={dateFrom}
```

### /pages/Reports.tsx (Line 1041)
- **Label**: إلى تاريخ الحركة / التلقيم
- **Name**: Unknown Name
- **Type**: date
- **Controlled**: Yes
```tsx
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              size="small"
              label="إلى تاريخ الحركة / التلقيم"
              slotProps={{ inputLabel: { shrink: true } }}
              value={dateTo}
```

### /pages/Reports.tsx (Line 1057)
- **Label**: الجهة أو الشريك
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="الجهة أو الشريك"
              value={partnerFilter}
              onChange={(e) => {
```

### /pages/Reports.tsx (Line 1136)
- **Label**: اختر التصنيف / الفئة لربط السند الموقع
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="اختر التصنيف / الفئة لربط السند الموقع"
                value={setupCategories}
                onChange={(e) => setSetupCategories(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as unknown as string[]))}
```

### /pages/Reports.tsx (Line 1166)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: file
- **Controlled**: No
```tsx
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
```

### /pages/Transactions.tsx (Line 570)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
        <Box className="grid grid-cols-1 sm:grid-cols-12 md:grid-cols-12 gap-4 items-center">
          {/* Row 1 */}
          <Box className="col-span-1 sm:col-span-6 md:col-span-4">
            <TextField
              fullWidth
              placeholder="البحث بالصنف، الكود، المستلم/المورد..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
```

### /pages/Transactions.tsx (Line 585)
- **Label**: الحركة
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            />
          </Box>
          <Box className="col-span-1 sm:col-span-6 md:col-span-4">
            <TextField
              select
              fullWidth
              size="small"
              label="الحركة"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
```

### /pages/Transactions.tsx (Line 604)
- **Label**: تصفية بالتصنيف
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            </TextField>
          </Box>
          <Box className="col-span-1 sm:col-span-12 md:col-span-4">
            <TextField
              select
              fullWidth
              size="small"
              label="تصفية بالتصنيف"
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value)}
```

### /pages/Transactions.tsx (Line 622)
- **Label**: النطاقات الزمنية الذكية
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

          {/* Row 2 */}
          <Box className="col-span-1 sm:col-span-6 md:col-span-3">
            <TextField
              select
              fullWidth
              size="small"
              label="النطاقات الزمنية الذكية"
              value={smartDateRange}
              onChange={(e) => handleSmartDateChange(e.target.value)}
```

### /pages/Transactions.tsx (Line 641)
- **Label**: من تاريخ
- **Name**: Unknown Name
- **Type**: date
- **Controlled**: Yes
```tsx
            </TextField>
          </Box>
          <Box className="col-span-1 sm:col-span-3 md:col-span-2">
            <TextField
              fullWidth
              type="date"
              size="small"
              label="من تاريخ"
              slotProps={{ inputLabel: { shrink: true } }}
              value={dateFrom}
```

### /pages/Transactions.tsx (Line 653)
- **Label**: إلى تاريخ
- **Name**: Unknown Name
- **Type**: date
- **Controlled**: Yes
```tsx
            />
          </Box>
          <Box className="col-span-1 sm:col-span-3 md:col-span-2">
            <TextField
              fullWidth
              type="date"
              size="small"
              label="إلى تاريخ"
              slotProps={{ inputLabel: { shrink: true } }}
              value={dateTo}
```

### /pages/Transactions.tsx (Line 665)
- **Label**: حالة المرفقات
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            />
          </Box>
          <Box className="col-span-1 sm:col-span-6 md:col-span-2">
            <TextField
              select
              fullWidth
              size="small"
              label="حالة المرفقات"
              value={attachmentFilter}
              onChange={(e) => setAttachmentFilter(e.target.value)}
```

### /pages/Transactions.tsx (Line 680)
- **Label**: الموظف المنفذ
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            </TextField>
          </Box>
          <Box className="col-span-1 sm:col-span-6 md:col-span-3">
            <TextField
              select
              fullWidth
              size="small"
              label="الموظف المنفذ"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
```

### /pages/AuditLogs.tsx (Line 85)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              placeholder="البحث بالإجراء، تفاصيل المشهد، هوية الموظف المسؤول..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
```

### /pages/AuditLogs.tsx (Line 100)
- **Label**: تصفية نوع الحدث
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="تصفية نوع الحدث"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
```

### /pages/Settings.tsx (Line 1296)
- **Label**: عنوان رئيسي (المؤسسة / الإدارة العليا)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              </Box>
              <form onSubmit={handleSaveGeneral}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="عنوان رئيسي (المؤسسة / الإدارة العليا)"
                    placeholder="مثال: جهود خدمات المستودعات"
                    value={settings.organizationName}
                    onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                    helperText="العنوان الأول الرئيسي الذي يظهر في أعلى تقارير الجرد والحركات"
```

### /pages/Settings.tsx (Line 1309)
- **Label**: عنوان فرعي (القسم / الدائرة التشغيلية)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    label="عنوان فرعي (القسم / الدائرة التشغيلية)"
                    placeholder="مثال: قسم إصحاح ومكافحة الملاريا"
                    value={settings.departmentName}
                    onChange={(e) => setSettings({ ...settings, departmentName: e.target.value })}
                    helperText="العنوان الثاني الذي يظهر مباشرة تحت العنوان الأول في الترويسات"
```

### /pages/Settings.tsx (Line 1322)
- **Label**: عتبة التنبيه لانتهاء صلاحية الأصناف والمواد (بالأيام)
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: Yes
```tsx
                    }}
                  />

                  <TextField
                    fullWidth
                    type="number"
                    label="عتبة التنبيه لانتهاء صلاحية الأصناف والمواد (بالأيام)"
                    placeholder="مثال: 90 يوماً"
                    value={settings.expiryWarningThresholdDays}
                    onChange={(e) => setSettings({ ...settings, expiryWarningThresholdDays: parseInt(e.target.value, 10) || 90 })}
```

### /pages/Settings.tsx (Line 1343)
- **Label**: اسم وتوقيع أمين المخزن
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 1.5 }}>
                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc' }}>
                      <TextField
                        fullWidth
                        label="اسم وتوقيع أمين المخزن"
                        placeholder="مثال: م. فلان الفلاني"
                        value={settings.storekeeperName || ''}
                        onChange={(e) => setSettings({ ...settings, storekeeperName: e.target.value })}
                        slotProps={{
```

### /pages/Settings.tsx (Line 1372)
- **Label**: اسم وتوقيع مدير النظام
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
                    </Box>

                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc' }}>
                      <TextField
                        fullWidth
                        label="اسم وتوقيع مدير النظام"
                        placeholder="مثال: م. فلان الفلاني"
                        value={settings.systemManagerName || ''}
                        onChange={(e) => setSettings({ ...settings, systemManagerName: e.target.value })}
                        slotProps={{
```

### /pages/Settings.tsx (Line 1401)
- **Label**: اسم وتوقيع مدير صحة البيئة
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
                    </Box>

                    <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#f8fafc' }}>
                      <TextField
                        fullWidth
                        label="اسم وتوقيع مدير صحة البيئة"
                        placeholder="مثال: د. فلان الفلاني"
                        value={settings.healthDirectorName || ''}
                        onChange={(e) => setSettings({ ...settings, healthDirectorName: e.target.value })}
                        slotProps={{
```

### /pages/Settings.tsx (Line 1469)
- **Label**: اسم التصنيف
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="اسم التصنيف"
                      placeholder="مثال: مبيدات حشرية"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
```

### /pages/Settings.tsx (Line 1480)
- **Label**: رمز البادئة الكودية
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="رمز البادئة الكودية"
                      placeholder="مثال: MAT أو PES"
                      value={catPrefix}
                      onChange={(e) => setCatPrefix(e.target.value)}
```

### /pages/Settings.tsx (Line 1491)
- **Label**: بداية التسلسل الرقمي
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: Yes
```tsx
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="بداية التسلسل الرقمي"
                      placeholder="1000"
                      value={catStart}
```

### /pages/Settings.tsx (Line 1503)
- **Label**: نهاية التسلسل الرقمي
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: Yes
```tsx
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="نهاية التسلسل الرقمي"
                      placeholder="2000"
                      value={catEnd}
```

### /pages/Settings.tsx (Line 1584)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="مثال: مخزن خان يونس المركزي..."
                  value={newStorehouse}
                  onChange={(e) => setNewStorehouse(e.target.value)}
                />
```

### /pages/Settings.tsx (Line 1645)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="أضف وحدة قياس: كجم، كرتونة، برميل..."
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                />
```

### /pages/Settings.tsx (Line 1726)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx

          {/* Search bar */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', direction: 'rtl' }}>
            <TextField
              placeholder="ابحث باسم الشريك أو رقم الهاتف..."
              variant="outlined"
              size="small"
              value={partnerSearchQuery}
              onChange={(e) => setPartnerSearchQuery(e.target.value)}
              sx={{
```

### /pages/Settings.tsx (Line 1971)
- **Label**: الاسم الرباعي للموظف
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
              <form onSubmit={handleSaveUser}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="الاسم الرباعي للموظف"
                      placeholder="أدخل اسم الموظف بالكامل"
                      value={userFullName}
                      onChange={(e) => setUserFullName(e.target.value)}
                      required
```

### /pages/Settings.tsx (Line 1982)
- **Label**: البريد الإلكتروني (لتسجيل الدخول)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="البريد الإلكتروني (لتسجيل الدخول)"
                      placeholder="مثال: name@domain.com"
                      value={userUsername}
                      onChange={(e) => setUserUsername(e.target.value)}
                      required
```

### /pages/Settings.tsx (Line 2020)
- **Label**: كلمة مرور الحساب (Password)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="كلمة مرور الحساب (Password)"
                      placeholder="تعيين كلمة مرور مميزة"
                      type="text"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
```

### /pages/Settings.tsx (Line 2203)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: file
- **Controlled**: No
```tsx
                    }}
                  >
                    رفع واستعادة نسخة سابقة
                    <input
                      type="file"
                      accept=".json"
                      hidden
                      onChange={handleImportBackup}
                    />
                  </Button>
```

### /pages/Settings.tsx (Line 2313)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: file
- **Controlled**: No
```tsx
                        sx={{ bgcolor: '#007ab7', borderRadius: '10px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', fontSize: '0.8rem', '&:hover': { bgcolor: '#006293' } }}
                      >
                        {isImporting ? 'جاري الاستيراد...' : 'رفع واستيراد الأصناف (.xlsx)'}
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          hidden
                          onChange={handleImportItemsCSV}
                        />
                      </Button>
```

### /pages/Settings.tsx (Line 2352)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: file
- **Controlled**: No
```tsx
                        sx={{ bgcolor: '#16a34a', borderRadius: '10px', fontWeight: 'bold', fontFamily: '"Cairo", sans-serif', fontSize: '0.8rem', '&:hover': { bgcolor: '#15803d' } }}
                      >
                        {isImportingTx ? 'جاري الاستيراد...' : 'رفع واستيراد الحركات (.xlsx)'}
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          hidden
                          onChange={handleImportTransactionsCSV}
                        />
                      </Button>
```

### /pages/Settings.tsx (Line 2559)
- **Label**: Unknown Label
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#334155', fontFamily: '"Cairo", sans-serif' }}>
              الرجاء كتابة كلمة <span style={{ color: '#dc2626', fontWeight: 'bold' }}>"تاكيد"</span> في الحقل أدناه لإكمال الإجراء:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="اكتب تاكيد هنا"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
```

### /pages/Settings.tsx (Line 2669)
- **Label**: اسم الشريك / الجهة
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
          {partnerEditMode ? '📝 تعديل بيانات الشريك' : '➕ إضافة شريك جديد (مورد / جهة)'}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'right', pt: 1 }}>
          <TextField
            fullWidth
            label="اسم الشريك / الجهة"
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            margin="dense"
            sx={{ mb: 2.5, '& input': { fontFamily: '"Cairo", sans-serif' }, '& label': { fontFamily: '"Cairo", sans-serif' } }}
```

### /pages/Settings.tsx (Line 2709)
- **Label**: رقم الهاتف (اختياري)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            </Grid>
          </Box>

          <TextField
            fullWidth
            label="رقم الهاتف (اختياري)"
            value={partnerPhone}
            onChange={(e) => setPartnerPhone(e.target.value)}
            margin="dense"
            sx={{ mb: 2.5, '& input': { fontFamily: '"Cairo", sans-serif' }, '& label': { fontFamily: '"Cairo", sans-serif' } }}
```

### /pages/Settings.tsx (Line 2718)
- **Label**: ملاحظات تفصيلية (اختياري)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
            sx={{ mb: 2.5, '& input': { fontFamily: '"Cairo", sans-serif' }, '& label': { fontFamily: '"Cairo", sans-serif' } }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="ملاحظات تفصيلية (اختياري)"
            value={partnerNotes}
            onChange={(e) => setPartnerNotes(e.target.value)}
```

### /pages/Settings.tsx (Line 2813)
- **Label**: الاسم
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
          {editDialog.type === 'category' ? 'تعديل اسم التصنيف' : editDialog.type === 'storehouse' ? 'تعديل اسم المستودع' : 'تعديل وحدة القياس'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="الاسم"
            margin="dense"
            value={editDialog.value}
            onChange={(e) => setEditDialog({ ...editDialog, value: e.target.value })}
```

### /pages/Settings.tsx (Line 2824)
- **Label**: البادئة (الحروف)
- **Name**: Unknown Name
- **Type**: text
- **Controlled**: Yes
```tsx
          />
          {editDialog.type === 'category' && (
            <>
              <TextField
                fullWidth
                label="البادئة (الحروف)"
                margin="dense"
                value={editDialog.prefix || ''}
                onChange={(e) => setEditDialog({ ...editDialog, prefix: e.target.value })}
                sx={{ mb: 2, '& input': { fontFamily: '"Cairo", sans-serif' } }}
```

### /pages/Settings.tsx (Line 2834)
- **Label**: بداية المدى الرقمي
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: Yes
```tsx
              />
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="بداية المدى الرقمي"
                    value={editDialog.startRange || ''}
                    onChange={(e) => setEditDialog({ ...editDialog, startRange: Number(e.target.value) })}
                    sx={{ '& input': { fontFamily: '"Cairo", sans-serif' } }}
```

### /pages/Settings.tsx (Line 2844)
- **Label**: نهاية المدى الرقمي
- **Name**: Unknown Name
- **Type**: number
- **Controlled**: Yes
```tsx
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="نهاية المدى الرقمي"
                    value={editDialog.endRange || ''}
                    onChange={(e) => setEditDialog({ ...editDialog, endRange: Number(e.target.value) })}
                    sx={{ '& input': { fontFamily: '"Cairo", sans-serif' } }}
```

