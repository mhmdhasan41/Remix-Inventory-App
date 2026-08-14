const fs = require('fs');
let ds = fs.readFileSync('src/services/dataService.ts', 'utf8');

ds = ds.replace(
  /console\.error\("Auth error:", e\);/g,
  'console.warn("Auth warning (anonymous login might be disabled):", e.message);'
);

fs.writeFileSync('src/services/dataService.ts', ds);
