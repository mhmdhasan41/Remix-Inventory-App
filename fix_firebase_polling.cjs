const fs = require('fs');
let code = fs.readFileSync('src/services/firebase.ts', 'utf8');
code = code.replace(/initializeFirestore\(app, \{ experimentalForceLongPolling: true \}, config\.firestoreDatabaseId\)/g, "initializeFirestore(app, {}, config.firestoreDatabaseId)");
code = code.replace(/initializeFirestore\(app, \{ experimentalForceLongPolling: true \}\)/g, "initializeFirestore(app, {})");
fs.writeFileSync('src/services/firebase.ts', code);
