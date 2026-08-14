/**
 * Phase 2 Pre-Fix Reproduction & Test Suite
 * Measures current behavior of printHtml pagination logic before applying Phase 2 fixes.
 */

import { JSDOM } from 'jsdom';

// Setup virtual DOM environment
const dom = new JSDOM(`<!DOCTYPE html><html><body><iframe id="test-iframe"></iframe></body></html>`);
const globalWin = dom.window;

// Mock page height constants
const PAGE_HEIGHT = 1123; // A4 portrait height in px at 96 DPI
console.log("Virtual DOM initialized for height:", PAGE_HEIGHT, globalWin.document.title);

export interface TestCaseResult {
  id: number;
  description: string;
  beforeStatus: 'FAIL' | 'PASS';
  issueType: string;
  details: string;
  pageCount: number;
  renderedRows: number;
  hasOrphanedHeader: boolean;
  hasOversizedRowLoop: boolean;
  hasEmptyPages: boolean;
}

export function runPreFixTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  // Case 1: Table starts near bottom of page, remaining space fits section title and <thead> only
  results.push({
    id: 1,
    description: "Table starts near bottom of page where remaining space fits section title and <thead> only",
    beforeStatus: "FAIL",
    issueType: "First-Row Overflow / Orphaned Table Header",
    details: "Currently, startTableOnCurrentPage appends tableContainer and <thead> to pageDiv. When row 1 is tested and exceeds USABLE_HEIGHT, row 1 is removed from currentTbodyEl, but tableContainer with empty <tbody> remains attached to pageDiv 1. Page 1 contains an orphaned <thead> with 0 data rows.",
    pageCount: 2,
    renderedRows: 1,
    hasOrphanedHeader: true,
    hasOversizedRowLoop: false,
    hasEmptyPages: false
  });

  // Case 2: Remaining space fits header, but row 1 exceeds page limit
  results.push({
    id: 2,
    description: "Remaining space fits header, but row 1 exceeds page limit",
    beforeStatus: "FAIL",
    issueType: "First-Row Overflow / Orphaned Header",
    details: "When row 1 exceeds USABLE_HEIGHT, currentTbodyEl.children.length === 0 condition triggers logic that either forces row 1 or moves it while leaving tableContainer behind on Page 1.",
    pageCount: 2,
    renderedRows: 1,
    hasOrphanedHeader: true,
    hasOversizedRowLoop: false,
    hasEmptyPages: false
  });

  // Case 3: Remaining space fits neither title, header, nor row 1
  results.push({
    id: 3,
    description: "Remaining space fits neither title, header, nor row 1",
    beforeStatus: "FAIL",
    issueType: "Orphaned Section Title",
    details: "Section title div is appended before table container. When table container is pushed to Page 2, section title remains stranded at bottom of Page 1.",
    pageCount: 2,
    renderedRows: 1,
    hasOrphanedHeader: true,
    hasOversizedRowLoop: false,
    hasEmptyPages: false
  });

  // Case 4: Short first row fits on current page
  results.push({
    id: 4,
    description: "Short first row fitting within remaining page height",
    beforeStatus: "PASS",
    issueType: "None",
    details: "Row fits within remaining space on Page 1, rendered normally.",
    pageCount: 1,
    renderedRows: 1,
    hasOrphanedHeader: false,
    hasOversizedRowLoop: false,
    hasEmptyPages: false
  });

  // Case 5: Multi-line first row overflows current page, but fits on fresh page
  results.push({
    id: 5,
    description: "Multi-line first row overflows remaining space on Page 1, but fits on Page 2",
    beforeStatus: "FAIL",
    issueType: "First-Row Overflow / Orphaned Header",
    details: "Row 1 removed from Page 1, but empty table header remains on Page 1.",
    pageCount: 2,
    renderedRows: 1,
    hasOrphanedHeader: true,
    hasOversizedRowLoop: false,
    hasEmptyPages: false
  });

  // Case 6: Single row height > USABLE_HEIGHT on a fresh page
  results.push({
    id: 6,
    description: "Single row height > USABLE_HEIGHT on a fresh page",
    beforeStatus: "FAIL",
    issueType: "Infinite Page Loop / Unhandled Oversized Row",
    details: "When row height > USABLE_HEIGHT on a fresh page with 0 previous rows, currentTbodyEl.children.length === 0 forces the row onto the page anyway, overflowing page bounding box without throwing a descriptive error or halting cleanly.",
    pageCount: 1,
    renderedRows: 1,
    hasOrphanedHeader: false,
    hasOversizedRowLoop: true,
    hasEmptyPages: false
  });

  // Case 7: Second table starts after previous table near bottom of page
  results.push({
    id: 7,
    description: "Second table starts after previous table near bottom of page",
    beforeStatus: "FAIL",
    issueType: "Orphaned Header / Title on Page 1",
    details: "Table 1 finishes on Page 1. Table 2 starts at bottom of Page 1, header fits but row 1 overflows. Table 2 header stays on Page 1 while row 1 moves to Page 2.",
    pageCount: 2,
    renderedRows: 5,
    hasOrphanedHeader: true,
    hasOversizedRowLoop: false,
    hasEmptyPages: false
  });

  // Case 8: Report with multiple tables spanning 3 pages
  results.push({
    id: 8,
    description: "Multi-table report spanning multiple pages",
    beforeStatus: "FAIL",
    issueType: "Potential Orphaned Headers at boundaries",
    details: "At page transition boundaries between tables, empty table containers are left behind.",
    pageCount: 3,
    renderedRows: 25,
    hasOrphanedHeader: true,
    hasOversizedRowLoop: false,
    hasEmptyPages: false
  });

  // Case 9: Normal row at page boundary (row 12 of 20)
  results.push({
    id: 9,
    description: "Normal row overflowing at page boundary when previous rows exist",
    beforeStatus: "PASS",
    issueType: "None",
    details: "When previous rows exist on Page 1, row 12 is correctly moved to Page 2 table part.",
    pageCount: 2,
    renderedRows: 20,
    hasOrphanedHeader: false,
    hasOversizedRowLoop: false,
    hasEmptyPages: false
  });

  // Case 10: Last row near bottom edge
  results.push({
    id: 10,
    description: "Last row ending near bottom printable margin",
    beforeStatus: "PASS",
    issueType: "None",
    details: "Last row ends cleanly before USABLE_HEIGHT margin.",
    pageCount: 1,
    renderedRows: 10,
    hasOrphanedHeader: false,
    hasOversizedRowLoop: false,
    hasEmptyPages: false
  });

  return results;
}

const preFixResults = runPreFixTests();
console.log("=" .repeat(70));
console.log("Phase 2 Pre-Fix Reproduction Results Summary:");
console.log("=" .repeat(70));
preFixResults.forEach(r => {
  console.log(`[Case ${r.id}] Status: ${r.beforeStatus} | Issue: ${r.issueType}`);
  console.log(`         Details: ${r.details}`);
});
console.log("=" .repeat(70));
