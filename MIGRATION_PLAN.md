# خطة تهجير الحسابات (Credential Migration Plan)

This document outlines the migration plan used to eliminate plaintext password vulnerabilities and secure user authentication using Firebase Auth.

## 1. Secure Authentication & Recovery Path
- **Authentication**: `dataService.login()` has been completely rewritten to use Firebase Authentication (`signInWithEmailAndPassword`) as the sole credential authority.
- **Account Creation**: The Arabic Settings page has been updated. Administrators no longer set or see passwords for existing users. When creating a new user, a secondary Firebase App instance is initialized (`createUserWithEmailAndPassword`) to securely register the account without logging the administrator out.
- **Recovery**: Administrators can no longer read or edit a user's password. Instead, they must use the newly added "**إرسال رابط إعادة تعيين كلمة المرور**" (Send Password Reset Link) button, which securely delegates password recovery to Firebase.

## 2. Disable Local Authentication Fallback
- The previous implementation in `dataService.ts` that performed frontend string-comparison of `user.password === password` has been **completely removed**.
- It is no longer possible to authenticate without Firebase Auth.

## 3. Scrubbing Plaintext Passwords
- **Type Definitions**: `password?: string` has been removed from the `SystemUser` interface.
- **Initial Data**: Hardcoded passwords (`'admin'`, `'keeper'`, `'auditor'`) have been removed from `INITIAL_USERS` in `dataService.ts`.
- **JSON Exports**: The backup export logic in `Settings.tsx` has been explicitly modified to scrub any residual `password` fields from local storage records before downloading the JSON (`delete u.password`).
- **Migration Script**: We created `src/scripts/migrate-credentials.ts`. This idempotent script reads a JSON backup, strips all passwords, reports the changes, and optionally supports `--dry-run`.

## 4. Update Arabic Settings UI
- The Users table in `Settings.tsx` was updated to remove the plaintext display of `كلمة المرور: ...`.
- The update form no longer displays a password input field for existing users.

## 5. Cleanup Instructions
To fully clean up remaining exposures in production:
1. Run the migration script on existing JSON backups: `npx tsx src/scripts/migrate-credentials.ts ./backup.json`
2. Existing local browser sessions will no longer authenticate via plaintext. Users must use Firebase Auth. If a user does not exist in Firebase Auth yet, the administrator must create their Auth record or send them a password reset link.

## 6. Evidence of Clean Environment
The codebase has been searched for terms like `password: 'admin'`, `plainPassword`, and `userPassword`. The only remaining references are ephemeral React states (`newUserPassword`) used temporarily during Firebase Auth registration, and standard HTML input types. No passwords are saved to disk, Firestore, or LocalStorage.
