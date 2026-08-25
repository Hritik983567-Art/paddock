const http = require('http');

const CONCURRENT_USERS = 1000;
const BASE_URL = 'http://localhost:3000';

// High-concurrency HTTP Keep-Alive Agent for socket pooling
const keepAliveAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 1000,
  maxFreeSockets: 200,
  timeout: 60000
});

console.log(`🚀 Executing High-Concurrency 1,000 User Stress Audit with Socket Pooling...`);

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
  const tasks = [];

  const payload = JSON.stringify({ username: 'admin', password: 'paddock2026' });
  const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) };

  for (let i = 0; i < CONCURRENT_USERS; i++) {
    // Distribute 1,000 concurrent requests across key app routes
    if (i % 4 === 0) {
      tasks.push(makeRequest('/'));
    } else if (i % 4 === 1) {
      tasks.push(makeRequest('/api/auth/login', { method: 'POST', body: payload, headers }));
    } else if (i % 4 === 2) {
      tasks.push(makeRequest('/api/auth/verify'));
    } else {
      tasks.push(makeRequest('/api/auth/google', { method: 'POST', body: JSON.stringify({ email: 'test@f1.com' }), headers: { 'Content-Type': 'application/json' } }));
    }
  }

  const startTestTime = Date.now();
  await Promise.all(tasks);
  const totalDuration = Date.now() - startTestTime;

  metrics.latencies.sort((a, b) => a - b);
  const avgLatency = (metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length).toFixed(2);
  const p50 = metrics.latencies[Math.floor(metrics.latencies.length * 0.5)];
  const p95 = metrics.latencies[Math.floor(metrics.latencies.length * 0.95)];
  const p99 = metrics.latencies[Math.floor(metrics.latencies.length * 0.99)];
  const reqPerSec = ((metrics.total / totalDuration) * 1000).toFixed(2);

  console.log(`\n==================================================`);
  console.log(`🏁 1,000 CONCURRENT USER STRESS AUDIT RESULTS`);
  console.log(`==================================================`);
  console.log(`Total Requests Sent : ${metrics.total}`);
  console.log(`Successful (2xx)    : ${metrics.success}`);
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
