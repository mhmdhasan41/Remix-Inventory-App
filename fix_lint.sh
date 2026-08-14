sed -i 's/import React, {/import {/g' src/components/CreateTransactionModal.tsx
sed -i 's/import React, {/import {/g' src/components/MaterialFormDialog.tsx
sed -i '/jsPDF/d' src/pages/Reports.tsx
sed -i '/import { shapeArabicText, arrayBufferToBase64 }/d' src/pages/Reports.tsx
sed -i '/import { printHtml, exportToPDF }/d' src/pages/Reports.tsx
sed -i '/jsPDF/d' src/pages/Transactions.tsx
sed -i '/import { shapeArabicText, arrayBufferToBase64 }/d' src/pages/Transactions.tsx
sed -i '/import { printHtml, exportToPDF }/d' src/pages/Transactions.tsx

# for materials and transactions 
npm run build
