import sys

file_path = "src/components/CreateTransactionModal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update liveStockSim dependency and logic
target_sim = """  // Live Simulation
  const liveStockSim = useMemo(() => {
    if (!watchItem) return null;
    const targetMat = materials.find(m => m.id === watchItem.id);
    if (!targetMat) return null;

    const currentStock = dataService.getItemStockByStorehouse(watchItem.id, watchStorehouse || 'المخزن الرئيسي');
    const qty = Number(watchQty) || 0;
    
    let simulatedAfter = currentStock;
    if (watchTxType === 'وارد' || watchTxType === 'افتتاحي' || (watchTxType === 'تسوية' && qty >= 0)) {
      simulatedAfter += qty;
    } else if (watchTxType === 'صادر' || watchTxType === 'مستهلك' || watchTxType === 'تحويل' || (watchTxType === 'تسوية' && qty < 0)) {
      simulatedAfter -= Math.abs(qty);
    }

    let globalStock: number | null = null;
    let simulatedGlobalAfter: number | null = null;
    if (globalStorehouseScope === 'all') {
      globalStock = dataService.getItemStockByStorehouse(watchItem.id, 'all');
      simulatedGlobalAfter = globalStock;
      if (watchTxType === 'وارد' || watchTxType === 'افتتاحي' || (watchTxType === 'تسوية' && qty >= 0)) {
        simulatedGlobalAfter += qty;
      } else if (watchTxType === 'صادر' || watchTxType === 'مستهلك' || (watchTxType === 'تسوية' && qty < 0)) {
        simulatedGlobalAfter -= Math.abs(qty);
      }
      // For transfer, global stock stays the same
    }

    return {
      current: currentStock,
      simulated: simulatedAfter,
      unit: watchItem.unit,
      isNegative: simulatedAfter < 0,
      storehouseName: watchStorehouse || 'المخزن الرئيسي',
      globalStock,
      simulatedGlobalAfter
    };
  }, [watchItem, watchStorehouse, watchQty, watchTxType, materials, globalStorehouseScope]);"""

replacement_sim = """  // Live Simulation
  const liveStockSim = useMemo(() => {
    if (!watchItem) return null;
    const targetMat = materials.find(m => m.id === watchItem.id);
    if (!targetMat) return null;

    const currentStock = dataService.getItemStockByStorehouse(watchItem.id, watchStorehouse || 'المخزن الرئيسي');
    const qty = Number(watchQty) || 0;
    
    let simulatedAfter = currentStock;
    if (watchTxType === 'وارد' || watchTxType === 'افتتاحي' || (watchTxType === 'تسوية' && qty >= 0)) {
      simulatedAfter += qty;
    } else if (watchTxType === 'صادر' || watchTxType === 'مستهلك' || watchTxType === 'تحويل' || (watchTxType === 'تسوية' && qty < 0)) {
      simulatedAfter -= Math.abs(qty);
    }

    let globalStock: number | null = null;
    let simulatedGlobalAfter: number | null = null;
    let allStorehousesDetails: any[] = [];

    if (globalStorehouseScope === 'all') {
      globalStock = dataService.getItemStockByStorehouse(watchItem.id, 'all');
      simulatedGlobalAfter = globalStock;
      if (watchTxType === 'وارد' || watchTxType === 'افتتاحي' || (watchTxType === 'تسوية' && qty >= 0)) {
        simulatedGlobalAfter += qty;
      } else if (watchTxType === 'صادر' || watchTxType === 'مستهلك' || (watchTxType === 'تسوية' && qty < 0)) {
        simulatedGlobalAfter -= Math.abs(qty);
      }
      
      // Calculate individual storehouses
      settings.storehouses.forEach(sh => {
        let shCurrent = dataService.getItemStockByStorehouse(watchItem.id, sh);
        let shSimulated = shCurrent;
        let diff = 0;
        
        if (sh === watchStorehouse) {
           if (watchTxType === 'وارد' || watchTxType === 'افتتاحي' || (watchTxType === 'تسوية' && qty >= 0)) {
             diff = qty;
           } else if (watchTxType === 'صادر' || watchTxType === 'مستهلك' || watchTxType === 'تحويل' || (watchTxType === 'تسوية' && qty < 0)) {
             diff = -Math.abs(qty);
           }
        } else if (watchTxType === 'تحويل' && sh === watchDestStorehouse) {
           diff = qty;
        }
        
        shSimulated += diff;
        
        // Show if current stock > 0 OR diff !== 0 (involved in the transaction)
        if (shCurrent > 0 || diff !== 0) {
          allStorehousesDetails.push({
            name: sh,
            current: shCurrent,
            diff,
            simulated: shSimulated
          });
        }
      });
    }

    return {
      current: currentStock,
      simulated: simulatedAfter,
      unit: watchItem.unit,
      isNegative: simulatedAfter < 0,
      storehouseName: watchStorehouse || 'المخزن الرئيسي',
      globalStock,
      simulatedGlobalAfter,
      allStorehousesDetails
    };
  }, [watchItem, watchStorehouse, watchQty, watchTxType, materials, globalStorehouseScope, settings.storehouses, watchDestStorehouse]);"""

if target_sim in content:
    content = content.replace(target_sim, replacement_sim)
    print("sim replaced")
else:
    print("sim not found")

# 2. Update Table rendering
target_table = """                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>{liveStockSim.storehouseName}</td>
                        <td style={{ padding: '8px' }}>{liveStockSim.current} {liveStockSim.unit}</td>
                        <td style={{ padding: '8px', color: (watchTxType === 'صادر' || watchTxType === 'مستهلك' || watchTxType === 'تحويل' || (watchTxType==='تسوية'&&watchQty<0)) ? '#ef4444' : '#10b981' }}>
                          {(watchTxType === 'صادر' || watchTxType === 'مستهلك' || watchTxType === 'تحويل' || (watchTxType==='تسوية'&&watchQty<0)) ? '-' : '+'}{watchQty || 0}
                        </td>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: liveStockSim.isNegative ? '#ef4444' : 'inherit' }}>
                          {liveStockSim.simulated} {liveStockSim.unit}
                        </td>
                      </tr>
                      {watchTxType === 'تحويل' && watchDestStorehouse && (
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px' }}>{watchDestStorehouse}</td>
                          <td style={{ padding: '8px' }}>{dataService.getItemStockByStorehouse(watchItem.id, watchDestStorehouse)} {liveStockSim.unit}</td>
                          <td style={{ padding: '8px', color: '#10b981' }}>+{watchQty || 0}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>
                            {dataService.getItemStockByStorehouse(watchItem.id, watchDestStorehouse) + (Number(watchQty) || 0)} {liveStockSim.unit}
                          </td>
                        </tr>
                      )}
                      {globalStorehouseScope === 'all' && liveStockSim.globalStock !== null && liveStockSim.simulatedGlobalAfter !== null && (
                        <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0f9ff', fontWeight: 'bold' }}>
                          <td style={{ padding: '8px' }}>جميع المستودعات (الإجمالي)</td>
                          <td style={{ padding: '8px' }}>{liveStockSim.globalStock} {liveStockSim.unit}</td>
                          <td style={{ padding: '8px', color: (watchTxType === 'صادر' || watchTxType === 'مستهلك' || (watchTxType==='تسوية'&&watchQty<0)) ? '#ef4444' : (watchTxType === 'تحويل' ? 'inherit' : '#10b981') }}>
                            {watchTxType === 'تحويل' ? '0' : ((watchTxType === 'صادر' || watchTxType === 'مستهلك' || (watchTxType==='تسوية'&&watchQty<0)) ? '-' : '+') + (watchQty || 0)}
                          </td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>
                            {liveStockSim.simulatedGlobalAfter} {liveStockSim.unit}
                          </td>
                        </tr>
                      )}"""

replacement_table = """                      {globalStorehouseScope === 'all' && liveStockSim.allStorehousesDetails.length > 0 ? (
                        <>
                          {liveStockSim.allStorehousesDetails.map(sh => (
                            <tr key={sh.name} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px' }}>{sh.name}</td>
                              <td style={{ padding: '8px' }}>{sh.current} {liveStockSim.unit}</td>
                              <td style={{ padding: '8px', color: sh.diff < 0 ? '#ef4444' : (sh.diff > 0 ? '#10b981' : 'inherit') }}>
                                {sh.diff === 0 ? '-' : (sh.diff > 0 ? `+${sh.diff}` : sh.diff)}
                              </td>
                              <td style={{ padding: '8px', fontWeight: 'bold', color: sh.simulated < 0 ? '#ef4444' : 'inherit' }}>
                                {sh.simulated} {liveStockSim.unit}
                              </td>
                            </tr>
                          ))}
                          {liveStockSim.globalStock !== null && liveStockSim.simulatedGlobalAfter !== null && (
                            <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0f9ff', fontWeight: 'bold' }}>
                              <td style={{ padding: '8px' }}>الرصيد الإجمالي</td>
                              <td style={{ padding: '8px' }}>{liveStockSim.globalStock} {liveStockSim.unit}</td>
                              <td style={{ padding: '8px', color: (watchTxType === 'صادر' || watchTxType === 'مستهلك' || (watchTxType==='تسوية'&&watchQty<0)) ? '#ef4444' : (watchTxType === 'تحويل' ? 'inherit' : '#10b981') }}>
                                {watchTxType === 'تحويل' ? '0' : ((watchTxType === 'صادر' || watchTxType === 'مستهلك' || (watchTxType==='تسوية'&&watchQty<0)) ? '-' : '+') + (watchQty || 0)}
                              </td>
                              <td style={{ padding: '8px', fontWeight: 'bold' }}>
                                {liveStockSim.simulatedGlobalAfter} {liveStockSim.unit}
                              </td>
                            </tr>
                          )}
                        </>
                      ) : (
                        <>
                          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px' }}>{liveStockSim.storehouseName}</td>
                            <td style={{ padding: '8px' }}>{liveStockSim.current} {liveStockSim.unit}</td>
                            <td style={{ padding: '8px', color: (watchTxType === 'صادر' || watchTxType === 'مستهلك' || watchTxType === 'تحويل' || (watchTxType==='تسوية'&&watchQty<0)) ? '#ef4444' : '#10b981' }}>
                              {(watchTxType === 'صادر' || watchTxType === 'مستهلك' || watchTxType === 'تحويل' || (watchTxType==='تسوية'&&watchQty<0)) ? '-' : '+'}{watchQty || 0}
                            </td>
                            <td style={{ padding: '8px', fontWeight: 'bold', color: liveStockSim.isNegative ? '#ef4444' : 'inherit' }}>
                              {liveStockSim.simulated} {liveStockSim.unit}
                            </td>
                          </tr>
                          {watchTxType === 'تحويل' && watchDestStorehouse && (
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '8px' }}>{watchDestStorehouse}</td>
                              <td style={{ padding: '8px' }}>{dataService.getItemStockByStorehouse(watchItem.id, watchDestStorehouse)} {liveStockSim.unit}</td>
                              <td style={{ padding: '8px', color: '#10b981' }}>+{watchQty || 0}</td>
                              <td style={{ padding: '8px', fontWeight: 'bold' }}>
                                {dataService.getItemStockByStorehouse(watchItem.id, watchDestStorehouse) + (Number(watchQty) || 0)} {liveStockSim.unit}
                              </td>
                            </tr>
                          )}
                        </>
                      )}"""

if target_table in content:
    content = content.replace(target_table, replacement_table)
    print("table replaced")
else:
    print("table not found")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
