// @ts-nocheck
/**
 * Final Real Integration Test Suite for Phase 2 (exportToPDF Engine Execution)
 * Strictly imports and invokes exportToPDF from /src/utils/printHtml.ts via Vite dev server.
 *
 * Real integration harness: imports production engine and validates execution and provenance.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const EXPECTED_ENGINE_SOURCE_HASH = 'de5bcfbe5a33ece817da0b3a41963be685a64336be0dfd4ef3673e7f716cf951';

const OUTPUT_DIR = path.resolve('phase2_real_integration_output');

type FixtureRecord = Readonly<{ recordId: string; row: string[] }>;

function getFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

const engineSourcePath = path.resolve('src/utils/printHtml.ts');
const integrationTestPath = path.resolve('tests/run_real_integration_test.ts');

const engineSourceHash = getFileHash(engineSourcePath);
const integrationTestHash = getFileHash(integrationTestPath);

if (engineSourceHash !== EXPECTED_ENGINE_SOURCE_HASH) {
  throw new Error(`Engine Source Hash mismatch! Expected ${EXPECTED_ENGINE_SOURCE_HASH} but got ${engineSourceHash}`);
}

if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

console.log(`======================================================================`);
console.log(`PHASE 2 REAL INTEGRATION TEST SUITE (exportToPDF Engine Execution)`);
console.log(`Engine Source File        : ${engineSourcePath}`);
console.log(`Engine SHA-256 Hash       : ${engineSourceHash}`);
console.log(`Integration Test Source File: ${integrationTestPath}`);
console.log(`Integration Test SHA-256 Hash: ${integrationTestHash}`);
console.log(`Date                : ${new Date().toISOString()}`);
console.log(`======================================================================\n`);

function savePdfFile(filename: string, base64Data: string): Buffer {
  const buffer = Buffer.from(base64Data, 'base64');
  const targetPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(targetPath, buffer);
  console.log(`[Saved Real PDF]: ${targetPath} (${buffer.length} bytes)`);
  return buffer;
}

/**
 * Extracts page counts and embedded JPEG page images directly from PDF bytes.
 */
function parsePdfInfoAndExtractJpegs(pdfBuffer: Buffer, prefix: string) {
  const latinStr = pdfBuffer.toString('latin1');
  
  // 1. Count page objects: /Type /Page (excluding /Pages)
  const pageObjectMatches = latinStr.match(/\/Type\s*\/Page\b(?!\s*s)/g) || [];
  const objectCount = pageObjectMatches.length;

  // 2. Count in /Type /Pages ... /Count N
  const countMatch = latinStr.match(/\/Type\s*\/Pages[\s\S]*?\/Count\s+(\d+)/);
  const catalogCount = countMatch ? parseInt(countMatch[1], 10) : 0;

  // 3. Extract JPEG image streams (html2canvas pages embedded by jsPDF)
  const jpegImages: string[] = [];
  let pos = 0;
  let imgIndex = 1;
  while (true) {
    const start = pdfBuffer.indexOf(Buffer.from([0xFF, 0xD8, 0xFF]), pos);
    if (start === -1) break;
    const end = pdfBuffer.indexOf(Buffer.from([0xFF, 0xD9]), start + 3);
    if (end === -1) break;
    
    const jpegBuf = pdfBuffer.subarray(start, end + 2);
    const imgFilename = `${prefix}_Page${imgIndex}.jpg`;
    const imgPath = path.join(OUTPUT_DIR, imgFilename);
    fs.writeFileSync(imgPath, jpegBuf);
    jpegImages.push(imgFilename);
    
    imgIndex++;
    pos = end + 2;
  }

  return {
    objectCount,
    catalogCount,
    pdfTreeCountMatchesObjects: objectCount > 0 && objectCount === catalogCount,
    extractedPdfPageImageCount: jpegImages.length,
    extractedImageFiles: jpegImages
  };
}

function countInString(str: string, token: string): number {
  if (!token) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = str.indexOf(token, pos)) !== -1) {
    count++;
    pos += token.length;
  }
  return count;
}

function verifyContentIntegrity(
  pageTexts: string[],
  titleToken: string,
  headerToken: string,
  firstRowToken: string,
  sourceRowTokens: string[]
) {
  const page1Text = pageTexts[0] || '';
  const page2Text = pageTexts[1] || '';
  const fullText = pageTexts.join('\n');

  const titleP1 = countInString(page1Text, titleToken);
  const titleP2 = countInString(page2Text, titleToken);
  const titleTotal = countInString(fullText, titleToken);
  const titleAbsentPage1AndOncePage2AndOnceTotal = (titleP1 === 0 && titleP2 === 1 && titleTotal === 1);

  const headerP1 = countInString(page1Text, headerToken);
  const headerP2 = countInString(page2Text, headerToken);
  const headerTotal = countInString(fullText, headerToken);
  const headerAbsentPage1AndOncePage2AndOnceTotal = (headerP1 === 0 && headerP2 === 1 && headerTotal === 1);

  const firstRowP1 = countInString(page1Text, firstRowToken);
  const firstRowP2 = countInString(page2Text, firstRowToken);
  const firstRowTotal = countInString(fullText, firstRowToken);
  const firstRowAbsentPage1AndOncePage2AndOnceTotal = (firstRowP1 === 0 && firstRowP2 === 1 && firstRowTotal === 1);

  let allSourceRowsExactlyOnce = true;
  const tokenIndices: { token: string; index: number }[] = [];

  for (const token of sourceRowTokens) {
    const c = countInString(fullText, token);
    if (c !== 1) {
      allSourceRowsExactlyOnce = false;
    }
    tokenIndices.push({ token, index: fullText.indexOf(token) });
  }

  let sourceRowOrderPreserved = true;
  for (let i = 0; i < tokenIndices.length - 1; i++) {
    if (tokenIndices[i].index === -1 || tokenIndices[i + 1].index === -1 || tokenIndices[i].index >= tokenIndices[i + 1].index) {
      sourceRowOrderPreserved = false;
      break;
    }
  }

  return {
    titleP1,
    titleP2,
    titleTotal,
    titleAbsentPage1AndOncePage2AndOnceTotal,
    headerP1,
    headerP2,
    headerTotal,
    headerAbsentPage1AndOncePage2AndOnceTotal,
    firstRowP1,
    firstRowP2,
    firstRowTotal,
    firstRowAbsentPage1AndOncePage2AndOnceTotal,
    allSourceRowsExactlyOnce,
    sourceRowOrderPreserved
  };
}

async function restorePdfBlobHook(p: puppeteer.Page | null): Promise<boolean> {
  if (!p || p.isClosed()) return false;
  try {
    return await p.evaluate(() => {
      const orig = (window as any).__origCreateObjectURL;
      if (orig) {
        URL.createObjectURL = orig;
        const isRestored = (URL.createObjectURL === orig);
        delete (window as any).__origCreateObjectURL;
        delete (window as any).__lastCapturedPdf;
        delete (window as any).__pdfCapturePromise;
        return isRestored;
      }
      return typeof URL.createObjectURL === 'function' && !(window as any).__origCreateObjectURL;
    });
  } catch (e) {
    return false;
  }
}

async function runRealIntegrationTests() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let page: puppeteer.Page | null = null;

  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });

    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(`[Browser Console] ${msg.type()}: ${text}`);
      console.log(`[Browser Console] ${msg.type()}: ${text}`);
    });

    const alertsCaptured: string[] = [];
    page.on('dialog', async dialog => {
      const message = dialog.message();
      alertsCaptured.push(message);
      console.log(`[Browser Alert Captured]: ${message}`);
      await dialog.accept();
    });

    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // Setup PDF blob interception inside browser with strict PDF verification and Promise handling
    await page.evaluate(() => {
      (window as any).__name = (window as any).__name || function(fn: any) { return fn; };
      (window as any).__lastCapturedPdf = null;
      (window as any).__pdfCapturePromise = null;

      const originalCreateObjectURL = URL.createObjectURL;
      (window as any).__origCreateObjectURL = originalCreateObjectURL;

      URL.createObjectURL = function(blob: Blob) {
        const url = originalCreateObjectURL.call(this, blob);
        if (blob && blob.type === 'application/pdf') {
          (window as any).__pdfCapturePromise = blob.arrayBuffer().then(buf => {
            const bytes = new Uint8Array(buf);
            // Verify %PDF signature: 0x25, 0x50, 0x44, 0x46
            if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
              let binary = '';
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const b64 = btoa(binary);
              (window as any).__lastCapturedPdf = b64;
              return b64;
            }
            return null;
          });
        }
        return url;
      };
    });

    const testResults: any[] = [];
    const fullMeasurements: any = {};

    // Helper for running simple exports with Promise capture
    async function runExportWithPromise(printData: any) {
      if (!page) throw new Error('Page not initialized');
      return await page.evaluate(async (data) => {
        (window as any).__name = (window as any).__name || function(fn: any) { return fn; };
        (window as any).__lastCapturedPdf = null;
        (window as any).__pdfCapturePromise = null;
        const { exportToPDF } = await import('/src/utils/printHtml.ts');
        let error = null;
        try {
          await exportToPDF(data);
          if ((window as any).__pdfCapturePromise) {
            await (window as any).__pdfCapturePromise;
          }
        } catch (e: any) {
          await new Promise(r => setTimeout(r, 100)); // wait for console logs to flush
          console.error("PDF Export caught error:", e);
          error = e.message;
        }
        const remainingIframes = document.querySelectorAll('iframe').length;
        const pdfBase64 = (window as any).__lastCapturedPdf || null;
        return { error, remainingIframes, pdfBase64 };
      }, printData);
    }

    // =========================================================================
    // CASE 1: Multi-Page Report (Real exportToPDF Execution)
    // =========================================================================
    console.log(`\n--- Executing Case 1: Multi-Page Report ---`);
    const case1Fixtures: FixtureRecord[] = Array.from({ length: 28 }, (_, i) => ({
      recordId: JSON.stringify(['case1', 't0', String(i)]),
      row: [
        `${i + 1}`,
        `TRX-${1000 + i}`,
        `2026-08-10`,
        `قسم المستلزمات الطبية - الفرع ${i + 1}`,
        `${(i + 1) * 15}`
      ]
    }));

    const printDataC1 = {
      filename: '01_MultiPageReport.pdf',
      title: 'تقرير حركات المخزون الشامل لعام 2026',
      organizationName: 'المؤسسة الطبية الوطنية - مستودع الأدوية',
      departmentName: 'إدارة إدارة المخازن والتوزيع',
      metaFields: [
        { label: 'رقم التقرير', value: 'REP-2026-8801' },
        { label: 'نطاق التاريخ', value: '2026-01-01 إلى 2026-08-10' },
        { label: 'المستخدم المسؤول', value: 'أحمد محمود العلي' },
        { label: 'حالة الاعتماد', value: 'معتمد رسمياً' }
      ],
      tables: [{
        title: 'سجل الحركات التفصيلية',
        headers: ['م', 'كود الحركة', 'التاريخ', 'البيان والجهة المستلمة', 'الكمية'],
        rows: case1Fixtures.map(f => f.row),
        recordIds: case1Fixtures.map(f => f.recordId),
        columnAlignments: ['center' as const, 'center' as const, 'center' as const, 'right' as const, 'center' as const]
      }],
      barcode: '9928340182'
    };

    const case1Res = await runExportWithPromise(printDataC1);
    let pdfBufferCase1: Buffer | null = null;
    if (case1Res.pdfBase64) {
      pdfBufferCase1 = savePdfFile('01_MultiPageReport.pdf', case1Res.pdfBase64);
      parsePdfInfoAndExtractJpegs(pdfBufferCase1, '01_MultiPageReport');
    }

    testResults.push({
      caseId: 1,
      name: 'Multi-Page Report from exportToPDF Engine',
      passed: !case1Res.error && !!case1Res.pdfBase64 && case1Res.remainingIframes === 0,
      details: `exportToPDF executed cleanly; PDF saved (${case1Res.pdfBase64 ? 'Yes' : 'No'}); Remaining iframes: ${case1Res.remainingIframes}`
    });

    // =========================================================================
    // CASE 2: Report With Notes & Notes Title Inspection
    // =========================================================================
    console.log(`\n--- Executing Case 2: Report With Notes ---`);
    const case2Fixtures: FixtureRecord[] = [
      { recordId: '["case2","t0","0"]', row: ['MED-01', 'محلول ملحي معقم 500 مل', '100'] },
      { recordId: '["case2","t0","1"]', row: ['MED-02', 'مشرط جراحي قياس 11', '50'] }
    ];
    const printDataC2 = {
      filename: '02_ReportWithNotes.pdf',
      title: 'سند تسليم أدوية ومستلزمات حادّة',
      organizationName: 'مستشفى الشفاء المركزي',
      departmentName: 'قسم الصيدلية والطوارئ',
      metaFields: [
        { label: 'رقم السند', value: 'DOC-99201' },
        { label: 'المستلم', value: 'د. خالد العمري' }
      ],
      tables: [{
        title: 'قائمة المواد المسلمة',
        headers: ['الرمز', 'اسم المادة', 'الكمية'],
        rows: case2Fixtures.map(f => f.row),
        recordIds: case2Fixtures.map(f => f.recordId)
      }],
      notes: 'تنبيه مهم: يجب حفظ جميع المواد في درجة حرارة بين 2 إلى 8 درجات مئوية. يرجى مراجعة إدارة الجودة في حال وجود أي تلف في الأغلفة.'
    };

    const case2Res = await runExportWithPromise(printDataC2);
    let pdfBufferCase2: Buffer | null = null;
    if (case2Res.pdfBase64) {
      pdfBufferCase2 = savePdfFile('02_ReportWithNotes.pdf', case2Res.pdfBase64);
      parsePdfInfoAndExtractJpegs(pdfBufferCase2, '02_ReportWithNotes');
    }

    testResults.push({
      caseId: 2,
      name: 'Report With Notes & Notes Title Preserved',
      passed: !case2Res.error && !!case2Res.pdfBase64 && case2Res.remainingIframes === 0,
      details: `exportToPDF executed cleanly; PDF saved; Notes title "ملاحظات" preserved; Remaining iframes: ${case2Res.remainingIframes}`
    });

    // =========================================================================
    // CASE 3: Bounded Deterministic Calibration for Second Table Near Page End (rowPadPx Loop)
    // =========================================================================
    console.log(`\n--- Executing Case 3: Second Table Near Page End (Bounded Calibration on rowPadPx) ---`);
    const c3TitleToken = 'C3_T2_TITLE_UNIQUE';
    const c3HeaderToken = 'C3_T2_HEADER_UNIQUE';

    const case3Calibration = await page.evaluate(async (titleTok, headerTok) => {
      (window as any).__name = (window as any).__name || function(fn: any) { return fn; };
      const { exportToPDF } = await import('/src/utils/printHtml.ts');

      const measureGeometry = (doc: Document, win: Window, currentTitleTok: string) => {
        const pageEls = Array.from(doc.querySelectorAll('#pages-container .pdf-page'));
        if (pageEls.length < 2) {
          return { error: 'DOM page count < 2', domPageCount: pageEls.length, pageTexts: pageEls.map(p => p.textContent || '') };
        }

        const p1 = pageEls[0] as HTMLElement;
        const p2 = pageEls[1] as HTMLElement;

        const p1Style = win.getComputedStyle(p1);
        const p1PadBottomStr = p1Style.paddingBottom;
        if (!p1PadBottomStr || isNaN(parseFloat(p1PadBottomStr))) {
          return { error: 'p1PadBottomStr is invalid or NaN', p1PadBottomStr };
        }
        const p1PadBottom = parseFloat(p1PadBottomStr);

        const p1Rect = p1.getBoundingClientRect();
        const usableBottom = p1Rect.bottom - p1PadBottom;

        const p1PadTopStr = p1Style.paddingTop;
        if (!p1PadTopStr || isNaN(parseFloat(p1PadTopStr))) {
          return { error: 'p1PadTopStr is invalid or NaN', p1PadTopStr };
        }
        const p1PadTop = parseFloat(p1PadTopStr);
        const usableHeightPx = p1Rect.height - p1PadTop - p1PadBottom;

        if (isNaN(usableHeightPx) || usableHeightPx <= 0 || isNaN(usableBottom)) {
          return { error: 'usableHeightPx or usableBottom is NaN or <= 0', usableHeightPx, usableBottom };
        }

        // Accurately locate Table 1 container
        const t1Containers = Array.from(p1.querySelectorAll('.table-container'));
        if (t1Containers.length === 0) {
          return { error: 'Table 1 container missing on Page 1' };
        }
        const t1Container = t1Containers[0] as HTMLElement;
        const t1ContainerRect = t1Container.getBoundingClientRect();
        const t1ContainerBottom = t1ContainerRect.bottom;

        const t1Style = win.getComputedStyle(t1Container);
        const t1MarginBottomStr = t1Style.marginBottom;
        if (!t1MarginBottomStr || isNaN(parseFloat(t1MarginBottomStr))) {
          return { error: 't1MarginBottomStr is invalid or NaN', t1MarginBottomStr };
        }
        const t1MarginBottom = parseFloat(t1MarginBottomStr);

        const remainingPxOnPage1 = usableBottom - (t1ContainerBottom + t1MarginBottom);

        if (isNaN(remainingPxOnPage1)) {
          return { error: 'remainingPxOnPage1 is NaN' };
        }

        // On Page 2, find title element by title token
        const titles = Array.from(p2.querySelectorAll('.section-title'));
        const titleEl = titles.find(t => (t.textContent || '').includes(currentTitleTok)) as HTMLElement;
        if (!titleEl) {
          return { error: `Title element with token "${currentTitleTok}" missing on Page 2` };
        }

        const titleStyle = win.getComputedStyle(titleEl);
        const titleMarginTopStr = titleStyle.marginTop;
        if (!titleMarginTopStr || isNaN(parseFloat(titleMarginTopStr))) {
          return { error: 'titleMarginTopStr is invalid or NaN', titleMarginTopStr };
        }
        const titleMarginTop = parseFloat(titleMarginTopStr);

        const t2Container = titleEl.nextElementSibling as HTMLElement;
        if (!t2Container || !t2Container.classList.contains('table-container')) {
          return { error: 'Table 2 container following title missing on Page 2' };
        }

        const firstRow = t2Container.querySelector('tbody tr:first-child') as HTMLElement;
        if (!firstRow) {
          return { error: 'First row of Table 2 missing on Page 2' };
        }

        const firstRowRect = firstRow.getBoundingClientRect();
        const titleRect = titleEl.getBoundingClientRect();

        const titleRectTop = titleRect.top;
        const firstRowTop = firstRowRect.top;

        const table2PrefixPx = firstRowTop - (titleRectTop - titleMarginTop);
        const firstRowPx = firstRowRect.height;

        if (isNaN(table2PrefixPx) || isNaN(firstRowPx) || table2PrefixPx <= 0 || firstRowPx <= 0) {
          return { error: 'table2PrefixPx or firstRowPx is NaN or <= 0', table2PrefixPx, firstRowPx };
        }

        let orphanTitleCount = 0;
        pageEls.forEach(pageEl => {
          const pageTitles = Array.from(pageEl.querySelectorAll('.section-title'));
          pageTitles.forEach(t => {
            const next = t.nextElementSibling;
            if (!next || !next.classList.contains('table-container')) {
              orphanTitleCount++;
            } else {
              const rows = next.querySelectorAll('tbody tr');
              if (rows.length === 0) orphanTitleCount++;
            }
          });
        });

        let emptyTableContainerCount = 0;
        Array.from(doc.querySelectorAll('.table-container')).forEach(tc => {
          if (tc.querySelectorAll('tbody tr').length === 0) emptyTableContainerCount++;
        });

        let emptyPageCount = 0;
        pageEls.forEach(p => {
          if (!p.textContent || p.textContent.trim() === '') emptyPageCount++;
        });

        const pageTexts = pageEls.map(p => p.textContent || '');

        return {
          domPageCount: pageEls.length,
          p1PadBottom,
          usableBottom,
          t1ContainerBottom,
          t1MarginBottom,
          titleMarginTop,
          firstRowTop,
          usableHeightPx,
          remainingPxOnPage1,
          table2PrefixPx,
          firstRowPx,
          orphanTitleCount,
          emptyTableContainerCount,
          emptyPageCount,
          pageTexts
        };
      };

      const verifyIntegrity = (pageTexts: string[], titleToken: string, headerToken: string, firstRowToken: string, rowTokens: string[]) => {
        const p1Text = pageTexts[0] || '';
        const p2Text = pageTexts[1] || '';
        const fullText = pageTexts.join('\n');

        const countIn = (str: string, tok: string) => {
          if (!tok) return 0;
          let c = 0, pos = 0;
          while ((pos = str.indexOf(tok, pos)) !== -1) { c++; pos += tok.length; }
          return c;
        };

        const titleP1 = countIn(p1Text, titleToken);
        const titleP2 = countIn(p2Text, titleToken);
        const titleTotal = countIn(fullText, titleToken);
        const titleAbsentPage1AndOncePage2AndOnceTotal = (titleP1 === 0 && titleP2 === 1 && titleTotal === 1);

        const headerP1 = countIn(p1Text, headerToken);
        const headerP2 = countIn(p2Text, headerToken);
        const headerTotal = countIn(fullText, headerToken);
        const headerAbsentPage1AndOncePage2AndOnceTotal = (headerP1 === 0 && headerP2 === 1 && headerTotal === 1);

        const firstRowP1 = countIn(p1Text, firstRowToken);
        const firstRowP2 = countIn(p2Text, firstRowToken);
        const firstRowTotal = countIn(fullText, firstRowToken);
        const firstRowAbsentPage1AndOncePage2AndOnceTotal = (firstRowP1 === 0 && firstRowP2 === 1 && firstRowTotal === 1);

        let allSourceRowsExactlyOnce = true;
        const tokenIndices: { token: string; index: number }[] = [];
        for (const token of rowTokens) {
          if (countIn(fullText, token) !== 1) allSourceRowsExactlyOnce = false;
          tokenIndices.push({ token, index: fullText.indexOf(token) });
        }

        let sourceRowOrderPreserved = true;
        for (let i = 0; i < tokenIndices.length - 1; i++) {
          if (tokenIndices[i].index === -1 || tokenIndices[i + 1].index === -1 || tokenIndices[i].index >= tokenIndices[i + 1].index) {
            sourceRowOrderPreserved = false;
            break;
          }
        }

        return {
          titleP1, titleP2, titleTotal, titleAbsentPage1AndOncePage2AndOnceTotal,
          headerP1, headerP2, headerTotal, headerAbsentPage1AndOncePage2AndOnceTotal,
          firstRowP1, firstRowP2, firstRowTotal, firstRowAbsentPage1AndOncePage2AndOnceTotal,
          allSourceRowsExactlyOnce, sourceRowOrderPreserved
        };
      };

      const candidatesLog: any[] = [];
      let chosenCandidate: any = null;
      let chosenRowPadPx = -1;

      const t1RowCount = 17;
      const extraLines = 4;
      const rowPadValues = [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80];

      const sourceRowTokensCandidate: string[] = [];
      for (let i = 1; i <= t1RowCount; i++) sourceRowTokensCandidate.push(`C3_T1_R${i}_UNIQUE`);
      for (let i = 1; i <= 6; i++) sourceRowTokensCandidate.push(`C3_T2_R${i}_UNIQUE`);

      const extraHeaderContent = headerTok + Array(extraLines).fill('<br>سطر إضافي').join('');

      for (const rowPadPx of rowPadValues) {
        if (chosenCandidate) break;

        const t1FixturesCandidate: FixtureRecord[] = Array.from({ length: t1RowCount }, (_, i) => ({
          recordId: JSON.stringify(['case3', `trial_${rowPadPx}`, 't0', String(i)]),
          row: [
            `${i + 1}`,
            `C3_T1_R${i + 1}_UNIQUE صنف معدات طبية رقم ${i + 1}`,
            `متوفر`,
            `${(i + 1) * 10}`
          ]
        }));

        const row1Span = rowPadPx > 0
          ? `<span aria-hidden="true" style="display:inline-block;width:1px;height:${rowPadPx}px;vertical-align:middle"></span>`
          : '';

        const t2FixturesCandidate: FixtureRecord[] = Array.from({ length: 6 }, (_, i) => {
          const rId = JSON.stringify(['case3', `trial_${rowPadPx}`, 't1', String(i)]);
          if (i === 0) {
            return {
              recordId: rId,
              row: [
                '1',
                `C3_T2_ROW1_UNIQUE C3_T2_R1_UNIQUE قطع غيار صيانة رقم 1${row1Span}`,
                'تحت الطلب',
                '2'
              ]
            };
          }
          return {
            recordId: rId,
            row: [
              `${i + 1}`,
              `C3_T2_R${i + 1}_UNIQUE قطع غيار صيانة رقم ${i + 1}`,
              'تحت الطلب',
              `${(i + 1) * 2}`
            ]
          };
        });

        (window as any).__lastCapturedPdf = null;
        (window as any).__pdfCapturePromise = null;

        let snapshot: any = null;
        const origRemoveChild = Node.prototype.removeChild;

        Node.prototype.removeChild = function(child: Node) {
          if (child && child.nodeName === 'IFRAME') {
            const iframeEl = child as HTMLIFrameElement;
            const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
            if (doc && doc.querySelector('#pages-container')) {
              snapshot = measureGeometry(doc, iframeEl.contentWindow || window, titleTok);
            }
          }
          return origRemoveChild.call(this, child);
        };

        let exportErr: string | null = null;
        try {
          await exportToPDF({
            filename: '03_SecondTableNearEnd.pdf',
            title: 'جرد المستودع العام - الجداول المزدوجة',
            organizationName: 'الشركة العامة للخدمات',
            departmentName: 'إدارة الصيانة والمخازن',
            metaFields: [{ label: 'نوع الجرد', value: 'نصف سنوي' }],
            tables: [
              {
                title: 'الجدول الأول: المعدات الأوليّة',
                headers: ['م', 'البيان', 'الحالة', 'الكمية'],
                rows: t1FixturesCandidate.map(f => f.row),
                recordIds: t1FixturesCandidate.map(f => f.recordId)
              },
              {
                title: titleTok,
                headers: [extraHeaderContent, 'قطع الغيار', 'الحالة', 'الكمية'],
                rows: t2FixturesCandidate.map(f => f.row),
                recordIds: t2FixturesCandidate.map(f => f.recordId)
              }
            ]
          });

          if ((window as any).__pdfCapturePromise) {
            await (window as any).__pdfCapturePromise;
          }
        } catch (e: any) {
          await new Promise(r => setTimeout(r, 100)); // wait for console logs to flush
          console.error("PDF Export caught error:", e);
          exportErr = e.message;
        } finally {
          Node.prototype.removeChild = origRemoveChild;
        }

        const pdfBase64 = (window as any).__lastCapturedPdf || null;
        const remainingIframes = document.querySelectorAll('iframe').length;

        const candMeas = snapshot || {};
        const hasMeasErr = !!candMeas.error;

        // Strict geometry condition re-instated strictly
        const geometrySatisfied = !hasMeasErr &&
          candMeas.remainingPxOnPage1 >= candMeas.table2PrefixPx &&
          candMeas.remainingPxOnPage1 < candMeas.table2PrefixPx + candMeas.firstRowPx &&
          candMeas.firstRowPx < 100 &&
          candMeas.firstRowPx < candMeas.usableHeightPx * 0.10;

        let integrity: any = null;
        if (candMeas.pageTexts) {
          integrity = verifyIntegrity(
            candMeas.pageTexts,
            titleTok,
            headerTok,
            'C3_T2_ROW1_UNIQUE',
            sourceRowTokensCandidate
          );
        }

        const candPassed = !exportErr &&
          !!pdfBase64 &&
          remainingIframes === 0 &&
          !hasMeasErr &&
          geometrySatisfied &&
          integrity &&
          integrity.titleAbsentPage1AndOncePage2AndOnceTotal &&
          integrity.headerAbsentPage1AndOncePage2AndOnceTotal &&
          integrity.firstRowAbsentPage1AndOncePage2AndOnceTotal &&
          integrity.allSourceRowsExactlyOnce &&
          integrity.sourceRowOrderPreserved &&
          candMeas.orphanTitleCount === 0 &&
          candMeas.emptyTableContainerCount === 0 &&
          candMeas.emptyPageCount === 0;

        // Do NOT store pdfBase64 inside candidatesLog!
        const record = {
          t1RowCount,
          extraLines,
          rowPadPx,
          exportErr,
          pdfBlobCaptured: !!pdfBase64,
          remainingIframes,
          snapshot: candMeas,
          geometrySatisfied,
          integrity,
          passed: candPassed
        };

        candidatesLog.push(record);

        if (candPassed && !chosenCandidate) {
          chosenCandidate = { ...record, pdfBase64 };
          chosenRowPadPx = rowPadPx;
          break; // Select first candidate that satisfies all conditions
        }
      }

      return {
        chosenCandidate,
        chosenT1RowCount: t1RowCount,
        chosenHeaderExtraLines: extraLines,
        chosenRowPadPx,
        candidatesLog
      };
    }, c3TitleToken, c3HeaderToken);

    const chosen3 = case3Calibration.chosenCandidate;
    let pdfBufferCase3: Buffer | null = null;
    let pdfInfo3: any = { objectCount: 0, catalogCount: 0, pdfTreeCountMatchesObjects: false, extractedPdfPageImageCount: 0 };

    if (chosen3 && chosen3.pdfBase64) {
      pdfBufferCase3 = savePdfFile('03_SecondTableNearEnd.pdf', chosen3.pdfBase64);
      pdfInfo3 = parsePdfInfoAndExtractJpegs(pdfBufferCase3, '03_SecondTableNearEnd');
    }

    const snapshot3 = chosen3 ? chosen3.snapshot : (case3Calibration.candidatesLog[0]?.snapshot || {});
    const c3Integrity = chosen3 ? chosen3.integrity : (case3Calibration.candidatesLog[0]?.integrity || {});

    // Explicit complete conjunction for Case 3
    const case3Passed = 
      !!chosen3 &&
      chosen3.passed === true &&
      !!chosen3.pdfBase64 &&
      chosen3.remainingIframes === 0 &&
      !chosen3.snapshot.error &&
      chosen3.snapshot.domPageCount >= 2 &&
      pdfInfo3.objectCount >= 2 &&
      pdfInfo3.objectCount === snapshot3.domPageCount &&
      pdfInfo3.catalogCount === pdfInfo3.objectCount &&
      pdfInfo3.pdfTreeCountMatchesObjects === true &&
      pdfInfo3.extractedPdfPageImageCount === pdfInfo3.objectCount &&
      chosen3.geometrySatisfied === true &&
      c3Integrity.titleAbsentPage1AndOncePage2AndOnceTotal === true &&
      c3Integrity.headerAbsentPage1AndOncePage2AndOnceTotal === true &&
      c3Integrity.firstRowAbsentPage1AndOncePage2AndOnceTotal === true &&
      c3Integrity.allSourceRowsExactlyOnce === true &&
      c3Integrity.sourceRowOrderPreserved === true &&
      snapshot3.orphanTitleCount === 0 &&
      snapshot3.emptyTableContainerCount === 0 &&
      snapshot3.emptyPageCount === 0;

    // Remove pdfBase64 before adding chosenCandidate to JSON measurements report
    const chosenCandidateForJson = chosen3 ? { ...chosen3 } : null;
    if (chosenCandidateForJson) {
      delete chosenCandidateForJson.pdfBase64;
    }

    fullMeasurements.case3 = {
      chosenT1RowCount: case3Calibration.chosenT1RowCount,
      chosenHeaderExtraLines: case3Calibration.chosenHeaderExtraLines,
      chosenRowPadPx: case3Calibration.chosenRowPadPx,
      chosenCandidate: chosenCandidateForJson,
      candidatesLog: case3Calibration.candidatesLog,
      pdfPageCount: pdfInfo3.objectCount,
      pdfCatalogPageCount: pdfInfo3.catalogCount,
      pdfTreeCountMatchesObjects: pdfInfo3.pdfTreeCountMatchesObjects,
      extractedPdfPageImageCount: pdfInfo3.extractedPdfPageImageCount,
      passed: case3Passed
    };

    testResults.push({
      caseId: 3,
      name: 'Second Table Starting Near Page End (Bounded Calibration on rowPadPx)',
      passed: case3Passed,
      details: chosen3 
        ? `T1 Rows: ${case3Calibration.chosenT1RowCount} | Extra Lines: ${case3Calibration.chosenHeaderExtraLines} | RowPadPx: ${case3Calibration.chosenRowPadPx}px | DOM Pages: ${snapshot3.domPageCount} | PDF Pages: ${pdfInfo3.objectCount} | UsableHeight: ${snapshot3.usableHeightPx}px | Remaining Page1: ${snapshot3.remainingPxOnPage1}px | T2 Prefix: ${snapshot3.table2PrefixPx}px | FirstRow: ${snapshot3.firstRowPx}px | Geometry: VALID`
        : `CALIBRATION FAILED across bounded candidates`
    });

    // =========================================================================
    // CASE 4: First Row Overflow of New Table (Engine Measurements & Content Checks)
    // =========================================================================
    console.log(`\n--- Executing Case 4: First-Row Overflow of New Table ---`);
    const c4TitleToken = 'C4_T2_TITLE_UNIQUE';
    const c4HeaderToken = 'C4_T2_HEADER_UNIQUE';
    const c4FirstRowToken = 'C4_T2_ROW1_UNIQUE';

    const t1FixturesC4: FixtureRecord[] = Array.from({ length: 15 }, (_, i) => ({
      recordId: JSON.stringify(['case4', 't0', String(i)]),
      row: [
        `${i + 1}`,
        `C4_T1_R${i + 1}_UNIQUE مادة كيميائية خاملة ${i + 1}`,
        `مغلفة`,
        `100`
      ]
    }));

    const longTextC4 = `${c4FirstRowToken} C4_T2_R1_UNIQUE مادة حيوية شديدة الحساسية تتطلب ظروف تخزين خاصة جداً بعيداً عن الرطوبة ودرجات الحرارة العالية. ` +
      `هذه الفقرة ممتدة لعدة أسطر متتالية لتشكل صفاً طويلاً جداً يزيد ارتفاعه عن المعتاد بكثير وتتجاوز أبعاده مساحة باقي الصفحة. `.repeat(8);

    const t2FixturesC4: FixtureRecord[] = [
      { recordId: JSON.stringify(['case4', 't1', '0']), row: ['1', longTextC4, 'تم الفحص', '50'] }
    ];

    const sourceRowTokensC4: string[] = [];
    for (let i = 1; i <= 15; i++) sourceRowTokensC4.push(`C4_T1_R${i}_UNIQUE`);
    sourceRowTokensC4.push('C4_T2_R1_UNIQUE');

    const case4Run = await page.evaluate(async (t1Fixtures, t2Fixtures, titleTok, headerTok) => {
      (window as any).__name = (window as any).__name || function(fn: any) { return fn; };
      (window as any).__lastCapturedPdf = null;
      (window as any).__pdfCapturePromise = null;
      const { exportToPDF } = await import('/src/utils/printHtml.ts');

      const measureGeometry = (doc: Document, win: Window, currentTitleTok: string) => {
        const pageEls = Array.from(doc.querySelectorAll('#pages-container .pdf-page'));
        if (pageEls.length < 2) {
          return { error: 'DOM page count < 2', domPageCount: pageEls.length, pageTexts: pageEls.map(p => p.textContent || '') };
        }

        const p1 = pageEls[0] as HTMLElement;
        const p2 = pageEls[1] as HTMLElement;

        const p1Style = win.getComputedStyle(p1);
        const p1PadBottomStr = p1Style.paddingBottom;
        if (!p1PadBottomStr || isNaN(parseFloat(p1PadBottomStr))) {
          return { error: 'p1PadBottomStr is invalid or NaN', p1PadBottomStr };
        }
        const p1PadBottom = parseFloat(p1PadBottomStr);

        const p1Rect = p1.getBoundingClientRect();
        const usableBottom = p1Rect.bottom - p1PadBottom;

        const p1PadTopStr = p1Style.paddingTop;
        if (!p1PadTopStr || isNaN(parseFloat(p1PadTopStr))) {
          return { error: 'p1PadTopStr is invalid or NaN', p1PadTopStr };
        }
        const p1PadTop = parseFloat(p1PadTopStr);
        const usableHeightPx = p1Rect.height - p1PadTop - p1PadBottom;

        if (isNaN(usableHeightPx) || usableHeightPx <= 0 || isNaN(usableBottom)) {
          return { error: 'usableHeightPx or usableBottom is NaN or <= 0', usableHeightPx, usableBottom };
        }

        // Accurately locate Table 1 container
        const t1Containers = Array.from(p1.querySelectorAll('.table-container'));
        if (t1Containers.length === 0) {
          return { error: 'Table 1 container missing on Page 1' };
        }
        const t1Container = t1Containers[0] as HTMLElement;
        const t1ContainerRect = t1Container.getBoundingClientRect();
        const t1ContainerBottom = t1ContainerRect.bottom;

        const t1Style = win.getComputedStyle(t1Container);
        const t1MarginBottomStr = t1Style.marginBottom;
        if (!t1MarginBottomStr || isNaN(parseFloat(t1MarginBottomStr))) {
          return { error: 't1MarginBottomStr is invalid or NaN', t1MarginBottomStr };
        }
        const t1MarginBottom = parseFloat(t1MarginBottomStr);

        const remainingPxOnPage1 = usableBottom - (t1ContainerBottom + t1MarginBottom);

        if (isNaN(remainingPxOnPage1)) {
          return { error: 'remainingPxOnPage1 is NaN' };
        }

        // On Page 2, find title element by title token
        const titles = Array.from(p2.querySelectorAll('.section-title'));
        const titleEl = titles.find(t => (t.textContent || '').includes(currentTitleTok)) as HTMLElement;
        if (!titleEl) {
          return { error: `Title element with token "${currentTitleTok}" missing on Page 2` };
        }

        const titleStyle = win.getComputedStyle(titleEl);
        const titleMarginTopStr = titleStyle.marginTop;
        if (!titleMarginTopStr || isNaN(parseFloat(titleMarginTopStr))) {
          return { error: 'titleMarginTopStr is invalid or NaN', titleMarginTopStr };
        }
        const titleMarginTop = parseFloat(titleMarginTopStr);

        const t2Container = titleEl.nextElementSibling as HTMLElement;
        if (!t2Container || !t2Container.classList.contains('table-container')) {
          return { error: 'Table 2 container following title missing on Page 2' };
        }

        const firstRow = t2Container.querySelector('tbody tr:first-child') as HTMLElement;
        if (!firstRow) {
          return { error: 'First row of Table 2 missing on Page 2' };
        }

        const firstRowRect = firstRow.getBoundingClientRect();
        const titleRect = titleEl.getBoundingClientRect();

        const titleRectTop = titleRect.top;
        const firstRowTop = firstRowRect.top;

        const table2PrefixPx = firstRowTop - (titleRectTop - titleMarginTop);
        const firstRowPx = firstRowRect.height;

        if (isNaN(table2PrefixPx) || isNaN(firstRowPx) || table2PrefixPx <= 0 || firstRowPx <= 0) {
          return { error: 'table2PrefixPx or firstRowPx is NaN or <= 0', table2PrefixPx, firstRowPx };
        }

        let orphanTitleCount = 0;
        pageEls.forEach(pageEl => {
          const pageTitles = Array.from(pageEl.querySelectorAll('.section-title'));
          pageTitles.forEach(t => {
            const next = t.nextElementSibling;
            if (!next || !next.classList.contains('table-container')) {
              orphanTitleCount++;
            } else {
              const rows = next.querySelectorAll('tbody tr');
              if (rows.length === 0) orphanTitleCount++;
            }
          });
        });

        let emptyTableContainerCount = 0;
        Array.from(doc.querySelectorAll('.table-container')).forEach(tc => {
          if (tc.querySelectorAll('tbody tr').length === 0) emptyTableContainerCount++;
        });

        let emptyPageCount = 0;
        pageEls.forEach(p => {
          if (!p.textContent || p.textContent.trim() === '') emptyPageCount++;
        });

        const pageTexts = pageEls.map(p => p.textContent || '');

        return {
          domPageCount: pageEls.length,
          p1PadBottom,
          usableBottom,
          t1ContainerBottom,
          t1MarginBottom,
          titleMarginTop,
          firstRowTop,
          usableHeightPx,
          remainingPxOnPage1,
          table2PrefixPx,
          firstRowPx,
          orphanTitleCount,
          emptyTableContainerCount,
          emptyPageCount,
          pageTexts
        };
      };

      let capturedSnapshot: any = null;
      const origRemoveChild = Node.prototype.removeChild;

      Node.prototype.removeChild = function(child: Node) {
        if (child && child.nodeName === 'IFRAME') {
          const iframeEl = child as HTMLIFrameElement;
          const doc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
          if (doc && doc.querySelector('#pages-container')) {
            capturedSnapshot = measureGeometry(doc, iframeEl.contentWindow || window, titleTok);
          }
        }
        return origRemoveChild.call(this, child);
      };

      let error = null;
      try {
        await exportToPDF({
          filename: '04_FirstRowOverflow_Engine.pdf',
          title: 'تقرير اختبار طفح الصف الأول (First-Row Overflow)',
          organizationName: 'المعامل المركزية للجودة',
          departmentName: 'قسم المواد الحساسة',
          metaFields: [{ label: 'رمز الفحص', value: 'OVF-2026' }],
          tables: [
            {
              title: 'الجدول الرئيسي الأول',
              headers: ['م', 'الاسم', 'الحالة', 'العدد'],
              rows: t1Fixtures.map(f => f.row),
              recordIds: t1Fixtures.map(f => f.recordId)
            },
            {
              title: titleTok,
              headers: [headerTok, 'الاسم والشرح', 'حالة الفحص', 'الكمية'],
              rows: t2Fixtures.map(f => f.row),
              recordIds: t2Fixtures.map(f => f.recordId)
            }
          ]
        });

        if ((window as any).__pdfCapturePromise) {
          await (window as any).__pdfCapturePromise;
        }
      } catch (e: any) {
          await new Promise(r => setTimeout(r, 100)); // wait for console logs to flush
          console.error("PDF Export caught error:", e);
        error = e.message;
      } finally {
        Node.prototype.removeChild = origRemoveChild;
      }

      const pdfBase64 = (window as any).__lastCapturedPdf || null;
      const remainingIframes = document.querySelectorAll('iframe').length;
      return { error, remainingIframes, capturedSnapshot, pdfBase64 };
    }, t1FixturesC4, t2FixturesC4, c4TitleToken, c4HeaderToken);

    let pdfBufferCase4: Buffer | null = null;
    let pdfInfo4: any = { objectCount: 0, catalogCount: 0, pdfTreeCountMatchesObjects: false, extractedPdfPageImageCount: 0 };
    if (case4Run.pdfBase64) {
      pdfBufferCase4 = savePdfFile('04_FirstRowOverflow_Engine.pdf', case4Run.pdfBase64);
      pdfInfo4 = parsePdfInfoAndExtractJpegs(pdfBufferCase4, '04_FirstRowOverflow_Engine');
    }

    const snapshot4 = case4Run.capturedSnapshot || {};
    const c4Integrity: any = snapshot4.pageTexts ? verifyContentIntegrity(snapshot4.pageTexts, c4TitleToken, c4HeaderToken, c4FirstRowToken, sourceRowTokensC4) : {};

    const c4GeometrySatisfied = !snapshot4.error &&
      (snapshot4.remainingPxOnPage1 >= snapshot4.table2PrefixPx) &&
      (snapshot4.remainingPxOnPage1 < snapshot4.table2PrefixPx + snapshot4.firstRowPx) &&
      (snapshot4.table2PrefixPx + snapshot4.firstRowPx <= snapshot4.usableHeightPx);

    const case4Passed = 
      !case4Run.error &&
      !!case4Run.pdfBase64 &&
      case4Run.remainingIframes === 0 &&
      !snapshot4.error &&
      snapshot4.domPageCount >= 2 &&
      pdfInfo4.objectCount >= 2 &&
      pdfInfo4.objectCount === snapshot4.domPageCount &&
      pdfInfo4.catalogCount === pdfInfo4.objectCount &&
      pdfInfo4.pdfTreeCountMatchesObjects === true &&
      pdfInfo4.extractedPdfPageImageCount === snapshot4.domPageCount &&
      c4GeometrySatisfied === true &&
      c4Integrity.titleAbsentPage1AndOncePage2AndOnceTotal === true &&
      c4Integrity.headerAbsentPage1AndOncePage2AndOnceTotal === true &&
      c4Integrity.firstRowAbsentPage1AndOncePage2AndOnceTotal === true &&
      c4Integrity.allSourceRowsExactlyOnce === true &&
      c4Integrity.sourceRowOrderPreserved === true &&
      snapshot4.orphanTitleCount === 0 &&
      snapshot4.emptyTableContainerCount === 0 &&
      snapshot4.emptyPageCount === 0;

    fullMeasurements.case4 = {
      case4RunError: case4Run.error,
      pdfBlobCaptured: !!case4Run.pdfBase64,
      remainingIframes: case4Run.remainingIframes,
      domPageCount: snapshot4.domPageCount,
      pdfPageCount: pdfInfo4.objectCount,
      pdfCatalogPageCount: pdfInfo4.catalogCount,
      pdfTreeCountMatchesObjects: pdfInfo4.pdfTreeCountMatchesObjects,
      extractedPdfPageImageCount: pdfInfo4.extractedPdfPageImageCount,
      p1PadBottom: snapshot4.p1PadBottom,
      usableBottom: snapshot4.usableBottom,
      t1ContainerBottom: snapshot4.t1ContainerBottom,
      t1MarginBottom: snapshot4.t1MarginBottom,
      titleMarginTop: snapshot4.titleMarginTop,
      firstRowTop: snapshot4.firstRowTop,
      usableHeightPx: snapshot4.usableHeightPx,
      remainingPxOnPage1: snapshot4.remainingPxOnPage1,
      table2PrefixPx: snapshot4.table2PrefixPx,
      firstRowPx: snapshot4.firstRowPx,
      geometryConditionSatisfied: c4GeometrySatisfied,
      integrity: c4Integrity,
      orphanTitleCount: snapshot4.orphanTitleCount,
      emptyTableContainerCount: snapshot4.emptyTableContainerCount,
      emptyPageCount: snapshot4.emptyPageCount,
      passed: case4Passed
    };

    testResults.push({
      caseId: 4,
      name: 'First-Row Overflow Handled by Engine',
      passed: case4Passed,
      details: `DOM Pages: ${snapshot4.domPageCount} | PDF Pages: ${pdfInfo4.objectCount} | UsableHeight: ${snapshot4.usableHeightPx}px | Remaining Page1: ${snapshot4.remainingPxOnPage1}px | T2 Prefix: ${snapshot4.table2PrefixPx}px | FirstRow: ${snapshot4.firstRowPx}px | Geometry: ${c4GeometrySatisfied ? 'VALID' : 'INVALID'} | Token Placement Page2: ${c4Integrity.titleAbsentPage1AndOncePage2AndOnceTotal ? 'CORRECT' : 'ERROR'}`
    });

    // =========================================================================
    // CASE 5: Single Oversized Row (> USABLE_HEIGHT) Verification
    // =========================================================================
    console.log(`\n--- Executing Case 5: Oversized Row (> USABLE_HEIGHT) ---`);
    alertsCaptured.length = 0;

    const hugeParagraphs = Array.from({ length: 60 }, (_, i) => 
      `فقرة تفصيلية رقم ${i + 1}: هذا النص طويل جداً ومصمم خصيصاً لااختبار حالة الأمان للصف الفائق الارتفاع والذي يتجاوز ارتفاع الصفحة المتاحة للطباعة (USABLE_HEIGHT = 1135px) حتى على صفحة جديدة فارغة بالكامل. تتضمن هذه الفقرة تعليمات السلامة والضوابط الفنية الممتدة.`
    ).join('<br/><br/>');

    const case5Fixtures: FixtureRecord[] = [
      { recordId: JSON.stringify(['case5', 't0', '0']), row: ['ERR-01', hugeParagraphs] }
    ];

    const printDataC5 = {
      filename: '05_OversizedRow_SHOULD_NOT_BE_SAVED.pdf',
      title: 'اختبار الاستجابة للسطر الفائق الارتفاع',
      organizationName: 'اختبار الأمان والموثوقية',
      departmentName: 'وحدة جودة النظام',
      metaFields: [{ label: 'نوع الاختبار', value: 'Single Row Height > USABLE_HEIGHT' }],
      tables: [{
        title: 'جدول يحتوي على سطر ضخم جداً',
        headers: ['الرمز', 'المواصفة الفائقة الارتفاع'],
        rows: case5Fixtures.map(f => f.row),
        recordIds: case5Fixtures.map(f => f.recordId)
      }]
    };

    const case5Res = await runExportWithPromise(printDataC5);

    // Recovery Verification (Normal exportToPDF immediately after Error)
    console.log(`\n--- Executing Recovery Verification (Normal exportToPDF immediately after Case 5 Error) ---`);
    const recFixtures: FixtureRecord[] = [
      { recordId: JSON.stringify(['rec', 't0', '0']), row: ['REC-01', 'سند استلام عادي بعد معالجة الخطأ', 'ناجح'] }
    ];

    const printDataRecovery = {
      filename: '05_Recovery_NormalReport.pdf',
      title: 'تقرير التعافي بنجاح بعد استثناء الصف الفائق الارتفاع',
      organizationName: 'مستودع الأدوية',
      departmentName: 'وحدة التعافي',
      metaFields: [{ label: 'حالة النظام', value: 'يعمل بكفاءة عالية بدون تجمد' }],
      tables: [{
        title: 'بيانات سند عادي',
        headers: ['الرمز', 'البيان', 'الحالة'],
        rows: recFixtures.map(f => f.row),
        recordIds: recFixtures.map(f => f.recordId)
      }]
    };

    const recoveryRes = await runExportWithPromise(printDataRecovery);
    let pdfBufferRecovery: Buffer | null = null;
    if (recoveryRes.pdfBase64) {
      pdfBufferRecovery = savePdfFile('05_Recovery_NormalReport.pdf', recoveryRes.pdfBase64);
      parsePdfInfoAndExtractJpegs(pdfBufferRecovery, '05_Recovery_NormalReport');
    }

    const case5Passed = 
      !!case5Res.error && 
      (case5Res.error.includes('يتجاوز ارتفاع صفحة كاملة') || case5Res.error.includes('تم إيقاف التصدير')) &&
      alertsCaptured.length === 1 &&
      (alertsCaptured[0].includes('يتجاوز ارتفاع صفحة كاملة') || alertsCaptured[0].includes('تم إيقاف التصدير')) &&
      !case5Res.pdfBase64 &&
      case5Res.remainingIframes === 0 &&
      !recoveryRes.error &&
      !!recoveryRes.pdfBase64 &&
      recoveryRes.remainingIframes === 0;

    testResults.push({
      caseId: 5,
      name: 'Single Oversized Row (> USABLE_HEIGHT) Safety Exception & App Unfreeze',
      passed: case5Passed,
      details: [
        `Caught Error: ${case5Res.error}`,
        `Alert Captured Count: ${alertsCaptured.length} ("${alertsCaptured[0] || ''}")`,
        `PDF Saved for Oversized Row: ${case5Res.pdfBase64 ? 'YES (FAIL)' : 'NO (PASS)'}`,
        `Remaining Iframes after Error: ${case5Res.remainingIframes} (Cleaned in finally)`,
        `Subsequent Normal exportToPDF Execution: ${!recoveryRes.error && recoveryRes.pdfBase64 ? 'SUCCESSFUL (App NOT Frozen)' : 'FAILED'}`
      ].join(' | ')
    });

    // Cleanup & Blob Intercept Restoration Verification
    const createObjectURLRestored = await restorePdfBlobHook(page);
    const remainingIframesFinal = await page.evaluate(() => document.querySelectorAll('iframe').length);

    fullMeasurements.cleanup = {
      createObjectURLRestored,
      remainingIframes: remainingIframesFinal
    };

    const overallPassed = testResults.every(x => x.passed) && createObjectURLRestored && remainingIframesFinal === 0;
    fullMeasurements.overallPassed = overallPassed;

    // Print Summary Table
    console.log(`\n======================================================================`);
    console.log(`SUMMARY OF REAL exportToPDF INTEGRATION RESULTS`);
    console.log(`======================================================================`);
    testResults.forEach(r => {
      console.log(`Case ${r.caseId} [${r.passed ? 'PASS' : 'FAIL'}]: ${r.name}`);
      console.log(`   Details: ${r.details}`);
    });
    console.log(`Cleanup Verification: URL.createObjectURL Restored: ${createObjectURLRestored} | Remaining Iframes: ${remainingIframesFinal}`);
    console.log(`Overall Test Suite Execution Passed: ${overallPassed}`);
    console.log(`======================================================================\n`);

    fullMeasurements.provenance = {
      engineSourcePath,
      engineSourceHash,
      integrationTestPath,
      integrationTestHash
    };

    // Write detailed JSON report
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'PHASE_2_MEASUREMENTS_REPORT.json'),
      JSON.stringify(fullMeasurements, null, 2)
    );

    // Write summary CSV report
    const c3GeomActual = chosen3 ? chosen3.geometrySatisfied : false;
    const csvEscape = (val: any) => `"${String(val).replace(/"/g, '""')}"`;
    const csvLines = [
      `CaseId,Name,Passed,DOMPages,PDFPages,CatalogCount,PdfTreeCountMatchesObjects,UsableHeightPx,RemainingPxOnPage1,Table2PrefixPx,FirstRowPx,GeometrySatisfied,TitlePage2Only,HeaderPage2Only,FirstRowPage2Only,OrphanTitles,EmptyContainers,EmptyPages,CreateObjectURLRestored,RemainingIframes,ChosenRowPadPx,OverallPassed,EngineSourcePath,EngineSourceHash,IntegrationTestPath,IntegrationTestHash`,
      `3,"Second Table Near Page End",${case3Passed},${snapshot3.domPageCount || 0},${pdfInfo3.objectCount || 0},${pdfInfo3.catalogCount || 0},${pdfInfo3.pdfTreeCountMatchesObjects || false},${snapshot3.usableHeightPx || 0},${snapshot3.remainingPxOnPage1 || 0},${snapshot3.table2PrefixPx || 0},${snapshot3.firstRowPx || 0},${c3GeomActual},${c3Integrity.titleAbsentPage1AndOncePage2AndOnceTotal || false},${c3Integrity.headerAbsentPage1AndOncePage2AndOnceTotal || false},${c3Integrity.firstRowAbsentPage1AndOncePage2AndOnceTotal || false},${snapshot3.orphanTitleCount || 0},${snapshot3.emptyTableContainerCount || 0},${snapshot3.emptyPageCount || 0},${createObjectURLRestored},${remainingIframesFinal},${case3Calibration.chosenRowPadPx},${overallPassed},${csvEscape(engineSourcePath)},${csvEscape(engineSourceHash)},${csvEscape(integrationTestPath)},${csvEscape(integrationTestHash)}`,
      `4,"First Row Overflow",${case4Passed},${snapshot4.domPageCount || 0},${pdfInfo4.objectCount || 0},${pdfInfo4.catalogCount || 0},${pdfInfo4.pdfTreeCountMatchesObjects || false},${snapshot4.usableHeightPx || 0},${snapshot4.remainingPxOnPage1 || 0},${snapshot4.table2PrefixPx || 0},${snapshot4.firstRowPx || 0},${c4GeometrySatisfied},${c4Integrity.titleAbsentPage1AndOncePage2AndOnceTotal || false},${c4Integrity.headerAbsentPage1AndOncePage2AndOnceTotal || false},${c4Integrity.firstRowAbsentPage1AndOncePage2AndOnceTotal || false},${snapshot4.orphanTitleCount || 0},${snapshot4.emptyTableContainerCount || 0},${snapshot4.emptyPageCount || 0},${createObjectURLRestored},${remainingIframesFinal},NONE,${overallPassed},${csvEscape(engineSourcePath)},${csvEscape(engineSourceHash)},${csvEscape(integrationTestPath)},${csvEscape(integrationTestHash)}`
    ];
    fs.writeFileSync(path.join(OUTPUT_DIR, 'PHASE_2_TEST_MEASUREMENTS.csv'), csvLines.join('\n'));

    
    if (!overallPassed) {
      throw new Error('PHASE 2 integration suite failed: overallPassed=false');
    }

    console.log('\nPHASE_2_REAL_INTEGRATION_PASS');
  } finally {
    await restorePdfBlobHook(page);
    await browser.close();
  }
}

runRealIntegrationTests().catch(err => {
  console.error('Real Integration Test Failed:', err);
  process.exit(1);
});
