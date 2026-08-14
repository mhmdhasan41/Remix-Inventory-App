#!/bin/bash
cat src/pages/Transactions.tsx | awk '
BEGIN { skip = 0; }
/<Typography variant="caption" sx={{ color: liveStockSim.isNegative \? '\''#b91c1c'\'' : '\''#0284c7'\'', display: '\''block'\'', mt: 0.5 }}>/ {
    print "                        <Typography variant=\"caption\" sx={{ color: liveStockSim.isNegative ? '\''#b91c1c'\'' : '\''#0284c7'\'', display: '\''block'\'', mt: 0.5 }}>";
    print "                          الرصيد المتوفر حالياً في مستودع <strong>({liveStockSim.storehouseName})</strong>: <strong>{liveStockSim.current} {liveStockSim.unit}</strong> | ";
    print "                          الرصيد المتوقع للمستودع بعد تنفيذ الحركة: <strong style={{ fontSize: '\''1.05rem'\'' }}>{liveStockSim.simulated} {liveStockSim.unit}</strong>";
    print "                          {liveStockSim.globalStock !== null && (";
    print "                            <><br/>الرصيد الكلي المتوفر حالياً لجميع المستودعات: <strong>{liveStockSim.globalStock} {liveStockSim.unit}</strong> | ";
    print "                            الرصيد الكلي المتوقع بعد تنفيذ الحركة: <strong style={{ fontSize: '\''1.05rem'\'' }}>{liveStockSim.simulatedGlobalAfter} {liveStockSim.unit}</strong></>";
    print "                          )}";
    print "                        </Typography>";
    skip = 1;
    next;
}
/                        {liveStockSim.isNegative && \(/ {
    if (skip) { skip = 0; }
    print;
    next;
}
{ if (!skip) print; }
' > src/pages/Transactions.tsx.new3
mv src/pages/Transactions.tsx.new3 src/pages/Transactions.tsx
