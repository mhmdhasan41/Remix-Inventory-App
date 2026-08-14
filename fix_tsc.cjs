const fs = require('fs');

// Fix printHtml.ts
let printHtml = fs.readFileSync('src/utils/printHtml.ts', 'utf8');
printHtml = printHtml.replace(
  `const renderedRecordIds: string[][] = Array.from({ length: sourceRecordIds.length }, () => []);`,
  `const renderedRecordIds: string[][] = Array.from({ length: sourceRecordIds.length }, () => [] as string[]);`
);
fs.writeFileSync('src/utils/printHtml.ts', printHtml);

// Fix Transactions.tsx
let tx = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');
tx = tx.replace(/      const txId = requireStableStringPart\(item\.id, 'txId'\);\n      const recordIds0 = \[JSON\.stringify\(\['voucher_detail', txId\]\)\];\n      let recordIds1: string\[\] = \[\];\n/, '');
fs.writeFileSync('src/pages/Transactions.tsx', tx);

