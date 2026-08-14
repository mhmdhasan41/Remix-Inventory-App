const fs = require('fs');
let content = fs.readFileSync('src/utils/printHtml.ts', 'utf8');

const interfaceIndex = content.indexOf('export interface PrintData');
const helperFunction = `export function requireStableStringPart(value: unknown, context: string): string {
  if (typeof value !== 'string') {
    throw new Error(\`معرّف غير صالح [\${context}]: القيمة غائبة أو ليست نصاً (النوع: \${typeof value})\`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(\`معرّف غير صالح [\${context}]: القيمة نص فارغ\`);
  }
  return trimmed;
}

`;

content = content.slice(0, interfaceIndex) + helperFunction + content.slice(interfaceIndex);
fs.writeFileSync('src/utils/printHtml.ts', content);
