const fs = require('fs');
let content = fs.readFileSync('src/services/dataService.ts', 'utf8');
content = content.replace(
  `import { db, isFirebaseAvailable, auth } from './firebase';`,
  `import { db, isFirebaseAvailable, auth, secondaryAuth } from './firebase';`
);
fs.writeFileSync('src/services/dataService.ts', content);
