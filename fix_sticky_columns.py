import re
import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Original: sx={{ ... position: 'sticky', left: 0, ..., borderRight: '...' }}
    # We want it to be right: 0 and borderLeft so stylis flips them back to left: 0 and borderRight in RTL

    # 1. Replace 'left: 0' with 'right: 0' in sticky table cells
    content = re.sub(r"position:\s*'sticky',\s*left:\s*0", "position: 'sticky', right: 0", content)
    
    # 2. Replace borderRight with borderLeft in these sticky cell sx props
    # (Just where we know it's related to the action column)
    content = re.sub(r"borderRight:\s*'1px solid rgba\(226,\s*232,\s*240,\s*1\)'", "borderLeft: '1px solid rgba(226, 232, 240, 1)'", content)
    content = re.sub(r"borderRight:\s*'1px solid #e2e8f0'", "borderLeft: '1px solid #e2e8f0'", content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))

