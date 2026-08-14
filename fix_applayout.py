import re

with open('src/layouts/AppLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import if renderOption is needed
if 'renderOption' not in content:
    import_stmt = "import { renderOption } from '../utils/emoji';\n"
    imports = list(re.finditer(r'^import .*?;?$', content, re.MULTILINE))
    if imports:
        last_import = imports[-1]
        content = content[:last_import.end()] + '\n' + import_stmt + content[last_import.end():]

target1 = """                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🌐 جميع المستودعات (شامل)
                  </Box>"""
replacement1 = """                  {renderOption("جميع المستودعات (شامل)")}"""

target2 = """                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🏢 {wh}
                    </Box>"""
replacement2 = """                  {renderOption(wh, "storehouse")}"""

content = content.replace(target1, replacement1)
content = content.replace(target2, replacement2)

with open('src/layouts/AppLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
