const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

// I am reverting to WeakMap approach for tracking identity, but attaching the map directly to the window object so it persists across iframe cloning, or attaching it to the row elements themselves but as a property, not an attribute.
// The issue with attributes is they might be getting lost if the HTML is rewritten or if we are matching wrong elements.
// Actually, in printHtml.ts, when `exportToPDF` is called, it builds a massive HTML string and assigns it via `iframe.contentDocument.write()`.
// IT'S A STRING! Attributes *should* survive string serialization. Wait, I added the attributes to `tr` *before* serialization?
// Let's check printHtml.ts!

// Ah, wait. The attributes are added to the DOM nodes created *inside* the iframe after it's been rendered!
// No, looking at my previous fix, I added the attributes inside `measureGeometry`.
// Wait, `measureGeometry` runs on a temporary iframe to measure things.
// The actual PDF generation also writes HTML to a final iframe.
// Let's find out how row identities are tracked in the original code.

// Original code:
// const rowIdentityMap = new Map<HTMLTableRowElement, { tableIndex: number, recordId: string }>();
// This was populated in a loop:
// const dataTbodys = Array.from(idoc.querySelectorAll('tbody')).filter(tb => tb.closest('.table-container'));
// It sets identity on `tr` elements.
// THEN, it runs calibration, which moves DOM nodes around (e.g. `p.appendChild(cloneNode)` or similar).
// Wait, `cloneNode` DOES NOT copy Map entries!
// Let's look at the logic.

// If it uses cloneNode, we MUST use attributes.
// Let's re-inject the attribute logic but safely.

code = code.replace(/allTbodyTrs\.forEach\(\(tr, domIdx\) => \{/g, `
  // Filter out any tr that doesn't have our data attribute, as it might be a header or a placeholder
  allTbodyTrs = allTbodyTrs.filter(tr => tr.hasAttribute('data-record-id'));
  allTbodyTrs.forEach((tr, domIdx) => {
`);

fs.writeFileSync('src/utils/printHtml.ts', code);
