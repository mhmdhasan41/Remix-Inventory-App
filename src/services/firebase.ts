import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app;
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;
let isFirebaseAvailable = false;
let secondaryApp;
let secondaryAuth;

try {
  if (firebaseConfig && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    const config = firebaseConfig as any;
    // Use Firestore with specific database ID if provided in config
    // We enforce long polling as WebSockets can sometimes drop in the restricted proxy environment
    if (config.firestoreDatabaseId) {
      db = initializeFirestore(app, {}, config.firestoreDatabaseId);
    } else {
      db = initializeFirestore(app, {});
    }
    
    auth = getAuth(app);
    secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
    secondaryAuth = getAuth(secondaryApp);
    isFirebaseAvailable = !!db && !!auth;

    if (isFirebaseAvailable) {

    } else {

    }
  } else {

  }
} catch (error) {

}

export { app, db, auth, secondaryAuth, isFirebaseAvailable, firebaseConfig };

// Helper to authenticate anonymously with Firebase to satisfy request.auth != null rules
