const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

code = code.replace(/const rowIdentityMap = new Map[^;]+;/g, '');
code = code.replace(/const dataTbodyIdentityMap = new Map[^;]+;/g, '');

code = code.replace(/rowIdentityMap\.set\(tr, \{ tableIndex: tIdx, recordId: sourceRecordIds\[tIdx\]\[rIdx\] \}\);/g, `tr.setAttribute('data-table-index', tIdx.toString());
      tr.setAttribute('data-record-id', sourceRecordIds[tIdx][rIdx]);`);

code = code.replace(/dataTbodyIdentityMap\.set\(currentTbodyEl, tIdx\);/g, `currentTbodyEl.setAttribute('data-table-index', tIdx.toString());`);

// Fix the read part
code = code.replace(/const identity = rowIdentityMap\.get\(tr\);/g, `const identity = { tableIndex: parseInt(tr.getAttribute('data-table-index') || '-1', 10), recordId: tr.getAttribute('data-record-id') || '' };`);
code = code.replace(/if \(!identity\) throw new Error[^;]+;/g, `if (!identity.recordId) throw new Error(\`صف DOM \${domIdx} مجهول الهوية، لا ينتمي للمصفوفة الأصلية\`);`);

fs.writeFileSync('src/utils/printHtml.ts', code);
