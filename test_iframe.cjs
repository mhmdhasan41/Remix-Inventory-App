const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  await page.setContent(`
    <html>
      <body>
      </body>
    </html>
  `);

  const result = await page.evaluate(() => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const idoc = iframe.contentWindow.document;
    idoc.open();
    idoc.write(`
      <style>
        .pdf-page {
          width: 820px;
          min-height: 1195px;
          padding: 30px;
          background-color: #ffffff;
          position: absolute;
          top: 0;
          left: 0;
        }
        .item {
          height: 100px;
          margin-bottom: 20px;
          background: red;
        }
      </style>
      <body>
        <div id="pages-container">
          <div class="pdf-page" id="page">
             <div class="item"></div>
             <div class="item"></div>
          </div>
        </div>
      </body>
    `);
    idoc.close();

    const pageDiv = idoc.getElementById('page');
    const lastItem = pageDiv.children[1];
    
    return {
      iframeRect: iframe.getBoundingClientRect(),
      pageRect: pageDiv.getBoundingClientRect(),
      lastItemRect: lastItem.getBoundingClientRect(),
      computedTop: lastItem.getBoundingClientRect().bottom - pageDiv.getBoundingClientRect().top
    };
  });

  console.log(result);
  await browser.close();
})();
