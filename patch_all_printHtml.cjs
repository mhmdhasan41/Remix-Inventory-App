const fs = require('fs');
let content = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

// 1. Add recordIds to PrintData
content = content.replace(
  'rows: string[][];',
  'rows: string[][];\n    recordIds: string[];'
);

// 2. Add requireStableStringPart
const interfaceIndex = content.indexOf('export interface PrintData');
const helperFunction = `export function requireStableStringPart(value: unknown, context: string): string {
  if (typeof value !== 'string') {
    throw new Error(\`معرّف غير صالح [\${context}]: القيمة غائبة أو ليست نصاً (النوع: \${typeof value})\`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(\`معرّف غير صالح [\${context}]: القيمة نص فارغ\`);
  }
  return trimmed;
}

`;
content = content.slice(0, interfaceIndex) + helperFunction + content.slice(interfaceIndex);

// 3. Add Preflight to exportToPDF
const exportToPdfIndex = content.indexOf('export async function exportToPDF');
const iframeTargetStr = `  const iframe = document.createElement('iframe');`;
const iframeIndex = content.indexOf(iframeTargetStr, exportToPdfIndex);

const preflightLogic = `  // Preflight validation
  const sourceRecordIds: string[][] = [];
  if (!Array.isArray(data.tables)) throw new Error('data.tables is missing or invalid');
  data.tables.forEach((t, tIdx) => {
    if (!Array.isArray(t.recordIds)) throw new Error(\`الجدول \${tIdx} يفتقد recordIds\`);
    if (t.recordIds.length !== t.rows.length) throw new Error(\`الجدول \${tIdx}: عدد recordIds (\${t.recordIds.length}) لا يطابق rows (\${t.rows.length})\`);
    const tableIds: string[] = [];
    const idSet = new Set<string>();
    t.recordIds.forEach((id, rIdx) => {
      if (typeof id !== 'string') throw new Error(\`الجدول \${tIdx} الصف \${rIdx}: الهوية ليست نصاً\`);
      const trimmed = id.trim();
      if (!trimmed) throw new Error(\`الجدول \${tIdx} الصف \${rIdx}: الهوية نص فارغ\`);
      if (idSet.has(trimmed)) throw new Error(\`الجدول \${tIdx} الصف \${rIdx}: تكرار في الهوية [\${trimmed}]\`);
      idSet.add(trimmed);
      tableIds.push(trimmed);
    });
    sourceRecordIds.push(tableIds);
  });
  
  const rowIdentityMap = new WeakMap<HTMLTableRowElement, { tableIndex: number, recordId: string }>();
`;

content = content.slice(0, iframeIndex) + preflightLogic + '\n' + content.slice(iframeIndex);

// 4. Bind WeakMap
const exportToPdfIndex2 = content.indexOf('export async function exportToPDF');
const rowCreationTarget = `      const tr = idoc.createElement('tr');`;
const trIndex = content.indexOf(rowCreationTarget, exportToPdfIndex2);
const trReplacement = `      const tr = idoc.createElement('tr');
      rowIdentityMap.set(tr, { tableIndex: tIdx, recordId: sourceRecordIds[tIdx][rIdx] });`;
content = content.slice(0, trIndex) + trReplacement + content.slice(trIndex + rowCreationTarget.length);

// 5. Final Scan
const finalScanTarget = `  // 8. Strict Audit Validations`;
const finalScanIndex = content.indexOf(finalScanTarget, exportToPdfIndex2);

const finalScanLogic = `  // Final DOM scan for record IDs
  const renderedRecordIds: string[][] = Array.from({ length: sourceRecordIds.length }, () => []);
  const allTbodyTrs = Array.from(idoc.querySelectorAll('tbody > tr')) as HTMLTableRowElement[];
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
    const renderedSet = new Set<string>();
    renderedTblIds.forEach((id, rIdx) => {
      if (renderedSet.has(id)) throw new Error(\`الجدول \${tIdx}: تكرار السجل المرسوم [\${id}]\`);
      renderedSet.add(id);
      if (id !== sourceTblIds[rIdx]) {
        throw new Error(\`الجدول \${tIdx} الصف \${rIdx}: ترتيب غير متطابق أو استبدال. متوقع [\${sourceTblIds[rIdx]}] وجد [\${id}]\`);
      }
    });
  });

  // 8. Strict Audit Validations`;
content = content.slice(0, finalScanIndex) + finalScanLogic + content.slice(finalScanIndex + finalScanTarget.length);

fs.writeFileSync('src/utils/printHtml.ts', content);
