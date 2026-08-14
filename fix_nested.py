import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Clean up any bad HTML comments if they exist from my previous sed
    content = content.replace('<!--\n                            منخفض 🟢\n                          </MenuItem>', '')
    content = content.replace('<!--\n                  منخفض 🟢\n                </MenuItem>', '')
    
    # Actually just fix it properly with a raw string replace
    # Materials.tsx
    content = content.replace('<MenuItem value="منخفض">{renderOption("منخفض")}</MenuItem>\n<!--\n                            منخفض 🟢\n                          </MenuItem>', '<MenuItem value="منخفض">{renderOption("منخفض")}</MenuItem>')
    content = content.replace('<MenuItem value="متوسط">\n                            متوسط 🟡\n                          </MenuItem>', '<MenuItem value="متوسط">{renderOption("متوسط")}</MenuItem>')
    content = content.replace('<MenuItem value="مرتفع">\n                            مرتفع 🔴\n                          </MenuItem>', '<MenuItem value="مرتفع">{renderOption("مرتفع")}</MenuItem>')

    # MaterialFormDialog.tsx
    content = content.replace('<MenuItem value="منخفض">{renderOption("منخفض")}</MenuItem>\n<!--\n                  منخفض 🟢\n                </MenuItem>', '<MenuItem value="منخفض">{renderOption("منخفض")}</MenuItem>')
    content = content.replace('<MenuItem value="متوسط">\n                  متوسط 🟡\n                </MenuItem>', '<MenuItem value="متوسط">{renderOption("متوسط")}</MenuItem>')
    content = content.replace('<MenuItem value="مرتفع">\n                  مرتفع 🔴\n                </MenuItem>', '<MenuItem value="مرتفع">{renderOption("مرتفع")}</MenuItem>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('src/pages/Materials.tsx')
process_file('src/components/MaterialFormDialog.tsx')

