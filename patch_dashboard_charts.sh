#!/bin/bash
cat src/pages/Dashboard.tsx | awk '
/const warehouseCounts:/ {
    print "  // Recharts Dynamic Dataset 3: Additions vs Withdrawals per warehouse";
    print "  const warehouseInOut: { [key: string]: { in: number, out: number } } = {};";
    print "  settings.storehouses.forEach(wh => warehouseInOut[wh] = { in: 0, out: 0 });";
    print "  warehouseInOut[\"المخزن الرئيسي\"] = { in: 0, out: 0 };";
    print "  ledgerTx.forEach(tx => {";
    print "    const wh = tx.storehouse || \"المخزن الرئيسي\";";
    print "    if (!warehouseInOut[wh]) warehouseInOut[wh] = { in: 0, out: 0 };";
    print "    if (tx.transactionType === \"وارد\" || tx.transactionType === \"افتتاحي\" || (tx.transactionType === \"تحويل\" && tx.transferType === \"in\") || (tx.transactionType === \"تسوية\" && (tx.transferType === \"in\" || tx.quantity >= 0))) {";
    print "      warehouseInOut[wh].in += Math.abs(tx.quantity);";
    print "    } else {";
    print "      warehouseInOut[wh].out += Math.abs(tx.quantity);";
    print "    }";
    print "  });";
    print "  const warehouseInOutData = Object.keys(warehouseInOut).filter(wh => warehouseInOut[wh].in > 0 || warehouseInOut[wh].out > 0 || wh === selectedStorehouse).map(wh => ({ name: wh, وارد: warehouseInOut[wh].in, صادر: warehouseInOut[wh].out }));";
    print "  ";
    print "  // Calculate most consumed item (current month)";
    print "  const thisMonthTx = ledgerTx.filter(t => t.date.startsWith(thisMonthStr) && (t.transactionType === \"صادر\" || t.transactionType === \"مستهلك\"));";
    print "  const consumptionMap: {[key: string]: {name: string, qty: number}} = {};";
    print "  thisMonthTx.forEach(t => {";
    print "    if (!consumptionMap[t.itemId]) consumptionMap[t.itemId] = {name: t.itemName, qty: 0};";
    print "    consumptionMap[t.itemId].qty += Math.abs(t.quantity);";
    print "  });";
    print "  let mostConsumedItem = { name: \"لا يوجد\", qty: 0 };";
    print "  Object.values(consumptionMap).forEach(v => {";
    print "    if (v.qty > mostConsumedItem.qty) mostConsumedItem = v;";
    print "  });";
    print "";
}
{ print; }
' > src/pages/Dashboard.tsx.new
mv src/pages/Dashboard.tsx.new src/pages/Dashboard.tsx
