import re

with open('src/utils/printHtml.ts', 'r') as f:
    content = f.read()

old_table = """    let rowRows = table.rows.map((row, rowIndex) => {
      const bgColor = table.rowBgColors?.[rowIndex] ? `style="background-color: ${table.rowBgColors[rowIndex]}"` : '';
      const cells = row.map((cell, colIndex) => {
        const align = table.columnAlignments?.[colIndex] || 'right';
        return `<td class="align-${align}">${cell}</td>`;
      }).join('');"""

new_table = """    let rowRows = table.rows.map((row, rowIndex) => {
      const bgColor = table.rowBgColors?.[rowIndex] ? `style="background-color: ${table.rowBgColors[rowIndex]}"` : '';
      const cells = row.map((cell, colIndex) => {
        const align = table.columnAlignments?.[colIndex] || 'right';
        const headerText = table.headers[colIndex] ? table.headers[colIndex].replace(/<[^>]+>/g, '') : '';
        const noWrapKeywords = ['كود', 'رقم', 'تاريخ', 'وقت', 'كمية', 'رصيد', 'وحدة', 'رمز', 'حالة'];
        const isNoWrap = noWrapKeywords.some(kw => headerText.includes(kw));
        const nowrapStyle = isNoWrap ? ' white-space: nowrap;' : '';
        return `<td class="align-${align}" style="${nowrapStyle}">${cell}</td>`;
      }).join('');"""

content = content.replace(old_table, new_table)

with open('src/utils/printHtml.ts', 'w') as f:
    f.write(content)
print("done")
