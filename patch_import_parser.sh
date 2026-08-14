#!/bin/bash
cat src/pages/Settings.tsx | awk '
/const supplierOrReceiver = String\(row\[3\]/ {
    print "          const storehouse = String(row[3] || targetItem.storageLocation || \"المخزن الرئيسي\").trim();";
    print "          const supplierOrReceiver = String(row[4] || \"\").trim() || \"الجهة المقابلة\";";
    print "          const dateStr = String(row[5] || \"\").trim() || new Date().toISOString().split(\"T\")[0];";
    print "          const notesValue = String(row[6] || \"\").trim() || \"\";";
    skip = 1;
    next;
}
/const dateStr = String\(row\[4\]/ { if (skip) next; }
/const notesValue = String\(row\[5\]/ { if (skip) { skip = 0; next; } }
/txData = {/ {
    inTxData = 1;
}
/itemCategory: targetItem.category,/ {
    if (inTxData) {
        print;
        print "            storehouse: storehouse,";
        next;
    }
}
/if \(txTypeStr !== '\''وارد'\'' && txTypeStr !== '\''صادر'\''/ {
    print "          if (txTypeStr !== \"وارد\" && txTypeStr !== \"صادر\" && txTypeStr !== \"مستهلك\" && txTypeStr !== \"تحويل\" && txTypeStr !== \"تسوية\" && txTypeStr !== \"افتتاحي\") {";
    print "            skippedCount++;";
    print "            errorLines.push(`السطر ${i + 1}: نوع الحركة غير معروف`);";
    print "            continue;";
    print "          }";
    skipCheck = 1;
    next;
}
/errorLines\.push\(\`السطر \$\{i \+ 1\}: نوع الحركة لابد من كونها: وارد \/ صادر \/ مستهلك\`\);/ { if(skipCheck) next; }
/continue;/ { if(skipCheck) { skipCheck = 0; next; } }
{ print; }
' > src/pages/Settings.tsx.new3
mv src/pages/Settings.tsx.new3 src/pages/Settings.tsx
