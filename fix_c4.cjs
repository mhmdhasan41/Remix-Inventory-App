const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

code = code.replace(/const t1RowsC4 = Array\.from\(\{ length: 15 \}, \(\_, i\) => \[\n.*?\n\s*\]\);/s, `const fixtureT1C4 = Array.from({ length: 15 }, (_, i) => {
      return {
        recordId: JSON.stringify(['case4', 't0', String(i)]),
        row: [
          \`\${i + 1}\`,
          \`C4_T1_R\${i + 1}_UNIQUE مادة كيميائية خاملة \${i + 1}\`,
          'مغلفة',
          '100'
        ]
      };
    });
    const t1RowsC4 = fixtureT1C4.map(f => f.row);
    const recordIdsT1C4 = fixtureT1C4.map(f => f.recordId);`);

code = code.replace(/const longTextC4[\s\S]*?const t2RowsC4 = Array\.from\(\{ length: 4 \}, \(\_, i\) => \[\n.*?\n\s*\]\);/s, `const fixtureT2C4 = Array.from({ length: 4 }, (_, i) => {
      return {
        recordId: JSON.stringify(['case4', 't1', String(i)]),
        row: [
          \`\${i + 1}\`,
          i === 0 ? \`\${c4FirstRowToken} C4_T2_R1_UNIQUE مادة حيوية شديدة الحساسية تتطلب ظروف تخزين خاصة جداً بعيداً عن الرطوبة ودرجات الحرارة العالية. \`.repeat(8) : \`C4_T2_R\${i + 1}_UNIQUE مادة إضافية\`,
          'مغلفة',
          '20'
        ]
      };
    });
    const t2RowsC4 = fixtureT2C4.map(f => f.row);
    const recordIdsT2C4 = fixtureT2C4.map(f => f.recordId);`);

code = code.replace(/\}, t1RowsC4, t2RowsC4, c4TitleToken, c4HeaderToken\);/, `}, t1RowsC4, t2RowsC4, recordIdsT1C4, recordIdsT2C4, c4TitleToken, c4HeaderToken);`);

code = code.replace(/const case4Run = await page.evaluate\(async \(t1RowsArg, t2RowsArg, tTitleTok, tHeaderTok\)/, `const case4Run = await page.evaluate(async (t1RowsArg, t2RowsArg, recIdsT1, recIdsT2, tTitleTok, tHeaderTok)`);

code = code.replace(/rows: t1RowsArg/, `rows: t1RowsArg, recordIds: recIdsT1`);
code = code.replace(/rows: t2RowsArg\s*\}\s*\]/s, `rows: t2RowsArg, recordIds: recIdsT2 }]`);

fs.writeFileSync('tests/run_real_integration_test.ts', code);
