import https from 'https';
import fs from 'fs';
import path from 'path';

// Let's try Amiri from Google Fonts main branch
const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf';
const publicDir = path.join(process.cwd(), 'public');
const destPath = path.join(publicDir, 'Cairo-Regular.ttf');



if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log(`Downloading Cairo font from: ${fontUrl}`);

const urlObj = new URL(fontUrl);
const options = {
  hostname: urlObj.hostname,
  path: urlObj.pathname + urlObj.search,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'Accept': '*/*'
  }
};

https.get(options, (response) => {
  if (response.statusCode === 301 || response.statusCode === 302) {
    console.log(`Redirected to: ${response.headers.location}`);
    // Follow redirect
    https.get(response.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
      handleResponse(res2);
    });
  } else {
    handleResponse(response);
  }
});

function handleResponse(response) {
  if (response.statusCode !== 200) {
    console.error(`Failed to download font: status code ${response.statusCode}`);
    process.exit(1);
  }
  
  const chunks = [];
  response.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  response.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const signature = buffer.slice(0, 4).toString('hex');
    const txtSig = buffer.slice(0, 4).toString('utf8');
    console.log(`Font downloaded. First 4 bytes (hex): ${signature}, as text: ${txtSig}, total size: ${buffer.length}`);
    
    fs.writeFileSync(destPath, buffer);
    console.log('Font saved successfully!');
    process.exit(0);
  });
}


