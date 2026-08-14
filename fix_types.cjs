const fs = require('fs');

let types = fs.readFileSync('src/types/index.ts', 'utf8');
types = types.replace(
  "  permissions: string[];\n  createdAt: string;\n}",
  "  permissions: string[];\n  createdAt: string;\n  password?: string;\n}"
);
fs.writeFileSync('src/types/index.ts', types);
