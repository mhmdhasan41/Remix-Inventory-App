const fs = require('fs');
let code = fs.readFileSync('tests/run_real_integration_test.ts', 'utf8');

code = code.replace(/} catch \(e: any\) {/g, `} catch (e: any) {
          await new Promise(r => setTimeout(r, 100)); // wait for console logs to flush
          console.error("PDF Export caught error:", e);`);

fs.writeFileSync('tests/run_real_integration_test.ts', code);
