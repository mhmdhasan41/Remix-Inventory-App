const fs = require('fs');
let content = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

// The errors in the tests file are mostly related to puppeteer import and path resolution for printHtml, which we shouldn't touch since we can't add dependencies or modify config. But wait! I MUST modify tests/run_real_integration_test.ts to supply `recordIds` for each table!

const target1 = `const rowsC1 = Array.from({ length: 28 }, (_, i) => {
    return [
      String(i + 1),
      \`TRX-10\${i + 1}\`,
      new Date().toISOString().split('T')[0],
      'المخزن الرئيسي',
      i % 2 === 0 ? 'مادة أ' : 'مادة ب',
      'MAT-01',
      i % 3 === 0 ? 'وارد' : 'صادر',
      String(i * 10 + 5) + ' كجم',
      'مورد محلي'
    ];
  });`;

const replace1 = `
  const fixC1 = Array.from({ length: 28 }, (_, i) => ({
    id: JSON.stringify(['case1', 't0', String(i)]),
    row: [
      String(i + 1),
      \`TRX-10\${i + 1}\`,
      new Date().toISOString().split('T')[0],
      'المخزن الرئيسي',
      i % 2 === 0 ? 'مادة أ' : 'مادة ب',
      'MAT-01',
      i % 3 === 0 ? 'وارد' : 'صادر',
      String(i * 10 + 5) + ' كجم',
      'مورد محلي'
    ]
  }));
  const rowsC1 = fixC1.map(f => f.row);
  const recordIdsC1 = fixC1.map(f => f.id);
`;
content = content.replace(target1, replace1);
content = content.replace(`rows: rowsC1,`, `rows: rowsC1,\n            recordIds: recordIdsC1,`);

const target2 = `const rowsC2 = [
    ['MED-01', 'أجهزة تنفس', 'طبي', 'جهاز', '10', '15', 'المخزن أ'],
    ['MED-02', 'كمامات طبية', 'استهلاكي', 'علبة', '100', '120', 'المخزن ب']
  ];`;
const replace2 = `
  const fixC2 = [
    { id: JSON.stringify(['case2', 't0', 'MED-01']), row: ['MED-01', 'أجهزة تنفس', 'طبي', 'جهاز', '10', '15', 'المخزن أ'] },
    { id: JSON.stringify(['case2', 't0', 'MED-02']), row: ['MED-02', 'كمامات طبية', 'استهلاكي', 'علبة', '100', '120', 'المخزن ب'] }
  ];
  const rowsC2 = fixC2.map(f => f.row);
  const recordIdsC2 = fixC2.map(f => f.id);
`;
content = content.replace(target2, replace2);
content = content.replace(`rows: rowsC2,`, `rows: rowsC2,\n            recordIds: recordIdsC2,`);


const target3 = `  const t1Rows = Array.from({ length: 15 }, (_, i) => [
    \`ITEM-A-\${i + 1}\`,
    \`صنف أ - نموذج \${i + 1}\`,
    'المخزن الرئيسي',
    'تصنيف أ',
    String(100 + i * 5),
    'وحدة'
  ]);
  const t2Rows = [
    ['الرصيد الدفتري المتوفر بالمستودع قبل الحركة', '10:00 AM', 'مستمر', '150 وحدة']
  ];`;

const replace3 = `
  const fixC4T1 = Array.from({ length: 15 }, (_, i) => ({
    id: JSON.stringify(['case4', 't0', String(i)]),
    row: [\`ITEM-A-\${i + 1}\`, \`صنف أ - نموذج \${i + 1}\`, 'المخزن الرئيسي', 'تصنيف أ', String(100 + i * 5), 'وحدة']
  }));
  const fixC4T2 = [
    { id: JSON.stringify(['case4', 't1', 'longrow']), row: ['الرصيد الدفتري المتوفر بالمستودع قبل الحركة', '10:00 AM', 'مستمر', '150 وحدة'] }
  ];
  const t1Rows = fixC4T1.map(f => f.row);
  const t1RecordIds = fixC4T1.map(f => f.id);
  const t2Rows = fixC4T2.map(f => f.row);
  const t2RecordIds = fixC4T2.map(f => f.id);
`;
content = content.replace(target3, replace3);
content = content.replace(`rows: t1Rows,`, `rows: t1Rows,\n            recordIds: t1RecordIds,`);
content = content.replace(`rows: t2Rows,`, `rows: t2Rows,\n            recordIds: t2RecordIds,`);


const target4 = `const rowsC5 = [
    ['ERR-01', hugeParagraphs]
  ];`;
const replace4 = `
  const fixC5 = [
    { id: JSON.stringify(['case5', 't0', 'huge']), row: ['ERR-01', hugeParagraphs] }
  ];
  const rowsC5 = fixC5.map(f => f.row);
  const recordIdsC5 = fixC5.map(f => f.id);
`;
content = content.replace(target4, replace4);
content = content.replace(`rows: rowsC5,`, `rows: rowsC5,\n            recordIds: recordIdsC5,`);


const target5 = `  const t1RowsCandidate = Array.from({ length: 17 }, (_, i) => [
    \`ITEM-B-\${i + 1}\`,
    \`صنف ب - نموذج \${i + 1} تجربة التفاف طويلة جدا جدا جدا\`,
    'المستودع الجانبي',
    'تصنيف ب',
    String(50 + i * 2),
    'كجم'
  ]);
  const t2RowsCandidate = Array.from({ length: 6 }, (_, i) => [
    \`شرح مفصل للحركة رقم \${i + 1}\`,
    new Date().toLocaleTimeString(),
    'نهائي',
    \`\${i * 10} كجم\`
  ]);`;

const replace5 = `
  const fixC3T1 = Array.from({ length: 17 }, (_, i) => ({
    id: JSON.stringify(['case3', 't0', String(i)]),
    row: [\`ITEM-B-\${i + 1}\`, \`صنف ب - نموذج \${i + 1} تجربة التفاف طويلة جدا جدا جدا\`, 'المستودع الجانبي', 'تصنيف ب', String(50 + i * 2), 'كجم']
  }));
  const fixC3T2 = Array.from({ length: 6 }, (_, i) => ({
    id: JSON.stringify(['case3', 't1', String(i)]),
    row: [\`شرح مفصل للحركة رقم \${i + 1}\`, new Date().toLocaleTimeString(), 'نهائي', \`\${i * 10} كجم\`]
  }));
  const t1RowsCandidate = fixC3T1.map(f => f.row);
  const t1RecordIds = fixC3T1.map(f => f.id);
  const t2RowsCandidate = fixC3T2.map(f => f.row);
  const t2RecordIds = fixC3T2.map(f => f.id);
`;
content = content.replace(target5, replace5);
// The calibration loop uses evaluate, so we need to inject recordIds into evaluate
content = content.replace(
  `            tables: [
              {
                title: 'الجدول الأول (17 سطر)',
                headers: ['الكود', 'البيان والتفصيل', 'الموقع', 'النوع', 'الكمية', 'الوحدة'],
                rows: t1RowsCandidate,
                columnAlignments: ['center', 'right', 'center', 'center', 'center', 'center']
              },
              {
                title: 'الجدول الثاني (6 سطور)',
                headers: ['البيان والمرحلة', 'الوقت', 'نظام الجرد', 'الرصيد المؤكد الفعلي'],
                rows: t2RowsCandidate,
                columnAlignments: ['right', 'center', 'center', 'center']
              }
            ]`,
  `            tables: [
              {
                title: 'الجدول الأول (17 سطر)',
                headers: ['الكود', 'البيان والتفصيل', 'الموقع', 'النوع', 'الكمية', 'الوحدة'],
                rows: t1RowsCandidate,
                recordIds: t1RecordIds,
                columnAlignments: ['center', 'right', 'center', 'center', 'center', 'center']
              },
              {
                title: 'الجدول الثاني (6 سطور)',
                headers: ['البيان والمرحلة', 'الوقت', 'نظام الجرد', 'الرصيد المؤكد الفعلي'],
                rows: t2RowsCandidate,
                recordIds: t2RecordIds,
                columnAlignments: ['right', 'center', 'center', 'center']
              }
            ]`
);

// Recovery table
const target6 = `const rowsRec = [
    ['REC-01', 'نجاح التعافي من الفشل']
  ];`;
const replace6 = `
  const fixRec = [
    { id: JSON.stringify(['rec', 't0', 'ok']), row: ['REC-01', 'نجاح التعافي من الفشل'] }
  ];
  const rowsRec = fixRec.map(f => f.row);
  const recordIdsRec = fixRec.map(f => f.id);
`;
content = content.replace(target6, replace6);
content = content.replace(`rows: rowsRec,`, `rows: rowsRec,\n            recordIds: recordIdsRec,`);


fs.writeFileSync('tests/run_real_integration_test.ts', content);
