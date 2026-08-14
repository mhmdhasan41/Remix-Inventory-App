#!/bin/bash
cat src/pages/Transactions.tsx | awk '
BEGIN { skip = 0; }
/<Box sx={{ textAlign: '\''center'\'', mt: 4, pt: 3, borderTop: '\''1px dashed #000'\'' }}>/ {
    print;
    skip = 1;
    next;
}
/<Typography sx={{ fontFamily: '\''monospace'\'', letterSpacing: '\''4px'\'', color: '\''#000'\'', fontSize: '\''11px'\'', fontWeight: '\''bold'\'' }}>/ {
    if (skip == 1) { next; }
    print;
    next;
}
{ print; }
' > src/pages/Transactions.tsx.new
mv src/pages/Transactions.tsx.new src/pages/Transactions.tsx
