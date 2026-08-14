import re

def clean_comments(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find and remove any HTML comments or orphaned text from sed replacement
    content = re.sub(r'<!--.*?منخفض.*?</MenuItem>', '', content, flags=re.DOTALL)
    content = re.sub(r'<!--.*?متوسط.*?</MenuItem>', '', content, flags=re.DOTALL)
    content = re.sub(r'<!--.*?مرتفع.*?</MenuItem>', '', content, flags=re.DOTALL)

    # Clean any specific lines that start with <!--
    lines = content.split('\n')
    cleaned_lines = []
    for line in lines:
        if '<!--' in line and not line.strip().startswith('//'):
            pass # Skip line
        else:
            cleaned_lines.append(line)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(cleaned_lines))

clean_comments('src/pages/Materials.tsx')
clean_comments('src/components/MaterialFormDialog.tsx')

