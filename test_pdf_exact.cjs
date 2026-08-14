const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  const PAGE_WIDTH = 820;
  const PAGE_HEIGHT = 1195;
  const dateStr = '2026/08/10';
  const timeStr = '12:43:29';

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
          width: ${PAGE_WIDTH}px;
          box-sizing: border-box;
        }

        .pdf-page {
          width: ${PAGE_WIDTH}px;
          min-height: ${PAGE_HEIGHT}px;
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

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #007ab7;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }

        .header-right {
          text-align: right;
        }

        .org-name {
          font-size: 16px;
          font-weight: 850;
          color: #007ab7;
        }

        .dept-name {
          font-size: 13px;
          color: #0284c7;
          margin-top: 4px;
        }

        .header-left {
          text-align: left;
          font-size: 11px;
          color: #64748b;
        }

        .report-title-container {
          text-align: center;
          margin-bottom: 25px;
        }

        .report-title {
          display: inline-block;
          font-size: 18px;
          font-weight: 850;
          color: #007ab7;
          border-bottom: 2px solid #38bdf8;
          padding-bottom: 5px;
        }

        .meta-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 25px;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          min-width: 120px;
        }

        .meta-label {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 2px;
        }

        .meta-value {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }

        .table-container {
          margin-bottom: 25px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          border-spacing: 0;
          table-layout: fixed;
        }

        th {
          background-color: #007ab7;
          color: white;
          font-size: 12px;
          font-weight: 700;
          padding: 12px 10px;
          text-align: right;
          border: 1px solid #006293;
        }

        td {
          border: 1px solid #cbd5e1;
          padding: 10px 12px;
          font-size: 13px;
          color: #334155;
        }

        tr:nth-child(even) td {
          background-color: #f8fafc;
        }
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
      pageDiv.innerHTML = `
        <div class="page-header" id="header-page-${currentPageNum}">
          <div class="header-right">
            <div class="org-name">مكتب صحة البيئة - خان يونس</div>
            <div class="dept-name">دائرة البنى التحتية والتخطيط والتطوير</div>
          </div>
          <div class="header-left">
            <div>تاريخ التصدير: 2026/08/10</div>
            <div>وقت التصدير: 12:43:29</div>
            <div class="page-num-placeholder" style="font-size: 10px; font-weight: bold; margin-top: 4px; color: #64748b;">صفحة 1 من 1</div>
          </div>
        </div>
      `;
      if (currentPageNum === 1) {
        pageDiv.insertAdjacentHTML('beforeend', `
          <div class="report-title-container">
            <div class="report-title">تقرير الجرد الفعلي السنوي</div>
          </div>
          <div class="meta-grid">
            <div class="meta-item"><span class="meta-label">تصنيف التقرير</span><span class="meta-value">جرد</span></div>
          </div>
        `);
      }
      pagesContainer.appendChild(pageDiv);
      return pageDiv;
    };

    const getUsedHeight = (container) => {
      const children = Array.from(container.children);
      if (children.length === 0) return 0;
      const lastChild = children[children.length - 1];
      const containerRect = container.getBoundingClientRect();
      const lastChildRect = lastChild.getBoundingClientRect();
      return lastChildRect.bottom - containerRect.top - 30; // 30 is top padding
    };

    let pageDiv = createNewPage();
    const tableContainer = document.createElement('div');
    tableContainer.className = 'table-container';
    const table = document.createElement('table');
    
    // Header
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>كود الصنف</th><th>اسم الصنف</th><th>التصنيف</th><th>الوحدة</th><th>الرصيد الفعلي</th><th>حد الأمان</th><th>موقع التخزين</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    pageDiv.appendChild(tableContainer);

    const logs = [];
    let rowsAdded = 0;

    for (let i = 0; i < 30; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>DEV-3000</td><td>ثلاجة فريزر</td><td>أجهزة</td><td>قطعة</td><td>1</td><td>0</td><td>مخزن خانيونس</td>`;
      tbody.appendChild(tr);
      
      const used = getUsedHeight(pageDiv);
      
      if (used > USABLE_HEIGHT - SAFE_MARGIN) {
        tbody.removeChild(tr);
        logs.push({ breakAt: i, heightBeforeBreak: getUsedHeight(pageDiv) });
        break;
      } else {
        rowsAdded++;
      }
    }
    
    return { rowsAdded, logs, finalHeight: getUsedHeight(pageDiv), usable: USABLE_HEIGHT - SAFE_MARGIN };
  });

  console.log(result);
  await browser.close();
})();
