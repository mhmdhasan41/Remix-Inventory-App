import https from 'https';

const url = 'https://data.jsdelivr.net/v1/package/npm/@fontsource/cairo';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Files structure:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
      console.log('Data was:', data);
    }
  });
}).on('error', (err) => {
  console.log('Error fetching jsdelivr files:', err.message);
});
