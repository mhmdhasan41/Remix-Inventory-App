import re

with open('src/pages/Reports.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """            >
              <MenuItem value="all">كافة الحركات</MenuItem>
              <MenuItem value="افتتاحي">رصيد افتتاحي</MenuItem>
              <MenuItem value="وارد">وارد (توريد)</MenuItem>
              <MenuItem value="صادر">صادر (صرف)</MenuItem>
              <MenuItem value="تحويل">تحويل مخزني</MenuItem>
              <MenuItem value="تسوية">تسوية جردية</MenuItem>
              <MenuItem value="مستهلك">مستهلك (إهلاك)</MenuItem>
            </TextField>"""

new_block = """            >
              <MenuItem value="all">كافة الحركات</MenuItem>
              <MenuItem value="وارد">وارد 📥</MenuItem>
              <MenuItem value="صادر">صادر 📤</MenuItem>
              <MenuItem value="مستهلك">مستهلك 🗑️</MenuItem>
              <MenuItem value="تحويل">تحويل 🔄</MenuItem>
              <MenuItem value="تسوية">تسوية ⚖️</MenuItem>
              <MenuItem value="افتتاحي">افتتاحي 🆕</MenuItem>
            </TextField>"""

content = content.replace(old_block, new_block)

with open('src/pages/Reports.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
