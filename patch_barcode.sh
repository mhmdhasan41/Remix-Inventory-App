#!/bin/bash
cat src/pages/Transactions.tsx | awk '
BEGIN { skip = 0; }
/<Box sx={{ textAlign: '\''center'\'', mt: 4, pt: 3, borderTop: '\''1px dashed #000'\'' }}>/ {
    print "            <Box sx={{ textAlign: '\''center'\'', mt: 4, pt: 3, borderTop: '\''1px dashed #000'\'' }}>";
    print "              <Typography sx={{ fontFamily: '\''monospace'\'', letterSpacing: '\''4px'\'', color: '\''#000'\'', fontSize: '\''14px'\'', mb: 1 }}>";
    print "                ||||| | |||| || ||| | ||| |||| | | | {transactionToPrint.transactionNumber || transactionToPrint.id}";
    print "              </Typography>";
    print "              <Typography sx={{ fontFamily: '\''monospace'\'', color: '\''#000'\'', fontSize: '\''11px'\'', fontWeight: '\''bold'\'' }}>";
    print "                سند رسمي مشفر ومؤلف الكترونياً - رقم {transactionToPrint.transactionNumber || transactionToPrint.id}";
    print "              </Typography>";
    print "            </Box>";
    skip = 1;
    next;
}
/\* \* \* {transactionToPrint.transactionType === '\''وارد'\'' \? '\''سند توريد'\''/ { if (skip) next; }
/              <\/Typography>/ { if (skip) next; }
/            <\/Box>/ { if (skip) { skip = 0; next; } }
{ print; }
' > src/pages/Transactions.tsx.new
mv src/pages/Transactions.tsx.new src/pages/Transactions.tsx
