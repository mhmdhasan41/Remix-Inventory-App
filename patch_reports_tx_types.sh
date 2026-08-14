#!/bin/bash
cat src/pages/Reports.tsx | awk '
BEGIN { skip = 0; }
/<MenuItem value="all">كافة الحركات \(وارد \/ صادر \/ مستهلك\)<\/MenuItem>/ {
    print "              <MenuItem value=\"all\">كافة الحركات</MenuItem>";
    print "              <MenuItem value=\"افتتاحي\">رصيد افتتاحي</MenuItem>";
    print "              <MenuItem value=\"وارد\">وارد (توريد)</MenuItem>";
    print "              <MenuItem value=\"صادر\">صادر (صرف)</MenuItem>";
    print "              <MenuItem value=\"تحويل\">تحويل مخزني</MenuItem>";
    print "              <MenuItem value=\"تسوية\">تسوية جردية</MenuItem>";
    print "              <MenuItem value=\"مستهلك\">مستهلك (إهلاك)</MenuItem>";
    skip = 1;
    next;
}
/<MenuItem value="وارد">وارد فقط \(توريد أصناف\)<\/MenuItem>/ { if (skip) next; }
/<MenuItem value="صادر">صادر فقط \(تسليم جهات\)<\/MenuItem>/ { if (skip) next; }
/<MenuItem value="مستهلك">مستهلك فقط \(إهلاك وتلفيات\)<\/MenuItem>/ { if (skip) { skip = 0; next; } }
{ print; }
' > src/pages/Reports.tsx.new
mv src/pages/Reports.tsx.new src/pages/Reports.tsx
