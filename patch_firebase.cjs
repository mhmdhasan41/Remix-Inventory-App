const fs = require('fs');
let content = fs.readFileSync('src/services/firebase.ts', 'utf8');
if (!content.includes('secondaryAuth')) {
  const target = `let isFirebaseAvailable = false;`;
  const replacement = `let isFirebaseAvailable = false;\nlet secondaryApp;\nlet secondaryAuth;`;
  content = content.replace(target, replacement);
  
  const target2 = `    auth = getAuth(app);`;
  const replacement2 = `    auth = getAuth(app);\n    secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');\n    secondaryAuth = getAuth(secondaryApp);`;
  content = content.replace(target2, replacement2);
  
  const target3 = `export { app, db, auth, isFirebaseAvailable, firebaseConfig };`;
  const replacement3 = `export { app, db, auth, secondaryAuth, isFirebaseAvailable, firebaseConfig };`;
  content = content.replace(target3, replacement3);
  
  fs.writeFileSync('src/services/firebase.ts', content);
}
