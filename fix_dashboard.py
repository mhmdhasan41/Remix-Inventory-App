import re

with open('src/pages/Dashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix YAxis
content = content.replace('<YAxis stroke="#94a3b8" fontSize={11} width={25} />', '<YAxis orientation="right" stroke="#94a3b8" fontSize={11} width={25} />')

# Fix quantity LTR display
content = content.replace('{isInbound ? \'+\' : \'-\'}{tx.quantity}', '<span dir="ltr">{isInbound ? \'+\' : \'-\'}{tx.quantity}</span>')

# Fix item code
content = content.replace('📦 {tx.itemCode} • 🏢', '📦 <span dir="ltr">{tx.itemCode}</span> • 🏢')

# Fix tx number
content = content.replace('{tx.transactionNumber || \'---\'}', '<span dir="ltr">{tx.transactionNumber || \'---\'}</span>')

with open('src/pages/Dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
