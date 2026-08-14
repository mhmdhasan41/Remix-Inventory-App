import re

with open('src/pages/Reports.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I want to add useMemo and calculate warehouseScopedInventory

target_1 = """  // Get filtered data array based on chosen report type and sub-filters
  const getFilteredData = () => {
    const thresholdDays = settings.expiryWarningThresholdDays || 30;
    
    // Base dataset calculated by Centralized Logic
    const baseView = buildMaterialWarehouseView(materials, selectedStorehouse, settings.storehouses);"""

replacement_1 = """  // Create or use one warehouse-scoped computed dataset as the source of truth for both the summary cards and the inventory table.
  const baseView = useMemo(() => {
    return buildMaterialWarehouseView(materials, selectedStorehouse, settings.storehouses);
  }, [materials, selectedStorehouse, settings.storehouses]);

  const warehouseScopedInventory = useMemo(() => {
    return baseView.filter(m => !m.isSubRow);
  }, [baseView]);

  // Get filtered data array based on chosen report type and sub-filters
  const getFilteredData = () => {
    const thresholdDays = settings.expiryWarningThresholdDays || 30;
    """

if target_1 in content:
    content = content.replace(target_1, replacement_1)
else:
    print("target_1 not found!")

target_2 = """  // Stats Counters
  const getStats = () => {
    let totalItems = 0;
    let sumQtys = 0;
    let criticalItems = 0;

    materials.forEach(m => {
      totalItems++;
      sumQtys += m.currentStock;
      if (m.currentStock <= m.minimumStock) {
        criticalItems++;
      }
    });

    const itemsWithExpiry = materials.filter((m: any) => !!m.expiryDate) as any[];"""

replacement_2 = """  // Stats Counters
  const getStats = () => {
    let totalItems = 0;
    let sumQtys = 0;
    let criticalItems = 0;

    warehouseScopedInventory.forEach(m => {
      totalItems++;
      sumQtys += m.currentStock;
      if (m.currentStock <= m.minimumStock) {
        criticalItems++;
      }
    });

    const itemsWithExpiry = warehouseScopedInventory.filter((m: any) => !!m.expiryDate) as any[];"""

if target_2 in content:
    content = content.replace(target_2, replacement_2)
else:
    print("target_2 not found!")


with open('src/pages/Reports.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

