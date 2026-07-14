const WebSocket = require('ws');
const zlib = require('zlib');
const http = require('http');
const https = require('https');

const LOCAL_PORT = 8080;
const F1_HOST = 'livetiming.formula1.com';
const F1_NEGOTIATE_URL = `https://${F1_HOST}/signalr/negotiate?clientProtocol=1.5&connectionData=%5B%7B%22name%22%3A%22StreamingHub%22%7D%5D`;

let activeLocalClients = new Set();
let f1Socket = null;
let isF1Connected = false;

// HTTP GET Helper for negotiation
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse negotiation data: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Decompress F1 Gzipped Base64 stream
function decompressPayload(base64Str) {
  try {
    const buffer = Buffer.from(base64Str, 'base64');
    // F1 SignalR payload is raw deflate compression (no zlib headers)
    const decompressed = zlib.inflateRawSync(buffer);
    return JSON.parse(decompressed.toString('utf8'));
  } catch (err) {
    try {
      // Fallback to standard gunzip in case compression headers differ
      const buffer = Buffer.from(base64Str, 'base64');
      const decompressed = zlib.gunzipSync(buffer);
      return JSON.parse(decompressed.toString('utf8'));
    } catch (e2) {
      console.error('[PROXY DECOMPRESS ERROR]:', err.message);
      return null;
    }
  }
}

// Connect to official F1 Streaming Hub
async function connectToF1Live() {
  console.log('[PROXY F1]: Negotiating connection parameters...');
  try {
    const negData = await httpGet(F1_NEGOTIATE_URL);
    const token = negData.ConnectionToken;
    if (!token) {
      throw new Error('ConnectionToken missing in negotiation data.');
    }

    const wsUrl = `wss://${F1_HOST}/signalr/connect?transport=webSockets&clientProtocol=1.5&connectionToken=${encodeURIComponent(token)}&connectionData=%5B%7B%22name%22%3A%22StreamingHub%22%7D%5D`;
    console.log('[PROXY F1]: Parameter negotiation success. Connecting to Streaming Hub...');

    f1Socket = new WebSocket(wsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    f1Socket.on('open', () => {
      console.log('[PROXY F1]: Connected to official live timing server!');
      isF1Connected = true;

      // Subscribe to all live telemetry channels
      const subscribePayload = {
        H: "StreamingHub",
        M: "Subscribe",
        A: [["Heartbeat", "CarData", "TimingData", "TimingStats", "TimingAppData", "WeatherData", "TrackStatus", "SessionInfo"]],
        I: 1
      };
      f1Socket.send(JSON.stringify(subscribePayload));
      console.log('[PROXY F1]: Subscribed to timing, car telemetry, track flags and weather feeds.');
    });

    f1Socket.on('message', (rawData) => {
      try {
        const payload = JSON.parse(rawData.toString());
        
        // Check for subscription feeds
        if (payload.M && Array.isArray(payload.M)) {
          payload.M.forEach((message) => {
            if (message.M === 'feed' && message.A && message.A.length >= 2) {
              const channel = message.A[0]; // e.g., 'TimingData'
              const compressedData = message.A[1];
              const decompressed = decompressPayload(compressedData);

              if (decompressed) {
                // Broadcast this timing updates to all connected local dashboard pages
                broadcastToLocalClients({
                  source: 'F1_LIVE_SERVER',
                  channel,
                  data: decompressed
                });
              }
            }
          });
        }
      } catch (err) {
        // Skip unparseable heartbeat keep-alives
      }
    });

    f1Socket.on('close', () => {
      console.log('[PROXY F1]: Connection to F1 server closed. Retrying in 10s...');
      isF1Connected = false;
      setTimeout(connectToF1Live, 10000);
    });

    f1Socket.on('error', (err) => {
      console.error('[PROXY F1 ERROR]:', err.message);
      isF1Connected = false;
    });

  } catch (err) {
    console.error('[PROXY F1 NEGOTIATION ERROR]:', err.message);
    console.log('[PROXY F1]: Retrying parameters query in 10s...');
    setTimeout(connectToF1Live, 10000);
  }
}

// Start local WebSockets server for the Next.js UI client
const localWss = new WebSocket.Server({ port: LOCAL_PORT });

localWss.on('connection', (ws) => {
  console.log('[PROXY LOCAL]: Next.js dashboard client connected.');
  activeLocalClients.add(ws);

  // Send initial welcome status packet
  ws.send(JSON.stringify({
    source: 'F1_PROXY_SYSTEM',
    status: isF1Connected ? 'CONNECTED' : 'STANDBY',
    message: isF1Connected 
      ? 'Listening to active track telemetry feed.' 
      : 'F1 Live server is offline/standby. Generating test timing telemetry.'
  }));

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

// Fallback Mock Streamer: Streams simulated updates if no live GP is running
// to allow offline testing of the live dashboard
setInterval(() => {
  if (activeLocalClients.size > 0 && !isF1Connected) {
    // Generate a ticking live mock telemetry update
    const randomDriver = ['VER', 'NOR', 'LEC', 'HAM', 'PIA', 'RUS', 'SAI', 'ALO'][Math.floor(Math.random() * 8)];
    const timeStamp = new Date().toTimeString().split(' ')[0];

    broadcastToLocalClients({
      source: 'F1_PROXY_MOCK',
      channel: 'TimingData',
      timestamp: timeStamp,
      mockUpdate: {
        driverCode: randomDriver,
        lapTime: `1:${(17 + Math.random() * 2).toFixed(3)}`,
        speedTrap: Math.floor(Math.random() * 15) + 320,
        event: Math.random() > 0.8 ? `${randomDriver} sets personal best Sector 2.` : null
      }
    });
  }
}, 3000);

console.log(`=================================================`);
console.log(`🏎️  F1 SIGNALR TELEMETRY PROXY SERVER RUNNING`);
console.log(`👉 Local Dashboard Socket Port: ws://localhost:${LOCAL_PORT}`);
console.log(`=================================================`);

// Start F1 timing hub negotiations
connectToF1Live();
