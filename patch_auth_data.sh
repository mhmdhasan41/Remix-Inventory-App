#!/bin/bash
sed -i "s/import { db, isFirebaseAvailable } from '.\/firebase';/import { db, isFirebaseAvailable, authenticateFirebase } from '.\/firebase';/g" src/services/dataService.ts

sed -i '/export function initCloudSync() {/a\
  authenticateFirebase();' src/services/dataService.ts
