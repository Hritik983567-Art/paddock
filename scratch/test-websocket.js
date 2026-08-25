const https = require('https');
const WebSocket = require('ws');
const zlib = require('zlib');

function negotiate() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'livetiming.formula1.com',
      path: '/signalrcore/negotiate?negotiateVersion=1',
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.formula1.com',
        'Referer': 'https://www.formula1.com/',
        'Content-Length': 0
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const cookies = res.headers['set-cookie'] || [];
          resolve({ parsed, cookies });
        } catch (e) {
          reject(new Error(`Failed to parse negotiate body: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function decompressPayload(base64Str) {
  try {
    const buffer = Buffer.from(base64Str, 'base64');
    const decompressed = zlib.inflateRawSync(buffer);
    return JSON.parse(decompressed.toString('utf8'));
  } catch (err) {
    try {
      const buffer = Buffer.from(base64Str, 'base64');
      const decompressed = zlib.gunzipSync(buffer);
      return JSON.parse(decompressed.toString('utf8'));
    } catch (e2) {
      return null;
    }
  }
}

async function start() {
  console.log('Negotiating...');
  try {
    const { parsed, cookies } = await negotiate();
    const token = parsed.connectionToken;
    console.log(`Negotiate success. Token: ${token}`);

    // Reconstruct cookies for request headers
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

    const wsUrl = `wss://livetiming.formula1.com/signalrcore?id=${encodeURIComponent(token)}`;
    console.log(`Connecting to: ${wsUrl}`);

    const ws = new WebSocket(wsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Cookie': cookieHeader,
        'Origin': 'https://www.formula1.com',
        'Referer': 'https://www.formula1.com/'
      }
    });

    ws.on('open', () => {
      console.log('WebSocket connection opened.');
      
      // 1. Send SignalR Core Handshake Message
      const handshake = JSON.stringify({ protocol: "json", version: 1 }) + String.fromCharCode(0x1e);
      ws.send(handshake);
      console.log('Handshake message sent.');
    });

    let handshaked = false;

    ws.on('message', (data) => {
      const frames = data.toString().split(String.fromCharCode(0x1e));
      for (const frame of frames) {
        if (!frame) continue;
        console.log(`Received Frame: ${frame.slice(0, 150)}`);

        if (!handshaked) {
          try {
            const parsedFrame = JSON.parse(frame);
            if (Object.keys(parsedFrame).length === 0 || parsedFrame.type === undefined) {
              console.log('Handshake accepted by server!');
              handshaked = true;

              // 2. Send Subscription Invocation
              const subscribe = JSON.stringify({
                arguments: [["Heartbeat", "CarData", "TimingData", "TimingStats", "TimingAppData", "WeatherData", "TrackStatus", "SessionInfo"]],
                target: "Subscribe",
                type: 1
              }) + String.fromCharCode(0x1e);
              ws.send(subscribe);
              console.log('Subscription message sent.');
            }
          } catch (e) {
            console.error('Handshake parse error:', e.message);
          }
        } else {
          // Parse invocation messages
          try {
            const msg = JSON.parse(frame);
            if (msg.type === 1 && msg.target === 'feed' && msg.arguments && msg.arguments.length >= 2) {
              const channel = msg.arguments[0];
              const payload = msg.arguments[1];
              const decompressed = decompressPayload(payload);
              console.log(`\n--- Channel: ${channel} ---`);
              console.log(`Decompressed length: ${JSON.stringify(decompressed).length}`);
              console.log(`Preview:`, JSON.stringify(decompressed).slice(0, 300));
              
              // We successfully got real F1 data! Close and report.
              ws.close();
              process.exit(0);
            }
          } catch (e) {
            // Ignore parse errors on ping frames
          }
        }
      }
    });

    ws.on('error', (e) => {
      console.error('WS Error:', e.message);
    });

    ws.on('close', () => {
      console.log('WS Connection closed.');
    });

  } catch (err) {
    console.error('Start error:', err.message);
  }
}

start();
