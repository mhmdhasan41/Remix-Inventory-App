import re

with open('src/pages/Transactions.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix quantity LTR display
content = content.replace('{isInbound ? \'+\' : \'-\'}{tx.quantity} {tx.unit || \'وحدة\'}', '<span dir="ltr">{isInbound ? \'+\' : \'-\'}{tx.quantity}</span> {tx.unit || \'وحدة\'}')

# Fix item code
content = content.replace('📦 {tx.itemCode}', '📦 <span dir="ltr">{tx.itemCode}</span>')

# Fix tx number
content = content.replace('{tx.transactionNumber || \'---\'}', '<span dir="ltr">{tx.transactionNumber || \'---\'}</span>')

with open('src/pages/Transactions.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
