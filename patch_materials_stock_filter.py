import re

with open('src/pages/Materials.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("stockStatusFilter === 'low'", "stockStatusFilter === 'critical'")
content = content.replace("stockStatusFilter === 'ok'", "stockStatusFilter === 'normal'")

with open('src/pages/Materials.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
