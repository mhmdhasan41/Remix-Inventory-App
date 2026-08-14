with open('src/utils/emoji.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_mappings = """  // وحدات القياس
  'لتر': '💧',
  'كجم': '⚖️',
  'قطعة': '🧩',
  'علبة': '🥫',
  'جالون': '🛢️',
  
  // سجل العمليات
"""
content = content.replace("// سجل العمليات", new_mappings)

new_regex = r"/[📑📥📤🗑️🔄⚖️🆕⏳🕒⏪📅🗓️📆✏️📁📎❌📊✅⚠️⚪🟢🟡🔴👑🛡️👁️👥👤➕🏷️🏢🌐📦🧪⚙️📋💧🧩🥫🛢️]/g"
content = content.replace("g, '').trim()", "g, '').trim()")
import re
content = re.sub(r'\/\[.*?\]\/g', new_regex, content)

with open('src/utils/emoji.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
