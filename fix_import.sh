sed -i "s/import { db, isFirebaseAvailable, auth } from '.\/firebase';/import { db, isFirebaseAvailable, auth, authenticateFirebase } from '.\/firebase';/g" src/services/dataService.ts
