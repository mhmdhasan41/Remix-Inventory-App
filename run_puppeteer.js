import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/reports', { waitUntil: 'networkidle0', timeout: 60000 });
    console.log("Navigated to Reports page.");
    
    // Wait for data
    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.MuiCard-root');
      return Array.from(cards).some(c => c.textContent.includes('رصيد الأصناف الكلية'));
    }, { timeout: 10000 });

    async function getStats() {
      return await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.MuiCard-root'));
        const totalItemsCard = cards.find(c => c.textContent.includes('رصيد الأصناف الكلية'));
        const availableStockCard = cards.find(c => c.textContent.includes('الأرصدة المتوفرة'));
        const criticalItemsCard = cards.find(c => c.textContent.includes('أصناف حرجة للتعاقد'));
        
        return {
          totalItems: totalItemsCard ? totalItemsCard.querySelector('h6').textContent : null,
          availableStock: availableStockCard ? availableStockCard.querySelector('h6').textContent : null,
          criticalItems: criticalItemsCard ? criticalItemsCard.querySelector('h6').textContent : null,
        };
      });
    }

    const initialStats = await getStats();
    console.log("Stats before clicking warehouse:", initialStats);

    // Let's print out what warehouse selects exist
    await page.evaluate(() => {
       const selects = Array.from(document.querySelectorAll('.MuiSelect-select'));
       console.log("Selects found:", selects.length);
       selects.forEach(s => console.log(s.textContent));
    });

  } catch(e) {
    console.error("Test failed:", e);
  } finally {
    await browser.close();
  }
})();
