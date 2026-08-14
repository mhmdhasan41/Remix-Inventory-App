import re

with open('src/pages/Transactions.tsx', 'r') as f:
    content = f.read()

content = content.replace("{settings.systemManagerRole || ''}", "{settings.systemManagerRole || 'مدير النظام'}")
content = content.replace("{settings.healthDirectorRole || ''}", "{settings.healthDirectorRole || 'مدير صحة البيئة'}")

with open('src/pages/Transactions.tsx', 'w') as f:
    f.write(content)

print("done")
