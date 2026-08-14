const fs = require('fs');

let ds = fs.readFileSync('src/services/dataService.ts', 'utf8');

ds = ds.replace(/USERS: 'remix_users_v1',/g, "USERS: 'remix_users_v1',\n  IS_LOGGED_IN: 'remix_is_logged_in',");

const isLoggedInFunc = `
  isLoggedIn: (): boolean => {
    return localStorage.getItem('remix_is_logged_in') === 'true' || sessionStorage.getItem('remix_is_logged_in') === 'true';
  },`;

ds = ds.replace(/logout: \(\) => \{/, isLoggedInFunc + "\n  logout: () => {");

fs.writeFileSync('src/services/dataService.ts', ds);
