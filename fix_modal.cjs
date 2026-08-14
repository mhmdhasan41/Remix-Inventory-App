const fs = require('fs');

let content = fs.readFileSync('src/components/CreateTransactionModal.tsx', 'utf-8');

// Fix sourceStorehouses
const sourceOld = `  const sourceStorehouses = useMemo(() => {
    if (!watchItem) return settings.storehouses;
    if (['صادر', 'مستهلك', 'تحويل'].includes(watchTxType) || (watchTxType === 'تسوية' && watchQty < 0)) {
      return settings.storehouses.filter(s => dataService.getItemStockByStorehouse(watchItem.id, s) > 0);
    }
    return settings.storehouses;
  }, [settings.storehouses, watchItem, watchTxType, watchQty]);`;

const sourceNew = `  const sourceStorehouses = useMemo(() => {
    let stores = settings.storehouses;
    if (globalStorehouseScope !== 'all') {
      stores = stores.filter(s => s === globalStorehouseScope);
    }
    
    if (!watchItem) return stores;
    
    if (['صادر', 'مستهلك', 'تحويل'].includes(watchTxType) || (watchTxType === 'تسوية' && watchQty < 0)) {
      return stores.filter(s => dataService.getItemStockByStorehouse(watchItem.id, s) > 0);
    }
    return stores;
  }, [settings.storehouses, watchItem, watchTxType, watchQty, globalStorehouseScope]);`;

content = content.replace(sourceOld, sourceNew);

// Fix height of + button
const btnOld = `<Box className="col-span-1 md:col-span-12" sx={{ display: 'flex', gap: 1 }}>
              <Controller
                name="itemSelection"
                control={control}
                render={({ field }) => (
                  <Autocomplete`;
                  
const btnNew = `<Box className="col-span-1 md:col-span-12" sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Controller
                name="itemSelection"
                control={control}
                render={({ field }) => (
                  <Autocomplete`;
                  
content = content.replace(btnOld, btnNew);

const iconBtnOld = `              <Tooltip title="إنشاء صنف جديد">
                <IconButton 
                  color="primary" 
                  onClick={() => setOpenItemModal(true)}
                  sx={{ width: 56, height: 56, borderRadius: '10px', border: '1px solid #cbd5e1' }}
                >
                  <AddCircleIcon fontSize="large" />
                </IconButton>
              </Tooltip>`;
              
const iconBtnNew = `              <Tooltip title="إنشاء صنف جديد">
                <IconButton 
                  color="primary" 
                  onClick={() => setOpenItemModal(true)}
                  sx={{ width: 56, minWidth: 56, height: 56, borderRadius: '10px', border: '1px solid #cbd5e1' }}
                >
                  <AddCircleIcon fontSize="large" />
                </IconButton>
              </Tooltip>`;
              
content = content.replace(iconBtnOld, iconBtnNew);

fs.writeFileSync('src/components/CreateTransactionModal.tsx', content);
console.log("Modal fixed");
