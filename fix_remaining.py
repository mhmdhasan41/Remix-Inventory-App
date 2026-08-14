import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add import if renderOption is needed
    if 'renderOption' not in content and '<MenuItem' in content:
        import_stmt = "import { renderOption } from '../utils/emoji';\n"
        imports = list(re.finditer(r'^import .*?;?$', content, re.MULTILINE))
        if imports:
            last_import = imports[-1]
            content = content[:last_import.end()] + '\n' + import_stmt + content[last_import.end():]

    # Find all MenuItems that don't have renderOption
    # We want to replace <MenuItem ...>TEXT</MenuItem> with <MenuItem ...>{renderOption("TEXT")}</MenuItem>
    
    def replacer(match):
        attrs = match.group(1)
        text_content = match.group(2).strip()
        
        # if already uses renderOption or contains tags, skip
        if 'renderOption' in text_content or '<' in text_content:
            return match.group(0)

        # we can pass dynamicType based on context or leave it out
        # check if it's an expression like {cat.name}
        if text_content.startswith('{') and text_content.endswith('}'):
            expr = text_content[1:-1].strip()
            if 'cat.name' in expr or 'category' in expr.lower():
                return f'<MenuItem{attrs}>{{renderOption({expr}, "category")}}</MenuItem>'
            elif 'store' in expr.lower():
                return f'<MenuItem{attrs}>{{renderOption({expr}, "storehouse")}}</MenuItem>'
            elif 'emp' in expr.lower() or 'partner' in expr.lower() or 'p' == expr:
                return f'<MenuItem{attrs}>{{renderOption({expr}, "partner")}}</MenuItem>'
            elif 'u' == expr: # unit
                return f'<MenuItem{attrs}>{{renderOption({expr})}}</MenuItem>'
            else:
                return f'<MenuItem{attrs}>{{renderOption({expr})}}</MenuItem>'
        
        clean_text = text_content
        return f'<MenuItem{attrs}>{{renderOption("{clean_text}")}}</MenuItem>'

    content = re.sub(r'<MenuItem([^>]*)>\s*(.*?)\s*</MenuItem>', replacer, content, flags=re.DOTALL)
    
    # Custom fix for Reports.tsx category lines spanning multiple lines
    def replacer_reports(match):
        attrs = match.group(1)
        return f'<MenuItem{attrs}>{{renderOption(cat.name, "category")}}</MenuItem>'
    
    content = re.sub(r'<MenuItem([^>]*)>\s*\{cat\.name\}\s*</MenuItem>', replacer_reports, content, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('src/pages/Reports.tsx')
process_file('src/pages/Materials.tsx')
process_file('src/components/MaterialFormDialog.tsx')
process_file('src/components/CreateTransactionModal.tsx')
process_file('src/pages/AuditLogs.tsx')

