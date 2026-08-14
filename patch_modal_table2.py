import sys

file_path = "src/components/CreateTransactionModal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target_table = """                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: liveStockSim.isNegative ? '#fef2f2' : 'inherit' }}>
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

replacement_table = """                      {globalStorehouseScope === 'all' && liveStockSim.allStorehousesDetails && liveStockSim.allStorehousesDetails.length > 0 ? (
                        <>
                          {liveStockSim.allStorehousesDetails.map(sh => (
                            <tr key={sh.name} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: sh.simulated < 0 ? '#fef2f2' : 'inherit' }}>
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
                          <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: liveStockSim.isNegative ? '#fef2f2' : 'inherit' }}>
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
    print("table2 replaced")
else:
    print("table2 not found")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
