const fs = require('fs');
let ds = fs.readFileSync('src/services/dataService.ts', 'utf8');

ds = ds.replace(/import \{ collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch, getDoc \} from 'firebase\/firestore';/, "import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch, getDoc } from 'firebase/firestore';\nimport { signInAnonymously } from 'firebase/auth';");

ds = ds.replace(/await import\('firebase\/auth'\)\.then\(\(\{ signInAnonymously \}\) => signInAnonymously\(auth\)\);/, "await signInAnonymously(auth);");

fs.writeFileSync('src/services/dataService.ts', ds);
