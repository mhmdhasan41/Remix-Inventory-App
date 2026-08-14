sed -i "s/import { getAuth, signInAnonymously } from 'firebase\/auth';/import { getAuth } from 'firebase\/auth';/g" src/services/firebase.ts
sed -i '/export const authenticateFirebase = async () => {/,+9d' src/services/firebase.ts
sed -i "s/import { db, isFirebaseAvailable, auth, authenticateFirebase } from '.\/firebase';/import { db, isFirebaseAvailable, auth } from '.\/firebase';/g" src/services/dataService.ts
sed -i 's/  await authenticateFirebase();//g' src/services/dataService.ts
