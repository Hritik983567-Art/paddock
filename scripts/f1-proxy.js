const WebSocket = require('ws');
const zlib = require('zlib');
const https = require('https');

const LOCAL_PORT = 8080;
const F1_HOST = 'livetiming.formula1.com';

let activeLocalClients = new Set();
let f1Socket = null;
let isF1Connected = false;
let lastF1DataFrameTime = 0; // Watchdog timer for active data packets

// HTTP POST Helper for modern SignalR Core negotiation
function negotiateF1() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: F1_HOST,
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

// Asynchronously decompress F1 Gzipped Base64 stream without blocking event loop
function decompressPayloadAsync(base64Str) {
  return new Promise((resolve) => {
    try {
      const buffer = Buffer.from(base64Str, 'base64');
      zlib.inflateRaw(buffer, (err, decompressed) => {
        if (!err && decompressed) {
          try {
            return resolve(JSON.parse(decompressed.toString('utf8')));
          } catch {
            return resolve(null);
          }
        }
        zlib.gunzip(buffer, (err2, decompressed2) => {
          if (!err2 && decompressed2) {
            try {
              return resolve(JSON.parse(decompressed2.toString('utf8')));
            } catch {
              return resolve(null);
            }
          }
          resolve(null);
        });
      });
    } catch {
      resolve(null);
    }
  });
}

// Connect to official F1 Streaming Hub
async function connectToF1Live() {
  console.log('[PROXY F1]: Negotiating connection parameters with F1 SignalR Core servers...');
  try {
    const { parsed, cookies } = await negotiateF1();
    const token = parsed.connectionToken;
    if (!token) {
      throw new Error('ConnectionToken missing in negotiation data.');
    }

    // Extract load-balancer cookies
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    const wsUrl = `wss://${F1_HOST}/signalrcore?id=${encodeURIComponent(token)}`;
    console.log('[PROXY F1]: Negotiation successful. Connecting to WebSocket tunnel...');

    f1Socket = new WebSocket(wsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Cookie': cookieHeader,
        'Origin': 'https://www.formula1.com',
        'Referer': 'https://www.formula1.com/'
      }
    });

    let handshaked = false;

    f1Socket.on('open', () => {
      console.log('[PROXY F1]: WebSocket tunnel opened. Sending handshake protocol...');
      
      // Send handshake message
      const handshake = JSON.stringify({ protocol: "json", version: 1 }) + String.fromCharCode(0x1e);
      f1Socket.send(handshake);
      
      isF1Connected = true;
      lastF1DataFrameTime = 0; // Initialize to 0 so we check for active drivers first
    });

    f1Socket.on('message', async (rawData) => {
      try {
        const frames = rawData.toString().split(String.fromCharCode(0x1e));
        for (const frame of frames) {
          if (!frame) continue;

          if (!handshaked) {
            const parsedFrame = JSON.parse(frame);
            if (Object.keys(parsedFrame).length === 0 || parsedFrame.type === undefined) {
              console.log('[PROXY F1]: Handshake accepted. Subscribing to live timing feeds...');
              handshaked = true;

              // Subscribe to essential dashboard channels (prune CarData to prevent UI lag/latency)
              const subscribe = JSON.stringify({
                arguments: [["Heartbeat", "TimingData", "TimingStats", "TimingAppData", "WeatherData", "TrackStatus", "SessionInfo", "RaceControlMessages", "DriverList"]],
                target: "Subscribe",
                type: 1
              }) + String.fromCharCode(0x1e);
              f1Socket.send(subscribe);
            }
          } else {
            const msg = JSON.parse(frame);
            if (msg.type === 1 && msg.target === 'feed' && msg.arguments && msg.arguments.length >= 2) {
              const channel = msg.arguments[0];
              const payload = msg.arguments[1];

              // Filter out high-frequency raw telemetry if not subscribed
              if (channel === 'CarData') continue;

              let decompressed = null;
              if (typeof payload === 'string') {
                decompressed = await decompressPayloadAsync(payload);
              } else {
                decompressed = payload;
              }

              if (decompressed) {
                if (channel === 'TimingData') {
                  lastF1DataFrameTime = Date.now();
                }

                broadcastToLocalClients({
                  source: 'F1_LIVE_SERVER',
                  channel,
                  data: decompressed
                });
              }
            }
          }
        }
      } catch (err) {
        // Skip unparseable heartbeat keep-alives
      }
    });

    f1Socket.on('close', () => {
      console.log('[PROXY F1]: Connection to F1 server closed. Retrying in 10s...');
      isF1Connected = false;
      handshaked = false;
      setTimeout(connectToF1Live, 10000);
    });

    f1Socket.on('error', (err) => {
      console.error('[PROXY F1 ERROR]:', err.message);
      isF1Connected = false;
      handshaked = false;
    });

  } catch (err) {
    console.error('[PROXY F1 NEGOTIATION ERROR]:', err.message);
    isF1Connected = false;
  }
}

// Start local WebSockets server for the Next.js UI client
const localWss = new WebSocket.Server({ port: LOCAL_PORT });

localWss.on('connection', (ws) => {
  console.log('[PROXY LOCAL]: Next.js dashboard client connected.');
  activeLocalClients.add(ws);

  const isActuallyStreaming = isF1Connected && (Date.now() - lastF1DataFrameTime < 30000);
  ws.send(JSON.stringify({
    source: 'F1_PROXY_SYSTEM',
    status: isActuallyStreaming ? 'CONNECTED' : 'STANDBY',
    message: isActuallyStreaming 
      ? 'Official F1 pit-wall live stream connected and transmitting.' 
      : 'Pit-wall telemetry uplink standby. Live session activates on Sprint Quali, Sprint Race, Quali, or Race.'
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'SET_CIRCUIT') {
        console.log(`[PROXY LOCAL]: Client selected circuit: ${msg.circuitId}`);
      }
    } catch (e) {
      // Ignore invalid JSON messages
    }
  });

  ws.on('close', () => {
    console.log('[PROXY LOCAL]: Next.js dashboard client disconnected.');
    activeLocalClients.delete(ws);
  });
});

function broadcastToLocalClients(msg) {
  const jsonStr = JSON.stringify(msg);
  activeLocalClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonStr);
    }
  });
}

console.log(`=================================================`);
console.log(`🏎️  F1 SIGNALR TELEMETRY PROXY SERVER RUNNING`);
console.log(`👉 Local Dashboard Socket Port: ws://localhost:${LOCAL_PORT}`);
console.log(`=================================================`);

// Start F1 timing hub negotiations
connectToF1Live();
