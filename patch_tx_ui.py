import re

with open('src/pages/Transactions.tsx', 'r') as f:
    content = f.read()

# Fix closing text
content = content.replace("ومؤلف الكترونياً", "ومؤرشف إلكترونياً")

# Fix fallbacks
content = content.replace("|| 'أمين المستودع'", "|| ''")
content = content.replace("|| 'مدير النظام'", "|| ''")
content = content.replace("|| 'مدير صحة البيئة'", "|| ''")

# Fix التوقيع:
old_sig = "<Typography variant=\"caption\" sx={{ color: '#000', display: 'block', mt: 3 }}>التوقيع: ............................</Typography>"
new_sig = "<Typography variant=\"caption\" sx={{ color: '#94a3b8', display: 'block', mt: 3, fontSize: '13px' }}>التوقيع: <span style={{color: '#cbd5e1'}}>............................</span></Typography>"
content = content.replace(old_sig, new_sig)

with open('src/pages/Transactions.tsx', 'w') as f:
    f.write(content)

print("done")
