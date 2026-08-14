with open('src/utils/emoji.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("export type DynamicType = 'storehouse' | 'partner' | 'item' | 'category' | 'employee' | 'none';",
                          "export type DynamicType = 'storehouse' | 'partner' | 'item' | 'category' | 'employee' | 'unit' | 'none';")

fallback = """  switch (type) {
    case 'storehouse': return '🏢';
    case 'partner': return '👤';
    case 'employee': return '👤';
    case 'item': return '🏷️';
    case 'category': return '📁';
    case 'unit': return '📏';
    default: return '';"""
content = content.replace("""  switch (type) {
    case 'storehouse': return '🏢';
    case 'partner': return '👤';
    case 'employee': return '👤';
    case 'item': return '🏷️';
    case 'category': return '📁';
    default: return '';""", fallback)

content = content.replace("g, '').trim()", "g, '').trim()")
import re
content = re.sub(r'\/\[(.*?)\]\/g', r'/[\1📏]/g', content)

with open('src/utils/emoji.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
