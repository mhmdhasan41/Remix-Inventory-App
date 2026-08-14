const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

// Add imports for Dialog
code = code.replace("CircularProgress", "CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions");

// Add state for Force Change Password
const stateInsert = `
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
`;
code = code.replace("const settings = dataService.getSettings();", stateInsert + "\n  const settings = dataService.getSettings();");

// Add handle change password submit
const changePasswordSubmit = `
  const handleChangePasswordSubmit = () => {
    if (!newPassword || newPassword.length < 6) {
      setChangePasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('كلمتا المرور غير متطابقتين.');
      return;
    }
    const currentUser = dataService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, password: newPassword };
      dataService.saveUser(updatedUser).then((res) => {
        if (res.success) {
          setRequirePasswordChange(false);
          onLoginSuccess();
        } else {
          setChangePasswordError(res.message);
        }
      });
    }
  };
`;
code = code.replace("const handleSubmit = (e: React.FormEvent) => {", changePasswordSubmit + "\n  const handleSubmit = (e: React.FormEvent) => {");

// Change the login success flow
const loginFlow = `
      dataService.login(username, password).then(result => {
        setLoading(false);
        if (result.success) {
          const isDefault = (username.trim().toLowerCase() === 'admin@system.com' && password === 'admin') || password === '123456';
          if (isDefault) {
            setRequirePasswordChange(true);
          } else {
            onLoginSuccess();
          }
        } else {
          setErrorMsg(result.message);
        }
      });
`;
code = code.replace(/dataService\.login\(username, password\)\.then\(result => \{\s+setLoading\(false\);\s+if \(result\.success\) \{\s+onLoginSuccess\(\);\s+\} else \{\s+setErrorMsg\(result\.message\);\s+\}\s+\}\);/, loginFlow);


const forgotPasswordButton = `
            <Button
              type="submit"
              fullWidth
              variant="contained"
`;
const newButtons = `
            <Button
              fullWidth
              variant="text"
              onClick={() => setSnackbarOpen(true)}
              sx={{
                mb: 2,
                color: '#64748b',
                fontFamily: '"Cairo", sans-serif',
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              نسيت كلمة المرور؟
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
`;
code = code.replace(forgotPasswordButton, newButtons);


const dialogCode = `
      {/* Forgot Password Alert */}
      {snackbarOpen && (
        <Alert
          severity="info"
          onClose={() => setSnackbarOpen(false)}
          sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            fontFamily: '"Cairo", sans-serif',
            direction: 'rtl'
          }}
        >
          يرجى التواصل مع مدير النظام لإعادة تعيين كلمة المرور
        </Alert>
      )}

      {/* Force Password Change Dialog */}
      <Dialog open={requirePasswordChange} disableEscapeKeyDown>
        <DialogTitle sx={{ fontFamily: '"Cairo", sans-serif', fontWeight: 'bold', direction: 'rtl' }}>
          تغيير كلمة المرور الافتراضية
        </DialogTitle>
        <DialogContent sx={{ direction: 'rtl', minWidth: '350px' }}>
          <Typography variant="body2" sx={{ mb: 3, fontFamily: '"Cairo", sans-serif', color: '#64748b' }}>
            لأسباب أمنية، يرجى تغيير كلمة المرور الافتراضية قبل المتابعة.
          </Typography>
          
          {changePasswordError && (
            <Alert severity="error" sx={{ mb: 2, fontFamily: '"Cairo", sans-serif' }}>
              {changePasswordError}
            </Alert>
          )}

          <TextField
            fullWidth
            type="password"
            label="كلمة المرور الجديدة"
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2, fontFamily: '"Cairo", sans-serif' }}
          />
          <TextField
            fullWidth
            type="password"
            label="تأكيد كلمة المرور الجديدة"
            variant="outlined"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            sx={{ mb: 2, fontFamily: '"Cairo", sans-serif' }}
          />
        </DialogContent>
        <DialogActions sx={{ direction: 'rtl', p: 2 }}>
          <Button 
            onClick={handleChangePasswordSubmit} 
            variant="contained" 
            sx={{ fontFamily: '"Cairo", sans-serif', bgcolor: '#007ab7', fontWeight: 'bold' }}
          >
            تغيير كلمة المرور والمتابعة
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
`;

code = code.replace(/<\/Box>\s*$/m, dialogCode);

fs.writeFileSync('src/components/Login.tsx', code);
