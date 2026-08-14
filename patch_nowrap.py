import re

with open('src/utils/printHtml.ts', 'r') as f:
    content = f.read()

# Modify measure-table generation
old_measure_table = """      row.forEach((cell, cIdx) => {
        const align = table.columnAlignments?.[cIdx] || 'right';
        tableHtml += `<td class="align-${align}">${cell}</td>`;
      });"""

new_measure_table = """      row.forEach((cell, cIdx) => {
        const align = table.columnAlignments?.[cIdx] || 'right';
        const headerText = table.headers[cIdx] ? table.headers[cIdx].replace(/<[^>]+>/g, '') : '';
        const noWrapKeywords = ['كود', 'رقم', 'تاريخ', 'وقت', 'كمية', 'رصيد', 'وحدة', 'رمز', 'حالة'];
        const isNoWrap = noWrapKeywords.some(kw => headerText.includes(kw));
        const nowrapStyle = isNoWrap ? ' white-space: nowrap;' : '';
        tableHtml += `<td class="align-${align}" style="${nowrapStyle}">${cell}</td>`;
      });"""
content = content.replace(old_measure_table, new_measure_table)

# Modify actual table generation
old_actual_table = """      rowData.forEach((cell, cIdx) => {
        const td = idoc.createElement('td');
        td.className = `align-${tableData.columnAlignments?.[cIdx] || 'right'}`;
        td.innerHTML = cell;
        tr.appendChild(td);
      });"""

new_actual_table = """      rowData.forEach((cell, cIdx) => {
        const td = idoc.createElement('td');
        td.className = `align-${tableData.columnAlignments?.[cIdx] || 'right'}`;
        const headerText = tableData.headers[cIdx] ? tableData.headers[cIdx].replace(/<[^>]+>/g, '') : '';
        const noWrapKeywords = ['كود', 'رقم', 'تاريخ', 'وقت', 'كمية', 'رصيد', 'وحدة', 'رمز', 'حالة'];
        if (noWrapKeywords.some(kw => headerText.includes(kw))) {
          td.style.whiteSpace = 'nowrap';
        }
        td.innerHTML = cell;
        tr.appendChild(td);
      });"""
content = content.replace(old_actual_table, new_actual_table)

with open('src/utils/printHtml.ts', 'w') as f:
    f.write(content)
print("done")
