const fs = require('fs');
let code = fs.readFileSync('src/services/firebase.ts', 'utf8');
code = code.replace("export { app, db, auth, isFirebaseAvailable };", "export { app, db, auth, isFirebaseAvailable, firebaseConfig };");
fs.writeFileSync('src/services/firebase.ts', code);
