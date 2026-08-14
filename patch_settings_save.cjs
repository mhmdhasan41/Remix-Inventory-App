const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const targetSaveHandler = `  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataService.hasPermission('users_manage')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية إدارة المستخدمين وتعديل الصلاحيات (users_manage).');
      return;
    }`;

const replacementSaveHandler = `  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataService.hasPermission('users_manage')) {
      setErrorMsg('عذراً، هذا الحساب لا يملك صلاحية إدارة المستخدمين وتعديل الصلاحيات (users_manage).');
      return;
    }`;
    
const targetSaveCall = `    const res = dataService.saveUser(newUserObj);
    if (!res.success) {`;
    
const replacementSaveCall = `    const res = await dataService.saveUser(newUserObj);
    if (!res.success) {`;

content = content.replace(targetSaveHandler, replacementSaveHandler);
content = content.replace(targetSaveCall, replacementSaveCall);
fs.writeFileSync('src/pages/Settings.tsx', content);
