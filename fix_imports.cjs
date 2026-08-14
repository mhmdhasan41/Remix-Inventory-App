const fs = require('fs');

let ds = fs.readFileSync('src/services/dataService.ts', 'utf8');

// Remove the unused imports
ds = ds.replace(/import \{ signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword \} from 'firebase\/auth';\n?/g, '');
ds = ds.replace(/import \{ db, isFirebaseAvailable, auth, secondaryAuth \} from '\.\/firebase';/g, "import { db, isFirebaseAvailable, auth } from './firebase';");

fs.writeFileSync('src/services/dataService.ts', ds);

