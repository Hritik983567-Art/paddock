'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, getTeamColor, fetchCircuitWeather, WeatherData } from '../utils/api';

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
  const [circuitCoords, setCircuitCoords] = useState<{ lat: string; long: string } | null>(null);
  
  // Real data state
  const [raceName, setRaceName] = useState('');
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
      const [resultsRes, pitRes] = await Promise.all([
        getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/results.json`),
        getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/pitstops.json`).catch(() => null)
      ]);

      const raceInfo = resultsRes.MRData.RaceTable.Races[0];
      if (!raceInfo) {
        throw new Error('Telemetry results not found for this Grand Prix.');
      }

      setRaceName(raceInfo.raceName);
      const resultsList = (raceInfo.Results || []) as TimingRow[];
      setTimingRows(resultsList);

      // Extract driver codes to map driverId -> Code
      const codes: Record<string, string> = {};
      resultsList.forEach(r => {
        codes[r.Driver.driverId] = r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase();
      });
      setDriverCodeMap(codes);

      const stopsList = (pitRes?.MRData?.RaceTable?.Races[0]?.PitStops || []) as PitStopRow[];
      // Sort pit stops chronologically by lap and stop count
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
        setCircuitCoords({ lat, long: lon });
        setWeatherLoading(true);
        setWeatherError('');
        try {
          const wData = await fetchCircuitWeather(lat, lon);
          setWeather(wData);
        } catch (err) {
          setWeatherError('Weather radar offline');
        } finally {
          setWeatherLoading(false);
        }
      }
    } catch (e: any) {
      setDataError(e.message || 'Failed to fetch race timing telemetry.');
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
    ? [...pitStops].sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration))[0]
    : null;

  const renderPositionChange = (grid: string, pos: string) => {
    const gridNum = parseInt(grid);
    const posNum = parseInt(pos);
    if (isNaN(gridNum) || isNaN(posNum) || gridNum === 0) return <span style={{ color: 'var(--dim)' }}>—</span>;
    
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
              {raceName.toUpperCase()} // OFFICIAL TELEMETRY FEED
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
                  {fastestPitStop ? `${parseFloat(fastestPitStop.duration).toFixed(3)}s` : 'n/a'}
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

            {/* Layout Grid */}
            <div className="grid cols-2" style={{ alignItems: 'start' }}>
              
              {/* Timing Sheet */}
              <div className="panel" style={{ overflowX: 'auto' }}>
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
              <div className="flex flex-col gap-4">
                {/* Circuit Satellite Map */}
                {circuitCoords && (
                  <div className="panel">
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', marginBottom: '12px' }}>Circuit Satellite Map</h3>
                    <iframe
                      src={`https://maps.google.com/maps?q=${circuitCoords.lat},${circuitCoords.long}&t=k&z=14&output=embed`}
                      width="100%"
                      height="200"
                      style={{ border: '1px solid var(--line)', borderRadius: '6px', opacity: 0.85 }}
                      allowFullScreen
                    />
                  </div>
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
                          <div style={{ color: 'var(--amber)' }}>{parseFloat(stop.duration).toFixed(3)}s</div>
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
