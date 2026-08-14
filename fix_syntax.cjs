const fs = require('fs');

let content = fs.readFileSync('src/pages/Transactions.tsx', 'utf-8');

const startStr = "// Compress and scale image helper function";
const endStr = "export default function Transactions() {";

const s = content.indexOf(startStr);
const e = content.indexOf(endStr);

if (s !== -1 && e !== -1) {
  content = content.substring(0, s) + content.substring(e);
}

fs.writeFileSync('src/pages/Transactions.tsx', content);
console.log("Syntax fixed!");
