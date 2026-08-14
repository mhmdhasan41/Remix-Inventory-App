const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

// First, let's remove the badly placed Dialog block entirely.
const startIdx = code.indexOf('{/* Forgot Password Alert */}');
const endIdx = code.indexOf('</Dialog>\n    </Box>') + '</Dialog>\n    </Box>'.length;

if (startIdx !== -1 && endIdx !== -1) {
  // restore the </Box> that was replaced
  const badBlock = code.substring(startIdx, endIdx);
  code = code.replace(badBlock, '</Box>');
}

// Now put it back at the proper end of the file
const properBlock = `
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
`;

code = code.replace(/<\/Box>\s*\);\s*}\s*$/, properBlock);
fs.writeFileSync('src/components/Login.tsx', code);
