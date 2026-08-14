const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

const replacement1 = `  const rowIdentityMap = new WeakMap<HTMLTableRowElement, { tableIndex: number, recordId: string }>();\n  const dataTbodyIdentityMap = new WeakMap<HTMLTableSectionElement, number>();`;

code = code.replace(`  const rowIdentityMap = new WeakMap<HTMLTableRowElement, { tableIndex: number, recordId: string }>();`, replacement1);

const replacement2 = `      currentTbodyEl = idoc.createElement('tbody');\n      dataTbodyIdentityMap.set(currentTbodyEl, tIdx);\n      currentTableEl.appendChild(currentTbodyEl);`;

code = code.replace(`      currentTbodyEl = idoc.createElement('tbody');\n      currentTableEl.appendChild(currentTbodyEl);`, replacement2);


const replacement3 = `  // Final DOM scan for record IDs
  const renderedRecordIds: string[][] = Array.from({ length: sourceRecordIds.length }, () => [] as string[]);
  
  const allTbodyEls = Array.from(idoc.querySelectorAll('#pages-container .table-container > table > tbody')) as HTMLTableSectionElement[];
  let lastSeenTableIndex = -1;
  
  allTbodyEls.forEach((tbody, tbodyDomIdx) => {
    const tableIndex = dataTbodyIdentityMap.get(tbody);
    if (tableIndex === undefined) {
      throw new Error(\`جسم جدول (tbody) مجهول الهوية في DOM ولم يتم إنشاؤه عبر المحرك\`);
    }
    if (tableIndex < lastSeenTableIndex) {
      throw new Error(\`تداخل أو تراجع في ترتيب الجداول (الجدول \${tableIndex} أتى بعد \${lastSeenTableIndex})\`);
    }
    lastSeenTableIndex = tableIndex;

    const trs = Array.from(tbody.children) as HTMLElement[];
    trs.forEach((tr, trDomIdx) => {
      if (tr.tagName !== 'TR') throw new Error(\`عنصر غير TR وجد داخل tbody للجدول \${tableIndex}\`);
      const identity = rowIdentityMap.get(tr as HTMLTableRowElement);
      if (!identity) throw new Error(\`صف DOM ضمن الجدول \${tableIndex} مجهول الهوية (غير مسجل في WeakMap)\`);
      if (identity.tableIndex !== tableIndex) throw new Error(\`صف DOM ينتمي للجدول \${identity.tableIndex} تم نقله إلى الجدول \${tableIndex}\`);
      
      renderedRecordIds[tableIndex].push(identity.recordId);
    });
  });

  if (sourceRecordIds.length !== data.tables.length || renderedRecordIds.length !== data.tables.length) {
    throw new Error(\`خطأ هيكلي: عدد جداول source أو rendered لا يطابق data.tables\`);
  }

  sourceRecordIds.forEach((sourceTblIds, tIdx) => {
    const renderedTblIds = renderedRecordIds[tIdx];
    if (sourceTblIds.length !== renderedTblIds.length) {
      throw new Error(\`الجدول \${tIdx}: عدد السجلات المرسومة (\${renderedTblIds.length}) لا يطابق الأصلية (\${sourceTblIds.length})\`);
    }
    const renderedSet = new Set<string>();
    renderedTblIds.forEach((id, rIdx) => {
      if (renderedSet.has(id)) throw new Error(\`الجدول \${tIdx}: تكرار السجل المرسوم [\${id}]\`);
      renderedSet.add(id);
      if (id !== sourceTblIds[rIdx]) {
        throw new Error(\`الجدول \${tIdx} الصف \${rIdx}: ترتيب غير متطابق أو استبدال. متوقع [\${sourceTblIds[rIdx]}] وجد [\${id}]\`);
      }
    });
  });`;

// We must replace the existing final dom scan block
code = code.replace(/  \/\/ Final DOM scan for record IDs[\s\S]*?  \}\);\n  \}\);/m, replacement3);

fs.writeFileSync('src/utils/printHtml.ts', code);
