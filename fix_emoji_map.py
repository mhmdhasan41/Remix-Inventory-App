import re

with open('src/utils/emoji.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add new mappings
new_mappings = """  // التقارير
  'تقرير الجرد العام وجرد الأرصدة المتوفرة حالياً': '📊',
  'تقرير إنفاد مخزون الأمان': '⚠️',
  'تقرير كشف فترات الصلاحيات وحالة الأصناف المشروطة بالصلاحية': '📅',
  'سجل حركات المستودع التفصيلي': '🔄',
  'تقرير الموازنة والملخص الشامل': '🏢',
  'سند توثيق الأرصدة الافتتاحية': '📋',
  
  // سجل العمليات
  'كل الأحداث المسجلة': '📋',
  'المواد واللوازم': '📦',
  'مستودع المبيدات': '🧪',
  'حركة مخازن وصرف': '🔄',
  'تهيئة وتحديث إعدادات': '⚙️',
"""

content = content.replace("// الأخرى الثابتة", new_mappings + "\n  // أخرى ثابتة")
content = content.replace("// أخرى ثابتة", new_mappings + "\n  // أخرى ثابتة") # just in case

# Update the cleanLabel regex
# /[📑📥📤🗑️🔄⚖️🆕⏳🕒⏪📅🗓️📆✏️📁📎❌📊✅⚠️⚪🟢🟡🔴👑🛡️👁️👥👤➕🏷️🏢🌐]/g
old_regex = r"/[📑📥📤🗑️🔄⚖️🆕⏳🕒⏪📅🗓️📆✏️📁📎❌📊✅⚠️⚪🟢🟡🔴👑🛡️👁️👥👤➕🏷️🏢🌐]/g"
new_regex = r"/[📑📥📤🗑️🔄⚖️🆕⏳🕒⏪📅🗓️📆✏️📁📎❌📊✅⚠️⚪🟢🟡🔴👑🛡️👁️👥👤➕🏷️🏢🌐📦🧪⚙️📋]/g"
content = content.replace(old_regex, new_regex)

with open('src/utils/emoji.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
