const fs = require('fs');
let content = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

const targetStr = `  // 8. Strict Audit Validations`;
const finalScanLogic = `  // Final DOM scan for record IDs
  const renderedRecordIds = Array.from({ length: sourceRecordIds.length }, () => []);
  const allTbodyTrs = Array.from(idoc.querySelectorAll('tbody > tr'));
  let lastSeenTableIndex = -1;
  allTbodyTrs.forEach((tr, domIdx) => {
    const identity = rowIdentityMap.get(tr);
    if (!identity) throw new Error(\`صف DOM \${domIdx} مجهول الهوية، لا ينتمي للمصفوفة الأصلية\`);
    if (identity.tableIndex < 0 || identity.tableIndex >= sourceRecordIds.length) throw new Error(\`صف DOM \${domIdx}: فهرس الجدول \${identity.tableIndex} خارج النطاق\`);
    if (identity.tableIndex < lastSeenTableIndex) throw new Error(\`صف DOM \${domIdx}: تداخل جداول (الجدول \${identity.tableIndex} أتى بعد \${lastSeenTableIndex})\`);
    lastSeenTableIndex = identity.tableIndex;
    renderedRecordIds[identity.tableIndex].push(identity.recordId);
  });

  sourceRecordIds.forEach((sourceTblIds, tIdx) => {
    const renderedTblIds = renderedRecordIds[tIdx];
    if (sourceTblIds.length !== renderedTblIds.length) {
      throw new Error(\`الجدول \${tIdx}: عدد السجلات المرسومة (\${renderedTblIds.length}) لا يطابق الأصلية (\${sourceTblIds.length})\`);
    }
    const renderedSet = new Set();
    renderedTblIds.forEach((id, rIdx) => {
      if (renderedSet.has(id)) throw new Error(\`الجدول \${tIdx}: تكرار السجل المرسوم [\${id}]\`);
      renderedSet.add(id);
      if (id !== sourceTblIds[rIdx]) {
        throw new Error(\`الجدول \${tIdx} الصف \${rIdx}: ترتيب غير متطابق أو استبدال. متوقع [\${sourceTblIds[rIdx]}] وجد [\${id}]\`);
      }
    });
  });

  // 8. Strict Audit Validations`;

content = content.replace(targetStr, finalScanLogic);
fs.writeFileSync('src/utils/printHtml.ts', content);
