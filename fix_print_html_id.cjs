const fs = require('fs');
let code = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

// I am reverting to WeakMap approach entirely. BUT since cloneNode doesn't preserve WeakMap, I will add an actual element ID or data attribute `data-row-id` (a simple incremental string like "row-0", "row-1") during the initial scan, and use THAT to look up the identity.
// Because innerHTML/outerHTML string serialization WILL preserve regular attributes like `id` or `data-row-id`.
// But Wait, I ALREADY used attributes (`data-table-index` and `data-record-id`) and it failed!
// Why did it fail? Because `const allTbodyTrs = Array.from(idoc.querySelectorAll('.table-container tbody > tr'))` didn't find them?
// No, the error is `صف DOM 0 مجهول الهوية`, which means it found a `tr` (domIdx = 0), but `identity.recordId` was empty!
// Wait! If `identity.recordId` is empty, it means `tr.getAttribute('data-record-id')` returned null or empty string.
// That implies the `data-record-id` attribute WAS NOT SET on that `tr`.
// Why wouldn't it be set?
// Because the `tr` is newly created during pagination?
// YES! During pagination, `exportToPDF` might be creating NEW rows (e.g. for split rows) or it's cloning them but the initial attributes weren't set on ALL rows?
// Let's look at `printHtml.ts` to see when attributes are set.

// Ah, wait. I replaced the WeakMap setting code with setting attributes.
// Let's look at where I set them.

// Oh, I see. `exportToPDF` generates a raw HTML string. Then it injects it into an iframe.
// Then it calls `measureGeometry(idoc)`.
// The attributes `data-record-id` were injected *during* `measureGeometry`? No, let's look at the original code.

code = code.replace(/const rowIdentityMap = new Map[^;]+;/g, '');
code = code.replace(/const dataTbodyIdentityMap = new Map[^;]+;/g, '');

// Actually, in printHtml.ts:
// There is an initial loop that sets up identities:
// const dataTbodys = Array.from(idoc.querySelectorAll('tbody')).filter(tb => tb.closest('.table-container'));
// If I use data attributes in the *React generation side* (i.e. `printHtml.ts` generating the initial HTML string), then they will ALWAYS be present!
// But wait, `printHtml.ts` builds the HTML manually using template literals!
// Let's inject the data attributes into the template literals!

code = code.replace(/<tr className="border-b[^>]*>/g, (match) => {
   return match + ' data-record-id="${table.recordIds && table.recordIds[rIdx] ? table.recordIds[rIdx].replace(/\"/g, \'&quot;\') : \'\'}" data-table-index="${tIdx}"';
});

// Now let's remove the attribute setting from the DOM manipulation part, since they are already in the HTML.
code = code.replace(/tr\.setAttribute\('data-table-index', tIdx\.toString\(\)\);\s*const recId = sourceRecordIds\[tIdx\]\[rIdx\];\s*if \(!recId\) \{[^}]+\}\s*tr\.setAttribute\('data-record-id', recId\);/g, '');


fs.writeFileSync('src/utils/printHtml.ts', code);
