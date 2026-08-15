
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import http from 'http';

const EXPECTED_ENGINE_SOURCE_HASH = 'de5bcfbe5a33ece817da0b3a41963be685a64336be0dfd4ef3673e7f716cf951';
const ENGINE_SOURCE_PATH = path.resolve('src/utils/printHtml.ts');
const TRANSACTIONS_SOURCE_PATH = path.resolve('src/pages/Transactions.tsx');
const SERVER_READINESS_TIMEOUT_MS = 60_000;
const PAGE_NAVIGATION_TIMEOUT_MS = 60_000;
const MAX_VITE_LOG_CHARS = 12_000;

function getFileHash(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

type FixtureRecord = { recordId: string; row: string[] };

function materializeFixtures(label: string, fixtures: FixtureRecord[]) {
  const rows: string[][] = [];
  const recordIds: string[] = [];
  const seen = new Set<string>();

  for (const f of fixtures) {
    if (typeof f.recordId !== 'string') throw new Error(`[${label}] recordId must be string`);
    const recordId = f.recordId.trim();
    if (!recordId) throw new Error(`[${label}] recordId cannot be blank`);
    if (!Array.isArray(f.row)) throw new Error(`[${label}] row must be an array`);
    if (seen.has(recordId)) throw new Error(`[${label}] duplicate recordId`);
    seen.add(recordId);
    rows.push([...f.row]);
    recordIds.push(recordId);
  }
  return { rows, recordIds };
}

function expectFixtureFailure(label: string, fixtures: FixtureRecord[], expectedMessagePart: string): void {
  let caughtMessage = '';
  try {
    materializeFixtures(label, fixtures);
  } catch (error) {
    caughtMessage = error instanceof Error ? error.message : String(error);
  }
  if (!caughtMessage.includes(expectedMessagePart)) {
    throw new Error(`[${label}] expected fixture failure containing: ${expectedMessagePart}`);
  }
}

function runFixtureMaterializationTests(): void {
  const firstRow = ['ROW-1'];
  const materialized = materializeFixtures('fixture-positive', [
    { recordId: ' R1 ', row: firstRow },
    { recordId: 'R2', row: ['ROW-2'] }
  ]);
  if (materialized.recordIds.length !== 2 || materialized.recordIds[0] !== 'R1' || materialized.recordIds[1] !== 'R2') {
    throw new Error('[fixture-positive] normalized recordIds mismatch');
  }
  if (materialized.rows.length !== 2 || materialized.rows[0][0] !== 'ROW-1' || materialized.rows[0] === firstRow) {
    throw new Error('[fixture-positive] rows are not aligned defensive copies');
  }

  expectFixtureFailure('fixture-non-string', [{ recordId: 123 as any, row: ['ROW'] }], 'recordId must be string');
  expectFixtureFailure('fixture-blank', [{ recordId: '   ', row: ['ROW'] }], 'recordId cannot be blank');
  expectFixtureFailure('fixture-duplicate-after-trim', [
    { recordId: ' R1 ', row: ['ROW-1'] },
    { recordId: 'R1', row: ['ROW-2'] }
  ], 'duplicate recordId');
  expectFixtureFailure('fixture-row-shape', [{ recordId: 'R1', row: null as any }], 'row must be an array');
}

function runLiveAcceptanceSourceRegressionTests(): void {
  const engineSource = fs.readFileSync(ENGINE_SOURCE_PATH, 'utf8');
  const transactionsSource = fs.readFileSync(TRANSACTIONS_SOURCE_PATH, 'utf8');

  const pageNumberReservation = 'min-height: 15px; line-height: 1.5; color: #64748b;">صفحة 0 من 0</div>';
  if (!engineSource.includes(pageNumberReservation)) {
    throw new Error('[live-acceptance] page-number height is not reserved before pagination');
  }

  const requiredVoucherIdentityMarkers = [
    'recordIds1ForIds = activeList.map(wh => JSON.stringify([',
    "recordIds1ForIds.push(JSON.stringify(['voucher_balance', txIdForIds, 'all_storehouses_total']))",
    "JSON.stringify(['voucher_balance', txIdForIds, 'warehouse', stableStorehouseForId, 'before'])",
    "JSON.stringify(['voucher_balance', txIdForIds, 'warehouse', stableStorehouseForId, 'after'])"
  ];
  for (const marker of requiredVoucherIdentityMarkers) {
    if (!transactionsSource.includes(marker)) {
      throw new Error(`[live-acceptance] missing voucher identity marker: ${marker}`);
    }
  }
}

function pollServerReadiness(
  url: string,
  timeoutMs: number,
  childProc: any,
  getDiagnostics: () => string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const interval = 250;
    const requestTimeoutMs = 1000;
    let settled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let onChildError: ((error: Error) => void) | undefined;
    let onChildExit: ((code: number | null, signal: string | null) => void) | undefined;

    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (onChildError) childProc?.removeListener('error', onChildError);
      if (onChildExit) childProc?.removeListener('exit', onChildExit);
      if (error) {
        const diagnostics = getDiagnostics().trim();
        reject(new Error(diagnostics ? `${error.message}\n${diagnostics}` : error.message));
      }
      else resolve();
    };

    onChildError = (error: Error) => {
      finish(new Error(`Vite process error: ${error.message}`));
    };
    onChildExit = (code: number | null, signal: string | null) => {
      finish(new Error(`Vite process exited before readiness (code=${String(code)}, signal=${String(signal)})`));
    };
    childProc?.once('error', onChildError);
    childProc?.once('exit', onChildExit);

    const check = () => {
      if (settled) return;
      if (childProc && (childProc.exitCode !== null || childProc.signalCode !== null)) {
        return finish(new Error('Child process exited early'));
      }

      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) {
        return finish(new Error('HTTP polling timed out'));
      }

      const req = http.get(url, (res) => {
        res.resume();
        finish();
      });

      req.setTimeout(Math.min(requestTimeoutMs, remainingMs), () => {
        req.destroy(new Error('HTTP readiness request timed out'));
      });

      req.once('error', () => {
        if (settled) return;
        const retryRemainingMs = deadline - Date.now();
        if (retryRemainingMs <= 0) {
          return finish(new Error('HTTP polling timed out'));
        }
        retryTimer = setTimeout(check, Math.min(interval, retryRemainingMs));
      });
    };

    check();
  });
}

function stopOwnedServer(child: any): Promise<boolean> {
  return new Promise((resolve) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) {
      return resolve(true);
    }
    let timer: any;
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    child.once('exit', onExit);
    let killAccepted = false;
    try {
      killAccepted = child.kill();
    } catch {
      child.removeListener('exit', onExit);
      return resolve(false);
    }
    if (!killAccepted) {
      child.removeListener('exit', onExit);
      return resolve(false);
    }
    if (child.exitCode !== null || child.signalCode !== null) {
      child.removeListener('exit', onExit);
      clearTimeout(timer);
      return resolve(true);
    }
    timer = setTimeout(() => {
      child.removeListener('exit', onExit);
      resolve(false);
    }, 5000);
  });
}

async function runGuardTests() {
  let browser: any;
  let serverProcess: any;
  let allTestsPassed = true;
  let serverStopped = false;
  let browserClosed = false;
  let executionSentinelPassed = false;
  let fixtureAssertionsPassed = false;
  let helperAssertionsPassed = false;
  let liveAcceptanceSourceRegressionPassed = false;
  let pageNumberRegressionPassed = false;
  let positiveControlPassed = false;
  const passedCorruptionCases = new Set<string>();
  const passedPreflightCases = new Set<string>();
  const expectedCorruptionCases = ['A', 'B', 'C', 'D'];
  const expectedPreflightCases = [
    'missing recordIds', 'not array', 'length mismatch',
    'non-string undefined', 'non-string null', 'non-string number',
    'blank/whitespace', 'duplicate after trim'
  ];

  try {
    const engineSourceHash = getFileHash(ENGINE_SOURCE_PATH);
    console.log(`Engine Source File: ${ENGINE_SOURCE_PATH}`);
    console.log(`Engine SHA-256 Hash: ${engineSourceHash}`);

    if (engineSourceHash !== EXPECTED_ENGINE_SOURCE_HASH) {
      throw new Error(`Engine Source Hash mismatch! Expected ${EXPECTED_ENGINE_SOURCE_HASH} but got ${engineSourceHash}`);
    }

    runLiveAcceptanceSourceRegressionTests();
    liveAcceptanceSourceRegressionPassed = true;
    console.log('Live acceptance source regressions passed.');

    runFixtureMaterializationTests();
    fixtureAssertionsPassed = true;
    console.log('Fixture materialization tests passed.');

    // Start Vite server
    let viteLogBuffer = '';
    const captureViteLog = (stream: 'stdout' | 'stderr', data: any) => {
      const text = String(data);
      viteLogBuffer = `${viteLogBuffer}[${stream}] ${text}`.slice(-MAX_VITE_LOG_CHARS);
      const rendered = text.trimEnd();
      if (!rendered) return;
      if (stream === 'stderr') console.error(`Vite stderr: ${rendered}`);
      else console.log(`Vite stdout: ${rendered}`);
    };

    serverProcess = spawn(process.execPath, [
      path.resolve('node_modules/vite/bin/vite.js'),
      '--port', '4179', '--strictPort', '--host', '127.0.0.1', '--clearScreen', 'false'
    ], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, DISABLE_HMR: 'true' }
    });

    serverProcess.stdout.on('data', (data: any) => captureViteLog('stdout', data));
    serverProcess.stderr.on('data', (data: any) => captureViteLog('stderr', data));

    await pollServerReadiness(
      'http://127.0.0.1:4179',
      SERVER_READINESS_TIMEOUT_MS,
      serverProcess,
      () => [
        `Vite executable: ${path.resolve('node_modules/vite/bin/vite.js')}`,
        `Node executable: ${process.execPath}`,
        `Vite pid: ${String(serverProcess?.pid ?? 'unavailable')}`,
        `Vite exitCode: ${String(serverProcess?.exitCode)}`,
        `Vite signalCode: ${String(serverProcess?.signalCode)}`,
        `Recent Vite output:\n${viteLogBuffer.trim() || '<none captured>'}`
      ].join('\n')
    );

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(PAGE_NAVIGATION_TIMEOUT_MS);
    page.setDefaultTimeout(15000);
    await page.goto('http://127.0.0.1:4179', {
      waitUntil: 'domcontentloaded',
      timeout: PAGE_NAVIGATION_TIMEOUT_MS
    });

    const runTestCase = async (testName: string, config: any) => {
      return await page.evaluate(async (evaluatedTestName, cfg: any) => {
        let error = null;
        let pdfBlobCaptured = false;
        let pdfHeaderValid = false;
        let iframeHookInstalled = false;
        let p3Injected = false;
        let domEvidenceCaptured = false;
        let identityMapCaptured = false;
        let metaTableAuditCaptured = false;
        let metaRowsExcludedFromIdentityMap = false;
        let dataRowsMapped = false;

        let originalCreateObjectURL: any = null;
        let originalAppendChild: any = null;
        let iframeOriginalQuerySelector: any = null;
        let originalWeakMapSet: any = null;
        let capturedContentWindow: any = null;

        let createObjectURLRestored = false;
        let appendChildRestored = false;
        let iframeQuerySelectorRestored = false;
        let weakMapRestored = false;
        let hooksRestored = false;

        let capturedPdfPromise: Promise<string> | null = null;
        let capturedIdentityMap: WeakMap<any, any> | null = null;

        try {
          originalCreateObjectURL = URL.createObjectURL;
          URL.createObjectURL = function(blob: any) {
            const url = originalCreateObjectURL.call(this, blob);
            if (blob && blob.type === 'application/pdf') {
              pdfBlobCaptured = true;
              capturedPdfPromise = blob.arrayBuffer().then((buf: ArrayBuffer) => {
                const bytes = new Uint8Array(buf);
                if (bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
                  pdfHeaderValid = true;
                }
                return "captured";
              });
            }
            return url;
          };

          // rowIdentityMap is constructed by exportToPDF in the parent page realm,
          // even though its keys are <tr> elements created inside the print iframe.
          originalWeakMapSet = WeakMap.prototype.set;
          WeakMap.prototype.set = function(key: any, val: any) {
            if (key && key.tagName === 'TR' && val && typeof val === 'object' && 'recordId' in val && 'tableIndex' in val) {
               capturedIdentityMap = this;
               identityMapCaptured = true;
            }
            return originalWeakMapSet.call(this, key, val);
          };

          originalAppendChild = Node.prototype.appendChild;
          Node.prototype.appendChild = function(node: any) {
            const result = originalAppendChild.call(this, node);
            if (node && node.tagName === 'IFRAME' && !iframeHookInstalled) {
              const iframe = node;
              const contentWindow = iframe.contentWindow;
              if (!contentWindow) return result;
              capturedContentWindow = contentWindow;

              iframeOriginalQuerySelector = contentWindow.Element.prototype.querySelector;
              contentWindow.Element.prototype.querySelector = function(sel: any) {
                if (sel === '.page-num-placeholder') {
                  const doc = contentWindow.document;
                  if (!metaTableAuditCaptured) {
                    const metaRows = Array.from(doc.querySelectorAll('.meta-table tbody > tr'));
                    if (metaRows.length > 0) {
                      const dataRows = Array.from(doc.querySelectorAll('.table-container tbody > tr'));
                      metaTableAuditCaptured = true;
                      metaRowsExcludedFromIdentityMap = Boolean(capturedIdentityMap) &&
                        metaRows.every((tr) => !capturedIdentityMap!.has(tr));
                      dataRowsMapped = Boolean(capturedIdentityMap) && dataRows.length > 0 &&
                        dataRows.every((tr) => capturedIdentityMap!.has(tr));
                    }
                  }

                  if (!p3Injected && cfg.case) {
                    p3Injected = true;

                    if (!capturedIdentityMap) {
                       throw new Error('Identity WeakMap not captured');
                    }

                    if (cfg.case === 'A') {
                     const trs = Array.from(doc.querySelectorAll('.table-container tbody > tr'));
                     if (trs.length >= 1) {
                        capturedIdentityMap.delete(trs[0]);
                     } else {
                        throw new Error('Required rows not found for case A');
                     }
                    } else if (cfg.case === 'B') {
                     const trs = Array.from(doc.querySelectorAll('.table-container tbody > tr'));
                     if (trs.length >= 2) {
                        const m0 = capturedIdentityMap.get(trs[0]);
                        const m1 = capturedIdentityMap.get(trs[1]);
                        if (m0 && m1) {
                           capturedIdentityMap.set(trs[0], m1);
                           capturedIdentityMap.set(trs[1], m0);
                        }
                     } else {
                        throw new Error('Required rows not found for case B');
                     }
                    } else if (cfg.case === 'C') {
                     const trs = Array.from(doc.querySelectorAll('.table-container tbody > tr'));
                     if (trs.length >= 2) {
                        const m0 = capturedIdentityMap.get(trs[0]);
                        if (m0) {
                           capturedIdentityMap.set(trs[1], m0);
                        }
                     } else {
                        throw new Error('Required rows not found for case C');
                     }
                    } else if (cfg.case === 'D') {
                     const tbodies = Array.from(doc.querySelectorAll('.table-container tbody'));
                     if (tbodies.length >= 2) {
                        const trs = Array.from((tbodies[1] as HTMLElement).querySelectorAll('tr'));
                        if (trs.length >= 2) {
                           const tr0 = trs[0] as HTMLElement;
                           const tr1 = trs[1] as HTMLElement;
                           const clone = tr0.cloneNode(true);
                           tr1.parentNode!.replaceChild(clone, tr1);
                        } else {
                           throw new Error('Required rows not found in tbody 1 for case D');
                        }
                     } else {
                        throw new Error('Required tbodies not found for case D');
                     }
                    }
                    domEvidenceCaptured = true;
                  }
                }
                return iframeOriginalQuerySelector.call(this, sel);
              };
              iframeHookInstalled = true;
            }
            return result;
          };

          const { exportToPDF } = await import('/src/utils/printHtml.ts' as any);
          await exportToPDF(cfg.printData);

          if (capturedPdfPromise) {
             await capturedPdfPromise;
          }

        } catch (e: any) {
          error = e.message;
        } finally {
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
          } else {
             iframeQuerySelectorRestored = !iframeHookInstalled;
          }
          if (originalWeakMapSet) {
             try {
                 WeakMap.prototype.set = originalWeakMapSet;
                 weakMapRestored = (WeakMap.prototype.set === originalWeakMapSet);
             } catch(e) {
                 weakMapRestored = false;
             }
          } else {
             weakMapRestored = true;
          }
          hooksRestored = createObjectURLRestored && appendChildRestored && iframeQuerySelectorRestored && weakMapRestored;
        }

        const remainingIframes = document.querySelectorAll('iframe').length;

        return {
            testName: evaluatedTestName,
            error, pdfBlobCaptured, pdfHeaderValid, remainingIframes,
            iframeHookInstalled, p3Injected, domEvidenceCaptured, identityMapCaptured,
            metaTableAuditCaptured, metaRowsExcludedFromIdentityMap, dataRowsMapped,
            hooksRestored, createObjectURLRestored, appendChildRestored, iframeQuerySelectorRestored, weakMapRestored
        };
      }, testName, config);
    };

    const runRequireStringPartTests = async () => {
      return await page.evaluate(async () => {
        let results: string[] = [];
        const { requireStableStringPart } = await import('/src/utils/printHtml.ts' as any);
        try { requireStableStringPart(undefined, 'ctx'); results.push('FAIL'); } catch (e) { results.push('PASS'); }
        try { requireStableStringPart(null, 'ctx'); results.push('FAIL'); } catch (e) { results.push('PASS'); }
        try { requireStableStringPart(123, 'ctx'); results.push('FAIL'); } catch (e) { results.push('PASS'); }
        try { requireStableStringPart('   ', 'ctx'); results.push('FAIL'); } catch (e) { results.push('PASS'); }
        try {
            const v = requireStableStringPart('  text  ', 'ctx');
            if (v === 'text') results.push('PASS'); else results.push('FAIL');
        } catch (e) { results.push('FAIL'); }
        return results;
      });
    };
    console.log('\n--- Running requireStableStringPart Tests ---');
    const rTests = await runRequireStringPartTests();
    if (rTests.length !== 5 || rTests.some((r: string) => r !== 'PASS')) {
       console.error('requireStableStringPart tests failed:', rTests);
       allTestsPassed = false;
    } else {
       helperAssertionsPassed = true;
       console.log('requireStableStringPart tests passed.');
    }

    // Positive Control
    const fixturesPositive: FixtureRecord[] = [
      { recordId: 'R1', row: ['R1'] },
      { recordId: 'R2', row: ['R2'] }
    ];
    const p1 = materializeFixtures('Positive-T1', fixturesPositive.slice(0, 1));
    const p2 = materializeFixtures('Positive-T2', fixturesPositive.slice(1, 2));

    const printDataPositive = {
      filename: 'Positive.pdf', title: 'Positive', organizationName: 'Org', departmentName: 'Dept',
      metaFields: [{label: 'Test', value: 'Value'}],
      tables: [
        { headers: ['H1'], rows: p1.rows, recordIds: p1.recordIds },
        { headers: ['H2'], rows: p2.rows, recordIds: p2.recordIds }
      ]
    };
    const resPositive = await runTestCase('Positive', { case: null, printData: printDataPositive });
    const positivePassed = resPositive.testName === 'Positive' && !resPositive.error &&
      resPositive.pdfBlobCaptured && resPositive.pdfHeaderValid &&
      resPositive.iframeHookInstalled && resPositive.identityMapCaptured &&
      resPositive.metaTableAuditCaptured && resPositive.metaRowsExcludedFromIdentityMap && resPositive.dataRowsMapped &&
      !resPositive.p3Injected && !resPositive.domEvidenceCaptured &&
      resPositive.remainingIframes === 0 && resPositive.hooksRestored &&
      resPositive.createObjectURLRestored && resPositive.appendChildRestored &&
      resPositive.iframeQuerySelectorRestored && resPositive.weakMapRestored;
    if (!positivePassed) {
       console.error('Positive Control FAILED:', resPositive);
       allTestsPassed = false;
    } else {
       positiveControlPassed = true;
       console.log('Positive Control PASSED.');
    }

    const pageNumberFixtures: FixtureRecord[] = Array.from({ length: 59 }, (_, index) => ({
      recordId: `OPENING-${String(index + 1).padStart(3, '0')}`,
      row: [
        `MAT-${String(1000 + index)}`,
        index % 3 === 0 ? `اسم ومواصفات مادة مخزنية تفصيلية رقم ${index + 1}` : `صنف مخزني ${index + 1}`,
        index % 2 === 0 ? 'أدوات ومعدات' : 'مواد',
        'قطعة',
        String((index % 9) + 1),
        'مخزن خانيونس',
        '٩/٨/٢٠٢٦',
        index % 4 === 0 ? 'ملاحظات ومواصفات فنية معتمدة' : '--'
      ]
    }));
    const pageNumberMaterialized = materializeFixtures('PageNumberReservation', pageNumberFixtures);
    const pageNumberData = {
      filename: 'PageNumberReservation.pdf',
      title: 'سند توثيق الأرصدة الافتتاحية للمخزون التأسيسي',
      organizationName: 'مكتب صحة البيئة - خان يونس',
      departmentName: 'دائرة البنى التحتية والتخطيط والتطوير',
      metaFields: [
        { label: 'تصنيف التقرير وعائلته:', value: 'سند توثيق الأرصدة الافتتاحية للمخزون' },
        { label: 'تعداد السجلات المدرجة:', value: '59 سجل حركي دفتري' }
      ],
      tables: [{
        headers: ['كود الصنف', 'اسم ومواصفات المادة بالكامل', 'التصنيف', 'وحدة المعاملات', 'الرصيد الافتتاحي المعتمد', 'المستودع وموقع التخزين', 'تاريخ إقرار الرصيد', 'ملاحظات ومواصفات فنية'],
        rows: pageNumberMaterialized.rows,
        recordIds: pageNumberMaterialized.recordIds,
        columnAlignments: ['center', 'center', 'center', 'center', 'center', 'center', 'center', 'center']
      }]
    };
    const pageNumberResult = await runTestCase('PageNumberReservation', { case: null, printData: pageNumberData });
    pageNumberRegressionPassed = pageNumberResult.testName === 'PageNumberReservation' &&
      !pageNumberResult.error && pageNumberResult.pdfBlobCaptured && pageNumberResult.pdfHeaderValid &&
      pageNumberResult.identityMapCaptured && pageNumberResult.dataRowsMapped &&
      pageNumberResult.remainingIframes === 0 && pageNumberResult.hooksRestored;
    if (!pageNumberRegressionPassed) {
      console.error('Page-number reservation regression FAILED:', pageNumberResult);
      allTestsPassed = false;
    } else {
      console.log('Page-number reservation regression PASSED.');
    }

    // Corruptions A-D
    const runCorruptionCase = async (caseName: string, fixtures: FixtureRecord[][], errKeyword: string) => {
       const printData = {
          filename: `${caseName}.pdf`, title: caseName, organizationName: 'Org', departmentName: 'Dept',
          tables: fixtures.map((fx, i) => {
             const m = materializeFixtures(`${caseName}-T${i}`, fx);
             return { headers: ['H1'], rows: m.rows, recordIds: m.recordIds };
          })
       };
       const res = await runTestCase(caseName, { case: caseName, printData });
       const passed = res.testName === caseName && res.error && res.error.includes(errKeyword) &&
                      !res.pdfBlobCaptured && !res.pdfHeaderValid &&
                      res.iframeHookInstalled && res.remainingIframes === 0 && res.hooksRestored &&
                      res.createObjectURLRestored && res.appendChildRestored &&
                      res.iframeQuerySelectorRestored && res.weakMapRestored &&
                      res.domEvidenceCaptured && res.identityMapCaptured && res.p3Injected;
       if (!passed) {
          console.error(`Corruption Case ${caseName} FAILED:`, res);
          allTestsPassed = false;
       } else {
          passedCorruptionCases.add(caseName);
          console.log(`Corruption Case ${caseName} PASSED (Blocked successfully).`);
       }
    };

    await runCorruptionCase('A', [
      [
        { recordId: 'R1', row: ['P3-A-R1'] },
        { recordId: 'R2', row: ['P3-A-R2'] },
        { recordId: 'R3', row: ['P3-A-R3'] }
      ]
    ], 'مجهول الهوية');

    await runCorruptionCase('B', [
      [
        { recordId: 'R1', row: ['P3-B-R1'] },
        { recordId: 'R2', row: ['P3-B-R2'] },
        { recordId: 'R3', row: ['P3-B-R3'] }
      ]
    ], 'ترتيب غير متطابق أو استبدال');

    await runCorruptionCase('C', [
      [
        { recordId: 'R1', row: ['P3-C-R1'] },
        { recordId: 'R2', row: ['P3-C-R2'] },
        { recordId: 'R3', row: ['P3-C-R3'] },
        { recordId: 'R4', row: ['P3-C-R4'] }
      ]
    ], 'تكرار السجل المرسوم');

    await runCorruptionCase('D', [
      [
        { recordId: 'T0-R1', row: ['P3-D-T0-R1'] },
        { recordId: 'T0-R2', row: ['P3-D-T0-R2'] }
      ],
      [
        { recordId: 'T1-R1', row: ['P3-D-T1-R1'] },
        { recordId: 'T1-R2', row: ['P3-D-T1-R2'] }
      ]
    ], 'مجهول الهوية');

    // Preflight negatives (intentionally malformed, bypassing materializeFixtures)
    const runPreflightCase = async (name: string, pData: any, errKeyword: string) => {
       const res = await runTestCase(name, { case: null, printData: pData });
       const iframeNeverAppended = !res.iframeHookInstalled;
       const passed = res.testName === name && res.error && res.error.includes(errKeyword) &&
                      iframeNeverAppended && !res.pdfBlobCaptured && !res.pdfHeaderValid &&
                      !res.p3Injected && !res.domEvidenceCaptured && !res.identityMapCaptured &&
                      res.remainingIframes === 0 && res.hooksRestored &&
                      res.createObjectURLRestored && res.appendChildRestored &&
                      res.iframeQuerySelectorRestored && res.weakMapRestored;
       if (!passed) {
          console.error(`Preflight Case ${name} FAILED:`, res);
          allTestsPassed = false;
       } else {
          passedPreflightCases.add(name);
          console.log(`Preflight Case ${name} PASSED (Blocked successfully).`);
       }
    };

    await runPreflightCase('missing recordIds', {
       filename: 'PF.pdf', title: 'PF', organizationName: 'Org', departmentName: 'Dept',
       tables: [{ headers: ['H1'], rows: [['R1']] }]
    }, 'يفتقد recordIds');

    await runPreflightCase('not array', {
       filename: 'PF.pdf', title: 'PF', organizationName: 'Org', departmentName: 'Dept',
       tables: [{ headers: ['H1'], rows: [['R1']], recordIds: 'R1' }]
    }, 'يفتقد recordIds');

    await runPreflightCase('length mismatch', {
       filename: 'PF.pdf', title: 'PF', organizationName: 'Org', departmentName: 'Dept',
       tables: [{ headers: ['H1'], rows: [['R1']], recordIds: ['R1', 'R2'] }]
    }, 'لا يطابق rows');

    await runPreflightCase('non-string undefined', {
       filename: 'PF.pdf', title: 'PF', organizationName: 'Org', departmentName: 'Dept',
       tables: [{ headers: ['H1'], rows: [['R1']], recordIds: [undefined] }]
    }, 'الهوية ليست نصاً');

    await runPreflightCase('non-string null', {
       filename: 'PF.pdf', title: 'PF', organizationName: 'Org', departmentName: 'Dept',
       tables: [{ headers: ['H1'], rows: [['R1']], recordIds: [null] }]
    }, 'الهوية ليست نصاً');

    await runPreflightCase('non-string number', {
       filename: 'PF.pdf', title: 'PF', organizationName: 'Org', departmentName: 'Dept',
       tables: [{ headers: ['H1'], rows: [['R1']], recordIds: [123] }]
    }, 'الهوية ليست نصاً');

    await runPreflightCase('blank/whitespace', {
       filename: 'PF.pdf', title: 'PF', organizationName: 'Org', departmentName: 'Dept',
       tables: [{ headers: ['H1'], rows: [['R1']], recordIds: ['   '] }]
    }, 'الهوية نص فارغ');

    await runPreflightCase('duplicate after trim', {
       filename: 'PF.pdf', title: 'PF', organizationName: 'Org', departmentName: 'Dept',
       tables: [{ headers: ['H1'], rows: [['R1'], ['R2']], recordIds: [' R1 ', 'R1'] }]
    }, 'تكرار في الهوية');

    executionSentinelPassed = fixtureAssertionsPassed && helperAssertionsPassed &&
      liveAcceptanceSourceRegressionPassed && pageNumberRegressionPassed && positiveControlPassed &&
      passedCorruptionCases.size === expectedCorruptionCases.length &&
      expectedCorruptionCases.every((caseName) => passedCorruptionCases.has(caseName)) &&
      passedPreflightCases.size === expectedPreflightCases.length &&
      expectedPreflightCases.every((caseName) => passedPreflightCases.has(caseName));
    if (!executionSentinelPassed) {
      allTestsPassed = false;
      console.error('Execution sentinel FAILED:', {
        fixtureAssertionsPassed,
        helperAssertionsPassed,
        liveAcceptanceSourceRegressionPassed,
        pageNumberRegressionPassed,
        positiveControlPassed,
        passedCorruptionCases: Array.from(passedCorruptionCases),
        passedPreflightCases: Array.from(passedPreflightCases)
      });
    } else {
      console.log('Execution sentinel PASSED.');
    }
  } catch (e) {
    console.error("Test framework error:", e);
    allTestsPassed = false;
  } finally {
    if (browser) {
      await browser.close();
      browserClosed = true;
    }
    if (serverProcess) {
      serverStopped = await stopOwnedServer(serverProcess);
    } else {
      serverStopped = true; // Never started
    }

    if (!serverStopped) {
      allTestsPassed = false;
      console.error('Failed to close server process');
    }

    if (allTestsPassed && browserClosed && serverStopped && executionSentinelPassed) {
       console.log('\nPHASE3_ID_INTEGRITY_GUARD_PASSED');
       process.exitCode = 0;
    } else {
       console.log('\nPHASE3_ID_INTEGRITY_GUARD_FAILED');
       process.exitCode = 1;
    }
  }
}

runGuardTests().catch(e => {
   console.error(e);
   process.exitCode = 1;
});
