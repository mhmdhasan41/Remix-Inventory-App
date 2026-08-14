with open('src/pages/Reports.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('{renderOption("📅 تقرير كشف فترات الصلاحيات وحالة "الأصناف المشروطة بالصلاحية"")}', "{renderOption('تقرير كشف فترات الصلاحيات وحالة الأصناف المشروطة بالصلاحية', 'category')}")

with open('src/pages/Reports.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
