import re

def fix(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the block from <MenuItem value="منخفض"> to the end of the مرتفع MenuItem
    # We will just replace it entirely with the clean renderOption versions.
    
    # We know what we want them to look like:
    replacement = """                  <MenuItem value="منخفض">{renderOption("منخفض")}</MenuItem>
                  <MenuItem value="متوسط">{renderOption("متوسط")}</MenuItem>
                  <MenuItem value="مرتفع">{renderOption("مرتفع")}</MenuItem>"""

    # We can just search for `<MenuItem value="منخفض">` and replace everything up to `مرتفع` closing tag.
    content = re.sub(r'<MenuItem value="منخفض">.*?</MenuItem>\s*<MenuItem value="متوسط">.*?</MenuItem>\s*<MenuItem value="مرتفع">.*?</MenuItem>', replacement, content, flags=re.DOTALL)

    # Some might already be partially broken (like the one with renderOption("منخفض")
    content = re.sub(r'<MenuItem value="منخفض">\{renderOption\("منخفض"\)\}</MenuItem>\s*<MenuItem value="متوسط">.*?</MenuItem>\s*<MenuItem value="مرتفع">.*?</MenuItem>', replacement, content, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix('src/pages/Materials.tsx')
fix('src/components/MaterialFormDialog.tsx')
