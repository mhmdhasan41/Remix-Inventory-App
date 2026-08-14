const XLSX = require('xlsx');
const fs = require('fs');

// generate materials (30)
const materialsData = [
  ["الكود", "الاسم", "النوع", "التصنيف", "الوحدة", "حد الأمان", "موقع التخزين", "ملاحظات", "الشركة المصنعة", "تاريخ الإنتاج", "تاريخ الانتهاء", "درجة الخطورة"],
];

const categories = [
    { name: 'مبيدات حشرية', prefix: 'PES', u: 'لتر', s: 'مستودع السموم والمبيدات', type: 'مبيد' },
    { name: 'معقمات ومطهرات', prefix: 'SAN', u: 'جالون', s: 'المخزن الرئيسي', type: 'مادة' },
    { name: 'أدوات ومعدات رش', prefix: 'EQP', u: 'قطعة', s: 'مستودع الأجهزة والمعدات', type: 'مادة' },
    { name: 'مصائد قوارض', prefix: 'TRP', u: 'قطعة', s: 'مستودع طعوم القوارض', type: 'مادة' },
    { name: 'كلور ومواد كيميائية', prefix: 'CHM', u: 'كجم', s: 'المخزن الرئيسي', type: 'مادة' },
];

let counter = 1000;
for(let i=0; i<30; i++) {
    const cat = categories[i % 5];
    const code = `${cat.prefix}-${counter + i}`;
    materialsData.push([
        code,
        `${cat.name} صنف ${i+1}`,
        cat.type,
        cat.name,
        cat.u,
        (Math.floor(Math.random() * 50) + 10).toString(),
        cat.s,
        `ملاحظة حول الصنف ${i+1}`,
        'الشركة الأهلية للصناعة والتجارة',
        '2025-01-01',
        '2028-12-31',
        cat.type === 'مبيد' ? 'شديدة' : 'آمن'
    ]);
}

const ws_materials = XLSX.utils.aoa_to_sheet(materialsData);
const wb_materials = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb_materials, ws_materials, "الأصناف");
XLSX.writeFile(wb_materials, "public/نموذج_الأصناف_معبأ.xlsx");

// generate transactions (50)
const transactionsData = [
  ["كود الصنف", "نوع الحركة", "الكمية", "المورد أو المستلم", "التاريخ", "ملاحظات"],
];

const types = ["وارد", "صادر", "تالف_مستهلك", "تالف_مستهلك"];
const codes = materialsData.slice(1).map(row => row[0]);

for(let i=0; i<50; i++) {
    const code = codes[i % 30]; // pick a code from generated
    // Prefer وارد or صادر more
    let type = "وارد";
    if (i > 15) type = "صادر";
    if (i > 40) type = "تالف_مستهلك";
    
    // Add some random variety
    if (i % 7 === 0) type = "وارد";

    const qty = Math.floor(Math.random() * 50) + 10;
    let person = "";
    if(type === "وارد") {
        person = "شركة التوريدات الطبية " + ((i%3)+1);
    } else if(type === "صادر") {
        person = "قسم مكافحة الآفات " + ((i%4)+1);     
    } else {
         person = "إتلاف مخزني داخلي";
    }

    let day = (i%28)+1;
    let dayStr = day < 10 ? '0'+day : day;

    transactionsData.push([
        code,
        type,
        qty.toString(),
        person,
        `2026-06-${dayStr}`,
        `حركة ${type} كمية ${qty} للصنف ${code}`
    ]);
}

const ws_trans = XLSX.utils.aoa_to_sheet(transactionsData);
const wb_trans = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb_trans, ws_trans, "الحركات");
XLSX.writeFile(wb_trans, "public/نموذج_الحركات_معبأ.xlsx");
console.log("Generated Successfully");
