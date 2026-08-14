const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

// 1. Add signInWithEmailAndPassword to import
content = content.replace(
  "import { sendPasswordResetEmail } from 'firebase/auth';",
  "import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';"
);

// 2. Add state
const stateTarget = `const [resetConfirmText, setResetConfirmText] = useState('');`;
const stateReplacement = `const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetAdminPassword, setResetAdminPassword] = useState('');`;
content = content.replace(stateTarget, stateReplacement);

// 3. Update handlePerformFactoryReset
const fnTarget = `  const handlePerformFactoryReset = async () => {
    const cleanStr = resetConfirmText.trim().toLowerCase();
    if (cleanStr !== 'تاكيد' && cleanStr !== 'confirm' && resetConfirmText.trim() !== 'تأكيد' && resetConfirmText.trim() !== 'تاكيد') {
      setErrorMsg('النص المدخل غير صحيح! يرجى كتابة كلمة "تاكيد" بدقة لإتمام إعادة الضبط.');
      
      setResetDialogOpen(false);
      return;
    }
    
    try {
      setIsFactoryResetting(true);
      await dataService.resetToFactoryDefaults();
      setResetDialogOpen(false);
      setSuccessMsg('تمت إعادة تهيئة المنظومة بالكامل بنجاح واستعادة التهيئة التأسيسية! جاري إعادة التوجيه لصفحة تسجيل الدخول...');
      
      setTimeout(() => {
        setIsFactoryResetting(false);
        window.location.reload();
      }, 1500);
    } catch {
      setIsFactoryResetting(false);
      setErrorMsg('حدث خطأ أثناء إجراء المسح الكلي، يرجى تصفير ذاكرة المتصفح يدوياً.');
    }
  };`;

const fnReplacement = `  const handlePerformFactoryReset = async () => {
    const cleanStr = resetConfirmText.trim().toLowerCase();
    if (cleanStr !== 'تاكيد' && cleanStr !== 'confirm' && resetConfirmText.trim() !== 'تأكيد' && resetConfirmText.trim() !== 'تاكيد') {
      setErrorMsg('النص المدخل غير صحيح! يرجى كتابة كلمة "تاكيد" بدقة لإتمام إعادة الضبط.');
      setResetDialogOpen(false);
      return;
    }

    if (!resetAdminPassword.trim()) {
      setErrorMsg('الرجاء إدخال كلمة المرور الحالية الخاصة بك كمدير للتحقق.');
      setResetDialogOpen(false);
      return;
    }
    
    try {
      setIsFactoryResetting(true);
      
      // Admin Password Verification layer
      const currentUser = dataService.getCurrentUser();
      if (isFirebaseAvailable && auth && currentUser) {
        try {
          await signInWithEmailAndPassword(auth, currentUser.username, resetAdminPassword);
        } catch (authError: any) {
          setIsFactoryResetting(false);
          setErrorMsg('كلمة المرور غير صحيحة! لا يمكن إتمام العملية بدون التحقق من هوية المدير.');
          return;
        }
      }

      await dataService.resetToFactoryDefaults();
      setResetDialogOpen(false);
      setSuccessMsg('تمت إعادة تهيئة المنظومة بالكامل بنجاح واستعادة التهيئة التأسيسية! جاري إعادة التوجيه لصفحة تسجيل الدخول...');
      
      setTimeout(() => {
        setIsFactoryResetting(false);
        window.location.reload();
      }, 1500);
    } catch {
      setIsFactoryResetting(false);
      setErrorMsg('حدث خطأ أثناء إجراء المسح الكلي، يرجى تصفير ذاكرة المتصفح يدوياً.');
    }
  };`;
content = content.replace(fnTarget, fnReplacement);

// 4. Update Dialog UI
const dialogTarget = `          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#334155', fontFamily: '"Cairo", sans-serif' }}>
              الرجاء كتابة كلمة <span style={{ color: '#dc2626', fontWeight: 'bold' }}>"تاكيد"</span> في الحقل أدناه لإكمال الإجراء:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="اكتب تاكيد هنا"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              sx={{ '& input': { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } }}
            />
          </Box>`;

const dialogReplacement = `          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#334155', fontFamily: '"Cairo", sans-serif' }}>
              كلمة المرور الحالية للمدير (للتحقق من الصلاحية):
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="password"
              placeholder="أدخل كلمة المرور الحالية"
              value={resetAdminPassword}
              onChange={(e) => setResetAdminPassword(e.target.value)}
              sx={{ '& input': { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' }, mb: 2 }}
            />

            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#334155', fontFamily: '"Cairo", sans-serif' }}>
              الرجاء كتابة كلمة <span style={{ color: '#dc2626', fontWeight: 'bold' }}>"تاكيد"</span> في الحقل أدناه لإكمال الإجراء:
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="اكتب تاكيد هنا"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              sx={{ '& input': { fontFamily: '"Cairo", sans-serif', fontSize: '0.9rem' } }}
            />
          </Box>`;
content = content.replace(dialogTarget, dialogReplacement);

fs.writeFileSync('src/pages/Settings.tsx', content);
