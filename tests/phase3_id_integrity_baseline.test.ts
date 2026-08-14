// @ts-nocheck
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const EXPECTED_PRINT_HTML_HASH = '2c2384af368f9429ca426fcc2a896c3991c09eae13c24159b37c6d76772f49ee';
const EXPECTED_TEST_HASH = '19958d930daa816b3f968ca35de1187575629409354e5584227ebd59f1406163';
const EXPECTED_REPORTS_HASH = '242af967386cb17e943dc44952abf356bac73ea68dbff5aa3ad8f50431920fda';
const EXPECTED_MATERIALS_HASH = '4ec3681f3ea2349bf8314dfd75f83346787eadd9f33b43c9526cc9885e141c13';
const EXPECTED_TRANSACTIONS_HASH = 'a98e20036a033b3f2b88cab73ed1f89119ebdf03fb2e31f6b8cf6dc340bc3bd4';

function checkHash(file: string, expected: string) {
  const p = path.resolve(file);
  if (!fs.existsSync(p)) return;
  const buf = fs.readFileSync(p);
  const hash = crypto.createHash('sha256').update(buf).digest('hex');
  if (hash !== expected) {
    console.error(`Hash mismatch for ${file}. Expected ${expected}, got ${hash}`);
    process.exitCode = 1;
  }
}

checkHash('src/utils/printHtml.ts', EXPECTED_PRINT_HTML_HASH);
checkHash('tests/run_real_integration_test.ts', EXPECTED_TEST_HASH);
checkHash('src/pages/Reports.tsx', EXPECTED_REPORTS_HASH);
checkHash('src/pages/Materials.tsx', EXPECTED_MATERIALS_HASH);
checkHash('src/pages/Transactions.tsx', EXPECTED_TRANSACTIONS_HASH);

async function runBaseline() {
  let browser: puppeteer.Browser | null = null;
  let testCompleted = false;
  let allEvidenceSatisfied = false;

  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    const runTestCase = async (testName: string, config: any) => {
      return await page.evaluate(async (name, cfg) => {
        let hooksRestored = false;
        let createObjectURLRestored = false;
        let appendChildRestored = false;
        let iframeQuerySelectorRestored = false;
        
        let originalCreateObjectURL: any = null;
        let originalAppendChild: any = null;
        let iframeOriginalQuerySelector: any = null;
        let iframeCaptured: HTMLIFrameElement | null = null;
        let capturedContentWindow: Window | null = null;
        
        let iframeHookInstalled = false;
        let p3Injected = false;
        let domEvidenceCaptured = false;
        
        let pdfBlobCaptured = false;
        let pdfHeaderValid = false;
        let finalDomOrdersPerTable: string[][] = [];
        let finalDomCountsPerTable: number[] = [];
        let error = null;
        
        // Store promises for intercepting the blob
        let pdfResolve: Function;
        const pdfPromise = new Promise((resolve) => { pdfResolve = resolve; });

        try {
          // 1. Hook URL.createObjectURL
          originalCreateObjectURL = URL.createObjectURL;
          URL.createObjectURL = function(blob: Blob) {
            const url = originalCreateObjectURL.call(this, blob);
            if (blob && blob.type === 'application/pdf') {
              pdfBlobCaptured = true;
              blob.arrayBuffer().then((buf: ArrayBuffer) => {
                const bytes = new Uint8Array(buf);
                if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
                  pdfHeaderValid = true;
                }
                pdfResolve();
              }).catch(() => { pdfResolve(); });
            } else {
               pdfResolve(); // Just in case a different blob is passed
            }
            return url;
          };

          // 2. Hook Node.prototype.appendChild
          originalAppendChild = Node.prototype.appendChild;
          Node.prototype.appendChild = function<T extends Node>(node: T): T {
            const result = originalAppendChild.call(this, node);
            if (node instanceof HTMLIFrameElement) {
              iframeCaptured = node;
              if (!node.contentWindow || !node.contentWindow.Element || !node.contentWindow.Element.prototype) {
                  throw new Error("Iframe contentWindow or Element not immediately available");
              }
              capturedContentWindow = node.contentWindow;
              iframeOriginalQuerySelector = capturedContentWindow.Element.prototype.querySelector;
              
              capturedContentWindow.Element.prototype.querySelector = function(sel: string) {
                if (sel === '.page-num-placeholder' && !p3Injected) {
                  p3Injected = true;
                  const idoc = capturedContentWindow!.document;
                  const tbodies = Array.from(idoc.querySelectorAll('tbody'));
                  
                  // Inject Flaws
                  if (cfg.case === 'A') {
                     if (tbodies.length >= 1) {
                       const rows = Array.from(tbodies[0].querySelectorAll('tr'));
                       if (rows.length >= 3) {
                          tbodies[0].insertBefore(rows[1], rows[0]);
                       }
                     }
                  } else if (cfg.case === 'B') {
                     if (tbodies.length >= 1) {
                       const rows = Array.from(tbodies[0].querySelectorAll('tr'));
                       if (rows.length >= 3) {
                          const newRow = idoc.createElement('tr');
                          newRow.innerHTML = '<td>P3-B-X</td>';
                          tbodies[0].replaceChild(newRow, rows[1]);
                       }
                     }
                  } else if (cfg.case === 'C') {
                     if (tbodies.length >= 1) {
                       const rows = Array.from(tbodies[0].querySelectorAll('tr'));
                       if (rows.length >= 4) {
                          const clone = rows[1].cloneNode(true);
                          tbodies[0].replaceChild(clone, rows[2]);
                       }
                     }
                  } else if (cfg.case === 'D') {
                     if (tbodies.length >= 2) {
                       const t1Rows = Array.from(tbodies[1].querySelectorAll('tr'));
                       if (t1Rows.length >= 2) {
                          const clone = t1Rows[0].cloneNode(true);
                          tbodies[1].replaceChild(clone, t1Rows[1]);
                       }
                     }
                  }

                  // Measure Immediately After Injection
                  const currentTbodies = Array.from(idoc.querySelectorAll('tbody'));
                  finalDomOrdersPerTable = currentTbodies.map(tbody => {
                     return Array.from(tbody.querySelectorAll('tr')).map(tr => {
                        const text = tr.textContent || '';
                        const match = text.match(/P3-[A-D](-[T0-9]+)?-[R0-9X]+/);
                        return match ? match[0] : 'UNKNOWN';
                     });
                  });
                  finalDomCountsPerTable = currentTbodies.map(tbody => tbody.querySelectorAll('tr').length);
                  domEvidenceCaptured = true;
                }
                return iframeOriginalQuerySelector.call(this, sel);
              };
              iframeHookInstalled = true;
            }
            return result;
          };

          // 3. Import and execute engine
          const { exportToPDF } = await import('/src/utils/printHtml.ts');
          await exportToPDF(cfg.printData as any); // Cast as any to bypass TS complaining about recordIds
          
          // Wait for PDF processing
          if (pdfBlobCaptured) {
             await pdfPromise;
          }

        } catch(e: any) {
          error = e.message;
        } finally {
          // Strict Restoration
          if (originalCreateObjectURL) {
             URL.createObjectURL = originalCreateObjectURL;
             createObjectURLRestored = (URL.createObjectURL === originalCreateObjectURL);
          }
          if (originalAppendChild) {
             Node.prototype.appendChild = originalAppendChild;
             appendChildRestored = (Node.prototype.appendChild === originalAppendChild);
          }
          if (iframeHookInstalled && capturedContentWindow && iframeOriginalQuerySelector) {
             try {
                 capturedContentWindow.Element.prototype.querySelector = iframeOriginalQuerySelector;
                 iframeQuerySelectorRestored = (capturedContentWindow.Element.prototype.querySelector === iframeOriginalQuerySelector);
             } catch(e) {
                 iframeQuerySelectorRestored = false;
             }
          }
          hooksRestored = createObjectURLRestored && appendChildRestored && iframeQuerySelectorRestored;
        }
        
        const remainingIframes = document.querySelectorAll('iframe').length;
        
        return { 
           error, 
           pdfBlobCaptured, 
           pdfHeaderValid, 
           remainingIframes, 
           iframeHookInstalled,
           p3Injected,
           domEvidenceCaptured,
           hooksRestored,
           createObjectURLRestored,
           appendChildRestored,
           iframeQuerySelectorRestored,
           finalDomCountsPerTable,
           finalDomOrdersPerTable
        };
      }, testName, config);
    };

    const results = [];

    // Case A: Reorder with same count (3)
    const printDataA = {
      filename: 'A.pdf', title: 'A', organizationName: 'Org', departmentName: 'Dept',
      tables: [{ 
         headers: ['H1'], 
         rows: [['P3-A-R1'], ['P3-A-R2'], ['P3-A-R3']],
         recordIds: ['R1', 'R2', 'R3'] // Added parallel recordIds
      }]
    };
    const resA = await runTestCase('Case A', { case: 'A', printData: printDataA });
    results.push({ name: 'A', result: resA, 
       sourceCounts: printDataA.tables.map(t => t.rows.length), 
       sourceOrders: [['P3-A-R1', 'P3-A-R2', 'P3-A-R3']],
       expectedCounts: [3],
       expectedOrders: [['P3-A-R2', 'P3-A-R1', 'P3-A-R3']] 
    });

    // Case B: Substitution
    const printDataB = {
      filename: 'B.pdf', title: 'B', organizationName: 'Org', departmentName: 'Dept',
      tables: [{ 
         headers: ['H1'], 
         rows: [['P3-B-R1'], ['P3-B-R2'], ['P3-B-R3']],
         recordIds: ['R1', 'R2', 'R3']
      }]
    };
    const resB = await runTestCase('Case B', { case: 'B', printData: printDataB });
    results.push({ name: 'B', result: resB, 
       sourceCounts: printDataB.tables.map(t => t.rows.length), 
       sourceOrders: [['P3-B-R1', 'P3-B-R2', 'P3-B-R3']],
       expectedCounts: [3],
       expectedOrders: [['P3-B-R1', 'P3-B-X', 'P3-B-R3']] 
    });

    // Case C: Duplicate + Loss
    const printDataC = {
      filename: 'C.pdf', title: 'C', organizationName: 'Org', departmentName: 'Dept',
      tables: [{ 
         headers: ['H1'], 
         rows: [['P3-C-R1'], ['P3-C-R2'], ['P3-C-R3'], ['P3-C-R4']],
         recordIds: ['R1', 'R2', 'R3', 'R4']
      }]
    };
    const resC = await runTestCase('Case C', { case: 'C', printData: printDataC });
    results.push({ name: 'C', result: resC, 
       sourceCounts: printDataC.tables.map(t => t.rows.length), 
       sourceOrders: [['P3-C-R1', 'P3-C-R2', 'P3-C-R3', 'P3-C-R4']],
       expectedCounts: [4],
       expectedOrders: [['P3-C-R1', 'P3-C-R2', 'P3-C-R2', 'P3-C-R4']] 
    });

    // Case D: Multi-table
    const printDataD = {
      filename: 'D.pdf', title: 'D', organizationName: 'Org', departmentName: 'Dept',
      tables: [
        { 
           headers: ['H1'], 
           rows: [['P3-D-T0-R1'], ['P3-D-T0-R2']],
           recordIds: ['R1', 'R2']
        },
        { 
           headers: ['H1'], 
           rows: [['P3-D-T1-R1'], ['P3-D-T1-R2']],
           recordIds: ['R1', 'R2']
        }
      ]
    };
    const resD = await runTestCase('Case D', { case: 'D', printData: printDataD });
    results.push({ name: 'D', result: resD, 
       sourceCounts: printDataD.tables.map(t => t.rows.length), 
       sourceOrders: [['P3-D-T0-R1', 'P3-D-T0-R2'], ['P3-D-T1-R1', 'P3-D-T1-R2']],
       expectedCounts: [2, 2],
       expectedOrders: [['P3-D-T0-R1', 'P3-D-T0-R2'], ['P3-D-T1-R1', 'P3-D-T1-R1']] 
    });

    allEvidenceSatisfied = true;
    for (const r of results) {
       const res = r.result;
       
       // Compare actual vs expected logic
       const countsMatch = JSON.stringify(res.finalDomCountsPerTable) === JSON.stringify(r.expectedCounts);
       const ordersMatch = JSON.stringify(res.finalDomOrdersPerTable) === JSON.stringify(r.expectedOrders);
       
       const satisfied = res.error === null && 
                         countsMatch && 
                         ordersMatch && 
                         res.pdfBlobCaptured === true && 
                         res.pdfHeaderValid === true && 
                         res.remainingIframes === 0 && 
                         res.iframeHookInstalled === true &&
                         res.p3Injected === true &&
                         res.domEvidenceCaptured === true &&
                         res.createObjectURLRestored === true &&
                         res.appendChildRestored === true &&
                         res.iframeQuerySelectorRestored === true &&
                         res.hooksRestored === true;
                         
       console.log(`\n--- Case ${r.name} ---`);
       console.log(`Error: ${res.error}`);
       console.log(`pdfBlobCaptured: ${res.pdfBlobCaptured}`);
       console.log(`pdfHeaderValid: ${res.pdfHeaderValid}`);
       console.log(`remainingIframes: ${res.remainingIframes}`);
       console.log(`iframeHookInstalled: ${res.iframeHookInstalled}`);
       console.log(`p3Injected: ${res.p3Injected}`);
       console.log(`domEvidenceCaptured: ${res.domEvidenceCaptured}`);
       console.log(`createObjectURLRestored: ${res.createObjectURLRestored}`);
       console.log(`appendChildRestored: ${res.appendChildRestored}`);
       console.log(`iframeQuerySelectorRestored: ${res.iframeQuerySelectorRestored}`);
       console.log(`hooksRestored: ${res.hooksRestored}`);
       
       for (let i = 0; i < r.expectedCounts.length; i++) {
          console.log(` Table ${i}:`);
          console.log(`   Source Count: ${r.sourceCounts[i]} | Final DOM Count: ${res.finalDomCountsPerTable[i]}`);
          console.log(`   Source Order: ${JSON.stringify(r.sourceOrders[i])}`);
          console.log(`   Expected DOM Order: ${JSON.stringify(r.expectedOrders[i])}`);
          console.log(`   Actual DOM Order: ${JSON.stringify(res.finalDomOrdersPerTable[i])}`);
       }
       
       if (!satisfied) {
          allEvidenceSatisfied = false;
          console.log(`Evidence FAILED for Case ${r.name}`);
       }
    }

    testCompleted = true;
  } catch (e: any) {
    console.error("Outer exception:", e);
    allEvidenceSatisfied = false;
  } finally {
    if (browser) await browser.close();
    
    if (testCompleted && allEvidenceSatisfied) {
       console.log('\nPHASE3_BASELINE_VULNERABILITY_CONFIRMED: unsafe PDF saves occurred with equal row counts');
    } else {
       console.log('\nPHASE3_BASELINE_EVIDENCE_FAILED');
    }
    process.exitCode = 1;
  }
}

runBaseline().catch((e) => {
   console.error(e);
   process.exitCode = 1;
});
