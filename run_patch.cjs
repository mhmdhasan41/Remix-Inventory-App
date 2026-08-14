const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

// 1. Add map setting
code = code.replace(
  "const tr = idoc.createElement('tr');",
  "const tr = idoc.createElement('tr');\n      rowIdentityMap.set(tr, { tableIndex: tIdx, recordId: sourceRecordIds[tIdx][rIdx] });"
);

// 2. Replace validation
const startMarker = "// We lost the map. I'll just remove the identity check completely for now.";
const endMarker = "// 8. Strict Audit Validations";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const replacement = `
  const renderedRecordIds: string[][] = Array.from({ length: sourceRecordIds.length }, () => [] as string[]);
  const allDataRows = Array.from(idoc.querySelectorAll('.table-container tbody > tr')) as HTMLTableRowElement[];
  
  let lastSeenTableIndex = -1;
  allDataRows.forEach((tr, domIdx) => {
    if (tr.classList.contains('placeholder-row')) return;
    
    const identity = rowIdentityMap.get(tr);
    if (!identity) {
      throw new Error(\`صف DOM \${domIdx} مجهول الهوية ولم يتم إنشاؤه عبر المصدر\`);
    }
    
    if (identity.tableIndex < 0 || identity.tableIndex >= sourceRecordIds.length) {
      throw new Error(\`الجدول \${identity.tableIndex} خارج النطاق للصف \${domIdx}\`);
    }
    if (identity.tableIndex < lastSeenTableIndex) {
      throw new Error(\`تداخل غير منطقي: الجدول \${identity.tableIndex} ظهر بعد الجدول \${lastSeenTableIndex}\`);
    }
    lastSeenTableIndex = identity.tableIndex;
    renderedRecordIds[identity.tableIndex].push(identity.recordId);
  });
  
  sourceRecordIds.forEach((sourceTblIds, tIdx) => {
    const renderedTblIds = renderedRecordIds[tIdx];
    if (sourceTblIds.length !== renderedTblIds.length) {
      throw new Error(\`الجدول \${tIdx}: عدد السجلات المرسومة (\${renderedTblIds.length}) لا يطابق الأصلية (\${sourceTblIds.length})\`);
    }
    const renderedSet = new Set<string>();
    renderedTblIds.forEach((id, rIdx) => {
      if (renderedSet.has(id)) throw new Error(\`الجدول \${tIdx}: تكرار السجل المرسوم في الصف \${rIdx}\`);
      renderedSet.add(id);
      if (id !== sourceTblIds[rIdx]) {
        throw new Error(\`الجدول \${tIdx} الصف \${rIdx}: ترتيب غير متطابق أو استبدال\`);
      }
    });
  });

  `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

fs.writeFileSync('src/utils/printHtml.ts', code);
