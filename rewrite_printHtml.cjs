const fs = require('fs');
const path = require('path');

let content = fs.readFileSync(path.join(__dirname, 'src/utils/printHtml.ts'), 'utf8');

// 1. Replace PAGE_WIDTH and PAGE_HEIGHT and USABLE_HEIGHT
content = content.replace(
  /const PAGE_WIDTH = isLandscape \? 1195 : 820;\s*const PAGE_HEIGHT = isLandscape \? 820 : 1195;\s*const USABLE_HEIGHT = PAGE_HEIGHT - 60;/g,
  `const PAGE_WIDTH = isLandscape ? 1123 : 794;
  const PAGE_HEIGHT = isLandscape ? 794 : 1123;
  const USABLE_HEIGHT = PAGE_HEIGHT - 30;`
);

// 2. Replace CSS inside <style>
content = content.replace(
  /min-height: \$\{PAGE_HEIGHT\}px;/g,
  `height: \$\{PAGE_HEIGHT\}px;`
);

// 3. Replace padding and margins for tables
content = content.replace(
  /padding: 10px 12px;/g,
  `padding: 8px 10px;` // slightly tighter
);
content = content.replace(
  /padding: 12px 10px;/g,
  `padding: 10px 8px;`
);

// 4. Update getUsedHeight
const oldGetUsedHeight = `
    const getUsedHeight = (container: HTMLElement) => {
      const children = Array.from(container.children);
      if (children.length === 0) return 0;
      const lastChild = children[children.length - 1] as HTMLElement;
      const containerRect = container.getBoundingClientRect();
      const lastChildRect = lastChild.getBoundingClientRect();
      return lastChildRect.bottom - containerRect.top - 30; // 30 is top padding
    };
`;
const newGetUsedHeight = `
    const getUsedHeight = (container: HTMLElement) => {
      const children = Array.from(container.children);
      if (children.length === 0) return 0;
      const lastChild = children[children.length - 1] as HTMLElement;
      const containerRect = container.getBoundingClientRect();
      const lastChildRect = lastChild.getBoundingClientRect();
      return lastChildRect.bottom - containerRect.top;
    };
`;
content = content.replace(oldGetUsedHeight.trim(), newGetUsedHeight.trim());

// 5. Await fonts before rendering rows
content = content.replace(
  `idoc.close();`,
  `idoc.close();\n\n    // Wait for fonts to load before measuring text\n    if (iframe.contentWindow && iframe.contentWindow.document) {\n      await iframe.contentWindow.document.fonts.ready;\n    }`
);

// 6. Fix Extras Container
const oldExtrasBlock = `
  // 6. Append Notes and Signatures
  let hasExtras = false;
  if (data.notes || (data.signatures && data.signatures.length > 0) || data.barcode) {
    hasExtras = true;
  }
  
  if (hasExtras) {
    const extrasContainer = idoc.createElement('div');
    extrasContainer.style.width = '100%';
    
    if (data.notes) {
      const notesDiv = idoc.createElement('div');
      notesDiv.className = 'notes-container';
      notesDiv.innerHTML = \`<div class="section-title">ملاحظات</div><div class="notes-text">\${data.notes.replace(/\\n/g, '<br />')}</div>\`;
      extrasContainer.appendChild(notesDiv);
    }
    
    if (data.signatures && data.signatures.length > 0) {
      const sigsDiv = idoc.createElement('div');
      sigsDiv.className = 'signatures-grid';
      data.signatures.forEach(sig => {
        let role = '';
        let name = '';
        let isVisible = true;
        
        if (typeof sig === 'string') {
          role = sig;
        } else {
          role = sig.role;
          name = sig.name || '';
          isVisible = sig.show !== false;
        }
        
        sigsDiv.insertAdjacentHTML('beforeend', \`
          <div class="signature-box" style="\${isVisible ? '' : 'visibility: hidden;'}">
            <div class="signature-role" style="font-size: 12px; font-weight: 700; color: #334155;">\${role}</div>
            <div class="signature-name" style="font-size: 13px; font-weight: bold; color: #000; margin-top: 5px; min-height: 18px;">\${name}</div>
            <div class="signature-line" style="margin-top: 25px; color: #94a3b8; font-size: 13px;">التوقيع: <span style="color: #cbd5e1;">............................</span></div>
          </div>
        \`);
      });
      extrasContainer.appendChild(sigsDiv);
    }
    
    if (data.barcode) {
      extrasContainer.insertAdjacentHTML('beforeend', \`
        <div class="barcode-container" style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">
          <div class="barcode-lines" style="font-family: monospace; letter-spacing: 4px; color: #000; font-size: 14px; margin-bottom: 5px;">||||| | |||| || ||| | ||| |||| | | | \${data.barcode}</div>
          <div class="barcode-text" style="font-family: 'Cairo', sans-serif; font-size: 11px; color: #64748b;">سند رسمي مشفر ومؤرشف إلكترونياً - رقم \${data.barcode}</div>
        </div>
      \`);
    }
    
    pageDiv.appendChild(extrasContainer);
    
    if (getUsedHeight(pageDiv) > USABLE_HEIGHT - SAFE_MARGIN) {
      // Doesn't fit, move to new page
      pageDiv.removeChild(extrasContainer);
      pageDiv = createNewPage();
      pageDiv.appendChild(extrasContainer);
    }
  }
`;

const newExtrasBlock = `
  // 6. Append Notes and Signatures individually to maximize space usage
  if (data.notes) {
    const notesDiv = idoc.createElement('div');
    notesDiv.className = 'notes-container';
    notesDiv.style.marginTop = '20px';
    notesDiv.innerHTML = \`<div class="section-title">ملاحظات</div><div class="notes-text">\${data.notes.replace(/\\n/g, '<br />')}</div>\`;
    pageDiv.appendChild(notesDiv);
    
    if (getUsedHeight(pageDiv) > USABLE_HEIGHT) {
      pageDiv.removeChild(notesDiv);
      pageDiv = createNewPage();
      pageDiv.appendChild(notesDiv);
    }
  }

  if (data.signatures && data.signatures.length > 0) {
    const sigsDiv = idoc.createElement('div');
    sigsDiv.className = 'signatures-grid';
    data.signatures.forEach(sig => {
      let role = '';
      let name = '';
      let isVisible = true;
      if (typeof sig === 'string') {
        role = sig;
      } else {
        role = sig.role;
        name = sig.name || '';
        isVisible = sig.show !== false;
      }
      sigsDiv.insertAdjacentHTML('beforeend', \`
        <div class="signature-box" style="\${isVisible ? '' : 'visibility: hidden;'}">
          <div class="signature-role" style="font-size: 12px; font-weight: 700; color: #334155;">\${role}</div>
          <div class="signature-name" style="font-size: 13px; font-weight: bold; color: #000; margin-top: 5px; min-height: 18px;">\${name}</div>
          <div class="signature-line" style="margin-top: 25px; color: #94a3b8; font-size: 13px;">التوقيع: <span style="color: #cbd5e1;">............................</span></div>
        </div>
      \`);
    });
    pageDiv.appendChild(sigsDiv);
    
    if (getUsedHeight(pageDiv) > USABLE_HEIGHT) {
      pageDiv.removeChild(sigsDiv);
      pageDiv = createNewPage();
      pageDiv.appendChild(sigsDiv);
    }
  }

  if (data.barcode) {
    const barcodeDiv = idoc.createElement('div');
    barcodeDiv.className = 'barcode-container';
    barcodeDiv.innerHTML = \`
      <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px dashed #cbd5e1;">
        <div class="barcode-lines" style="font-family: monospace; letter-spacing: 4px; color: #000; font-size: 14px; margin-bottom: 5px;">||||| | |||| || ||| | ||| |||| | | | \${data.barcode}</div>
        <div class="barcode-text" style="font-family: 'Cairo', sans-serif; font-size: 11px; color: #64748b;">سند رسمي مشفر ومؤرشف إلكترونياً - رقم \${data.barcode}</div>
      </div>
    \`;
    pageDiv.appendChild(barcodeDiv);
    
    if (getUsedHeight(pageDiv) > USABLE_HEIGHT) {
      pageDiv.removeChild(barcodeDiv);
      pageDiv = createNewPage();
      pageDiv.appendChild(barcodeDiv);
    }
  }
`;

content = content.replace(oldExtrasBlock.trim(), newExtrasBlock.trim());

// 7. Fix SAFE_MARGIN usage (remove it entirely since we use EXACT calculations)
content = content.replace(/USABLE_HEIGHT - SAFE_MARGIN/g, 'USABLE_HEIGHT');
content = content.replace(/const SAFE_MARGIN = 5;\s*/g, '');

// 8. Fix jsPDF export (Remove 10mm margins)
const oldPdfExport = `
    const pdfOrientation = isLandscape ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation: pdfOrientation,
      unit: 'mm',
      format: 'a4'
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const printWidth = pdfWidth - (margin * 2);

    for (let i = 0; i < allPages.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      const pageEl = allPages[i];
      const canvas = await html2canvas(pageEl, {
        window: iframe.contentWindow as unknown as Window,
        scale: 2.2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      } as any);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      let finalPrintWidth = printWidth;
      let finalPrintHeight = (canvas.height * printWidth) / canvas.width;
      
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const maxPrintHeight = pdfHeight - (margin * 2);

      if (finalPrintHeight > maxPrintHeight) {
        const ratio = maxPrintHeight / finalPrintHeight;
        finalPrintHeight = maxPrintHeight;
        finalPrintWidth = printWidth * ratio;
      }
      
      const xOffset = margin + (printWidth - finalPrintWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, margin, finalPrintWidth, finalPrintHeight);
    }
`;
const newPdfExport = `
    const pdfOrientation = isLandscape ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation: pdfOrientation,
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < allPages.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      const pageEl = allPages[i];
      
      // Use scale 2 for good quality, higher scale might cause memory issues on large tables
      const canvas = await html2canvas(pageEl, {
        window: iframe.contentWindow as unknown as Window,
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      } as any);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Since our HTML page is exactly A4 aspect ratio (794x1123), 
      // we can just fill the entire PDF page. The HTML 30px padding acts as the margin.
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }
`;

content = content.replace(oldPdfExport.trim(), newPdfExport.trim());

fs.writeFileSync(path.join(__dirname, 'src/utils/printHtml.ts'), content);
console.log('Successfully updated printHtml.ts');
