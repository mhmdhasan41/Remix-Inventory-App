const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

// 1. Add type="button" to the reset button
const target1 = `                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={async () => {
                          try {
                            const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');`;

const replacement1 = `                      <Button
                        type="button"
                        variant="outlined"
                        color="primary"
                        onClick={async () => {
                          try {
                            const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');`;
content = content.replace(target1, replacement1);

// 2. Fix typography for username display
const target2 = `                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: -0.5, fontFamily: '"Cairo", sans-serif' }}>
                                @{u.username} 
                              </Typography>`;

const replacement2 = `                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: -0.5, fontFamily: '"Cairo", sans-serif', direction: 'ltr', textAlign: 'right' }}>
                                {u.username} 
                              </Typography>`;
content = content.replace(target2, replacement2);

fs.writeFileSync('src/pages/Settings.tsx', content);
