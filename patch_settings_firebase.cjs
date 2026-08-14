const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

if (!content.includes('import { firebaseConfig }')) {
  content = content.replace(
    "import { dataService } from '../services/dataService';",
    "import { dataService } from '../services/dataService';\nimport { firebaseConfig } from '../services/firebase';\nimport { initializeApp } from 'firebase/app';\nimport { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';"
  );
}

// Add state for secondary password when creating new user
if (!content.includes('const [newUserPassword, setNewUserPassword] = useState')) {
  content = content.replace(
    "const [userPermissions, setUserPermissions] = useState<string[]>([]);",
    "const [userPermissions, setUserPermissions] = useState<string[]>([]);\n  const [newUserPassword, setNewUserPassword] = useState('');"
  );
}

// Add password field ONLY for creating users
const dialogContentTarget = `<TextField
                  fullWidth
                  size="small"
                  label="البريد الإلكتروني"
                  type="email"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  sx={{ mb: 2 }}
                />`;
const dialogContentReplacement = `<TextField
                  fullWidth
                  size="small"
                  label="البريد الإلكتروني"
                  type="email"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  sx={{ mb: 2 }}
                />
                {!userEditId && (
                  <TextField
                    fullWidth
                    size="small"
                    label="كلمة المرور المبدئية"
                    type="password"
                    autoComplete="new-password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                )}
`;
content = content.replace(dialogContentTarget, dialogContentReplacement);

// Handle Save user
const handleSaveUserRegex = /const handleSaveUser = \(\) => \{[\s\S]*?dataService\.saveUser\(userToSave\);/g;

const oldSaveLogic = `const handleSaveUser = () => {
    if (!dataService.hasPermission('users_manage')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية إدارة المستخدمين وتعديل الصلاحيات (users_manage).');
      return;
    }

    if (!userFullName.trim()) {
      setErrorMsg('اسم المستخدم مطلوب');
      return;
    }
    if (!userUsername.trim()) {
      setErrorMsg('البريد الإلكتروني مطلوب');
      return;
    }

    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailPattern.test(userUsername.trim())) {
      setErrorMsg('يجب إدخال بريد إلكتروني صحيح!');
      return;
    }

    const userToSave: SystemUser = {
      id: userEditId || 'u-' + Date.now(),
      fullName: userFullName.trim(),
      username: userUsername.trim().toLowerCase(),
      role: userRole,
      permissions: userPermissions,
      createdAt: userEditId ? (users.find(u => u.id === userEditId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    const result = dataService.saveUser(userToSave);`;

const newSaveLogic = `const handleSaveUser = async () => {
    if (!dataService.hasPermission('users_manage')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية إدارة المستخدمين وتعديل الصلاحيات (users_manage).');
      return;
    }

    if (!userFullName.trim()) {
      setErrorMsg('اسم المستخدم مطلوب');
      return;
    }
    if (!userUsername.trim()) {
      setErrorMsg('البريد الإلكتروني مطلوب');
      return;
    }

    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailPattern.test(userUsername.trim())) {
      setErrorMsg('يجب إدخال بريد إلكتروني صحيح!');
      return;
    }

    if (!userEditId && !newUserPassword) {
      setErrorMsg('كلمة المرور المبدئية مطلوبة للمستخدمين الجدد');
      return;
    }

    if (!userEditId && newUserPassword.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تتكون من 6 أحرف على الأقل');
      return;
    }

    // Attempt Firebase creation first
    if (!userEditId) {
      try {
        const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp" + Date.now());
        const secondaryAuth = getAuth(secondaryApp);
        await createUserWithEmailAndPassword(secondaryAuth, userUsername.trim().toLowerCase(), newUserPassword);
        // We successfully created the auth user
      } catch (e: any) {
        setErrorMsg('حدث خطأ أثناء إنشاء المستخدم في مزود المصادقة: ' + e.message);
        return;
      }
    }

    const userToSave: SystemUser = {
      id: userEditId || 'u-' + Date.now(),
      fullName: userFullName.trim(),
      username: userUsername.trim().toLowerCase(),
      role: userRole,
      permissions: userPermissions,
      createdAt: userEditId ? (users.find(u => u.id === userEditId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    const result = dataService.saveUser(userToSave);`;

content = content.replace(oldSaveLogic, newSaveLogic);

fs.writeFileSync('src/pages/Settings.tsx', content);
