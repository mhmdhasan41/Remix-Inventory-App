with open('src/pages/AuditLogs.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('{renderOption("المواد واللوازم 📦")}', '{renderOption("المواد واللوازم")}')
content = content.replace('{renderOption("مستودع المبيدات 🧪")}', '{renderOption("مستودع المبيدات")}')
content = content.replace('{renderOption("حركة مخازن وصرف 🔄")}', '{renderOption("حركة مخازن وصرف")}')
content = content.replace('{renderOption("تهيئة وتحديث إعدادات ⚙️")}', '{renderOption("تهيئة وتحديث إعدادات")}')

with open('src/pages/AuditLogs.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
