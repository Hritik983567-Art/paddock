import { NextRequest, NextResponse } from 'next/server';

interface LiveDriverPayload {
  driverId: string;
  code: string;
  name: string;
  number: string;
  teamId: string;
  teamName: string;
  position: number;
  gapToLeader: number;
  intervalToAhead: number;
  lastLapTime: string;
  bestLapTime: string;
  isFastestSector: boolean;
  isFastestLap?: boolean;
  sector1?: { value: string; isPersonalFastest?: boolean; isOverallFastest?: boolean };
  sector2?: { value: string; isPersonalFastest?: boolean; isOverallFastest?: boolean };
  sector3?: { value: string; isPersonalFastest?: boolean; isOverallFastest?: boolean };
  speedTrap: number;
  tyre: 'S' | 'M' | 'H' | 'I' | 'W';
  tyreAge: number;
  status: 'RACING' | 'IN PIT' | 'OUT' | 'RETIRED';
  pitStops: number;
}

// 2026 Championship Driver Roster metadata for authentic live session mapping
interface DriverRosterEntry {
  driverId: string;
  code: string;
  name: string;
  number: string;
  teamId: string;
  teamName: string;
}

const OFFICIAL_2026_DRIVER_ROSTER: DriverRosterEntry[] = [
  { driverId: 'norris', code: 'NOR', name: 'Lando Norris', number: '4', teamId: 'mclaren', teamName: 'McLaren' },
  { driverId: 'verstappen', code: 'VER', name: 'Max Verstappen', number: '1', teamId: 'red_bull', teamName: 'Red Bull Racing' },
  { driverId: 'leclerc', code: 'LEC', name: 'Charles Leclerc', number: '16', teamId: 'ferrari', teamName: 'Ferrari' },
  { driverId: 'piastri', code: 'PIA', name: 'Oscar Piastri', number: '81', teamId: 'mclaren', teamName: 'McLaren' },
  { driverId: 'hamilton', code: 'HAM', name: 'Lewis Hamilton', number: '44', teamId: 'ferrari', teamName: 'Ferrari' },
  { driverId: 'russell', code: 'RUS', name: 'George Russell', number: '63', teamId: 'mercedes', teamName: 'Mercedes' },
  { driverId: 'antonelli', code: 'ANT', name: 'Andrea Kimi Antonelli', number: '12', teamId: 'mercedes', teamName: 'Mercedes' },
  { driverId: 'sainz', code: 'SAI', name: 'Carlos Sainz', number: '55', teamId: 'williams', teamName: 'Williams' },
  { driverId: 'albon', code: 'ALB', name: 'Alexander Albon', number: '23', teamId: 'williams', teamName: 'Williams' },
  { driverId: 'alonso', code: 'ALO', name: 'Fernando Alonso', number: '14', teamId: 'aston_martin', teamName: 'Aston Martin' },
  { driverId: 'stroll', code: 'STR', name: 'Lance Stroll', number: '18', teamId: 'aston_martin', teamName: 'Aston Martin' },
  { driverId: 'gasly', code: 'GAS', name: 'Pierre Gasly', number: '10', teamId: 'alpine', teamName: 'Alpine' },
  { driverId: 'doohan', code: 'DOO', name: 'Jack Doohan', number: '7', teamId: 'alpine', teamName: 'Alpine' },
  { driverId: 'tsunoda', code: 'TSU', name: 'Yuki Tsunoda', number: '22', teamId: 'rb', teamName: 'Racing Bulls' },
  { driverId: 'hadjar', code: 'HAD', name: 'Isack Hadjar', number: '6', teamId: 'rb', teamName: 'Racing Bulls' },
  { driverId: 'lawson', code: 'LAW', name: 'Liam Lawson', number: '30', teamId: 'red_bull', teamName: 'Red Bull Racing' },
  { driverId: 'hulkenberg', code: 'HUL', name: 'Nico Hülkenberg', number: '27', teamId: 'sauber', teamName: 'Sauber' },
  { driverId: 'bortoleto', code: 'BOR', name: 'Gabriel Bortoleto', number: '5', teamId: 'sauber', teamName: 'Sauber' },
  { driverId: 'bearman', code: 'BEA', name: 'Oliver Bearman', number: '87', teamId: 'haas', teamName: 'Haas F1 Team' },
  { driverId: 'ocon', code: 'OCO', name: 'Esteban Ocon', number: '31', teamId: 'haas', teamName: 'Haas F1 Team' }
];

interface CacheEntry {
  data: any;
  status: number;
  timestamp: number;
}

const telemetryCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 3000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const circuit = searchParams.get('circuit') || 'interlagos';

    // Check short server memory cache to prevent upstream OpenF1 throttling
    const cached = telemetryCache[circuit];
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return NextResponse.json(cached.data, {
        status: cached.status,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json'
        }
      });
    }

    // 1. Attempt to fetch real-time session from OpenF1 public live endpoints
    let openf1Drivers: LiveDriverPayload[] | null = null;
    let weatherData: any = null;
    const trackStatus = 'GREEN';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // Probe OpenF1 latest session
      const sessRes = await fetch('https://api.openf1.org/v1/sessions?session_key=latest', {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      if (sessRes.ok) {
        const sessList = await sessRes.json();
        const activeSess = sessList[0];

        if (activeSess && activeSess.session_key) {
          const sessionKey = activeSess.session_key;

          // Check if session is truly ongoing right now (within 30 mins before start to 1 hour after end)
          const sessionStart = activeSess.date_start ? new Date(activeSess.date_start).getTime() : 0;
          const sessionEnd = activeSess.date_end 
            ? new Date(activeSess.date_end).getTime() 
            : (sessionStart > 0 ? sessionStart + 3 * 3600 * 1000 : 0);
          const nowMs = Date.now();
          const isSessionOngoing = sessionStart > 0 && nowMs >= (sessionStart - 30 * 60 * 1000) && nowMs <= (sessionEnd + 60 * 60 * 1000);

          // Fetch weather regardless for atmospheric telemetry
          const [posRes, _intRes, _lapRes, weaRes] = await Promise.all([
            isSessionOngoing 
              ? fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`, { signal: controller.signal })
              : Promise.resolve({ ok: false, json: async () => [] } as any),
            isSessionOngoing 
              ? fetch(`https://api.openf1.org/v1/intervals?session_key=${sessionKey}`, { signal: controller.signal })
              : Promise.resolve({ ok: false, json: async () => [] } as any),
            isSessionOngoing 
              ? fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`, { signal: controller.signal })
              : Promise.resolve({ ok: false, json: async () => [] } as any),
            fetch(`https://api.openf1.org/v1/weather?session_key=${sessionKey}`, { signal: controller.signal })
          ]);

          if (weaRes.ok) {
            const weaList = await weaRes.json();
            const latestWeather = weaList[weaList.length - 1];
            if (latestWeather) {
              weatherData = {
                airTemp: latestWeather.air_temperature ? String(Math.round(latestWeather.air_temperature)) : undefined,
                trackTemp: latestWeather.track_temperature ? String(Math.round(latestWeather.track_temperature)) : undefined,
                humidity: latestWeather.humidity ? `${Math.round(latestWeather.humidity)}%` : undefined,
                windSpeed: latestWeather.wind_speed ? String(Math.round(latestWeather.wind_speed * 3.6)) : undefined,
                rainfall: latestWeather.rainfall ? '1' : '0'
              };
            }
          }

          if (isSessionOngoing && posRes.ok) {
            const posList = await posRes.json();
            if (Array.isArray(posList) && posList.length > 0) {
              // Extract the latest position for each driver
              const latestByDriver = new Map<number, any>();
              posList.forEach((p: any) => {
                latestByDriver.set(p.driver_number, p);
              });

              if (latestByDriver.size > 0) {
                // Map to our LiveDriver array
                openf1Drivers = Array.from(latestByDriver.values())
                  .sort((a, b) => a.position - b.position)
                  .map((p: any) => {
                    const matchedMeta = OFFICIAL_2026_DRIVER_ROSTER.find(d => d.number === String(p.driver_number)) || {
                      driverId: `driver_${p.driver_number}`,
                      code: `CAR${p.driver_number}`,
                      name: `Driver #${p.driver_number}`,
                      number: String(p.driver_number),
                      teamId: 'unknown',
                      teamName: 'F1 Team'
                    };

                    return {
                      driverId: matchedMeta.driverId,
                      code: matchedMeta.code,
                      name: matchedMeta.name,
                      number: matchedMeta.number,
                      teamId: matchedMeta.teamId,
                      teamName: matchedMeta.teamName,
                      position: p.position,
                      gapToLeader: 0,
                      intervalToAhead: 0,
                      lastLapTime: '—',
                      bestLapTime: '—',
                      isFastestSector: false,
                      speedTrap: 0,
                      tyre: 'M' as const,
                      tyreAge: 0,
                      status: 'RACING' as const,
                      pitStops: 0
                    };
                  });
              }
            }
          }
        }
      }
      clearTimeout(timeoutId);
    } catch {
      // Upstream feed is offline or outside active broadcast
    }

    // 2. Return live telemetry payload — strictly active when an authentic live session is broadcasting
    if (!openf1Drivers || openf1Drivers.length === 0) {
      const standbyPayload = {
        status: 'STANDBY',
        isLive: false,
        circuitId: circuit,
        source: 'STANDBY',
        message: 'No live session currently active on track. Live telemetry streams strictly during official Grand Prix track action.',
        updatedAt: new Date().toISOString(),
        flagStatus: 'GREEN',
        weather: weatherData || null,
        drivers: []
      };

      telemetryCache[circuit] = {
        data: standbyPayload,
        status: 200,
        timestamp: Date.now()
      };

      return NextResponse.json(standbyPayload, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Content-Type': 'application/json'
        }
      });
    }

    const livePayload = {
      status: 'LIVE',
      isLive: true,
      circuitId: circuit,
      source: 'OPENF1_LIVE_FEED',
      updatedAt: new Date().toISOString(),
      flagStatus: trackStatus,
      weather: weatherData,
      drivers: openf1Drivers
    };

    telemetryCache[circuit] = {
      data: livePayload,
      status: 200,
      timestamp: Date.now()
    };

    return NextResponse.json(livePayload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    const errorPayload = {
      status: 'ERROR',
      isLive: false,
      circuitId: 'unknown',
      source: 'ERROR',
      error: error?.message || 'Upstream live telemetry feed unavailable',
      message: 'Telemetry uplink error: unable to establish connection to upstream telemetry feed.',
      updatedAt: new Date().toISOString(),
      flagStatus: 'GREEN',
      weather: null,
      drivers: []
    };

    return NextResponse.json(errorPayload, { status: 503 });
  }
}
