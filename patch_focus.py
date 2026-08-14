import os
import re

def patch_file(filepath, patterns):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filepath}")
    else:
        print(f"No changes made to {filepath}")


settings_patterns = [
    # catStart
    (r'(label="بداية التسلسل الرقمي"\s*placeholder="1000"\s*value=\{catStart\}\s*onChange=\{[^\}]+\})',
     r'\1\n                      onFocus={(e) => e.target.select()}'),
    # catEnd
    (r'(label="نهاية التسلسل الرقمي"\s*placeholder="2000"\s*value=\{catEnd\}\s*onChange=\{[^\}]+\})',
     r'\1\n                      onFocus={(e) => e.target.select()}'),
    # editDialog.startRange
    (r'(label="بداية المدى الرقمي"\s*value=\{editDialog\.startRange[^\}]+\}\s*onChange=\{[^\}]+\})',
     r'\1\n                    onFocus={(e) => e.target.select()}'),
    # editDialog.endRange
    (r'(label="نهاية المدى الرقمي"\s*value=\{editDialog\.endRange[^\}]+\}\s*onChange=\{[^\}]+\})',
     r'\1\n                    onFocus={(e) => e.target.select()}'),
    # editDialog.prefix
    (r'(label="البادئة \(الحروف\)"\s*margin="dense"\s*value=\{editDialog\.prefix[^\}]+\}\s*onChange=\{[^\}]+\})',
     r'\1\n                onFocus={(e) => e.target.select()}'),
    # editDialog.value
    (r'(label="الاسم"\s*margin="dense"\s*value=\{editDialog\.value\}\s*onChange=\{[^\}]+\})',
     r'\1\n            onFocus={(e) => e.target.select()}'),
    # partnerName
    (r'(label="اسم الشريك / الجهة"\s*value=\{partnerName\}\s*onChange=\{[^\}]+\}\s*margin="dense")',
     r'\1\n            onFocus={(e) => e.target.select()}'),
]

patch_file('src/pages/Settings.tsx', settings_patterns)

tx_patterns = [
    # quantity
    (r'(label="الكمية"\s*\{\.\.\.register\(\'quantity\'[^\)]+\)\})',
     r'\1\n                onFocus={(e) => e.target.select()}'),
]

patch_file('src/components/CreateTransactionModal.tsx', tx_patterns)

mat_dialog_patterns = [
    # initialStock
    (r'(label="الرصيد الإبتدائي الافتتاحي بالمستودع"\s*placeholder="مثال: 100"\s*disabled=\{!!selectedMaterial\}\s*\{\.\.\.register\(\'initialStock\'[^\)]+\)\})',
     r'\1\n                onFocus={(e) => e.target.select()}'),
    # minimumStock
    (r'(label="حد الأمان الأدنى"\s*placeholder="مثال: 10"\s*\{\.\.\.register\(\'minimumStock\'[^\)]+\)\})',
     r'\1\n                onFocus={(e) => e.target.select()}'),
]

patch_file('src/components/MaterialFormDialog.tsx', mat_dialog_patterns)

mat_patterns = [
    # physicalVal
    (r'(value=\{physicalVal\}\s*onChange=\{[^\}]+\})',
     r'\1\n                          onFocus={(e) => e.target.select()}'),
]

patch_file('src/pages/Materials.tsx', mat_patterns)
