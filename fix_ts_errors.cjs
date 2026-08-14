const fs = require('fs');

let printHtml = fs.readFileSync('src/utils/printHtml.ts', 'utf8');
printHtml = printHtml.replace(/\(tbody, tbodyDomIdx\)/, '(tbody)');
printHtml = printHtml.replace(/\(tr, trDomIdx\)/, '(tr)');
fs.writeFileSync('src/utils/printHtml.ts', printHtml);

let guard = fs.readFileSync('tests/phase3_id_integrity_guard.test.ts', 'utf8');
guard = guard.replace(/\(testName, cfg\)/, '(_tName, cfg: any)');
guard = guard.replace(/testName/g, '_tName');
guard = guard.replace(/URL.createObjectURL = \(blob\) => {/, 'URL.createObjectURL = (blob: any) => {');
guard = guard.replace(/Node.prototype.appendChild = function\(node\) {/, 'Node.prototype.appendChild = function(node: any) {');
guard = guard.replace(/const tr0 = trs\[0\];/g, 'const tr0 = trs[0] as HTMLElement;');
guard = guard.replace(/const tr1 = trs\[1\];/g, 'const tr1 = trs[1] as HTMLElement;');
guard = guard.replace(/const tr2 = trs\[2\];/g, 'const tr2 = trs[2] as HTMLElement;');
guard = guard.replace(/contentWindow.Element.prototype.querySelector = function\(sel\)/, 'contentWindow.Element.prototype.querySelector = function(sel: any)');
guard = guard.replace(/const rows = Array.from\(tbody.querySelectorAll\('tr'\)\);/, "const rows = Array.from((tbody as HTMLElement).querySelectorAll('tr'));");
guard = guard.replace(/return rows.map\(r => {/, 'return rows.map((r: any) => {');
guard = guard.replace(/tbody.querySelectorAll\('tr'\)/g, "(tbody as HTMLElement).querySelectorAll('tr')");
guard = guard.replace(/import\('\/src\/utils\/printHtml.ts'\)/g, "import('/src/utils/printHtml.ts' as any)");
fs.writeFileSync('tests/phase3_id_integrity_guard.test.ts', guard);
