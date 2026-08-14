const fs = require('fs');
let content = fs.readFileSync('src/services/dataService.ts', 'utf8');

const targetSave = `  saveUser: (user: SystemUser): { success: boolean; message: string } => {
    const emailPattern = /^[^\s@]+@[^\s@]+\\.[^\s@]+$/;
    if (!emailPattern.test(user.username.trim().toLowerCase())) {
      return { success: false, message: 'ممنوع إنشاء أو حفظ حسابات ليست على صيغة بريد إلكتروني!' };
    }

    const users = dataService.getUsers();
    // Validate uniqueness of username (except for current item we're editing)
    const duplicate = users.find(u => u.username.trim().toLowerCase() === user.username.trim().toLowerCase() && u.id !== user.id);
    if (duplicate) {
      return { success: false, message: 'اسم المستخدم مسجل مسبقاً لمستخدم آخر!' };
    }

    const index = users.findIndex(u => u.id === user.id);
    const updatedUser = { ...user };
    if (index !== -1) {
      users[index] = updatedUser;
    } else {
      updatedUser.createdAt = new Date().toISOString();
      users.push(updatedUser);
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    dataService.logAudit('تثبيت/تعديل مستخدم', \`تم تعديل أو إضافة المستخدم: \${user.fullName} بنظام الصلاحيات المُخصّص له\`, 'إعدادات');

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      setDoc(doc(db, 'users', updatedUser.id), cleanUndefined(updatedUser))
        .catch(() => {});
    }

    return { success: true, message: 'تم حفظ بيانات المستخدم بنجاح' };
  },`;

const replacementSave = `  saveUser: async (user: SystemUser): Promise<{ success: boolean; message: string }> => {
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailPattern.test(user.username.trim().toLowerCase())) {
      return { success: false, message: 'ممنوع إنشاء أو حفظ حسابات ليست على صيغة بريد إلكتروني!' };
    }

    const users = dataService.getUsers();
    const duplicate = users.find(u => u.username.trim().toLowerCase() === user.username.trim().toLowerCase() && u.id !== user.id);
    if (duplicate) {
      return { success: false, message: 'اسم المستخدم مسجل مسبقاً لمستخدم آخر!' };
    }

    const index = users.findIndex(u => u.id === user.id);
    const updatedUser = { ...user };
    
    // Create Firebase Auth user proactively so password resets work immediately!
    if (isFirebaseAvailable && secondaryAuth && index === -1) {
      try {
        await createUserWithEmailAndPassword(secondaryAuth, user.username.trim().toLowerCase(), '123456');
      } catch (e: any) {
        if (e.code === 'auth/operation-not-allowed') {
          return { success: false, message: 'يجب تفعيل Email/Password في إعدادات Firebase أولاً!' };
        } else if (e.code !== 'auth/email-already-in-use') {
          return { success: false, message: 'فشل إنشاء حساب المستخدم في Firebase: ' + e.message };
        }
      }
    }

    if (index !== -1) {
      users[index] = updatedUser;
    } else {
      updatedUser.createdAt = new Date().toISOString();
      users.push(updatedUser);
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    dataService.logAudit('تثبيت/تعديل مستخدم', \`تم تعديل أو إضافة المستخدم: \${user.fullName} بنظام الصلاحيات المُخصّص له\`, 'إعدادات');

    const settings = dataService.getSettings();
    if (isFirebaseAvailable && settings.cloudSyncEnabled) {
      setDoc(doc(db, 'users', updatedUser.id), cleanUndefined(updatedUser))
        .catch(() => {});
    }

    return { success: true, message: 'تم حفظ بيانات المستخدم بنجاح (كلمة المرور الافتراضية للجدد هي 123456)' };
  },`;

content = content.replace(targetSave, replacementSave);
fs.writeFileSync('src/services/dataService.ts', content);
