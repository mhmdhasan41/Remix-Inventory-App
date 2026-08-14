const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  // Set zoom to 150%
  const client = await page.target().createCDPSession();
  await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1.5 });
  
  await page.setContent(`
    <html dir="rtl">
      <body>
        <div id="box" style="width: 100px; height: 100px; background: red;"></div>
      </body>
    </html>
  `);

  const result = await page.evaluate(() => {
    const box = document.getElementById('box');
    return box.getBoundingClientRect().height;
  });

  console.log('Height at 150% zoom:', result);
  await browser.close();
})();
