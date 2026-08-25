const https = require('https');
const WebSocket = require('ws');

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

async function start() {
  console.log('Negotiating...');
  try {
    const { parsed, cookies } = await negotiate();
    const token = parsed.connectionToken;
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

    const wsUrl = `wss://livetiming.formula1.com/signalrcore?id=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Cookie': cookieHeader,
        'Origin': 'https://www.formula1.com',
        'Referer': 'https://www.formula1.com/'
      }
    });

    ws.on('open', () => {
      console.log('WebSocket open.');
      const handshake = JSON.stringify({ protocol: "json", version: 1 }) + String.fromCharCode(0x1e);
      ws.send(handshake);
    });

    let handshaked = false;

    ws.on('message', (data) => {
      const frames = data.toString().split(String.fromCharCode(0x1e));
      for (const frame of frames) {
        if (!frame) continue;
        console.log(`Frame: ${frame.slice(0, 300)}`);

        if (!handshaked) {
          const parsedFrame = JSON.parse(frame);
          if (Object.keys(parsedFrame).length === 0 || parsedFrame.type === undefined) {
            handshaked = true;
            // Subscribe ONLY to open channels (no CarData, no telemetry)
            const subscribe = JSON.stringify({
              arguments: [["Heartbeat", "TimingData", "TrackStatus", "SessionInfo"]],
              target: "Subscribe",
              type: 1
            }) + String.fromCharCode(0x1e);
            ws.send(subscribe);
            console.log('Subscribed to public channels.');
          }
        }
      }
    });

    // Run for 10 seconds then close
    setTimeout(() => {
      ws.close();
      console.log('Done.');
      process.exit(0);
    }, 10000);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

start();
