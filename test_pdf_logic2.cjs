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
        .table-container { margin-bottom: 25px; background: red; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11.5px; background: yellow; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; }
        .extras { height: 100px; background: green; }
        </style>
      </head>
      <body>
        <div id="pages-container"></div>
      </body>
    </html>
  `);

  const result = await page.evaluate(() => {
    const pagesContainer = document.getElementById('pages-container');
    const pageDiv = document.createElement('div');
    pageDiv.className = 'pdf-page';
    pageDiv.innerHTML = `<div class="page-header">Header</div>`;
    pagesContainer.appendChild(pageDiv);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    tableContainer.innerHTML = '<table><tr><td>Test</td></tr></table>';
    pageDiv.appendChild(tableContainer);

    const getUsedHeight = (container) => {
      const children = Array.from(container.children);
      const lastChild = children[children.length - 1];
      const containerRect = container.getBoundingClientRect();
      const lastChildRect = lastChild.getBoundingClientRect();
      return {
        usedHeight: lastChildRect.bottom - containerRect.top - 30,
        lastChildBottom: lastChildRect.bottom,
      };
    };

    const res1 = getUsedHeight(pageDiv);

    const extras = document.createElement('div');
    extras.className = 'extras';
    pageDiv.appendChild(extras);

    const res2 = getUsedHeight(pageDiv);
    const extrasRect = extras.getBoundingClientRect();

    return { res1, res2, extrasTop: extrasRect.top };
  });

  console.log(result);
  await browser.close();
})();
