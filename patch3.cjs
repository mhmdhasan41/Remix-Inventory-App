const fs = require('fs');
let content = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

const targetStr = `      const tr = idoc.createElement('tr');`;
const replacementStr = `      const tr = idoc.createElement('tr');
      rowIdentityMap.set(tr, { tableIndex: tIdx, recordId: sourceRecordIds[tIdx][rIdx] });`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/utils/printHtml.ts', content);
