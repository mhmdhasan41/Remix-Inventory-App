#!/bin/bash
cat src/pages/Transactions.tsx | awk '
BEGIN { skip = 0; }
/const getLiveStockStatus = \(\) => {/ {
    print "  const getLiveStockStatus = () => {";
    print "    if (!watchItem) return null;";
    print "    const targetMat = materials.find(m => m.id === watchItem.id);";
    print "    const storehouse = watchStorehouse || targetMat?.storageLocation || '\''المخزن الرئيسي'\'';";
    print "    const currentStock = dataService.getItemStockByStorehouse(watchItem.id, storehouse);";
    print "    ";
    print "    const qty = Number(watchQty) || 0;";
    print "    let simulatedAfter = currentStock;";
    print "    if (watchTxType === '\''وارد'\'' || watchTxType === '\''افتتاحي'\'') {";
    print "      simulatedAfter += qty;";
    print "    } else if (watchTxType === '\''تسوية'\'') {";
    print "      simulatedAfter += qty;";
    print "    } else { // صادر, مستهلك, تحويل";
    print "      simulatedAfter -= qty;";
    print "    }";
    print "";
    print "    let globalStock: number | null = null;";
    print "    let simulatedGlobalAfter: number | null = null;";
    print "    if (selectedStorehouse === '\''all'\'') {";
    print "       globalStock = dataService.getItemStockByStorehouse(watchItem.id, '\''all'\'');";
    print "       simulatedGlobalAfter = globalStock;";
    print "       if (watchTxType === '\''وارد'\'' || watchTxType === '\''افتتاحي'\'') {";
    print "         simulatedGlobalAfter += qty;";
    print "       } else if (watchTxType === '\''تسوية'\'') {";
    print "         simulatedGlobalAfter += qty;";
    print "       } else {";
    print "         simulatedGlobalAfter -= qty;";
    print "       }";
    print "    }";
    print "";
    print "    return {";
    print "      current: currentStock,";
    print "      simulated: simulatedAfter,";
    print "      unit: watchItem.unit,";
    print "      isNegative: simulatedAfter < 0,";
    print "      storehouseName: storehouse,";
    print "      globalStock,";
    print "      simulatedGlobalAfter";
    print "    };";
    print "  };";
    skip = 1;
    next;
}
/const liveStockSim = getLiveStockStatus\(\);/ {
    if (skip) { skip = 0; }
    print;
    next;
}
{ if (!skip) print; }
' > src/pages/Transactions.tsx.new4
mv src/pages/Transactions.tsx.new4 src/pages/Transactions.tsx
