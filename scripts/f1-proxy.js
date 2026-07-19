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
    let uniqueDriversWithPositions = new Set();
    let lastPositionReset = Date.now();

    f1Socket.on('open', () => {
      console.log('[PROXY F1]: WebSocket tunnel opened. Sending handshake protocol...');
      
      // Send handshake message
      const handshake = JSON.stringify({ protocol: "json", version: 1 }) + String.fromCharCode(0x1e);
      f1Socket.send(handshake);
      
      isF1Connected = true;
      lastF1DataFrameTime = 0; // Initialize to 0 so we check for active drivers first
    });

    f1Socket.on('message', (rawData) => {
      try {
        const frames = rawData.toString().split(String.fromCharCode(0x1e));
        for (const frame of frames) {
          if (!frame) continue;

          if (!handshaked) {
            const parsedFrame = JSON.parse(frame);
            if (Object.keys(parsedFrame).length === 0 || parsedFrame.type === undefined) {
              console.log('[PROXY F1]: Handshake accepted. Subscribing to live timing feeds...');
              handshaked = true;

              // Subscribe to channels
              const subscribe = JSON.stringify({
                arguments: [["Heartbeat", "CarData", "TimingData", "TimingStats", "TimingAppData", "WeatherData", "TrackStatus", "SessionInfo"]],
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

              let decompressed = null;
              if (typeof payload === 'string') {
                decompressed = decompressPayload(payload);
              } else {
                decompressed = payload;
              }

              if (decompressed) {
                if (channel === 'TimingData') {
                  lastF1DataFrameTime = Date.now();

                  // Parse updates to display in the client's event terminal
                  if (decompressed.Lines) {
                    Object.entries(decompressed.Lines).forEach(([num, line]) => {
                      const driverCode = NUMBER_TO_CODE[num] || `Driver #${num}`;
                      const timeStamp = new Date().toTimeString().split(' ')[0];

                      if (line && line.LastLapTime && line.LastLapTime.Value) {
                        broadcastToLocalClients({
                          source: 'F1_PROXY_MOCK',
                          channel: 'TerminalEvent',
                          mockUpdate: {
                            event: `[${timeStamp}] ⏱️ LIVE UPDATE: ${driverCode} completed lap with time ${line.LastLapTime.Value}`
                          }
                        });
                      }

                      if (line && line.InPit) {
                        broadcastToLocalClients({
                          source: 'F1_PROXY_MOCK',
                          channel: 'TerminalEvent',
                          mockUpdate: {
                            event: `[${timeStamp}] 🔧 LIVE UPDATE: ${driverCode} has entered the pit lane.`
                          }
                        });
                      }
                    });
                  }
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

// Historical Replay State
const CIRCUIT_TO_2024_ROUND = {
  'bahrain': 1,
  'jeddah': 2,
  'albert_park': 3,
  'suzuka': 4,
  'shanghai': 5,
  'miami': 6,
  'imola': 7,
  'monaco': 8,
  'villeneuve': 9,
  'catalunya': 10,
  'red_bull_ring': 11,
  'silverstone': 12,
  'hungaroring': 13,
  'spa': 14,
  'zandvoort': 15,
  'monza': 16,
  'baku': 17,
  'marina_bay': 18,
  'americas': 19,
  'rodriguez': 20,
  'interlagos': 21,
  'vegas': 22,
  'losail': 23,
  'yas_marina': 24
};

const NUMBER_TO_CODE = {
  '12': 'ANT',
  '63': 'RUS',
  '44': 'HAM',
  '16': 'LEC',
  '1': 'NOR',
  '81': 'PIA',
  '3': 'VER',
  '6': 'HAD',
  '10': 'GAS',
  '30': 'LAW',
  '41': 'LIN',
  '87': 'BEA',
  '43': 'COL',
  '5': 'BOR',
  '55': 'SAI',
  '23': 'ALB',
  '31': 'OCO',
  '14': 'ALO',
  '27': 'HUL',
  '77': 'BOT',
  '11': 'PER',
  '18': 'STR'
};

let currentCircuitId = 'spa';
let cachedLaps = null;
let cachedLapsLoading = false;
let currentReplayLap = 1;
let maxReplayLaps = 44;

async function loadHistoricalLaps(circuitId) {
  const round = CIRCUIT_TO_2024_ROUND[circuitId] || 14;
  const url = `https://api.jolpi.ca/ergast/f1/2024/${round}/laps.json?limit=2000`;
  console.log(`[PROXY HISTORICAL]: Fetching 2024 GP round ${round} lap data from Jolpica...`);
  cachedLapsLoading = true;
  
  try {
    const resData = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });

    const races = resData.MRData.RaceTable.Races;
    if (races && races.length > 0) {
      const laps = races[0].Laps;
      if (laps && laps.length > 0) {
        cachedLaps = laps;
        maxReplayLaps = laps.length;
        currentReplayLap = 1;
        console.log(`[PROXY HISTORICAL]: Successfully loaded ${laps.length} laps of 2024 historical GP data!`);
      } else {
        throw new Error('Empty laps array returned');
      }
    } else {
      throw new Error('No race found in response');
    }
  } catch (err) {
    console.error(`[PROXY HISTORICAL ERROR]: Failed to load historical laps:`, err.message);
    cachedLaps = null;
  } finally {
    cachedLapsLoading = false;
  }
}

// Start local WebSockets server for the Next.js UI client
const localWss = new WebSocket.Server({ port: LOCAL_PORT });

localWss.on('connection', (ws) => {
  console.log('[PROXY LOCAL]: Next.js dashboard client connected.');
  activeLocalClients.add(ws);

  const isActuallyStreaming = isF1Connected && (Date.now() - lastF1DataFrameTime < 15000);
  ws.send(JSON.stringify({
    source: 'F1_PROXY_SYSTEM',
    status: isActuallyStreaming ? 'CONNECTED' : 'STANDBY',
    message: isActuallyStreaming 
      ? 'Connected to F1 live stream.' 
      : 'F1 server restricted / offline. Local high-fidelity timing generator active.'
  }));

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'SET_CIRCUIT') {
        const newCircuit = msg.circuitId || 'spa';
        console.log(`[PROXY LOCAL]: Client selected circuit: ${newCircuit}`);
        if (newCircuit !== currentCircuitId || !cachedLaps) {
          currentCircuitId = newCircuit;
          cachedLaps = null;
          currentReplayLap = 1;
          await loadHistoricalLaps(newCircuit);
        }
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

// Local Timing Generator State (2026 Rosters)
const mockDrivers = [
  { number: '12', code: 'ANT', position: 1, gap: 0.0, lastLap: 78.42, tyreAge: 4, inPit: false, retired: false },
  { number: '63', code: 'RUS', position: 2, gap: 1.2, lastLap: 78.51, tyreAge: 4, inPit: false, retired: false },
  { number: '44', code: 'HAM', position: 3, gap: 2.8, lastLap: 78.63, tyreAge: 6, inPit: false, retired: false },
  { number: '16', code: 'LEC', position: 4, gap: 4.1, lastLap: 78.45, tyreAge: 5, inPit: false, retired: false },
  { number: '1', code: 'NOR', position: 5, gap: 5.5, lastLap: 78.82, tyreAge: 4, inPit: false, retired: false },
  { number: '81', code: 'PIA', position: 6, gap: 7.9, lastLap: 78.99, tyreAge: 3, inPit: false, retired: false },
  { number: '3', code: 'VER', position: 7, gap: 9.8, lastLap: 79.12, tyreAge: 7, inPit: false, retired: false },
  { number: '6', code: 'HAD', position: 8, gap: 12.3, lastLap: 79.34, tyreAge: 8, inPit: false, retired: false },
  { number: '10', code: 'GAS', position: 9, gap: 14.2, lastLap: 79.45, tyreAge: 9, inPit: false, retired: false },
  { number: '30', code: 'LAW', position: 10, gap: 18.5, lastLap: 79.78, tyreAge: 10, inPit: false, retired: false },
  { number: '41', code: 'LIN', position: 11, gap: 21.0, lastLap: 79.92, tyreAge: 8, inPit: false, retired: false },
  { number: '87', code: 'BEA', position: 12, gap: 24.5, lastLap: 79.89, tyreAge: 12, inPit: false, retired: false },
  { number: '43', code: 'COL', position: 13, gap: 28.0, lastLap: 80.12, tyreAge: 11, inPit: false, retired: false },
  { number: '5', code: 'BOR', position: 14, gap: 30.5, lastLap: 80.34, tyreAge: 13, inPit: false, retired: false },
  { number: '55', code: 'SAI', position: 15, gap: 32.8, lastLap: 80.55, tyreAge: 9, inPit: false, retired: false },
  { number: '23', code: 'ALB', position: 16, gap: 35.1, lastLap: 80.89, tyreAge: 14, inPit: false, retired: false },
  { number: '31', code: 'OCO', position: 17, gap: 38.4, lastLap: 81.11, tyreAge: 11, inPit: false, retired: false },
  { number: '14', code: 'ALO', position: 18, gap: 41.2, lastLap: 81.43, tyreAge: 15, inPit: false, retired: false },
  { number: '27', code: 'HUL', position: 19, gap: 44.9, lastLap: 81.89, tyreAge: 16, inPit: false, retired: false },
  { number: '77', code: 'BOT', position: 20, gap: 48.0, lastLap: 82.09, tyreAge: 13, inPit: false, retired: false },
  { number: '11', code: 'PER', position: 21, gap: 51.5, lastLap: 82.45, tyreAge: 10, inPit: false, retired: false },
  { number: '18', code: 'STR', position: 22, gap: 55.0, lastLap: 82.89, tyreAge: 14, inPit: false, retired: false }
];

let mockLap = 14;

// Fallback Mock Streamer: Streams simulated updates if F1 live timing is disconnected or restricted
setInterval(() => {
  const isActuallyStreaming = isF1Connected && (Date.now() - lastF1DataFrameTime < 15000);
  const shouldMock = !isF1Connected || !isActuallyStreaming;

  if (activeLocalClients.size > 0 && shouldMock) {
    if (cachedLaps && cachedLaps[currentReplayLap - 1]) {
      const lapData = cachedLaps[currentReplayLap - 1];
      mockLap = parseInt(lapData.number) || currentReplayLap;
      
      const Lines = {};
      
      const driverMap2024to2026 = {
        'antonelli': '12',
        'russell': '63',
        'hamilton': '44',
        'leclerc': '16',
        'norris': '1',
        'piastri': '81',
        'max_verstappen': '3',
        'hadjar': '6',
        'gasly': '10',
        'lawson': '30',
        'arvid_lindblad': '41',
        'bearman': '87',
        'colapinto': '43',
        'bortoleto': '5',
        'sainz': '55',
        'albon': '23',
        'ocon': '31',
        'alonso': '14',
        'hulkenberg': '27',
        'bottas': '77',
        'perez': '11',
        'stroll': '18'
      };

      const idMap = {
        'leclerc': 'leclerc',
        'hamilton': 'hamilton',
        'perez': 'perez',
        'piastri': 'piastri',
        'russell': 'russell',
        'sainz': 'sainz',
        'norris': 'norris',
        'alonso': 'alonso',
        'max_verstappen': 'max_verstappen',
        'albon': 'albon',
        'ocon': 'ocon',
        'gasly': 'gasly',
        'bottas': 'bottas',
        'stroll': 'stroll',
        'hulkenberg': 'hulkenberg',
        'kevin_magnussen': 'bearman',
        'zhou': 'bortoleto',
        'sargeant': 'colapinto',
        'ricciardo': 'lawson',
        'antonelli': 'antonelli',
        'hadjar': 'hadjar',
        'arvid_lindblad': 'arvid_lindblad'
      };

      lapData.Timings.forEach((t) => {
        const targetId = idMap[t.driverId] || t.driverId;
        const number = driverMap2024to2026[targetId] || '99';
        const pos = parseInt(t.position);
        
        let gapToLeader = 0.0;
        if (pos > 1) {
          gapToLeader = (pos - 1) * 1.8 + Math.random() * 0.5;
        }

        Lines[number] = {
          Position: pos,
          LastLapTime: { Value: t.time },
          Speeds: { ST: String(Math.floor(Math.random() * 15) + 320) },
          InPit: false,
          Retired: false,
          GapToLeader: String(gapToLeader.toFixed(3))
        };
      });

      // Handle DNFs
      const activeNumbers = new Set(Object.keys(Lines));
      Object.values(driverMap2024to2026).forEach(num => {
        if (!activeNumbers.has(num)) {
          Lines[num] = {
            Position: 22,
            LastLapTime: { Value: '—' },
            Speeds: { ST: '0' },
            InPit: false,
            Retired: true,
            GapToLeader: '999.999'
          };
        }
      });

      broadcastToLocalClients({
        source: 'F1_LIVE_SERVER',
        channel: 'TimingData',
        data: { Lines }
      });

      const timeStamp = new Date().toTimeString().split(' ')[0];
      const p1Driver = lapData.Timings[0] ? lapData.Timings[0].driverId.toUpperCase() : 'UNKNOWN';
      const p2Driver = lapData.Timings[1] ? lapData.Timings[1].driverId.toUpperCase() : 'UNKNOWN';
      broadcastToLocalClients({
        source: 'F1_PROXY_MOCK',
        channel: 'TerminalEvent',
        mockUpdate: {
          event: `[${timeStamp}] LAP ${mockLap}: ⏱️ [REPLAY] Real 2024 telemetry stream. P1: ${p1Driver} | P2: ${p2Driver}`
        }
      });

      currentReplayLap++;
      if (currentReplayLap > maxReplayLaps) {
        currentReplayLap = 1;
      }
    } else {
      mockLap++;

      // Overtake logic: check close gaps
      for (let i = 0; i < mockDrivers.length - 1; i++) {
        const d1 = mockDrivers[i];
        const d2 = mockDrivers[i + 1];

        if (!d1.retired && !d2.retired && !d1.inPit && !d2.inPit) {
          const gap = d2.gap - d1.gap;
          if (gap < 0.8 && Math.random() < 0.25) {
            const tempPos = d1.position;
            d1.position = d2.position;
            d2.position = tempPos;

            mockDrivers[i] = d2;
            mockDrivers[i + 1] = d1;

            const timeStamp = new Date().toTimeString().split(' ')[0];
            broadcastToLocalClients({
              source: 'F1_PROXY_MOCK',
              channel: 'TerminalEvent',
              mockUpdate: {
                event: `[${timeStamp}] LAP ${mockLap}: 🚀 ${d2.code} has overtaken ${d1.code} for P${d2.position}!`
              }
            });
            break;
          }
        }
      }

      // Random Pit Stop trigger (1.5% chance)
      mockDrivers.forEach(d => {
        if (!d.retired && !d.inPit && Math.random() < 0.02) {
          d.inPit = true;
          d.tyreAge = 0;
          d.gap += 22.0;
          const timeStamp = new Date().toTimeString().split(' ')[0];
          broadcastToLocalClients({
            source: 'F1_PROXY_MOCK',
            channel: 'TerminalEvent',
            mockUpdate: {
              event: `[${timeStamp}] LAP ${mockLap}: 🔧 ${d.code} enters the pit lane for tyre change.`
            }
          });

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

      mockDrivers.sort((a, b) => a.position - b.position);

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

      broadcastToLocalClients({
        source: 'F1_LIVE_SERVER',
        channel: 'TimingData',
        data: { Lines }
      });
    }
  }
}, 3000);

console.log(`=================================================`);
console.log(`🏎️  F1 SIGNALR TELEMETRY PROXY SERVER RUNNING`);
console.log(`👉 Local Dashboard Socket Port: ws://localhost:${LOCAL_PORT}`);
console.log(`=================================================`);

// Start F1 timing hub negotiations
connectToF1Live();
