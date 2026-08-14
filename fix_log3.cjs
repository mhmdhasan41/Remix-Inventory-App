const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

code = code.replace(/tr\.setAttribute\('data-record-id', sourceRecordIds\[tIdx\]\[rIdx\]\);/, `
      const recId = sourceRecordIds[tIdx][rIdx];
      if (!recId) {
         throw new Error("Missing recId for table " + tIdx + " row " + rIdx + ". sourceRecordIds length: " + sourceRecordIds.length + " idsForThisTable length: " + sourceRecordIds[tIdx].length);
      }
      tr.setAttribute('data-record-id', recId);
`);

fs.writeFileSync('src/utils/printHtml.ts', code);
