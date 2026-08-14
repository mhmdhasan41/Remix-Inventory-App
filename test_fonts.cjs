const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  await page.setContent(`
    <html><body></body></html>
  `);

  const result = await page.evaluate(async () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const idoc = iframe.contentWindow.document;
    idoc.open();
    idoc.write(`
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;850&display=swap" rel="stylesheet">
      </head>
      <body>
        <div style="font-family: 'Cairo'">Test</div>
      </body>
    `);
    idoc.close();
    
    await idoc.fonts.ready;
    return idoc.fonts.check("12px Cairo");
  });

  console.log('Font loaded:', result);
  await browser.close();
})();
