const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

// The issue is likely that when tr is cloned (e.g. cloneNode), attributes might be lost or modified depending on how it's handled, OR the querySelectorAll('.table-container tbody > tr') is matching rows we didn't expect (e.g. a placeholder row, a totally empty row injected by logic, etc).
// Let's modify the query selector to ONLY match rows that have our data attribute, OR log the outerHTML using a console.log that the test script can catch and print.

code = code.replace(/allTbodyTrs\.forEach\(\(tr, domIdx\) => \{/g, `allTbodyTrs.forEach((tr, domIdx) => {
    // Skip empty filler rows or placeholder rows we might have injected
    if (tr.classList.contains('placeholder-row') || !tr.hasAttribute('data-record-id')) {
        return; // Ignore rows we didn't explicitly tag
    }
`);

fs.writeFileSync('src/utils/printHtml.ts', code);
