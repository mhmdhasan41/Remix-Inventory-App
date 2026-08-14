#!/bin/bash
cat > src/services/firebase.ts << 'INNER_EOF'
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app;
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;
let isFirebaseAvailable = false;

try {
  if (firebaseConfig && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    const config = firebaseConfig as any;
    // Use Firestore with specific database ID if provided in config
    if (config.firestoreDatabaseId) {
      db = getFirestore(app, config.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    
    auth = getAuth(app);
    isFirebaseAvailable = !!db && !!auth;

    if (isFirebaseAvailable) {
      console.log('Firebase initialized successfully with project:', firebaseConfig.projectId);
    } else {
      console.error('Firebase components (db or auth) are undefined.');
    }
  } else {
    console.error('Firebase config is incomplete or missing in firebase-applet-config.json');
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export { app, db, auth, isFirebaseAvailable };
INNER_EOF
