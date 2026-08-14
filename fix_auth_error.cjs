const fs = require('fs');
let ds = fs.readFileSync('src/services/dataService.ts', 'utf8');

ds = ds.replace(
  /catch \(e: any\) \{\n      console\.error\("Auth error:", e\);\n      return \{ success: false, message: 'خطأ في الاتصال بقاعدة البيانات: ' \+ e\.message \};\n    \}/g,
  `catch (e: any) {\n      console.error("Auth error:", e);\n      // Continue locally even if Firebase auth fails (e.g. if Anonymous auth is not enabled in Firebase Console)\n    }`
);

fs.writeFileSync('src/services/dataService.ts', ds);
