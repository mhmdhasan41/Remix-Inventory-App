import { Material, InventoryTransaction } from '../types';
import { dataService } from '../services/dataService';

export interface MaterialViewRow extends Material {
  isSubRow?: boolean;
  hasSubRows?: boolean;
  parentId?: string;
  _originalId?: string;
  id: string; // The UI list key
}

/**
 * buildMaterialWarehouseView
 * Builds a unified view of materials according to the "Centralized Logic" rules.
 * 
 * @param materials - Raw materials from database
 * @param storehouseFilter - 'all' or a specific warehouse name
 * @param activeStorehouses - Array of active warehouse names (from settings)
 */
export function buildMaterialWarehouseView(
  materials: Material[],
  storehouseFilter: string,
  activeStorehouses: string[]
): MaterialViewRow[] {
  let viewRows: MaterialViewRow[] = [];

  materials.forEach(item => {
    // Determine active warehouse stocks for this item

    
    // Default location holds stock if it's not explicitly in warehouseStocks
    // Or it might be explicit. Let's merge them into a Map.
    const activeStocks = new Map<string, number>();
    
    // We only care about activeStorehouses. If the item has stock in an inactive storehouse, 
    // it's ignored per instructions.
    
    // If the item has no warehouseStocks but has a storageLocation, add it.
    let totalStock = 0;
    
    activeStorehouses.forEach(wh => {
      let stock = 0;
      if (item.warehouseStocks && typeof item.warehouseStocks[wh] === 'number') {
        stock = item.warehouseStocks[wh];
      } else if (item.storageLocation === wh && Object.keys(item.warehouseStocks || {}).length === 0) {
         // Fallback to currentStock if it's the primary location and no warehouseStocks object exists
         // Actually, if warehouseStocks exists, it is the truth. If not, currentStock is the truth for storageLocation.
         stock = item.currentStock;
      }
      
      // If stock exists or this is the default storage location or explicitly tracked in warehouseStocks
      const hasExplicitRecord = item.warehouseStocks && Object.prototype.hasOwnProperty.call(item.warehouseStocks, wh);
      if (stock > 0 || item.storageLocation === wh || hasExplicitRecord) {
        activeStocks.set(wh, stock);
        totalStock += stock;
      }
    });

    if (storehouseFilter === 'all') {
      // 1. All Warehouses
      if (activeStocks.size <= 1) {
        // CLEAN UX: If the item exists in only 0 or 1 warehouse, show a single row with that warehouse's name.
        let singleWh = 'المخزن الرئيسي';
        let singleStock = totalStock;
        if (activeStocks.size === 1) {
          singleWh = Array.from(activeStocks.keys())[0];
          singleStock = activeStocks.get(singleWh)!;
        } else if (item.storageLocation) {
          singleWh = item.storageLocation;
        }

        viewRows.push({
          ...item,
          currentStock: singleStock,
          storageLocation: singleWh,
          _originalId: item.id,
          isSubRow: false
        });
      } else {
        // Item exists in multiple warehouses: show a parent aggregate row + sub-rows
        const parentRow: MaterialViewRow = {
          ...item,
          currentStock: totalStock,
          storageLocation: 'جميع المستودعات',
          _originalId: item.id,
          isSubRow: false,
          hasSubRows: true
        };
        viewRows.push(parentRow);
        
        activeStocks.forEach((stock, wh) => {
          viewRows.push({
            ...item,
            id: item.id + '-' + wh,
            currentStock: stock,
            storageLocation: wh,
            _originalId: item.id,
            isSubRow: true,
            parentId: item.id
          });
        });
      }
    } else {
      // 2. Specific Warehouse
      // If it has stock in this warehouse, or it is the default location
      if (activeStorehouses.includes(storehouseFilter)) {
        if (activeStocks.has(storehouseFilter)) {
          viewRows.push({
            ...item,
            currentStock: activeStocks.get(storehouseFilter)!,
            storageLocation: storehouseFilter,
            _originalId: item.id,
            isSubRow: false // Shows as single main row
          });
        }
      }
    }
  });

  return viewRows;
}

/**
 * buildOpeningStockReportView
 * Builds a clean, unified view specifically for Opening Stock Reports (سند توثيق وإقرار الأرصدة الافتتاحية).
 * 
 * Rules:
 * 1. An item is ONLY included if it has an opening stock > 0 in at least one active storehouse.
 * 2. If an item has opening stock in ONLY ONE storehouse:
 *    - Display a SINGLE row containing the item details, the storehouse name, and the opening stock quantity.
 *    - NO parent row, NO sub-rows.
 * 3. If an item has opening stock in MORE THAN ONE storehouse:
 *    - Display a parent aggregate row (storageLocation = 'جميع المستودعات', total opening stock) PLUS sub-rows for each storehouse that has an opening stock > 0.
 */
export function buildOpeningStockReportView(
  materials: Material[],
  storehouseFilter: string,
  activeStorehouses: string[]
): MaterialViewRow[] {
  const viewRows: MaterialViewRow[] = [];

  materials.forEach((item) => {
    const originalId = (item as any)._originalId || item.id;

    // Collect opening stock quantities for each storehouse
    const openingStocksMap = new Map<string, number>();

    activeStorehouses.forEach((wh) => {
      const initQty = dataService.getStorehouseInitialStock(originalId, wh);
      if (initQty > 0) {
        openingStocksMap.set(wh, initQty);
      }
    });

    if (storehouseFilter !== 'all') {
      // Filtering for a specific storehouse
      const qty = openingStocksMap.get(storehouseFilter) || 0;
      if (qty > 0) {
        viewRows.push({
          ...item,
          id: `${item.id}-${storehouseFilter}`,
          _originalId: originalId,
          currentStock: qty, // Used as opening stock quantity
          storageLocation: storehouseFilter,
          isSubRow: false,
          hasSubRows: false,
        });
      }
    } else {
      // All storehouses selected ('all')
      if (openingStocksMap.size === 0) {
        return; // Exclude items with no opening stock
      }

      if (openingStocksMap.size === 1) {
        // CASE 1: Opening stock in ONLY ONE storehouse -> Single row!
        const [singleWh, singleQty] = Array.from(openingStocksMap.entries())[0];
        viewRows.push({
          ...item,
          id: item.id,
          _originalId: originalId,
          currentStock: singleQty,
          storageLocation: singleWh,
          isSubRow: false,
          hasSubRows: false,
        });
      } else {
        // CASE 2: Opening stock in MULTIPLE storehouses -> Parent row + Sub-rows
        let totalOpening = 0;
        openingStocksMap.forEach((qty) => {
          totalOpening += qty;
        });

        const parentRow: MaterialViewRow = {
          ...item,
          id: item.id,
          _originalId: originalId,
          currentStock: totalOpening,
          storageLocation: 'جميع المستودعات',
          isSubRow: false,
          hasSubRows: true,
        };
        viewRows.push(parentRow);

        openingStocksMap.forEach((qty, wh) => {
          viewRows.push({
            ...item,
            id: `${item.id}-${wh}`,
            _originalId: originalId,
            parentId: item.id,
            currentStock: qty,
            storageLocation: wh,
            isSubRow: true,
          });
        });
      }
    }
  });

  return viewRows;
}

export interface TransactionViewRow extends InventoryTransaction {
  displayStockBefore: number;
  displayStockAfter: number;
}

/**
 * buildTransactionLedger
 * Builds the historical ledger dynamically based on the selected storehouse filter.
 */
export function buildTransactionLedger(
  transactions: InventoryTransaction[],
  storehouseFilter: string,
  _activeStorehouses: string[],
  materials?: Material[]
): TransactionViewRow[] {
  // We need to calculate running balances for each item.
  // We first sort transactions chronologically.
  const sortedTxs = [...transactions].sort((a, b) => {
    const tA = new Date(a.date).getTime();
    const tB = new Date(b.date).getTime();
    if (tA !== tB) return tA - tB;
    return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0);
  });

  // Track running balances
  // ItemId -> { StorehouseName -> Balance }
  const itemBalances = new Map<string, Map<string, number>>();

  if (materials && materials.length > 0) {
    for (const m of materials) {
      if (m.initialStock !== undefined && m.initialStock > 0) {
        const hasInitTx = sortedTxs.some(t => t.itemId === m.id && t.id.startsWith('tr-init'));
        if (!hasInitTx) {
          const whMap = new Map<string, number>();
          whMap.set(m.storageLocation || 'المخزن الرئيسي', m.initialStock);
          itemBalances.set(m.id, whMap);
        }
      }
    }
  }

  const result: TransactionViewRow[] = [];

  for (const tx of sortedTxs) {
    const itemId = tx.itemId;
    const wh = tx.storehouse || 'المخزن الرئيسي';
    
    if (!itemBalances.has(itemId)) {
      itemBalances.set(itemId, new Map<string, number>());
    }
    const whBalances = itemBalances.get(itemId)!;
    
    let previousWhBalance = whBalances.get(wh) || 0;
    
    // Calculate total before across all storehouses
    let previousTotalBalance = 0;
    whBalances.forEach(val => {
       previousTotalBalance += val;
    });

    // Determine effect
    let effect = 0;
    if (
      tx.transactionType === 'وارد' || 
      tx.transactionType === 'افتتاحي' || 
      (tx.transactionType === 'تحويل' && tx.transferType === 'in') || 
      (tx.transactionType === 'تسوية' && tx.transferType === 'in')
    ) {
       effect = tx.quantity;
    } else {
       effect = -tx.quantity;
    }
    
    // tr-init / افتتاحي process chronologically
    if (tx.id.startsWith('tr-init') || tx.transactionType === 'افتتاحي') {
       if (!tx.transactionType) effect = tx.quantity; 
    }

    // Apply effect
    const newWhBalance = previousWhBalance + effect;
    whBalances.set(wh, newWhBalance);
    
    let newTotalBalance = 0;
    whBalances.forEach(val => {
       newTotalBalance += val;
    });

    // Create view row
    let displayStockBefore = 0;
    let displayStockAfter = 0;

    if (storehouseFilter === 'all') {
       displayStockBefore = previousTotalBalance;
       displayStockAfter = newTotalBalance;
       result.push({ ...tx, displayStockBefore, displayStockAfter });
    } else {
       // Specific warehouse filter
       // Only include if it happened in this warehouse (or it's a transfer involving it)
       if (wh === storehouseFilter) {
          displayStockBefore = previousWhBalance;
          displayStockAfter = newWhBalance;
          result.push({ ...tx, displayStockBefore, displayStockAfter });
       }
    }
  }

  // Reverse back to newest-first for display
  return result.reverse();
}

/**
 * getHistoricalWarehouseStocks
 * Calculates the exact warehouse stock breakdown for a specific material at the moment a target transaction occurred.
 */
export interface StorehouseStockHistory {
  before: Record<string, number>;
  after: Record<string, number>;
  totalBefore: number;
  totalAfter: number;
}

/**
 * getHistoricalWarehouseStocksDetailed
 * Calculates exact per-warehouse stock BEFORE and AFTER a target transaction occurred.
 */
export function getHistoricalWarehouseStocksDetailed(
  transactions: InventoryTransaction[],
  itemId: string,
  targetTxId: string,
  targetMaterial?: Material,
  activeStorehouses: string[] = []
): StorehouseStockHistory {
  const sorted = [...transactions].sort((a, b) => {
    const tA = new Date(a.date).getTime();
    const tB = new Date(b.date).getTime();
    if (tA !== tB) return tA - tB;
    return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0);
  });

  const runningStocks: Record<string, number> = {};

  // Discover all relevant storehouses
  const allKnownStorehouses = new Set<string>(activeStorehouses);
  if (targetMaterial?.storageLocation) allKnownStorehouses.add(targetMaterial.storageLocation);
  if (targetMaterial?.warehouseStocks) {
    Object.keys(targetMaterial.warehouseStocks).forEach(wh => allKnownStorehouses.add(wh));
  }
  transactions.forEach(t => {
    if (t.itemId === itemId && t.storehouse) allKnownStorehouses.add(t.storehouse);
  });

  allKnownStorehouses.forEach(wh => {
    runningStocks[wh] = 0;
  });

  const defaultLoc = targetMaterial?.storageLocation || 'المخزن الرئيسي';
  if (targetMaterial && targetMaterial.initialStock !== undefined && targetMaterial.initialStock > 0) {
    const hasInitTx = sorted.some(t => t.itemId === itemId && (t.id.startsWith('tr-init') || t.transactionType === 'افتتاحي'));
    if (!hasInitTx) {
      runningStocks[defaultLoc] = (runningStocks[defaultLoc] || 0) + targetMaterial.initialStock;
    }
  }

  const before: Record<string, number> = {};
  const after: Record<string, number> = {};
  let found = false;

  for (const tx of sorted) {
    if (tx.itemId !== itemId) continue;

    if (tx.id === targetTxId) {
      found = true;
      // Snapshot BEFORE
      Object.keys(runningStocks).forEach(wh => {
        before[wh] = runningStocks[wh] || 0;
      });

      // Apply this transaction
      const loc = tx.storehouse || defaultLoc;
      if (runningStocks[loc] === undefined) runningStocks[loc] = 0;

      if (
        tx.transactionType === 'وارد' || 
        tx.transactionType === 'افتتاحي' || 
        (tx.transactionType === 'تحويل' && tx.transferType === 'in') || 
        (tx.transactionType === 'تسوية' && tx.transferType === 'in')
      ) {
        runningStocks[loc] += tx.quantity;
      } else {
        runningStocks[loc] -= tx.quantity;
      }

      // Snapshot AFTER
      Object.keys(runningStocks).forEach(wh => {
        after[wh] = runningStocks[wh] || 0;
      });

      break;
    } else {
      const loc = tx.storehouse || defaultLoc;
      if (runningStocks[loc] === undefined) runningStocks[loc] = 0;

      if (
        tx.transactionType === 'وارد' || 
        tx.transactionType === 'افتتاحي' || 
        (tx.transactionType === 'تحويل' && tx.transferType === 'in') || 
        (tx.transactionType === 'تسوية' && tx.transferType === 'in')
      ) {
        runningStocks[loc] += tx.quantity;
      } else {
        runningStocks[loc] -= tx.quantity;
      }
    }
  }

  if (!found) {
    Object.keys(runningStocks).forEach(wh => {
      before[wh] = runningStocks[wh] || 0;
      after[wh] = runningStocks[wh] || 0;
    });
  }

  const totalBefore = Object.values(before).reduce((acc, v) => acc + v, 0);
  const totalAfter = Object.values(after).reduce((acc, v) => acc + v, 0);

  return { before, after, totalBefore, totalAfter };
}
