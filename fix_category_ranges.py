import re

with open('src/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix handleAddCategory
add_category_target = """    if (prefixExists) {
      setErrorMsg('البادئة لهذه الفئة مستخدمة بالفعل في تصنيف آخر.');
      return;
    }

    const newConfig: CategoryConfig = {"""

add_category_replacement = """    if (prefixExists) {
      setErrorMsg('البادئة لهذه الفئة مستخدمة بالفعل في تصنيف آخر.');
      return;
    }

    const newStart = Number(catStart);
    const newEnd = Number(catEnd);
    const rangeOverlap = settings.categories.find(c => newStart <= c.endRange && newEnd >= c.startRange);
    if (rangeOverlap) {
      setErrorMsg(`المدى الرقمي يتعارض مع تصنيف "${rangeOverlap.name}" (${rangeOverlap.startRange} - ${rangeOverlap.endRange})`);
      return;
    }

    const newConfig: CategoryConfig = {"""

if add_category_target in content:
    content = content.replace(add_category_target, add_category_replacement)
else:
    print("Could not find add_category_target")

# Fix handleSaveEditDialog
edit_category_target = """    } else if (editDialog.type === 'category') {
       oldValue = settings.categories[editDialog.index].name;
       if (settings.categories.some((c, i) => i !== editDialog.index && c.name === trimmed)) { setErrorMsg('موجود مسبقاً'); return; }
       updated.categories[editDialog.index] = {"""

edit_category_replacement = """    } else if (editDialog.type === 'category') {
       oldValue = settings.categories[editDialog.index].name;
       if (settings.categories.some((c, i) => i !== editDialog.index && c.name === trimmed)) { setErrorMsg('موجود مسبقاً'); return; }

       const newStart = editDialog.startRange || updated.categories[editDialog.index].startRange;
       const newEnd = editDialog.endRange || updated.categories[editDialog.index].endRange;
       const rangeOverlap = settings.categories.find((c, i) => i !== editDialog.index && newStart <= c.endRange && newEnd >= c.startRange);
       if (rangeOverlap) {
         setErrorMsg(`المدى الرقمي يتعارض مع تصنيف "${rangeOverlap.name}" (${rangeOverlap.startRange} - ${rangeOverlap.endRange})`);
         return;
       }

       updated.categories[editDialog.index] = {"""

if edit_category_target in content:
    content = content.replace(edit_category_target, edit_category_replacement)
else:
    print("Could not find edit_category_target")

with open('src/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Settings updated successfully.")
