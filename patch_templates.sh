#!/bin/bash
cat src/pages/Settings.tsx | awk '
/const handleDownloadTransactionsTemplate = \(\) => {/ {
    print "  const handleDownloadTransactionsTemplate = () => {";
    print "    const ws_data = [";
    print "      [\"كود الصنف\", \"نوع الحركة\", \"الكمية\", \"المستودع\", \"المورد أو المستلم\", \"التاريخ\", \"ملاحظات\"],";
    print "      [\"MAT-001\", \"وارد\", \"500\", \"المخزن الرئيسي\", \"شركة توريد الكيماويات الفلسطينية\", \"2026-01-12\", \"رصيد افتتاحي - حصة الربع الأول المخصصة لتطهير الآبار\"],";
    print "      [\"MAT-002\", \"وارد\", \"120\", \"المخزن الرئيسي\", \"الهلال الأحمر الفلسطيني\", \"2026-02-18\", \"رصيد افتتاحي - تسهيل ومساعدة مجتمعية لمكاتب وفرق الرش\"],";
    print "      [\"MAT-003\", \"وارد\", \"300\", \"مستودع شمال\", \"منظمة اليونيسيف العالمية\", \"2026-03-05\", \"رصيد افتتاحي - شحنة إمدادات الصيف للمياه والوقاية البيئية\"],";
    print "      [\"MAT-004\", \"وارد\", \"10\", \"المخزن الرئيسي\", \"مؤسسة التعاون الدولية\", \"2026-04-10\", \"رصيد افتتاحي - توريد خراطيم ومعدات ضغط عالي\"],";
    print "      [\"MAT-005\", \"صادر\", \"30\", \"المخزن الرئيسي\", \"برنامج حماية العمال البيئيين\", \"2026-05-01\", \"صرف وتسليم للميدان\"],";
    print "    ];";
    print "    const ws = XLSX.utils.aoa_to_sheet(ws_data);";
    print "    const wb = XLSX.utils.book_new();";
    print "    XLSX.utils.book_append_sheet(wb, ws, \"قيود الحركات\");";
    print "    XLSX.writeFile(wb, \"نموذج_الحركات_والمعاملات.xlsx\");";
    print "    setSuccessMsg('\''تم تنزيل قالب إكسل للقيود والحركات بنجاح!'\'');";
    print "  };";
    skip = 1;
    next;
}
/const handleImportTransactionsCSV =/ {
    if (skip) { skip = 0; }
}
{ if (!skip) print; }
' > src/pages/Settings.tsx.new2
mv src/pages/Settings.tsx.new2 src/pages/Settings.tsx
