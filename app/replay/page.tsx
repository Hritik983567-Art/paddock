'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, pauseMs, API_BASE, getTeamColor, parseLapTime } from '../utils/api';

interface RoundItem {
  round: string;
  raceName: string;
}

interface DriverMeta {
  code: string;
  name: string;
  team: string;
}

interface RaceReplayData {
  mode: 'race';
  labels: number[];
  series: Record<string, (number | null)[]>;
  driverMeta: Record<string, DriverMeta>;
}

interface QualiRow {
  driverId: string;
  time: number;
}

interface QualiFrame {
  label: string;
  rows: QualiRow[];
}

interface QualiReplayData {
  mode: 'quali';
  frames: QualiFrame[];
  driverMeta: Record<string, Omit<DriverMeta, 'name'>>;
}

type ReplayData = RaceReplayData | QualiReplayData;

export default function ReplayPage() {
  const { selectedSeason } = useSeason();

  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [mode, setMode] = useState<'race' | 'quali'>('race');
  
  const [loadingRounds, setLoadingRounds] = useState(true);
  const [roundsError, setRoundsError] = useState('');

  const [loadingSession, setLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [replayData, setReplayData] = useState<ReplayData | null>(null);

  // Playback states
  const [frameIdx, setFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1600); // Default to Slow (1600ms) for better readability
  const [hoveredDriverId, setHoveredDriverId] = useState<string | null>(null);
  
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch completed rounds for season
  useEffect(() => {
    async function loadRounds() {
      setLoadingRounds(true);
      setRoundsError('');
      setReplayData(null);
      setSelectedRound('');
      setIsPlaying(false);
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
        setRoundsError(e.message || 'Couldn\'t load session rounds.');
      } finally {
        setLoadingRounds(false);
      }
    }

    loadRounds();
  }, [selectedSeason]);

  // Clean interval on unmount or mode change
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  const stopPlayback = () => {
    setIsPlaying(false);
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  };

  const fetchAllLaps = async (season: string, round: string) => {
    const pageSize = 100;
    let offset = 0, total = Infinity, allLaps: any[] = [];
    let first = true;
    while (offset < total) {
      if (!first) await pauseMs(350);
      first = false;
      const data = await getJSON(`${API_BASE}/${season}/${round}/laps.json?limit=${pageSize}&offset=${offset}`);
      total = parseInt(data.MRData.total) || 0;
      const race = data.MRData.RaceTable.Races[0];
      const laps = race ? race.Laps : [];
      if (!laps || laps.length === 0) break;
      allLaps = allLaps.concat(laps);
      const timingsCount = laps.reduce((s: number, l: any) => s + l.Timings.length, 0);
      if (timingsCount === 0) break;
      offset += timingsCount;
    }
    const map: Record<string, any> = {};
    allLaps.forEach(l => {
      if (!map[l.number]) map[l.number] = { number: l.number, Timings: [] };
      map[l.number].Timings = map[l.number].Timings.concat(l.Timings);
    });
    return Object.values(map).sort((a, b) => parseInt(a.number) - parseInt(b.number));
  };

  const loadSession = async () => {
    stopPlayback();
    setSessionError('');
    setReplayData(null);

    if (!selectedRound) {
      setSessionError('No round selected.');
      return;
    }

    setLoadingSession(true);

    try {
      if (mode === 'race') {
        const [resultsData, laps] = await Promise.all([
          getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/results.json`),
          fetchAllLaps(selectedSeason, selectedRound)
        ]);

        const results = resultsData.MRData.RaceTable.Races[0]?.Results || [];
        if (results.length === 0) {
          throw new Error('No race results on record.');
        }

        if (laps.length === 0) {
          throw new Error('No lap-by-lap telemetry on record for this round.');
        }

        const driverMeta: Record<string, DriverMeta> = {};
        results.forEach((r: any) => {
          driverMeta[r.Driver.driverId] = {
            code: r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase(),
            name: `${r.Driver.givenName} ${r.Driver.familyName}`,
            team: r.Constructor.constructorId
          };
        });

        const labels = laps.map(l => parseInt(l.number));
        const series: Record<string, (number | null)[]> = {};

        laps.forEach((lap, i) => {
          lap.Timings.forEach((t: any) => {
            if (!series[t.driverId]) {
              series[t.driverId] = new Array(labels.length).fill(null);
            }
            series[t.driverId][i] = parseInt(t.position);
          });
        });

        setReplayData({ mode: 'race', labels, series, driverMeta });
        setFrameIdx(0);
      } else {
        const data = await getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/qualifying.json`);
        const qres = data.MRData.RaceTable.Races[0]?.QualifyingResults || [];
        if (qres.length === 0) {
          throw new Error('No qualifying session telemetry on record.');
        }

        const driverMeta: Record<string, Omit<DriverMeta, 'name'>> = {};
        qres.forEach((q: any) => {
          driverMeta[q.Driver.driverId] = {
            code: q.Driver.code || q.Driver.familyName.slice(0, 3).toUpperCase(),
            team: q.Constructor.constructorId
          };
        });

        const stages = ['Q1', 'Q2', 'Q3'];
        const frames: QualiFrame[] = stages.map(stage => {
          const rows = qres.map((q: any) => {
            const t = parseLapTime(q[stage]);
            return t != null ? { driverId: q.Driver.driverId, time: t } : null;
          }).filter(Boolean) as QualiRow[];
          
          rows.sort((a, b) => a.time - b.time);
          return { label: stage, rows };
        }).filter(f => f.rows.length > 0);

        if (frames.length === 0) {
          throw new Error('No qualifying timed laps available.');
        }

        setReplayData({ mode: 'quali', frames, driverMeta });
        setFrameIdx(0);
      }
    } catch (e: any) {
      setSessionError(e.message || 'Couldn\'t load the replay session.');
    } finally {
      setLoadingSession(false);
    }
  };

  const stepPrev = () => {
    stopPlayback();
    setFrameIdx(prev => Math.max(0, prev - 1));
  };

  const stepNext = () => {
    if (!replayData) return;
    stopPlayback();
    const total = replayData.mode === 'race' ? replayData.labels.length : replayData.frames.length;
    setFrameIdx(prev => Math.min(total - 1, prev + 1));
  };

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    if (!replayData) return;
    setIsPlaying(true);

    const total = replayData.mode === 'race' ? replayData.labels.length : replayData.frames.length;

    playIntervalRef.current = setInterval(() => {
      setFrameIdx(prev => {
        const next = prev + 1;
        if (next >= total) {
          stopPlayback();
          return prev;
        }
        return next;
      });
    }, speed);
  };

  // Re-initialize interval when speed changes while playing
  useEffect(() => {
    if (isPlaying && replayData) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      
      const total = replayData.mode === 'race' ? replayData.labels.length : replayData.frames.length;
      playIntervalRef.current = setInterval(() => {
        setFrameIdx(prev => {
          const next = prev + 1;
          if (next >= total) {
            stopPlayback();
            return prev;
          }
          return next;
        });
      }, speed);
    }
  }, [speed, isPlaying, replayData]);

  // Render SVG telemetry path map
  const renderRaceSVG = () => {
    if (!replayData || replayData.mode !== 'race') return null;
    const { labels, series, driverMeta } = replayData;

    const allVals = Object.values(series).flat().filter((v): v is number => v !== null);
    const maxPos = Math.max(...allVals, 1);
    
    const w = 700;
    const h = 320;
    const padL = 36;
    const padR = 24;
    const padT = 16;
    const padB = 26;
    
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const nLaps = labels.length;

    const xFor = (i: number) => padL + (nLaps <= 1 ? 0 : (i / (nLaps - 1)) * plotW);
    const yFor = (pos: number) => padT + ((pos - 1) / ((maxPos - 1) || 1)) * plotH;

    // Draw horizontal grid lines
    const gridLines = [];
    const step = Math.max(1, Math.round(maxPos / 8));
    for (let p = 1; p <= maxPos; p += step) {
      const y = yFor(p);
      gridLines.push(
        <g key={`grid-${p}`}>
          <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#2A2F3A" strokeWidth="1" />
          <text 
            x={padL - 8} 
            y={y + 3} 
            fontSize="9" 
            fill="#8791A3" 
            fontFamily="var(--font-mono)" 
            textAnchor="end"
          >
            P{p}
          </text>
        </g>
      );
    }

    // Draw lines for each driver
    const lines = Object.entries(series).map(([id, arr]) => {
      const meta = driverMeta[id];
      const color = getTeamColor(meta?.team || '');
      const pts = [];

      for (let i = 0; i <= frameIdx; i++) {
        const val = arr[i];
        if (val !== null && val !== undefined) {
          pts.push({ x: xFor(i), y: yFor(val), pos: val });
        }
      }

      if (pts.length === 0) return null;

      const pointsString = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      const lastPoint = pts[pts.length - 1];

      const isHighlighted = hoveredDriverId === id;
      const isAnyHovered = hoveredDriverId !== null;
      const opacity = isAnyHovered ? (isHighlighted ? 1.0 : 0.12) : 0.85;
      const strokeWidth = isHighlighted ? 4.5 : 2;

      return (
        <g 
          key={id}
          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={() => setHoveredDriverId(id)}
          onMouseLeave={() => setHoveredDriverId(null)}
        >
          <polyline points={pointsString} fill="none" stroke={color} strokeWidth={strokeWidth} opacity={opacity} />
          <circle cx={lastPoint.x} cy={lastPoint.y} r={isHighlighted ? 5.5 : 3.5} fill={color} opacity={opacity} />
          <text 
            x={lastPoint.x + 6} 
            y={lastPoint.y + 3} 
            fontSize={isHighlighted ? 11 : 9} 
            fill={color} 
            fontFamily="var(--font-mono)" 
            fontWeight="bold"
            opacity={opacity}
          >
            {meta?.code || id.slice(0, 3).toUpperCase()}
          </text>
        </g>
      );
    });

    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%">
        {gridLines}
        {lines}
        <text x={padL} y={h - 6} fontSize="9" fill="#8791A3" fontFamily="var(--font-mono)">Lap 1</text>
        <text x={w - padR} y={h - 6} fontSize="9" fill="#8791A3" fontFamily="var(--font-mono)" textAnchor="end">Lap {labels[labels.length - 1]}</text>
      </svg>
    );
  };

  const getStandingsList = () => {
    if (!replayData) return [];
    if (replayData.mode === 'race') {
      const { series, driverMeta } = replayData;
      return Object.entries(series)
        .map(([id, arr]) => ({ id, pos: arr[frameIdx] }))
        .filter((r): r is { id: string; pos: number } => r.pos !== null)
        .sort((a, b) => a.pos - b.pos)
        .map(r => {
          const meta = driverMeta[r.id];
          return {
            id: r.id,
            code: meta?.code || r.id,
            pos: r.pos.toString(),
            color: getTeamColor(meta?.team || ''),
            time: ''
          };
        });
    } else {
      const { frames, driverMeta } = replayData;
      const frame = frames[frameIdx];
      return (frame?.rows || []).map((r, i) => {
        const meta = driverMeta[r.driverId];
        return {
          id: r.driverId,
          code: meta?.code || r.driverId,
          pos: (i + 1).toString(),
          color: getTeamColor(meta?.team || ''),
          time: `${r.time.toFixed(3)}s`
        };
      });
    }
  };

  const currentStandings = getStandingsList();

  return (
    <section className="view" id="view-replay">
      <div className="panel">
        <h2>Session replay</h2>
        <p className="sub">
          No public API exposes live in-session telemetry — that belongs to F1&apos;s own broadcast feed. What&apos;s here is real: race mode replays actual lap-by-lap position data as a position chart; qualifying mode replays each driver&apos;s real best time per stage as a bar chart. Playback defaults to slow — use the speed control to pick up the pace once you&apos;ve got your bearings.
        </p>

        {loadingRounds ? (
          <div className="loading">Loading rounds…</div>
        ) : roundsError ? (
          <div className="err">{roundsError}</div>
        ) : (
          <div className="replay-controls">
            <div className="mode-toggle">
              <button 
                className={mode === 'race' ? 'active' : ''} 
                onClick={() => setMode('race')}
              >
                Race
              </button>
              <button 
                className={mode === 'quali' ? 'active' : ''} 
                onClick={() => setMode('quali')}
              >
                Qualifying
              </button>
            </div>
            <select 
              value={selectedRound} 
              onChange={(e) => setSelectedRound(e.target.value)}
            >
              <option value="">Select a round…</option>
              {rounds.map(r => (
                <option key={r.round} value={r.round}>R{r.round} — {r.raceName}</option>
              ))}
            </select>
            <button className="btn primary" onClick={loadSession} disabled={loadingSession}>
              {loadingSession ? 'Loading…' : 'Load'}
            </button>
          </div>
        )}

        {loadingSession && (
          <div id="replayStatus" className="loading">Pulling telemetry data…</div>
        )}

        {sessionError && (
          <div className="err" style={{ marginTop: '16px' }}>{sessionError}</div>
        )}

        {replayData && (
          <div id="replayView" style={{ marginTop: '20px' }}>
            <div className="replay-layout">
              <div className="chart-wrap">
                {replayData.mode === 'race' ? (
                  <div id="replayChart">
                    {renderRaceSVG()}
                  </div>
                ) : (
                  <div id="replayChart" className="quali-bars">
                    {(() => {
                      const f = replayData.frames[frameIdx];
                      if (!f || f.rows.length === 0) return null;
                      const best = f.rows[0].time;
                      return f.rows.map(r => {
                        const meta = replayData.driverMeta[r.driverId];
                        const color = getTeamColor(meta?.team || '');
                        const pct = Math.max(6, (best / r.time) * 100);
                        return (
                          <div key={r.driverId} className="qb-row">
                            <span className="qb-name">{meta?.code || r.driverId}</span>
                            <div className="qb-track">
                              <div className="qb-fill" style={{ width: `${pct}%`, background: color }}></div>
                            </div>
                            <span className="qb-time">{r.time.toFixed(3)}s</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              <div className="replay-board">
                <div style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--dim)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>
                  HOVER DRIVER TO HIGHLIGHT TRACK
                </div>
                {currentStandings.map((s, index) => {
                  const isHighlighted = hoveredDriverId === s.id;
                  return (
                    <div 
                      key={index} 
                      className="rb-row"
                      style={{ 
                        background: isHighlighted ? 'rgba(52, 228, 200, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={() => setHoveredDriverId(s.id)}
                      onMouseLeave={() => setHoveredDriverId(null)}
                    >
                      <span>{s.pos}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="rb-chip" style={{ background: s.color }}></span>
                        {s.code}
                      </span>
                      <span>{s.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="playback-row">
              <button className="btn" onClick={stepPrev} disabled={frameIdx === 0}>
                ⏮ Step Back
              </button>
              <button className="btn" onClick={togglePlay}>
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button 
                className="btn" 
                onClick={stepNext} 
                disabled={
                  replayData.mode === 'race' 
                    ? frameIdx === replayData.labels.length - 1 
                    : frameIdx === replayData.frames.length - 1
                }
              >
                ⏭ Step Fwd
              </button>
              <input 
                type="range" 
                min="0" 
                max={replayData.mode === 'race' ? replayData.labels.length - 1 : replayData.frames.length - 1} 
                value={frameIdx}
                onChange={(e) => {
                  stopPlayback();
                  setFrameIdx(parseInt(e.target.value));
                }}
              />
              <span className="lap-counter">
                {replayData.mode === 'race' 
                  ? `Lap ${replayData.labels[frameIdx]} / ${replayData.labels[replayData.labels.length - 1]}`
                  : replayData.frames[frameIdx]?.label || '—'
                }
              </span>
              <select 
                value={speed} 
                onChange={(e) => setSpeed(parseInt(e.target.value))}
              >
                <option value={3200}>Super Slow (3.2s)</option>
                <option value={1600}>Slow (1.6s)</option>
                <option value={800}>Normal (0.8s)</option>
                <option value={350}>Fast (0.3s)</option>
              </select>
            </div>

            <div className="footnote" id="replayFootnote">
              {replayData.mode === 'race'
                ? `Real lap-by-lap classification, ${replayData.labels.length} laps.`
                : `Each frame represents a qualifying stage (Q1→Q2→Q3) using each driver's real best time for that stage.`
              }
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
