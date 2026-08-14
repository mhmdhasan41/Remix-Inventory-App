with open('src/pages/Reports.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "</TableContainer>" in line and i > 1500:
        new_lines.append(line)
        new_lines.append("      </Paper>\n")
        new_lines.append("    </Box>\n")
        new_lines.append("  );\n")
        new_lines.append("}\n")
        break
    else:
        new_lines.append(line)

with open('src/pages/Reports.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
