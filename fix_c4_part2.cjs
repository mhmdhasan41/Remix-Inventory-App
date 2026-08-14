const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

code = code.replace(/const case4Run = await page\.evaluate\(async \(t1Rows, t2Rows, titleTok, headerTok\) => \{/, `const case4Run = await page.evaluate(async (t1Rows, t2Rows, recordIdsT1C4, recordIdsT2C4, titleTok, headerTok) => {`);

fs.writeFileSync('tests/run_real_integration_test.ts', code);
