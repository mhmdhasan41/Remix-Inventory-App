import re

with open('src/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix handleImportItemsCSV
old_item_data = """          const itemData: any = {
            id: 'mat-' + Math.random().toString(36).substr(2, 9),
            code, name, type: itemType, category, unit, safeStockLimit, currentStock, storageLocation, note,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          };
          if (isPesticide) {
            itemData.manufacturer = manufacturer; itemData.manufacturingDate = mfgDate; itemData.expirationDate = expDate; itemData.hazardLevel = hazardLevel as any;
          }"""

new_item_data = """          const itemData: any = {
            id: 'mat-' + Math.random().toString(36).substr(2, 9),
            code, name, type: itemType, category, unit, minimumStock: safeStockLimit, currentStock, storageLocation, notes: note,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
          };
          if (isPesticide) {
            itemData.manufacturer = manufacturer; itemData.productionDate = mfgDate; itemData.expiryDate = expDate; itemData.hazardLevel = hazardLevel as any;
          }"""

content = content.replace(old_item_data, new_item_data)

# 2. Fix Excel Export for Materials (Drive Backup)
old_mat_export = """      const matHeaders = ['المعرف', 'رمز الصنف', 'اسم الصنف', 'التصنيف', 'الوحدة', 'الرصيد الحالي', 'حد الأمان', 'المستودع', 'ملاحظات'];
      const matHeaderRow = matSheet.addRow(matHeaders);
      matHeaderRow.height = 26;
      matHeaderRow.eachCell((cell) => {
        cell.font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '007AB7' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      materials.forEach((m: any) => {
        const row = matSheet.addRow([
          m.id || '',
          m.code || '',
          m.name || '',
          m.category || '',
          m.unit || '',
          Number(m.currentStock) || 0,
          Number(m.minimumStock) || 0,
          m.storageLocation || '',
          m.notes || ''
        ]);"""

new_mat_export = """      const matHeaders = ['المعرف', 'رمز الصنف', 'اسم الصنف', 'التصنيف', 'الوحدة', 'الرصيد الحالي', 'حد الأمان', 'المستودع', 'ملاحظات', 'الشركة المصنعة', 'تاريخ الإنتاج', 'تاريخ الانتهاء', 'درجة الخطورة'];
      const matHeaderRow = matSheet.addRow(matHeaders);
      matHeaderRow.height = 26;
      matHeaderRow.eachCell((cell) => {
        cell.font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '007AB7' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      materials.forEach((m: any) => {
        const row = matSheet.addRow([
          m.id || '',
          m.code || '',
          m.name || '',
          m.category || '',
          m.unit || '',
          Number(m.currentStock) || 0,
          Number(m.minimumStock) || 0,
          m.storageLocation || '',
          m.notes || '',
          m.manufacturer || '',
          m.productionDate || '',
          m.expiryDate || '',
          m.hazardLevel || ''
        ]);"""

content = content.replace(old_mat_export, new_mat_export)

# 3. Fix Excel Export for Transactions (Drive Backup)
old_tx_export = """      const txHeaders = ['رقم الحركة', 'رمز الصنف', 'اسم الصنف', 'نوع الحركة', 'الكمية', 'التاريخ', 'رقم المستند', 'الجهة المستلمة / جهة التوريد', 'بواسطة'];
      const txHeaderRow = txSheet.addRow(txHeaders);
      txHeaderRow.height = 26;
      txHeaderRow.eachCell((cell) => {
        cell.font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      transactions.forEach((t: any) => {
        const row = txSheet.addRow([
          t.id || '',
          t.itemCode || '',
          t.itemName || '',
          t.transactionType === 'وارد' ? 'توريد (+)' : t.transactionType === 'صادر' ? 'صرف (-)' : 'استهلاك (-)',
          Number(t.quantity) || 0,
          t.date || '',
          t.transactionNumber || '',
          t.supplierOrReceiver || '',
          t.executedBy || ''
        ]);"""

new_tx_export = """      const txHeaders = ['رقم الحركة', 'رمز الصنف', 'اسم الصنف', 'نوع الحركة', 'الكمية', 'التاريخ', 'رقم المستند', 'الجهة المستلمة / جهة التوريد', 'بواسطة', 'المستودع', 'ملاحظات'];
      const txHeaderRow = txSheet.addRow(txHeaders);
      txHeaderRow.height = 26;
      txHeaderRow.eachCell((cell) => {
        cell.font = { name: fontName, size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      transactions.forEach((t: any) => {
        const row = txSheet.addRow([
          t.id || '',
          t.itemCode || '',
          t.itemName || '',
          t.transactionType === 'وارد' ? 'توريد (+)' : t.transactionType === 'صادر' ? 'صرف (-)' : t.transactionType === 'تحويل' ? 'تحويل' : t.transactionType === 'تسوية' ? 'تسوية جردية' : t.transactionType === 'مستهلك' ? 'مستهلك (-)' : 'افتتاحي (+)',
          Number(t.quantity) || 0,
          t.date || '',
          t.transactionNumber || '',
          t.supplierOrReceiver || '',
          t.executedBy || '',
          t.storehouse || '',
          t.notes || ''
        ]);"""

content = content.replace(old_tx_export, new_tx_export)

with open('src/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

