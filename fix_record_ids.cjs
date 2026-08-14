const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

// Fix Case 1
code = code.replace(/tables: \[\{\n\s*title: 'سجل الحركات التفصيلية',\n\s*headers: \['م', 'رقم الحركة', 'التاريخ', 'القسم المستلم', 'الكمية'\],\n\s*rows: rowsC1\n\s*\}\]/s, `tables: [{
        title: 'سجل الحركات التفصيلية',
        headers: ['م', 'رقم الحركة', 'التاريخ', 'القسم المستلم', 'الكمية'],
        rows: rowsC1,
        recordIds: rowsC1.map((_, i) => JSON.stringify(['case1', 't0', String(i)]))
      }]`);

// Fix Case 2
code = code.replace(/tables: \[\{\n\s*title: 'المواد المستهلكة',\n\s*headers: \['م', 'المادة', 'ملاحظات'\],\n\s*rows: rowsC2\n\s*\}\]/s, `tables: [{
        title: 'المواد المستهلكة',
        headers: ['م', 'المادة', 'ملاحظات'],
        rows: rowsC2,
        recordIds: rowsC2.map((_, i) => JSON.stringify(['case2', 't0', String(i)]))
      }]`);

// Fix Case 5
code = code.replace(/tables: \[\{\n\s*title: 'جدول يحتوي على سطر ضخم جداً',\n\s*headers: \['الرقم', 'الوصف'\],\n\s*rows: rowsC5\n\s*\}\]/s, `tables: [{
        title: 'جدول يحتوي على سطر ضخم جداً',
        headers: ['الرقم', 'الوصف'],
        rows: rowsC5,
        recordIds: rowsC5.map((_, i) => JSON.stringify(['case5', 't0', String(i)]))
      }]`);
      
// Fix Case 5 Recovery
code = code.replace(/tables: \[\{\n\s*title: 'جدول طبيعي',\n\s*headers: \['م', 'مادة'\],\n\s*rows: recoveryRows\n\s*\}\]/s, `tables: [{
        title: 'جدول طبيعي',
        headers: ['م', 'مادة'],
        rows: recoveryRows,
        recordIds: recoveryRows.map((_, i) => JSON.stringify(['case5_rec', 't0', String(i)]))
      }]`);

fs.writeFileSync('tests/run_real_integration_test.ts', code);
