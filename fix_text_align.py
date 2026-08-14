import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace textAlign: 'right' with textAlign: 'start'
    content = re.sub(r"textAlign:\s*['\"]right['\"]", "textAlign: 'start'", content)
    # Replace textAlign: 'left' with textAlign: 'end'
    content = re.sub(r"textAlign:\s*['\"]left['\"]", "textAlign: 'end'", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))

