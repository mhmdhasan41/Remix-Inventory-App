import re

with open('src/pages/Materials.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<TableCell sx={{ fontFamily: \'monospace\', fontWeight: \'bold\', color: \'#64748b\' }}>{row.code}</TableCell>', '<TableCell sx={{ fontFamily: \'monospace\', fontWeight: \'bold\', color: \'#64748b\' }}><span dir="ltr">{row.code}</span></TableCell>')

with open('src/pages/Materials.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
