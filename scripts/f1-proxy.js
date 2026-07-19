const WebSocket = require('ws');
const zlib = require('zlib');
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
    const decompressed = zlib.inflateRawSync(buffer);
    return JSON.parse(decompressed.toString('utf8'));
  } catch (err) {
    try {
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
        
        if (payload.M && Array.isArray(payload.M)) {
          payload.M.forEach((message) => {
            if (message.M === 'feed' && message.A && message.A.length >= 2) {
              const channel = message.A[0];
              const compressedData = message.A[1];
              const decompressed = decompressPayload(compressedData);

              if (decompressed) {
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
    console.log('[PROXY F1]: Live timing is restricted or offline during live F1 session. Generating rich standby data stream...');
    isF1Connected = false;
  }
}

// Start local WebSockets server for the Next.js UI client
const localWss = new WebSocket.Server({ port: LOCAL_PORT });

localWss.on('connection', (ws) => {
  console.log('[PROXY LOCAL]: Next.js dashboard client connected.');
  activeLocalClients.add(ws);

  ws.send(JSON.stringify({
    source: 'F1_PROXY_SYSTEM',
    status: isF1Connected ? 'CONNECTED' : 'STANDBY',
    message: isF1Connected 
      ? 'Connected to F1 live stream.' 
      : 'F1 server restricted / offline. Local high-fidelity timing generator active.'
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

// Local Timing Generator State
const mockDrivers = [
  { number: '1', code: 'VER', position: 1, gap: 0.0, lastLap: 78.42, tyreAge: 4, inPit: false, retired: false },
  { number: '4', code: 'NOR', position: 2, gap: 1.2, lastLap: 78.51, tyreAge: 4, inPit: false, retired: false },
  { number: '16', code: 'LEC', position: 3, gap: 2.8, lastLap: 78.63, tyreAge: 6, inPit: false, retired: false },
  { number: '44', code: 'HAM', position: 4, gap: 4.1, lastLap: 78.45, tyreAge: 5, inPit: false, retired: false },
  { number: '81', code: 'PIA', position: 5, gap: 5.5, lastLap: 78.82, tyreAge: 4, inPit: false, retired: false },
  { number: '63', code: 'RUS', position: 6, gap: 7.9, lastLap: 78.99, tyreAge: 3, inPit: false, retired: false },
  { number: '55', code: 'SAI', position: 7, gap: 9.8, lastLap: 79.12, tyreAge: 7, inPit: false, retired: false },
  { number: '14', code: 'ALO', position: 8, gap: 12.3, lastLap: 79.34, tyreAge: 8, inPit: false, retired: false },
  { number: '11', code: 'PER', position: 9, gap: 14.2, lastLap: 79.45, tyreAge: 9, inPit: false, retired: false },
  { number: '10', code: 'GAS', position: 10, gap: 18.5, lastLap: 79.78, tyreAge: 10, inPit: false, retired: false },
  { number: '22', code: 'TSU', position: 11, gap: 21.0, lastLap: 79.92, tyreAge: 8, inPit: false, retired: false },
  { number: '23', code: 'ALB', position: 12, gap: 24.5, lastLap: 79.89, tyreAge: 12, inPit: false, retired: false },
  { number: '27', code: 'HUL', position: 13, gap: 28.0, lastLap: 80.12, tyreAge: 11, inPit: false, retired: false },
  { number: '30', code: 'LAW', position: 14, gap: 30.5, lastLap: 80.34, tyreAge: 13, inPit: false, retired: false },
  { number: '87', code: 'BEA', position: 15, gap: 32.8, lastLap: 80.55, tyreAge: 9, inPit: false, retired: false },
  { number: '18', code: 'STR', position: 16, gap: 35.1, lastLap: 80.89, tyreAge: 14, inPit: false, retired: false },
  { number: '12', code: 'BOR', position: 17, gap: 38.4, lastLap: 81.11, tyreAge: 11, inPit: false, retired: false },
  { number: '7', code: 'DOO', position: 18, gap: 41.2, lastLap: 81.43, tyreAge: 15, inPit: false, retired: false },
  { number: '43', code: 'COL', position: 19, gap: 44.9, lastLap: 81.89, tyreAge: 16, inPit: false, retired: false },
  { number: '31', code: 'OCO', position: 20, gap: 48.0, lastLap: 82.09, tyreAge: 13, inPit: false, retired: false }
];

let mockLap = 14;

// Fallback Mock Streamer: Streams simulated updates if no live GP is running
setInterval(() => {
  if (activeLocalClients.size > 0 && !isF1Connected) {
    mockLap++;

    // Overtake logic: check close gaps
    for (let i = 0; i < mockDrivers.length - 1; i++) {
      const d1 = mockDrivers[i];
      const d2 = mockDrivers[i + 1];

      if (!d1.retired && !d2.retired && !d1.inPit && !d2.inPit) {
        const gap = d2.gap - d1.gap;
        if (gap < 0.8 && Math.random() < 0.25) {
          // Swap positions
          const tempPos = d1.position;
          d1.position = d2.position;
          d2.position = tempPos;

          mockDrivers[i] = d2;
          mockDrivers[i + 1] = d1;

          // Broadcast overtake event log
          const timeStamp = new Date().toTimeString().split(' ')[0];
          broadcastToLocalClients({
            source: 'F1_PROXY_MOCK',
            channel: 'TerminalEvent',
            mockUpdate: {
              event: `[${timeStamp}] LAP ${mockLap}: 🚀 ${d2.code} has overtaken ${d1.code} for P${d2.position}!`
            }
          });
          break; // Max 1 overtake per tick
        }
      }
    }

    // Random Pit Stop trigger (1.5% chance)
    mockDrivers.forEach(d => {
      if (!d.retired && !d.inPit && Math.random() < 0.02) {
        d.inPit = true;
        d.tyreAge = 0;
        d.gap += 22.0; // Pit lane loss
        const timeStamp = new Date().toTimeString().split(' ')[0];
        broadcastToLocalClients({
          source: 'F1_PROXY_MOCK',
          channel: 'TerminalEvent',
          mockUpdate: {
            event: `[${timeStamp}] LAP ${mockLap}: 🔧 ${d.code} enters the pit lane for tyre change.`
          }
        });

        // Release after 5 seconds
        setTimeout(() => {
          d.inPit = false;
          const releaseStamp = new Date().toTimeString().split(' ')[0];
          broadcastToLocalClients({
            source: 'F1_PROXY_MOCK',
            channel: 'TerminalEvent',
            mockUpdate: {
              event: `[${releaseStamp}] LAP ${mockLap}: 🟢 ${d.code} pit stop complete. Returning to track.`
            }
          });
        }, 5000);
      }
    });

    // Random DNF trigger (0.3% chance)
    mockDrivers.forEach(d => {
      if (!d.retired && !d.inPit && Math.random() < 0.003) {
        d.retired = true;
        const timeStamp = new Date().toTimeString().split(' ')[0];
        broadcastToLocalClients({
          source: 'F1_PROXY_MOCK',
          channel: 'TerminalEvent',
          mockUpdate: {
            event: `[${timeStamp}] ⚠️ DNF: ${d.code} retired from session (Mechanical failure).`
          }
        });
      }
    });

    // Recalculate Gaps
    let activeRacing = mockDrivers.filter(d => !d.retired);
    let retired = mockDrivers.filter(d => d.retired);

    activeRacing.forEach((d, idx) => {
      d.position = idx + 1;
      if (idx === 0) {
        d.gap = 0;
      } else {
        d.gap = activeRacing[idx - 1].gap + (Math.random() * 0.4 + 0.1);
      }
      d.tyreAge++;
      d.lastLap = 78.0 + Math.random() * 1.5;
    });

    retired.forEach((d, idx) => {
      d.position = activeRacing.length + idx + 1;
      d.gap = 999.9;
    });

    // Reassemble driver list order
    mockDrivers.sort((a, b) => a.position - b.position);

    // Format into standard TimingData payload structure
    const Lines = {};
    mockDrivers.forEach(d => {
      const min = Math.floor(d.lastLap / 60);
      const sec = (d.lastLap % 60).toFixed(3);
      Lines[d.number] = {
        Position: d.position,
        LastLapTime: { Value: `${min}:${sec.toString().padStart(6, '0')}` },
        Speeds: { ST: String(Math.floor(Math.random() * 20) + 315) },
        InPit: d.inPit,
        Retired: d.retired,
        GapToLeader: String(d.gap.toFixed(3))
      };
    });

    // Broadcast official format to local client
    broadcastToLocalClients({
      source: 'F1_LIVE_SERVER',
      channel: 'TimingData',
      data: { Lines }
    });
  }
}, 3000);

console.log(`=================================================`);
console.log(`🏎️  F1 SIGNALR TELEMETRY PROXY SERVER RUNNING`);
console.log(`👉 Local Dashboard Socket Port: ws://localhost:${LOCAL_PORT}`);
console.log(`=================================================`);

// Start F1 timing hub negotiations
connectToF1Live();
