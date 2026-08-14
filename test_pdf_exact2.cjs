const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  await page.setContent(`
    <html dir="rtl">
      <head>
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;850&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f1f5f9;
          color: #0f172a;
          line-height: 1.5;
          width: 820px;
          box-sizing: border-box;
        }

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
        /* ADD ALL CSS HERE LATER IF NEEDED */
        </style>
      </head>
      <body>
        <div id="pages-container"></div>
      </body>
    </html>
  `);

  const result = await page.evaluate(() => {
    const pageDiv = document.createElement('div');
    pageDiv.style.position = 'absolute';
    pageDiv.style.top = '0';
    pageDiv.style.left = '0';
    pageDiv.style.width = '820px';
    pageDiv.style.minHeight = '1195px';
    pageDiv.style.padding = '30px';
    document.body.appendChild(pageDiv);
    
    // add header
    const header = document.createElement('div');
    header.style.height = '100px';
    pageDiv.appendChild(header);
    
    const tableContainer = document.createElement('div');
    tableContainer.style.marginBottom = '25px';
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    tableContainer.appendChild(table);
    pageDiv.appendChild(tableContainer);
    
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    
    const logs = [];
    for (let i=0; i<25; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td style="padding: 10px; border: 1px solid black; font-size: 13px;">Test</td>';
      tbody.appendChild(tr);
      
      const children = Array.from(pageDiv.children);
      const lastChild = children[children.length - 1];
      const cr = pageDiv.getBoundingClientRect();
      const lr = lastChild.getBoundingClientRect();
      const used = lr.bottom - cr.top - 30;
      logs.push({ row: i+1, used, lrBottom: lr.bottom, crTop: cr.top, tableHeight: table.getBoundingClientRect().height });
    }
    
    return logs;
  });

  console.log(result);
  await browser.close();
})();
