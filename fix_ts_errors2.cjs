const fs = require('fs');

let guard = fs.readFileSync('tests/phase3_id_integrity_guard.test.ts', 'utf8');
guard = guard.replace(/tbodies\[1\]\.querySelectorAll/g, "(tbodies[1] as HTMLElement).querySelectorAll");
fs.writeFileSync('tests/phase3_id_integrity_guard.test.ts', guard);
