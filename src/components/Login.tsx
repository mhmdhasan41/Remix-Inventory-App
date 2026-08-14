import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Alert, InputAdornment, IconButton, Card, CardContent, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { dataService } from '../services/dataService';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetAlertOpen, setResetAlertOpen] = useState(() => {
    const hasReset = sessionStorage.getItem('show_reset_credentials') === 'true' || localStorage.getItem('show_reset_credentials') === 'true';
    if (hasReset) {
      sessionStorage.removeItem('show_reset_credentials');
      localStorage.removeItem('show_reset_credentials');
      return true;
    }
    return false;
  });

  
  const [requirePasswordChange, setRequirePasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  const settings = dataService.getSettings();

  
  const handleChangePasswordSubmit = () => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);
    // Simulate slight loading for premium UX feeling
    setTimeout(() => {
      
      dataService.login(username, password, rememberMe).then(result => {
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
      });


    }, 400);
  };

  return (
    <Box 
      sx={{
        direction: 'rtl',
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        fontFamily: '"Cairo", sans-serif'
      }}
    >
      <Card 
        sx={{
          maxWidth: 440,
          width: '100%',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 122, 183, 0.08)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}
        id="login-card"
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header & Logo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, textSelection: 'none' }}>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                borderRadius: '16px', 
                bgcolor: '#007ab7', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mb: 2,
                boxShadow: '0 8px 16px rgba(0, 122, 183, 0.2)'
              }}
            >
              <AdminPanelSettingsIcon sx={{ color: '#ffffff', fontSize: 32 }} />
            
      </Box>

            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800, 
                color: '#1e293b', 
                fontFamily: '"Cairo", sans-serif',
                textAlign: 'center'
              }}
            >
              منظومة الرقابة والضوابط المخزنية
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#007ab7', 
                fontWeight: 'bold', 
                mt: 0.5,
                fontFamily: '"Cairo", sans-serif',
                textAlign: 'center'
              }}
            >
              {settings.organizationName}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b', 
                mt: 1,
                fontFamily: '"Cairo", sans-serif',
                textAlign: 'center'
              }}
            >
              {settings.departmentName}
            </Typography>
          </Box>

          {/* Error Message */}
          {resetAlertOpen && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px', 
                fontWeight: 'bold',
                fontFamily: '"Cairo", sans-serif',
                fontSize: '0.85rem',
                border: '1px solid #bae6fd',
                bgcolor: '#f0f9ff',
                color: '#0369a1',
                textAlign: 'start',
                direction: 'rtl'
              }}
              onClose={() => setResetAlertOpen(false)}
            >
              تمت إعادة تهيئة المنظومة بنجاح!
              <br />
              <strong>بيانات تسجيل الدخول الافتراضية الأولية:</strong>
              <br />
              البريد الإلكتروني: <code style={{ fontSize: '0.9rem', color: '#0284c7' }}>admin@system.com</code>
              <br />
              كلمة المرور: <code style={{ fontSize: '0.9rem', color: '#0284c7' }}>admin</code>
            </Alert>
          )}

          {errorMsg && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px', 
                fontWeight: 'bold',
                fontFamily: '"Cairo", sans-serif',
                fontSize: '0.85rem'
              }}
            >
              {errorMsg}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ mb: 2.5 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 'bold', 
                  color: '#475569',
                  fontFamily: '"Cairo", sans-serif'
                }}
              >
                البريد الإلكتروني
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                id="username-field"
                placeholder="مثال: name@domain.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="email"
                type="email"
                autoFocus
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: '12px',
                      fontFamily: '"Cairo", sans-serif',
                      bgcolor: '#f8fafc',
                      '& fieldset': { borderColor: '#cbd5e1' },
                      '&:hover fieldset': { borderColor: '#94a3b8' },
                      '&.Mui-focused fieldset': { borderColor: '#007ab7' }
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 'bold', 
                  color: '#475569',
                  fontFamily: '"Cairo", sans-serif'
                }}
              >
                كلمة المرور
              </Typography>
              <TextField
                variant="outlined"
                fullWidth
                id="password-field"
                type={showPassword ? 'text' : 'password'}
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="start"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { 
                      borderRadius: '12px',
                      fontFamily: '"Cairo", sans-serif',
                      bgcolor: '#f8fafc',
                      '& fieldset': { borderColor: '#cbd5e1' },
                      '&:hover fieldset': { borderColor: '#94a3b8' },
                      '&.Mui-focused fieldset': { borderColor: '#007ab7' }
                    }
                  }
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: '#94a3b8',
                      '&.Mui-checked': {
                        color: '#007ab7',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontFamily: '"Cairo", sans-serif', color: '#475569' }}>
                    تذكرني على هذا الجهاز
                  </Typography>
                }
                sx={{ mr: 0, ml: 1 }}
              />
            </Box>

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
              disabled={loading}
              id="login-submit-btn"
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : null}
              sx={{
                py: 1.5,
                borderRadius: '14px',
                fontWeight: 'bold',
                fontFamily: '"Cairo", sans-serif',
                fontSize: '1rem',
                backgroundColor: '#007ab7',
                '&:hover': {
                  backgroundColor: '#006294',
                },
                boxShadow: '0 8px 20px rgba(0, 122, 183, 0.25)',
                textTransform: 'none'
              }}
            >
              {loading ? 'جاري التحقق...' : 'تسجيل الدخول الآمن'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    
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
      <Dialog open={requirePasswordChange}>
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
  );
}
