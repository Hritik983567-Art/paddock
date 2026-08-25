const http = require('http');

const CONCURRENT_USERS = parseInt(process.argv[2]) || 1000;
const BASE_URL = 'http://localhost:3000';

const keepAliveAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 500,
  maxFreeSockets: 100,
  timeout: 30000
});

console.log(`🚀 Executing Proper Test Suite: 1,000 Real-World User Requests...`);

const metrics = {
  total: 0,
  success: 0,
  failed: 0,
  latencies: [],
  routes: {}
};

function makeRequest(path, options = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const url = new URL(path, BASE_URL);
    
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: options.method || 'GET',
      agent: keepAliveAgent,
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const latency = Date.now() - startTime;
        metrics.latencies.push(latency);
        metrics.total++;

        const routeKey = `${reqOptions.method} ${path}`;
        metrics.routes[routeKey] = metrics.routes[routeKey] || { success: 0, failed: 0 };

        if (res.statusCode >= 200 && res.statusCode < 400) {
          metrics.success++;
          metrics.routes[routeKey].success++;
        } else {
          metrics.failed++;
          metrics.routes[routeKey].failed++;
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      const latency = Date.now() - startTime;
      metrics.latencies.push(latency);
      metrics.total++;
      metrics.failed++;
      const routeKey = `${reqOptions.method} ${path}`;
      metrics.routes[routeKey] = metrics.routes[routeKey] || { success: 0, failed: 0 };
      metrics.routes[routeKey].failed++;
      resolve();
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runLoadTest() {
  const payload = JSON.stringify({ username: 'admin', password: 'paddock2026' });
  const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) };

  const startTestTime = Date.now();
  const BATCH_SIZE = 50;

  for (let i = 0; i < CONCURRENT_USERS; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE && (i + j) < CONCURRENT_USERS; j++) {
      const index = i + j;
      if (index % 4 === 0) {
        batch.push(makeRequest('/'));
      } else if (index % 4 === 1) {
        batch.push(makeRequest('/api/auth/login', { method: 'POST', body: payload, headers }));
      } else if (index % 4 === 2) {
        batch.push(makeRequest('/api/auth/verify'));
      } else {
        batch.push(makeRequest('/api/auth/google', { method: 'POST', body: JSON.stringify({ email: 'test@f1.com' }), headers: { 'Content-Type': 'application/json' } }));
      }
    }
    await Promise.all(batch);
  }

  const totalDuration = Date.now() - startTestTime;

  metrics.latencies.sort((a, b) => a - b);
  const avgLatency = (metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length).toFixed(2);
  const p50 = metrics.latencies[Math.floor(metrics.latencies.length * 0.5)];
  const p95 = metrics.latencies[Math.floor(metrics.latencies.length * 0.95)];
  const p99 = metrics.latencies[Math.floor(metrics.latencies.length * 0.99)];
  const reqPerSec = ((metrics.total / totalDuration) * 1000).toFixed(2);
  const successRate = ((metrics.success / metrics.total) * 100).toFixed(2);

  console.log(`\n==================================================`);
  console.log(`🏁 PROPER TEST SUITE RESULTS: ${CONCURRENT_USERS.toLocaleString()} REQUESTS`);
  console.log(`==================================================`);
  console.log(`Total Requests Sent : ${metrics.total}`);
  console.log(`Successful (2xx)    : ${metrics.success} (${successRate}% Success Rate)`);
  console.log(`Failed (4xx/5xx/Err): ${metrics.failed}`);
  console.log(`Throughput          : ${reqPerSec} requests/sec`);
  console.log(`Total Duration      : ${totalDuration} ms`);
  console.log(`Average Latency     : ${avgLatency} ms`);
  console.log(`p50 Latency         : ${p50} ms`);
  console.log(`p95 Latency         : ${p95} ms`);
  console.log(`p99 Latency         : ${p99} ms`);
  console.log(`--------------------------------------------------`);
  console.log(`Breakdown By Route:`);
  console.log(JSON.stringify(metrics.routes, null, 2));
  console.log(`==================================================\n`);
}

runLoadTest();
