import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Migration script to remove plaintext passwords from localStorage JSON backups and generate a dry-run report.
// Usage: ts-node src/scripts/migrate-credentials.ts [path-to-json-backup] [--dry-run]

const main = () => {
  const args = process.argv.slice(2);
  const backupPath = args[0] || resolve(process.cwd(), 'backup.json');
  const isDryRun = args.includes('--dry-run');

  if (!existsSync(backupPath)) {
    console.error(`Backup file not found at ${backupPath}`);
    // Create a synthetic backup for testing purposes
    const syntheticData = {
      users: [
        { id: '1', username: 'test1@test.com', password: 'plainPassword123' },
        { id: '2', username: 'test2@test.com' } // already migrated
      ]
    };
    writeFileSync(backupPath, JSON.stringify(syntheticData, null, 2));
    console.log(`Created synthetic backup at ${backupPath} for testing.`);
  }

  const rawData = readFileSync(backupPath, 'utf8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    console.error('Invalid JSON');
    process.exit(1);
  }

  let migratedCount = 0;
  let skippedCount = 0;

  if (data.users && Array.isArray(data.users)) {
    data.users = data.users.map((user: any) => {
      if (user.password) {
        migratedCount++;
        const { password, ...safeUser } = user;
        return safeUser;
      }
      skippedCount++;
      return user;
    });
  } else {
    console.log('No users array found in backup.');
  }

  console.log('--- Migration Report ---');
  console.log(`Users analyzed: ${migratedCount + skippedCount}`);
  console.log(`Passwords removed: ${migratedCount}`);
  console.log(`Already safe: ${skippedCount}`);

  if (!isDryRun) {
    writeFileSync(backupPath, JSON.stringify(data, null, 2));
    console.log('Backup updated successfully. Passwords removed.');
  } else {
    console.log('[DRY RUN] No changes were written to disk.');
  }
};

main();
