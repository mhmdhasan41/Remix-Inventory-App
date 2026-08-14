const fs = require('fs');
let test = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

test = test.replace(
  /const c4Integrity: any = snapshot4\.pageTexts \? verifyContentIntegrity\(.*\) : \{\};/g, 
  "const c4Integrity: any = snapshot4.pageTexts ? verifyContentIntegrity(snapshot4.pageTexts, c4TitleToken, c4HeaderToken, c4FirstRowToken, sourceRowTokensC4) : {};"
);

fs.writeFileSync('tests/run_real_integration_test.ts', test);
