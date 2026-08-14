const fs = require('fs');
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

test = test.replace(/rows: \[\n\s*\['ERR-01', hugeParagraphs\]\n\s*\]/g, 
  "rows: [['ERR-01', hugeParagraphs]],\n        recordIds: [JSON.stringify(['case5', 't0', '0'])]");

test = test.replace(/rows: \[\n\s*\['REC-01', 'سند استلام عادي بعد معالجة الخطأ', 'ناجح'\]\n\s*\]/g, 
  "rows: [['REC-01', 'سند استلام عادي بعد معالجة الخطأ', 'ناجح']],\n        recordIds: [JSON.stringify(['rec', 't0', '0'])]");

fs.writeFileSync('tests/run_real_integration_test.ts', test);
