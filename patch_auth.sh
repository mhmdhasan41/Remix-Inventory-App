#!/bin/bash
sed -i "s/import { getAuth } from 'firebase\/auth';/import { getAuth, signInAnonymously } from 'firebase\/auth';/g" src/services/firebase.ts

cat << 'INNER_EOF' >> src/services/firebase.ts

// Helper to authenticate anonymously with Firebase to satisfy request.auth != null rules
export const authenticateFirebase = async () => {
  if (isFirebaseAvailable && auth) {
    try {
      await signInAnonymously(auth);
      console.log('Firebase anonymous auth successful');
    } catch (err) {
      console.error('Firebase anonymous auth failed:', err);
    }
  }
};
INNER_EOF
