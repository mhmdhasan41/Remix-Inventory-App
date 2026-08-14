const fs = require('fs');
let content = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

const targetStr = `  const iframe = document.createElement('iframe');`;

const preflightLogic = `
  // Preflight validation
  const sourceRecordIds = [];
  if (!Array.isArray(data.tables)) throw new Error('data.tables is missing or invalid');
  data.tables.forEach((t, tIdx) => {
    if (!Array.isArray(t.recordIds)) throw new Error(\`الجدول \${tIdx} يفتقد recordIds\`);
    if (t.recordIds.length !== t.rows.length) throw new Error(\`الجدول \${tIdx}: عدد recordIds (\${t.recordIds.length}) لا يطابق rows (\${t.rows.length})\`);
    const tableIds = [];
    const idSet = new Set();
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
  
  const rowIdentityMap = new WeakMap();
`;

content = content.replace(targetStr, preflightLogic + '\n' + targetStr);
fs.writeFileSync('src/utils/printHtml.ts', content);
