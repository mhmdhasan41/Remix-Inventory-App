with open('src/utils/emoji.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'مورد جديد...': '➕',", "'مورد جديد...': '➕',\n  'مورد آخر...': '➕',\n  'جهة مستلمة أخرى...': '➕',")

with open('src/utils/emoji.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
