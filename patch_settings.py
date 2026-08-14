import re

with open('src/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """    try {
      setIsFactoryResetting(true);
      await dataService.resetToFactoryDefaults();
      setResetDialogOpen(false);
      setSuccessMsg('تمت إعادة تهيئة المنظومة بالكامل بنجاح واستعادة التهيئة التأسيسية! جاري إعادة التوجيه لصفحة تسجيل الدخول...');
      setErrorMsg(null);
      setTimeout(() => {
        setIsFactoryResetting(false);
        window.location.reload();
      }, 1500);
    } catch {"""

new_logic = """    try {
      setIsFactoryResetting(true);
      await dataService.resetToFactoryDefaults();
      setResetDialogOpen(false);
      setSuccessMsg('تمت إعادة تهيئة المنظومة بالكامل بنجاح! تم تصفير كافة البيانات.');
      setErrorMsg(null);
      setResetConfirmText(''); // Clear input
      setIsFactoryResetting(false);
    } catch {"""

content = content.replace(old_logic, new_logic)

with open('src/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
