const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(`
    <html dir="rtl">
      <head>
        <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: sans-serif; background-color: #f1f5f9; width: 820px; }
        .pdf-page {
          width: 820px;
          min-height: 1195px;
          padding: 30px;
          box-sizing: border-box;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          position: absolute;
          top: 0;
          left: 0;
        }
        .page-header { border-bottom: 3px solid #007ab7; padding-bottom: 15px; margin-bottom: 25px; height: 50px; }
        .table-container { margin-bottom: 25px; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11.5px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; }
        </style>
      </head>
      <body>
        <div id="pages-container"></div>
      </body>
    </html>
  `);

  const result = await page.evaluate(() => {
    const pagesContainer = document.getElementById('pages-container');
    let currentPageNum = 0;
    const PAGE_HEIGHT = 1195;
    const USABLE_HEIGHT = PAGE_HEIGHT - 60;
    const SAFE_MARGIN = 5;

    const createNewPage = () => {
      currentPageNum++;
      const pageDiv = document.createElement('div');
      pageDiv.className = 'pdf-page';
      pageDiv.innerHTML = `<div class="page-header">Header ${currentPageNum}</div>`;
      pagesContainer.appendChild(pageDiv);
      return pageDiv;
    };

    const getUsedHeight = (container) => {
      const children = Array.from(container.children);
      if (children.length === 0) return 0;
      const lastChild = children[children.length - 1];
      const containerRect = container.getBoundingClientRect();
      const lastChildRect = lastChild.getBoundingClientRect();
      return lastChildRect.bottom - containerRect.top - 30;
    };

    let pageDiv = createNewPage();
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    pageDiv.appendChild(tableContainer);

    const log = [];
    
    // Add rows
    for (let i = 0; i < 40; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>Row ${i} Data 1</td><td>Row ${i} Data 2</td>`;
      tbody.appendChild(tr);
      
      const usedHeight = getUsedHeight(pageDiv);
      log.push({ row: i, usedHeight, bottom: tbody.lastChild.getBoundingClientRect().bottom });
      
      if (usedHeight > USABLE_HEIGHT - SAFE_MARGIN) {
        tbody.removeChild(tr);
        
        pageDiv = createNewPage();
        const newTableContainer = document.createElement('div');
        newTableContainer.className = 'table-container';
        const newTable = document.createElement('table');
        const newTbody = document.createElement('tbody');
        newTable.appendChild(newTbody);
        newTableContainer.appendChild(newTable);
        pageDiv.appendChild(newTableContainer);
        
        newTbody.appendChild(tr);
      }
    }
    
    return log;
  });

  console.log(result.slice(result.length - 10)); // Just look at the last few logs around page break
  await browser.close();
})();
