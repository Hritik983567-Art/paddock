'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, ALL_F1_SEASONS } from '../utils/api';

interface Race {
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitId?: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  FirstPractice?: { date: string; time?: string };
  SecondPractice?: { date: string; time?: string };
  ThirdPractice?: { date: string; time?: string };
  Qualifying?: { date: string; time?: string };
  Sprint?: { date: string; time?: string };
}

interface RaceResult {
  position: string;
  points: string;
  Driver: {
    givenName: string;
    familyName: string;
    code?: string;
  };
  Constructor: {
    name: string;
  };
}

interface RoundData {
  raceResults?: RaceResult[];
  loading: boolean;
  error?: string;
}

export default function SchedulePage() {
  const { selectedSeason, setSelectedSeason } = useSeason();
  const seasons = ALL_F1_SEASONS;

  const [races, setRaces] = useState<Race[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [roundDataCache, setRoundDataCache] = useState<Record<number, RoundData>>({});

  // Fetch season schedule
  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      setError('');
      try {
        const res = await getJSON(`${API_BASE}/${selectedSeason}.json`) as { MRData?: { RaceTable?: { Races?: Race[] } } };
        let raceList = res?.MRData?.RaceTable?.Races || [];
        if (raceList.length === 0) {
          const localRes = await fetch(`/data/circuits/${selectedSeason}/calendar.json`);
          if (localRes.ok) {
            const localData = await localRes.json();
            raceList = (localData.races || []).map((r: any) => ({
              round: r.round,
              raceName: r.raceName,
              date: r.date,
              time: r.time,
              Circuit: {
                circuitId: r.circuitId,
                circuitName: r.circuitName,
                Location: {
                  locality: r.locality || '',
                  country: r.country || ''
                }
              }
            }));
          }
        }
        setRaces(raceList);
      } catch (e: unknown) {
        try {
          const localRes = await fetch(`/data/circuits/${selectedSeason}/calendar.json`);
          if (localRes.ok) {
            const localData = await localRes.json();
            const raceList = (localData.races || []).map((r: any) => ({
              round: r.round,
              raceName: r.raceName,
              date: r.date,
              time: r.time,
              Circuit: {
                circuitId: r.circuitId,
                circuitName: r.circuitName,
                Location: {
                  locality: r.locality || '',
                  country: r.country || ''
                }
              }
            }));
            setRaces(raceList);
            return;
          }
        } catch {}
        const err = e as Error;
        setError(err.message || 'Could not fetch Grand Prix calendar.');
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, [selectedSeason]);

  // Load results when expanding a round
  const toggleExpand = async (rnd: number) => {
    if (expandedRound === rnd) {
      setExpandedRound(null);
      return;
    }

    setExpandedRound(rnd);

    if (roundDataCache[rnd]) return;

    setRoundDataCache(prev => ({ ...prev, [rnd]: { loading: true } }));

    try {
      const res = await getJSON(`${API_BASE}/${selectedSeason}/${rnd}/results.json`) as { MRData?: { RaceTable?: { Races?: Array<{ Results: unknown[] }> } } };
      const race = res?.MRData?.RaceTable?.Races?.[0];
      const rres = (race?.Results || []) as RaceResult[];

      setRoundDataCache(prev => ({
        ...prev,
        [rnd]: { raceResults: rres, loading: false }
      }));
    } catch {
      setRoundDataCache(prev => ({
        ...prev,
        [rnd]: { loading: false, error: 'Session results unavailable' }
      }));
    }
  };

  const now = new Date();
  const filteredRaces = races.filter(r => {
    const raceDate = new Date(r.date + 'T' + (r.time || '13:00:00Z'));
    if (filterMode === 'upcoming') return raceDate >= now;
    if (filterMode === 'completed') return raceDate < now;
    return true;
  });

  return (
    <section className="min-h-screen text-slate-100 p-4 md:p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* HEADER BAR */}
        <header className="stitch-card-machined rounded-2xl p-5 sm:p-6 shadow-2xl relative z-10">
          {/* Stitch Telemetry HUD Header Strip */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-4 text-[10px] font-mono tracking-wider text-slate-400">
            <div className="flex items-center gap-2">
              <span className="stitch-live-dot" />
              <span className="text-cyan-400 font-bold uppercase tracking-wider">FIA Formula 1</span>
              <span className="text-slate-500">•</span>
              <span className="text-white font-semibold">World Championship Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="stitch-data-chip text-[9px] text-[#00FF9C] border-[#00FF9C]/30 font-bold">
                {races.length} ROUNDS TOTAL
              </span>
              <span className="stitch-data-chip text-[9px] text-cyan-400 border-cyan-500/30 hidden sm:inline-flex">
                LIVE TIMING SYNCED
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#E10600]/30 to-[#FF3366]/10 border border-[#E10600]/50 text-[#FF3366] font-mono font-black text-sm tracking-wider shadow-[0_0_16px_rgba(225,6,0,0.25)]">
                F1
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1">
                    <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
                    <span className="text-[11px] font-mono tracking-widest text-[#E10600] font-black uppercase">
                      RACE CALENDAR
                    </span>
                  </span>
                  <span className="text-slate-600 font-sans text-xs">•</span>
                  <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                    SEASON {selectedSeason}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight f1-text-gradient uppercase">
                  PADDOCK CALENDAR &amp; SCHEDULE
                </h1>
                <p className="text-xs font-sans text-slate-300 mt-0.5 leading-relaxed">
                  Official Formula 1 Grand Prix Race Dates, Session Times &amp; Classification Results
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Season Selector */}
              <div className="flex items-center gap-2 bg-[#090D14] border border-white/10 px-3 py-1.5 rounded-xl shadow-inner">
                <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase">SEASON:</label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="bg-transparent text-white font-mono font-black text-xs rounded-lg focus:outline-none cursor-pointer"
                >
                  {seasons.map(s => (
                    <option key={s} value={s} className="bg-[#0D121F] text-white">{s} Season</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* FILTER BAR */}
        <div className="stitch-card-machined rounded-xl p-3 shadow-xl relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-[#090D14] p-1 border border-white/10 rounded-xl shadow-inner">
            {(['all', 'upcoming', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterMode(f)}
                className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-all uppercase duration-200 ${
                  filterMode === f
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_14px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'ALL RACES 🏁' : f === 'upcoming' ? 'UPCOMING ⏳' : 'COMPLETED ✅'}
              </button>
            ))}
          </div>

          <span className="stitch-data-chip text-xs text-slate-300 font-bold">
            SHOWING {filteredRaces.length} OF {races.length} ROUNDS
          </span>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="stitch-card-machined rounded-2xl p-12 text-center shadow-2xl font-mono">
            <span className="w-9 h-9 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin inline-block mb-3 shadow-[0_0_16px_rgba(0,240,255,0.3)]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2">
              <span className="stitch-live-dot" />
              <span>SYNCING FIA GRAND PRIX CALENDAR…</span>
            </h2>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="stitch-card-machined border-[#FF3366]/40 rounded-2xl p-4 text-[#FF3366] text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(255,51,102,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#FF3366] animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        {/* RACE CARDS LIST */}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredRaces.map((r) => {
              const rnd = parseInt(r.round);
              const isPast = new Date(r.date + 'T' + (r.time || '13:00:00Z')) < now;
              const isExpanded = expandedRound === rnd;
              const cache = roundDataCache[rnd];

              return (
                <div
                  key={r.round}
                  className={`stitch-card-machined rounded-2xl p-4 sm:p-5 shadow-xl relative z-10 transition-all duration-200 ${
                    isExpanded ? 'border-cyan-400/50 shadow-[0_0_24px_rgba(0,240,255,0.15)]' : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <span className="w-10 h-10 rounded-xl bg-[#090D14] border border-white/10 flex items-center justify-center font-mono font-black text-cyan-300 text-xs shadow-inner flex-shrink-0">
                        R{r.round}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-white tracking-tight">
                            {r.raceName}
                          </h3>
                          {r.Sprint && (
                            <span className="stitch-data-chip text-[9px] text-amber-400 border-amber-500/40 font-bold">
                              ⚡ SPRINT WEEKEND
                            </span>
                          )}
                          <span className={`stitch-data-chip text-[9px] font-bold ${
                            isPast 
                              ? 'text-slate-300 border-white/10 bg-white/5' 
                              : 'text-[#00FF9C] border-[#00FF9C]/40 bg-[#00FF9C]/10 shadow-[0_0_8px_rgba(0,255,156,0.15)]'
                          }`}>
                            {isPast ? 'COMPLETED' : '● UPCOMING'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                          {r.Circuit.circuitName} &bull; {r.Circuit.Location.locality}, {r.Circuit.Location.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#00F0FF] block">{r.date}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{r.time ? `${r.time.slice(0, 5)} UTC` : 'TBD'}</span>
                      </div>

                      <button
                        onClick={() => toggleExpand(rnd)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all duration-200 border ${
                          isExpanded
                            ? 'bg-[#00F0FF] text-black border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                            : 'bg-[#131A26] hover:bg-[#1A2333] border-white/10 hover:border-cyan-400/50 text-slate-200 hover:text-white'
                        }`}
                      >
                        {isExpanded ? 'CLOSE ▲' : 'RESULTS / SESSIONS ▼'}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      {/* Session Times Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <div className="bg-[#090D14] p-3 rounded-xl border border-white/10 shadow-inner">
                          <span className="text-[9px] font-mono text-cyan-400 block font-bold">FP1</span>
                          <span className="font-mono font-bold text-white text-xs">{r.FirstPractice?.date || 'N/A'}</span>
                        </div>
                        <div className="bg-[#090D14] p-3 rounded-xl border border-white/10 shadow-inner">
                          <span className="text-[9px] font-mono text-cyan-400 block font-bold">FP2</span>
                          <span className="font-mono font-bold text-white text-xs">{r.SecondPractice?.date || 'N/A'}</span>
                        </div>
                        <div className="bg-[#090D14] p-3 rounded-xl border border-white/10 shadow-inner">
                          <span className="text-[9px] font-mono text-cyan-400 block font-bold">{r.Sprint ? 'SPRINT QUALI' : 'FP3'}</span>
                          <span className="font-mono font-bold text-white text-xs">{r.Sprint ? r.SecondPractice?.date : r.ThirdPractice?.date || 'N/A'}</span>
                        </div>
                        <div className="bg-[#090D14] p-3 rounded-xl border border-white/10 shadow-inner">
                          <span className="text-[9px] font-mono text-amber-400 block font-bold">QUALIFYING</span>
                          <span className="font-mono font-bold text-white text-xs">{r.Qualifying?.date || r.date}</span>
                        </div>
                        <div className="bg-[#090D14] p-3 rounded-xl border border-white/10 shadow-inner">
                          <span className="text-[9px] font-mono text-[#00FF9C] block font-bold">GRAND PRIX</span>
                          <span className="font-mono font-bold text-white text-xs">{r.date}</span>
                        </div>
                      </div>

                      {/* Top Race Results Classification if completed */}
                      {isPast && (
                        <div className="bg-[#090D14] p-3.5 rounded-xl border border-white/10 shadow-inner">
                          <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-wider block mb-2 flex items-center gap-2">
                            <span className="stitch-live-dot" />
                            <span>TOP 3 RACE CLASSIFICATION (OFFICIAL FIA PODIUM)</span>
                          </span>
                          {cache?.loading ? (
                            <p className="text-slate-400 text-xs font-mono">Loading official results…</p>
                          ) : cache?.raceResults && cache.raceResults.length >= 3 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                              {cache.raceResults.slice(0, 3).map((res, i) => {
                                const posColor = i === 0 ? 'text-[#00FF9C] border-[#00FF9C]/30 bg-[#00FF9C]/10' : i === 1 ? 'text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]/10' : 'text-[#FFB800] border-[#FFB800]/30 bg-[#FFB800]/10';
                                return (
                                  <div key={res.position} className={`p-2.5 rounded-xl border flex justify-between items-center font-bold ${posColor}`}>
                                    <span>P{res.position}: {res.Driver.givenName} {res.Driver.familyName}</span>
                                    <span className="text-slate-300 text-[10px] uppercase font-semibold">{res.Constructor.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-xs font-sans">Full classification available in Paddock Replay workstation.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
