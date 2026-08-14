const fs = require('fs');
let content = fs.readFileSync('src/pages/Transactions.tsx', 'utf8');

// The bug is we generate recordIds0 and recordIds1 outside the if/else block, but activeList is local to the if.

const faultyLogic = `      const txId = requireStableStringPart(item.id, 'txId');
      const recordIds0 = [JSON.stringify(['voucher_detail', txId])];
      let recordIds1: string[] = [];
      if (isAllStorehouses) {
        recordIds1 = [
          ...activeList.map(wh => JSON.stringify(['voucher_balance', txId, 'warehouse', requireStableStringPart(wh, 'warehouse')])),
          JSON.stringify(['voucher_balance', txId, 'total'])
        ];
      } else {
        recordIds1 = [
          JSON.stringify(['voucher_balance', txId, 'before']),
          JSON.stringify(['voucher_balance', txId, 'after'])
        ];
      }`;

// We will remove this faulty logic and inject it correctly in the original if-else block.
content = content.replace(faultyLogic, `      const txId = requireStableStringPart(item.id, 'txId');
      const recordIds0 = [JSON.stringify(['voucher_detail', txId])];
      let recordIds1: string[] = [];
`);

// Now let's find the original `if (isAllStorehouses) {`
const origIf = `      if (isAllStorehouses) {
        const history = getHistoricalWarehouseStocksDetailed(`;
const newIf = `      const txIdForIds = requireStableStringPart(item.id, 'txId');
      let recordIds1ForIds: string[] = [];

      if (isAllStorehouses) {
        const history = getHistoricalWarehouseStocksDetailed(`;
content = content.replace(origIf, newIf);

// Inside isAllStorehouses, find where we set balanceRows
const origRowsAll = `        balanceRows = activeList.map(wh => [
          wh,
          \`\${history.before[wh] ?? 0} \${itemUnit}\`,
          \`\${history.after[wh] ?? 0} \${itemUnit}\`
        ]);
        balanceRows.push([
          'جميع المستودعات (الإجمالي)',
          \`\${history.beforeTotal} \${itemUnit}\`,
          \`\${history.afterTotal} \${itemUnit}\`
        ]);`;
const newRowsAll = origRowsAll + `
        recordIds1ForIds = [
          ...activeList.map(wh => JSON.stringify(['voucher_balance', txIdForIds, 'warehouse', requireStableStringPart(wh, 'warehouse')])),
          JSON.stringify(['voucher_balance', txIdForIds, 'total'])
        ];`;
content = content.replace(origRowsAll, newRowsAll);

// Inside else
const origRowsElse = `      } else {
        balanceHeaders = ['البيان والمرحلة', 'الوقت', 'نظام الجرد', 'الرصيد المؤكد الفعلي'];
        balanceAlignments = ['right', 'center', 'center', 'center'];
        balanceRowBgColors = ['#f8fafc', '#ffffff'];
        balanceRows = [
          [
            \`الرصيد الدفتري المتوفر بالمستودع (\${storehouseName}) قبل الحركة\`,
            '10:00 AM',
            'مستمر',
            \`\${item.stockBefore ?? item.displayStockBefore ?? 0} \${itemUnit}\`
          ],
          [
            \`الرصيد الميداني المتوفر حالياً بالمستودع (\${storehouseName}) بعد الحركة\`,
            new Date(item.createdAt || item.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            'نهائي',
            \`<span style="font-weight: bold; color: #0369a1">\${item.stockAfter ?? item.displayStockAfter ?? 0} \${itemUnit}</span>\`
          ]
        ];
      }`;
const newRowsElse = origRowsElse.replace(`      }`, `        recordIds1ForIds = [
          JSON.stringify(['voucher_balance', txIdForIds, 'before']),
          JSON.stringify(['voucher_balance', txIdForIds, 'after'])
        ];
      }`);
content = content.replace(origRowsElse, newRowsElse);

// Then change recordIds1 inside the exportToPDF call to use recordIds1ForIds
content = content.replace(`recordIds: recordIds1,`, `recordIds: recordIds1ForIds,`);
content = content.replace(`recordIds: recordIds0,`, `recordIds: [JSON.stringify(['voucher_detail', txIdForIds])],`);


fs.writeFileSync('src/pages/Transactions.tsx', content);
