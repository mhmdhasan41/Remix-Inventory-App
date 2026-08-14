import re

with open('src/layouts/AppLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix sidebar Box
content = content.replace("<Box sx={{ textAlign: 'right', overflow: 'hidden', flexGrow: 1 }}>", "<Box sx={{ textAlign: 'right', overflow: 'hidden', flexGrow: 1, direction: 'rtl' }}>")

with open('src/layouts/AppLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
