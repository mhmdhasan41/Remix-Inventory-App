const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

const targetCard = `                    <Card 
                      key={\`\${u.id}-\${idx}\`} 
                      onClick={() => handleEditUserClick(u)}`;

const replaceCard = `                    <Card 
                      className="user-card"
                      key={\`\${u.id}-\${idx}\`} 
                      onClick={() => handleEditUserClick(u)}`;

content = content.replace(targetCard, replaceCard);

const targetAction = `                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', pt: 1, mt: 1, pb: 0.5 }}>
                          <Button 
                            size="small" 
                            color="error" 
                            startIcon={<DeleteIcon sx={{ ml: 0.5, mr: -0.5 }} />} 
                            disabled={isSelf}`;

const replaceAction = `                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', pt: 1, mt: 'auto', pb: 0.5 }}>
                          <Button 
                            size="small" 
                            color="error" 
                            startIcon={<DeleteIcon sx={{ ml: 0.5, mr: -0.5 }} />} 
                            disabled={isSelf}`;

content = content.replace(targetAction, replaceAction);
fs.writeFileSync('src/pages/Settings.tsx', content);
