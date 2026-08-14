const fs = require('fs');
let tx = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

tx = tx.replace(/rowBgColors: balanceRowBgColors\n          }\n        ],/g, 'rowBgColors: balanceRowBgColors,\n            recordIds: recordIds1ForIds\n          }\n        ],');

fs.writeFileSync('src/pages/Transactions.tsx', tx);
