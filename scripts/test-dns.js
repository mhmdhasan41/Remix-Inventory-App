import dns from 'dns';

const domains = [
  'raw.githubusercontent.com',
  'github.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

for (const domain of domains) {
  dns.resolve(domain, (err, addresses) => {
    if (err) {
      console.log(`Failed to resolve ${domain}: ${err.message}`);
    } else {
      console.log(`Resolved ${domain} to: ${JSON.stringify(addresses)}`);
    }
  });
}
