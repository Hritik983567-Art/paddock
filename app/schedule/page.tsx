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
        const res = await getJSON(`${API_BASE}/${selectedSeason}.json`);
        const raceList = res.MRData.RaceTable.Races as Race[];
        setRaces(raceList);
      } catch (e: any) {
        setError(e.message || 'Could not fetch Grand Prix calendar.');
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
      const res = await getJSON(`${API_BASE}/${selectedSeason}/${rnd}/results.json`);
      const race = res?.MRData?.RaceTable?.Races?.[0];
      const rres = race?.Results || [];

      setRoundDataCache(prev => ({
        ...prev,
        [rnd]: { raceResults: rres, loading: false }
      }));
    } catch (err: any) {
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
    <section className="min-h-screen bg-[#050810] text-slate-100 p-4 md:p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* HEADER BAR */}
        <header 
          style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
          className="p-5 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-red-600/30 border-2 border-red-500 text-red-400 font-mono font-black text-sm tracking-wider shadow-lg">
              F1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wider text-white uppercase font-display">
                  PADDOCK CALENDAR & SCHEDULE
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase rounded bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md">
                  SEASON {selectedSeason}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Official Formula 1 Grand Prix Race Dates, Session Times & Results
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Season Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-black text-cyan-400 uppercase">SEASON:</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-3 py-1.5 bg-[#0D121F] border border-slate-700 text-white font-black text-xs rounded-lg focus:outline-none focus:border-cyan-500"
              >
                {seasons.map(s => (
                  <option key={s} value={s}>{s} Season</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* FILTER BAR */}
        <div 
          style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
          className="p-3 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 bg-[#0D121F] p-1 border border-slate-700 rounded-lg">
            {(['all', 'upcoming', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterMode(f)}
                className={`px-3 py-1 text-xs font-black rounded transition-all uppercase ${
                  filterMode === f
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {f === 'all' ? 'ALL RACES 🏁' : f === 'upcoming' ? 'UPCOMING ⏳' : 'COMPLETED ✅'}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-bold">
            SHOWING {filteredRaces.length} OF {races.length} ROUNDS
          </span>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div 
            style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
            className="p-12 text-center border-2 border-slate-700/80 rounded-xl shadow-2xl font-mono"
          >
            <span className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
            <h2 className="text-base font-black text-white uppercase tracking-wider">
              LOADING GRAND PRIX CALENDAR…
            </h2>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 bg-red-950/80 border-2 border-red-500 rounded-xl text-red-200 text-xs font-mono flex items-center gap-2">
            <span>⚠️</span>
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
                  style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
                  className="border-2 border-slate-700/80 rounded-xl p-4 shadow-2xl relative z-10 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-700 flex items-center justify-center font-black text-cyan-300 text-xs shadow-md">
                        R{r.round}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-white uppercase font-display">
                            {r.raceName}
                          </h3>
                          {r.Sprint && (
                            <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-amber-950 text-amber-400 border border-amber-700">
                              SPRINT WEEKEND
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded border ${
                            isPast ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          }`}>
                            {isPast ? 'COMPLETED' : 'UPCOMING'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {r.Circuit.circuitName} &bull; {r.Circuit.Location.locality}, {r.Circuit.Location.country}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-black text-cyan-400 block">{r.date}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{r.time ? `${r.time.slice(0, 5)} UTC` : 'TBD'}</span>
                      </div>

                      <button
                        onClick={() => toggleExpand(rnd)}
                        className="px-3 py-1.5 bg-[#0D121F] hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-black text-white transition-colors"
                      >
                        {isExpanded ? 'CLOSE ▲' : 'RESULTS / SESSIONS ▼'}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                      {/* Session Times Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <div className="bg-[#0D121F] p-2.5 rounded border border-slate-800">
                          <span className="text-[10px] text-cyan-400 block font-bold">FP1</span>
                          <span className="font-black text-white">{r.FirstPractice?.date || 'N/A'}</span>
                        </div>
                        <div className="bg-[#0D121F] p-2.5 rounded border border-slate-800">
                          <span className="text-[10px] text-cyan-400 block font-bold">FP2</span>
                          <span className="font-black text-white">{r.SecondPractice?.date || 'N/A'}</span>
                        </div>
                        <div className="bg-[#0D121F] p-2.5 rounded border border-slate-800">
                          <span className="text-[10px] text-cyan-400 block font-bold">{r.Sprint ? 'SPRINT QUALI' : 'FP3'}</span>
                          <span className="font-black text-white">{r.Sprint ? r.SecondPractice?.date : r.ThirdPractice?.date || 'N/A'}</span>
                        </div>
                        <div className="bg-[#0D121F] p-2.5 rounded border border-slate-800">
                          <span className="text-[10px] text-amber-400 block font-bold">QUALIFYING</span>
                          <span className="font-black text-white">{r.Qualifying?.date || r.date}</span>
                        </div>
                        <div className="bg-[#0D121F] p-2.5 rounded border border-slate-800">
                          <span className="text-[10px] text-emerald-400 block font-bold">RACE</span>
                          <span className="font-black text-white">{r.date}</span>
                        </div>
                      </div>

                      {/* Top Race Results Classification if completed */}
                      {isPast && (
                        <div className="bg-[#0D121F] p-3 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-black text-cyan-400 uppercase block mb-2">
                            TOP 3 RACE CLASSIFICATION
                          </span>
                          {cache?.loading ? (
                            <p className="text-slate-400 text-xs">Loading official results…</p>
                          ) : cache?.raceResults && cache.raceResults.length >= 3 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              {cache.raceResults.slice(0, 3).map(res => (
                                <div key={res.position} className="p-2 bg-[#050810] rounded border border-slate-800 flex justify-between items-center font-bold">
                                  <span className="text-cyan-300">P{res.position}: {res.Driver.givenName} {res.Driver.familyName}</span>
                                  <span className="text-amber-400 text-[11px]">{res.Constructor.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-xs">Full classification available in Paddock Replay workstation.</p>
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
