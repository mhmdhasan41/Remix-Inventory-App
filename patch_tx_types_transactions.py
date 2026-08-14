import re

with open('src/pages/Transactions.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<MenuItem value="وارد">وارد (إدخال مخزني) 🟢</MenuItem>', '<MenuItem value="وارد">وارد 📥</MenuItem>')
content = content.replace('<MenuItem value="صادر">صادر (صرف للبلديات) 🔴</MenuItem>', '<MenuItem value="صادر">صادر 📤</MenuItem>')
content = content.replace('<MenuItem value="مستهلك">مستهلك (ميداني) 🟠</MenuItem>', '<MenuItem value="مستهلك">مستهلك 🗑️</MenuItem>')

with open('src/pages/Transactions.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
