const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, {
  algorithm: 'sha256',
  days: 365,
  keySize: 2048,
});

const certDir = path.join(__dirname, '..', 'certificates');

if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

fs.writeFileSync(path.join(certDir, 'localhost-key.pem'), pems.private);
fs.writeFileSync(path.join(certDir, 'localhost.pem'), pems.cert); 