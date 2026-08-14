const fs = require('fs');
let content = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

// Fix recordIdsC1 not defined around line 306. Wait, I replaced it with fixC1.map in a previous script, but maybe it didn't apply properly.
content = content.replace(
  `            recordIds: recordIdsC1,`,
  `            recordIds: fixC1.map(f => f.id),`
);
content = content.replace(
  `            recordIds: recordIdsC2,`,
  `            recordIds: fixC2.map(f => f.id),`
);
content = content.replace(
  `            recordIds: t1RecordIds,`,
  `            recordIds: fixC4T1.map(f => f.id),`
);
content = content.replace(
  `            recordIds: t2RecordIds,`,
  `            recordIds: fixC4T2.map(f => f.id),`
);
content = content.replace(
  `            recordIds: recordIdsC5,`,
  `            recordIds: fixC5.map(f => f.id),`
);
content = content.replace(
  `            recordIds: recordIdsRec,`,
  `            recordIds: fixRec.map(f => f.id),`
);

fs.writeFileSync('tests/run_real_integration_test.ts', content);
