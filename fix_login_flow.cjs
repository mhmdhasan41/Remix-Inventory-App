const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

// Add tempUser state
code = code.replace(
  "const [snackbarOpen, setSnackbarOpen] = useState(false);",
  "const [snackbarOpen, setSnackbarOpen] = useState(false);\n  const [tempUser, setTempUser] = useState<any>(null);"
);

// Update handleSubmit
const oldSubmit = `      dataService.login(username, password).then(result => {
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
      });`;

const newSubmit = `      dataService.login(username, password).then(result => {
        setLoading(false);
        if (result.success) {
          if (result.requirePasswordChange) {
            setTempUser(result.tempUser);
            setRequirePasswordChange(true);
          } else {
            onLoginSuccess();
          }
        } else {
          setErrorMsg(result.message);
        }
      });`;
code = code.replace(oldSubmit, newSubmit);

// Update handleChangePasswordSubmit
const oldChangePass = `  const handleChangePasswordSubmit = () => {
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
  };`;

const newChangePass = `  const handleChangePasswordSubmit = () => {
    if (!newPassword || newPassword.length < 6) {
      setChangePasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (tempUser) {
      const updatedUser = { ...tempUser, password: newPassword };
      dataService.saveUser(updatedUser).then((res) => {
        if (res.success) {
          dataService.completeLogin(updatedUser);
          setRequirePasswordChange(false);
          onLoginSuccess();
        } else {
          setChangePasswordError(res.message);
        }
      });
    } else {
      setChangePasswordError('حدث خطأ. يرجى المحاولة مرة أخرى.');
    }
  };`;
code = code.replace(oldChangePass, newChangePass);

fs.writeFileSync('src/components/Login.tsx', code);
