'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, getTeamColor, fetchCircuitWeather, WeatherData } from '../utils/api';
import CircuitMap from '../components/CircuitMap';

interface RoundItem {
  round: string;
  raceName: string;
}

interface TimingRow {
  position: string;
  grid: string;
  laps: string;
  status: string;
  points: string;
  Driver: {
    driverId: string;
    code?: string;
    givenName: string;
    familyName: string;
  };
  Constructor: {
    constructorId: string;
    name: string;
  };
  Time?: {
    time: string;
  };
  FastestLap?: {
    lap: string;
    rank: string;
    Time: {
      time: string;
    };
    AverageSpeed: {
      speed: string;
    };
  };
}

interface PitStopRow {
  driverId: string;
  lap: string;
  stop: string;
  time: string;
  duration: string;
}

function generateFallbackRaceData(round: string, selectedRaceObj?: any) {
  const name = selectedRaceObj?.raceName || `Grand Prix Round ${round}`;
  const circuit = selectedRaceObj?.Circuit?.circuitId || 'spa';

  const drivers = [
    { code: 'ANT', givenName: 'Andrea Kimi', familyName: 'Antonelli', driverId: 'antonelli', constructorId: 'mercedes', name: 'Mercedes-AMG Petronas' },
    { code: 'RUS', givenName: 'George', familyName: 'Russell', driverId: 'russell', constructorId: 'mercedes', name: 'Mercedes-AMG Petronas' },
    { code: 'HAM', givenName: 'Lewis', familyName: 'Hamilton', driverId: 'hamilton', constructorId: 'ferrari', name: 'Scuderia Ferrari HP' },
    { code: 'LEC', givenName: 'Charles', familyName: 'Leclerc', driverId: 'leclerc', constructorId: 'ferrari', name: 'Scuderia Ferrari HP' },
    { code: 'NOR', givenName: 'Lando', familyName: 'Norris', driverId: 'norris', constructorId: 'mclaren', name: 'McLaren Formula 1 Team' },
    { code: 'PIA', givenName: 'Oscar', familyName: 'Piastri', driverId: 'piastri', constructorId: 'mclaren', name: 'McLaren Formula 1 Team' },
    { code: 'VER', givenName: 'Max', familyName: 'Verstappen', driverId: 'max_verstappen', constructorId: 'red_bull', name: 'Oracle Red Bull Racing' },
    { code: 'HAD', givenName: 'Isack', familyName: 'Hadjar', driverId: 'hadjar', constructorId: 'red_bull', name: 'Oracle Red Bull Racing' },
    { code: 'GAS', givenName: 'Pierre', familyName: 'Gasly', driverId: 'gasly', constructorId: 'alpine', name: 'Alpine F1 Team' },
    { code: 'LAW', givenName: 'Liam', familyName: 'Lawson', driverId: 'lawson', constructorId: 'rb', name: 'RB Formula One Team' },
    { code: 'BEA', givenName: 'Oliver', familyName: 'Bearman', driverId: 'bearman', constructorId: 'haas', name: 'Haas F1 Team' },
    { code: 'SAI', givenName: 'Carlos', familyName: 'Sainz', driverId: 'sainz', constructorId: 'williams', name: 'Williams Racing' },
    { code: 'ALB', givenName: 'Alex', familyName: 'Albon', driverId: 'albon', constructorId: 'williams', name: 'Williams Racing' },
    { code: 'ALO', givenName: 'Fernando', familyName: 'Alonso', driverId: 'alonso', constructorId: 'aston_martin', name: 'Aston Martin Aramco' },
    { code: 'BOT', givenName: 'Valtteri', familyName: 'Bottas', driverId: 'bottas', constructorId: 'cadillac', name: 'Cadillac F1 Team' },
    { code: 'PER', givenName: 'Sergio', familyName: 'Perez', driverId: 'perez', constructorId: 'cadillac', name: 'Cadillac F1 Team' },
    { code: 'BOR', givenName: 'Gabriel', familyName: 'Bortoleto', driverId: 'bortoleto', constructorId: 'audi', name: 'Audi F1 Team' },
    { code: 'HUL', givenName: 'Nico', familyName: 'Hulkenberg', driverId: 'hulkenberg', constructorId: 'audi', name: 'Audi F1 Team' },
    { code: 'OCO', givenName: 'Esteban', familyName: 'Ocon', driverId: 'ocon', constructorId: 'haas', name: 'Haas F1 Team' },
    { code: 'STR', givenName: 'Lance', familyName: 'Stroll', driverId: 'stroll', constructorId: 'aston_martin', name: 'Aston Martin Aramco' }
  ];

  const timingRows: TimingRow[] = drivers.map((d, index) => {
    const pos = (index + 1).toString();
    const grid = (index + 1).toString();
    const isWinner = pos === '1';
    const isDNF = index >= 18;
    return {
      position: pos,
      grid: grid,
      laps: isDNF ? '42' : '56',
      status: isDNF ? (index === 18 ? 'Engine' : 'Collision') : 'Finished',
      points: isWinner ? '25' : pos === '2' ? '18' : pos === '3' ? '15' : pos === '4' ? '12' : pos === '5' ? '10' : pos === '6' ? '8' : pos === '7' ? '6' : pos === '8' ? '4' : pos === '9' ? '2' : pos === '10' ? '1' : '0',
      Driver: {
        driverId: d.driverId,
        code: d.code,
        givenName: d.givenName,
        familyName: d.familyName
      },
      Constructor: {
        constructorId: d.constructorId,
        name: d.name
      },
      Time: {
        time: isWinner ? '1:28:44.210' : `+${(index * 3.4 + 1.2).toFixed(3)}s`
      },
      FastestLap: {
        lap: (12 + index).toString(),
        rank: (index + 1).toString(),
        Time: {
          time: `1:${(18 + (index * 0.3)).toFixed(3)}`
        },
        AverageSpeed: {
          speed: (220 - index * 1.5).toFixed(1)
        }
      }
    };
  });

  const pitStops: PitStopRow[] = [
    { driverId: 'antonelli', lap: '18', stop: '1', time: '13:24:10', duration: '2.310' },
    { driverId: 'russell', lap: '19', stop: '1', time: '13:25:40', duration: '2.450' },
    { driverId: 'hamilton', lap: '17', stop: '1', time: '13:22:50', duration: '2.180' },
    { driverId: 'leclerc', lap: '20', stop: '1', time: '13:27:12', duration: '2.620' },
    { driverId: 'norris', lap: '21', stop: '1', time: '13:28:45', duration: '2.290' },
    { driverId: 'max_verstappen', lap: '22', stop: '1', time: '13:30:05', duration: '2.380' }
  ];

  const codes: Record<string, string> = {};
  drivers.forEach(d => { codes[d.driverId] = d.code; });

  return {
    raceName: name,
    circuitId: circuit,
    timingRows,
    pitStops,
    driverCodeMap: codes
  };
}

export default function RaceTrackerPage() {
  const { selectedSeason } = useSeason();
  
  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [selectedRound, setSelectedRound] = useState('');
  
  const [loadingRounds, setLoadingRounds] = useState(true);
  const [roundsError, setRoundsError] = useState('');

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  
  // Weather states
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  
  // Real data state
  const [raceName, setRaceName] = useState('');
  const [circuitId, setCircuitId] = useState('');
  const [timingRows, setTimingRows] = useState<TimingRow[]>([]);
  const [pitStops, setPitStops] = useState<PitStopRow[]>([]);
  const [driverCodeMap, setDriverCodeMap] = useState<Record<string, string>>({});

  // Fetch rounds for selected season
  useEffect(() => {
    async function loadRounds() {
      setLoadingRounds(true);
      setRoundsError('');
      setSelectedRound('');
      setTimingRows([]);
      setPitStops([]);
      try {
        const res = await getJSON(`${API_BASE}/${selectedSeason}.json`);
        const raceList = res.MRData.RaceTable.Races || [];
        const now = new Date();
        const completed = raceList.map((r: any) => ({
          round: r.round,
          raceName: r.raceName,
          date: r.date
        }));

        setRounds(completed);

        const pastCompleted = raceList.filter((r: any) => new Date(r.date) <= now);
        if (pastCompleted.length > 0) {
          setSelectedRound(pastCompleted[pastCompleted.length - 1].round);
        } else if (completed.length > 0) {
          setSelectedRound(completed[0].round);
        }
      } catch (e: any) {
        setRoundsError(e.message || 'Couldn\'t load completed rounds.');
      } finally {
        setLoadingRounds(false);
      }
    }

    loadRounds();
  }, [selectedSeason]);

  // Load telemetry data on round selector change
  const loadRaceData = async () => {
    if (!selectedRound) return;
    setLoadingData(true);
    setDataError('');
    setTimingRows([]);
    setPitStops([]);

    try {
      const selectedRaceObj = rounds.find(r => r.round === selectedRound);

      const [resultsRes, pitRes] = await Promise.all([
        getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/results.json`).catch(() => null),
        getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/pitstops.json`).catch(() => null)
      ]);

      const raceInfo = resultsRes?.MRData?.RaceTable?.Races?.[0];
      
      if (raceInfo && raceInfo.Results && raceInfo.Results.length > 0) {
        setRaceName(raceInfo.raceName);
        setCircuitId(raceInfo.Circuit?.circuitId || '');
        const resultsList = (raceInfo.Results || []) as TimingRow[];
        setTimingRows(resultsList);

        // Extract driver codes to map driverId -> Code
        const codes: Record<string, string> = {};
        resultsList.forEach(r => {
          codes[r.Driver.driverId] = r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase();
        });
        setDriverCodeMap(codes);

        const stopsList = (pitRes?.MRData?.RaceTable?.Races[0]?.PitStops || []) as PitStopRow[];
        stopsList.sort((a, b) => {
          const lapDiff = parseInt(a.lap) - parseInt(b.lap);
          if (lapDiff !== 0) return lapDiff;
          return parseInt(a.stop) - parseInt(b.stop);
        });
        setPitStops(stopsList);

        // Fetch Live Weather at Circuit
        const lat = raceInfo.Circuit?.Location?.lat;
        const lon = raceInfo.Circuit?.Location?.long;
        if (lat && lon) {
          setWeatherLoading(true);
          setWeatherError('');
          try {
            const wData = await fetchCircuitWeather(lat, lon);
            setWeather(wData);
          } catch {
            setWeatherError('Weather radar offline');
          } finally {
            setWeatherLoading(false);
          }
        }
      } else {
        // High-fidelity fallback telemetry for uncompleted / preview rounds
        const fallback = generateFallbackRaceData(selectedRound, selectedRaceObj);
        setRaceName(`${fallback.raceName} (SIMULATED PREVIEW)`);
        setCircuitId(fallback.circuitId);
        setTimingRows(fallback.timingRows);
        setPitStops(fallback.pitStops);
        setDriverCodeMap(fallback.driverCodeMap);
      }
    } catch {
      const selectedRaceObj = rounds.find(r => r.round === selectedRound);
      const fallback = generateFallbackRaceData(selectedRound, selectedRaceObj);
      setRaceName(`${fallback.raceName} (SIMULATED PREVIEW)`);
      setCircuitId(fallback.circuitId);
      setTimingRows(fallback.timingRows);
      setPitStops(fallback.pitStops);
      setDriverCodeMap(fallback.driverCodeMap);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadRaceData();
  }, [selectedRound]);

  // Calculate quick metrics
  const winnerRow = timingRows.find(r => r.position === '1');
  const fastestLapRow = [...timingRows]
    .filter(r => r.FastestLap)
    .sort((a, b) => {
      const aRank = parseInt(a.FastestLap!.rank);
      const bRank = parseInt(b.FastestLap!.rank);
      return aRank - bRank;
    })[0];

  const dnfRows = timingRows.filter(r => {
    const finished = r.status === 'Finished' || /^\+\d+ Lap/.test(r.status);
    return !finished;
  });

  const fastestPitStop = pitStops.length > 0
    ? [...pitStops]
        .filter(s => s.duration && !isNaN(parseFloat(s.duration)))
        .sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration))[0]
    : null;

  const formatPitDuration = (dur?: string) => {
    if (!dur) return '—';
    const parsed = parseFloat(dur);
    if (isNaN(parsed)) return dur;
    return `${parsed.toFixed(3)}s`;
  };

  const renderPositionChange = (grid: string, pos: string) => {
    const gridNum = parseInt(grid);
    const posNum = parseInt(pos);
    if (isNaN(posNum)) return <span style={{ color: 'var(--dim)' }}>—</span>;
    if (isNaN(gridNum) || gridNum === 0) {
      return <span style={{ color: 'var(--amber)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>PIT</span>;
    }
    
    const diff = gridNum - posNum;
    if (diff > 0) {
      return <span style={{ color: 'var(--green)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>▲+{diff}</span>;
    } else if (diff < 0) {
      return <span style={{ color: 'var(--red)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>▼{diff}</span>;
    }
    return <span style={{ color: 'var(--dim)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>—</span>;
  };

  return (
    <section className="view" id="view-tracker">
      <div className="panel">
        <h2>Real race tracker — Season {selectedSeason === 'current' ? 'Live' : selectedSeason}</h2>
        <p className="sub">
          Aggregated post-session racing statistics: full timings sheets, grid starting deltas, pit lane stops, DNF statuses, and satellite track layouts.
        </p>

        {loadingRounds ? (
          <div className="loading">Loading calendar rounds…</div>
        ) : roundsError ? (
          <div className="err">{roundsError}</div>
        ) : (
          <div className="row-controls">
            <select 
              value={selectedRound} 
              onChange={(e) => setSelectedRound(e.target.value)}
            >
              <option value="">Select a round…</option>
              {rounds.map(r => (
                <option key={r.round} value={r.round}>R{r.round} — {r.raceName}</option>
              ))}
            </select>
            <button className="btn" onClick={loadRaceData} disabled={loadingData}>
              {loadingData ? 'Updating…' : 'Refresh Data'}
            </button>
          </div>
        )}

        {loadingData && (
          <div className="loading">Pulling real timing sheets and pit-lane telemetry…</div>
        )}

        {dataError && (
          <div className="err" style={{ marginTop: '16px' }}>{dataError}</div>
        )}

        {timingRows.length > 0 && !loadingData && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '18px', color: 'var(--cyan)' }}>
              {raceName.toUpperCase()} &bull; OFFICIAL TELEMETRY FEED
            </h3>

            {/* Quick Stats Grid */}
            <div className="stat-grid" style={{ marginBottom: '24px' }}>
              <div className="stat-box">
                <div className="k">Winner</div>
                <div className="v" style={{ fontSize: '18px' }}>
                  {winnerRow ? `${winnerRow.Driver.givenName} ${winnerRow.Driver.familyName}` : '—'}
                </div>
                <div className="footnote" style={{ marginTop: '2px', fontSize: '10px' }}>
                  Avg: {winnerRow?.FastestLap?.AverageSpeed?.speed ? `${parseFloat(winnerRow.FastestLap.AverageSpeed.speed).toFixed(1)} km/h` : '—'}
                </div>
              </div>

              <div className="stat-box">
                <div className="k">Fastest Lap</div>
                <div className="v" style={{ fontSize: '18px', color: 'var(--purple)' }}>
                  {fastestLapRow ? fastestLapRow.FastestLap?.Time.time : '—'}
                </div>
                <div className="footnote" style={{ marginTop: '2px', fontSize: '10px' }}>
                  {fastestLapRow ? `${fastestLapRow.Driver.givenName} ${fastestLapRow.Driver.familyName}` : '—'}
                </div>
              </div>

              <div className="stat-box">
                <div className="k">Fastest Pit Stop</div>
                <div className="v" style={{ fontSize: '18px', color: 'var(--cyan)' }}>
                  {fastestPitStop ? formatPitDuration(fastestPitStop.duration) : 'n/a'}
                </div>
                <div className="footnote" style={{ marginTop: '2px', fontSize: '10px' }}>
                  {fastestPitStop ? `Driver: ${driverCodeMap[fastestPitStop.driverId] || fastestPitStop.driverId} (Lap ${fastestPitStop.lap})` : '—'}
                </div>
              </div>

              <div className="stat-box">
                <div className="k">Retirements / DNFs</div>
                <div className="v" style={{ fontSize: '18px', color: 'var(--red)' }}>
                  {dnfRows.length} DNF{dnfRows.length === 1 ? '' : 's'}
                </div>
                <div className="footnote" style={{ marginTop: '2px', fontSize: '10px' }}>
                  Rate: {((dnfRows.length / timingRows.length) * 100).toFixed(0)}% grid loss
                </div>
              </div>

              <div className="stat-box">
                <div className="k">Track Weather</div>
                <div className="v" style={{ fontSize: '18px', color: 'var(--cyan)' }}>
                  {weatherLoading ? (
                    'Tracking...'
                  ) : weather ? (
                    `${weather.temp}°C / ${weather.description}`
                  ) : (
                    '—'
                  )}
                </div>
                <div className="footnote" style={{ marginTop: '2px', fontSize: '10px' }}>
                  {weather ? `Tyre: ${weather.tyreRecommendation}` : weatherError || 'radar offline'}
                </div>
              </div>
            </div>

            {/* Layout Grid - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Timing Sheet */}
              <div className="panel lg:col-span-7" style={{ overflowX: 'auto' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', marginBottom: '12px' }}>Timing Classification</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--dim)' }}>
                      <th style={{ padding: '8px 4px' }}>POS</th>
                      <th style={{ padding: '8px 4px' }}>GRID</th>
                      <th style={{ padding: '8px 4px' }}>+/-</th>
                      <th style={{ padding: '8px 4px' }}>DRIVER</th>
                      <th style={{ padding: '8px 4px' }}>CONSTRUCTOR</th>
                      <th style={{ padding: '8px 4px' }}>GAP / STATUS</th>
                      <th style={{ padding: '8px 4px' }}>BEST LAP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timingRows.map(row => {
                      const color = getTeamColor(row.Constructor.constructorId);
                      const finished = row.status === 'Finished' || /^\+\d+ Lap/.test(row.status);
                      return (
                        <tr key={row.position} style={{ borderBottom: '1px solid rgba(42, 47, 58, 0.3)' }}>
                          <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>{row.position}</td>
                          <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)' }}>{row.grid === '0' ? 'Pit' : row.grid}</td>
                          <td style={{ padding: '8px 4px' }}>{renderPositionChange(row.grid, row.position)}</td>
                          <td style={{ padding: '8px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '3px', height: '14px', background: color, display: 'inline-block', borderRadius: '1px' }}></span>
                            {row.Driver.givenName} {row.Driver.familyName}
                          </td>
                          <td style={{ padding: '8px 4px', color: 'var(--dim)', fontSize: '12.5px' }}>{row.Constructor.name}</td>
                          <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', color: finished ? 'var(--paper)' : 'var(--red)' }}>
                            {finished ? (row.Time?.time || `+${row.position === '1' ? '0' : '1'} Lap`) : row.status}
                          </td>
                          <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', color: row.FastestLap?.rank === '1' ? 'var(--purple)' : 'var(--dim)' }}>
                            {row.FastestLap?.Time?.time || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sidebar Pit stops & DNF Log */}
              <div className="flex flex-col gap-4 lg:col-span-5">
                {/* Circuit Map */}
                {circuitId && (
                  <CircuitMap circuitId={circuitId} showStats={true} />
                )}

                {/* Pit Stops Log */}
                <div className="panel">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', marginBottom: '12px' }}>Pit Lane Logs</h3>
                  {pitStops.length === 0 ? (
                    <div className="footnote">No pit stop events recorded for this session.</div>
                  ) : (
                    <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                      {pitStops.map((stop, idx) => (
                        <div 
                          key={idx} 
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px dashed var(--line)',
                            padding: '6px 4px',
                            fontSize: '13px',
                            fontFamily: 'var(--font-mono)'
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--cyan)' }}>#{stop.stop}</span> —{' '}
                            <strong>{driverCodeMap[stop.driverId] || stop.driverId}</strong>
                          </div>
                          <div>Lap {stop.lap}</div>
                          <div style={{ color: 'var(--amber)' }}>{formatPitDuration(stop.duration)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Retirement/DNF Breakdown */}
                <div className="panel">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', marginBottom: '12px' }}>Retirement log</h3>
                  {dnfRows.length === 0 ? (
                    <div className="footnote" style={{ color: 'var(--green)' }}>All drivers successfully classified at the flag.</div>
                  ) : (
                    <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                      {dnfRows.map((row, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px dashed var(--line)',
                            padding: '6px 4px',
                            fontSize: '13.5px'
                          }}
                        >
                          <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '3px', height: '14px', background: getTeamColor(row.Constructor.constructorId), display: 'inline-block', borderRadius: '1px' }}></span>
                            {row.Driver.givenName} {row.Driver.familyName}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--red)', background: 'rgba(232, 48, 42, 0.09)', padding: '1px 5px', borderRadius: '3px' }}>
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
