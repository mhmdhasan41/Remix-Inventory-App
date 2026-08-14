sed -i 's/export function initCloudSync() {/export async function initCloudSync() {/g' src/services/dataService.ts
sed -i 's/  authenticateFirebase();/  await authenticateFirebase();/g' src/services/dataService.ts
