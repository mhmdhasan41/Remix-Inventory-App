const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const regex = /<Button[^>]*onClick=\{async \(\) => \{[^}]*sendPasswordResetEmail[^}]*\} catch \(e: any\) \{[^}]*\}\s*\}\s*\}\s*sx=\{\{[^}]*\}\}\s*>\s*إرسال رابط إعادة تعيين كلمة المرور\s*<\/Button>/g;

// Fallback search: Let's find the specific block
const lines = content.split('\n');
let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('إرسال رابط إعادة تعيين كلمة المرور')) {
    // walk backwards to find <Button
    for (let j = i; j >= 0; j--) {
      if (lines[j].includes('<Button')) {
        start = j;
        break;
      }
    }
    // walk forwards to find </Button>
    for (let j = i; j < lines.length; j++) {
      if (lines[j].includes('</Button>')) {
        end = j;
        break;
      }
    }
    break;
  }
}

if (start !== -1 && end !== -1) {
  const replaceBtn = `                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        startIcon={<KeyIcon />}
                        onClick={() => {
                          const users = dataService.getUsers();
                          const idx = users.findIndex(u => u.id === editingUserId);
                          if (idx !== -1) {
                            users[idx].password = '123456';
                            localStorage.setItem('remix_users_v1', JSON.stringify(users));
                            setSuccessMsg('تم إعادة تعيين كلمة المرور إلى الافتراضية: 123456');
                          } else {
                            setErrorMsg('يرجى حفظ المستخدم أولاً قبل إعادة التعيين.');
                          }
                        }}
                        sx={{ fontFamily: '"Cairo", sans-serif', mb: 2 }}
                      >
                        إعادة التعيين للكلمة الافتراضية (123456)
                      </Button>`;
                      
  lines.splice(start, end - start + 1, replaceBtn);
  content = lines.join('\n');
  content = content.replace(/import \{ sendPasswordResetEmail \} from 'firebase\/auth';\n?/g, '');
  fs.writeFileSync('src/pages/Settings.tsx', content);
  console.log("Successfully replaced");
} else {
  console.log("Not found");
}

