const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/auth/authenticate',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});
req.on('error', console.error);
req.write(JSON.stringify({email: 'r.lucas@fiemg.com.br', password: 'test'}));
req.end();
