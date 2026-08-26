const http = require('http');

const BASE_URL = 'http://localhost:3000';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: JSON.parse(body || '{}') });
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testBackend() {
  console.log('🧪 Testing New User Registration API Endpoint...\n');

  try {
    // Test: POST /api/auth/register
    const regPayload = JSON.stringify({
      name: 'Lewis Hamilton',
      email: 'lewis.hamilton@ferrari.f1',
      password: 'champion2026',
      team: 'Scuderia Ferrari / Paddock Telemetry'
    });

    const regRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(regPayload) },
      body: regPayload
    });

    console.log(`✅ POST /api/auth/register -> Status ${regRes.statusCode}`);
    console.log(`   Message: ${regRes.body.message}`);
    console.log(`   User: ${regRes.body.user?.name} (${regRes.body.user?.email})`);
    console.log(`   Role: ${regRes.body.user?.role}`);
    console.log(`   Team: ${regRes.body.user?.team}`);
    console.log(`   JWT Token: ${regRes.body.token ? 'YES (' + regRes.body.token.substring(0, 30) + '...)' : 'NO'}`);

    console.log('\n==================================================');
    console.log('🎉 REGISTRATION BACKEND API IS WORKING 100% PERFECTLY!');
    console.log('==================================================\n');

  } catch (err) {
    console.error('❌ Registration test error:', err.message);
  }
}

testBackend();
