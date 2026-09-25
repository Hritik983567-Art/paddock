'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getJSON, API_BASE } from './utils/api';
import CircuitWeatherRadar from './components/CircuitWeatherRadar';

interface Race {
  raceName: string;
  round: string;
  date: string;
  time?: string;
  Circuit: {
    circuitId?: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
      lat?: string;
      long?: string;
    };
  };
}

interface DriverStanding {
  position: string;
  points: string;
  Driver: {
    driverId: string;
    code: string;
    givenName: string;
    familyName: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
  }>;
}

interface ConstructorStanding {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
  };
}

export default function OverviewPage() {
  // Next race states
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [totalRaces, setTotalRaces] = useState<number>(0);
  const [countdownText, setCountdownText] = useState('Loading countdown…');
  const [litCount, setLitCount] = useState(0);
  const [isLightsOut, setIsLightsOut] = useState(false);

  // Standings states
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(true);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch next & last race info
  useEffect(() => {
    async function fetchCalendar() {
      try {
        const sched = await getJSON(`${API_BASE}/current.json`) as { MRData: { RaceTable: { Races: Race[] } } };
        const races = sched?.MRData?.RaceTable?.Races || [];
        setTotalRaces(races.length);
        const now = new Date();
        const future = races.filter(r => new Date(r.date + 'T' + (r.time || '00:00:00Z')) > now);

        if (future.length > 0) {
          setNextRace(future[0]);
        } else if (races.length > 0) {
          setNextRace(races[races.length - 1]);
        }
      } catch {
        setCountdownText('Countdown feed unavailable');
      }
    }
    fetchCalendar();
  }, []);

  // Tick countdown interval
  useEffect(() => {
    if (!nextRace) return;

    const raceDate = new Date(nextRace.date + 'T' + (nextRace.time || '13:00:00Z'));

    const tick = () => {
      const now = new Date();
      const diff = raceDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsLightsOut(true);
        setLitCount(0);
        setCountdownText('LIGHTS OUT — RACE WEEKEND UNDERWAY');
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        return;
      }

      setIsLightsOut(false);
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdownText(`T-MINUS ${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`);

      const totalWindow = 7 * 86400000;
      const calculatedLit = Math.min(5, Math.max(0, 5 - Math.floor(diff / (totalWindow / 5))));
      setLitCount(calculatedLit);
    };

    tick();
    countdownIntervalRef.current = setInterval(tick, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [nextRace]);

  // Fetch current standings
  useEffect(() => {
    async function loadStandings() {
      setStandingsLoading(true);
      try {
        const [dRes, cRes] = await Promise.all([
          getJSON(`${API_BASE}/current/driverStandings.json`).catch(() => null),
          getJSON(`${API_BASE}/current/constructorStandings.json`).catch(() => null)
        ]);

        const dObj = dRes as { MRData?: { StandingsTable?: { StandingsLists?: Array<{ DriverStandings: DriverStanding[] }> } } } | null;
        const cObj = cRes as { MRData?: { StandingsTable?: { StandingsLists?: Array<{ ConstructorStandings: ConstructorStanding[] }> } } } | null;

        const dList = dObj?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
        const cList = cObj?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

        setDrivers(dList);
        setConstructors(cList);
      } catch {
        // Fallback gracefully
      } finally {
        setStandingsLoading(false);
      }
    }

    loadStandings();
  }, []);

  return (
    <section className="min-h-screen bg-[#050810] text-slate-100 p-4 md:p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* COMMAND CENTER HEADER */}
        <header 
          style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
          className="p-5 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-red-600/30 border-2 border-red-500 text-red-400 font-mono font-black text-sm tracking-wider shadow-lg">
              F1
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1">
                  <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
                  <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                    F1 MISSION CONTROL
                  </span>
                </span>
                <span className="text-slate-700 font-sans text-xs">•</span>
                <span className="text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
                  2026 WORLD CHAMPIONSHIP
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight f1-text-gradient uppercase">
                PADDOCK COMMAND CENTER
              </h1>
              <p className="text-xs font-sans text-slate-400 mt-0.5 leading-relaxed">
                Official Formula 1 Race Control, Telemetry &amp; Analytics Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0D121F] px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-black">SYSTEMS OPERATIONAL</span>
          </div>
        </header>

        {/* HERO: NEXT RACE & LIGHTS OUT COUNTDOWN */}
        <div 
          style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
          className="p-6 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
        >
          {/* Next Race Info (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
                <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                  NEXT ON THE CALENDAR
                </span>
              </span>
              {nextRace && (
                <>
                  <span className="text-slate-700 font-sans text-xs">•</span>
                  <span className="text-[11px] font-telemetry font-bold text-cyan-400 uppercase tracking-wider">
                    ROUND {nextRace.round} OF {totalRaces}
                  </span>
                </>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white f1-text-gradient uppercase">
              {nextRace ? nextRace.raceName : 'FETCHING CALENDAR…'}
            </h2>

            <p className="text-xs text-slate-300 font-semibold">
              {nextRace
                ? `${nextRace.Circuit?.circuitName || 'Grand Prix Circuit'}${nextRace.Circuit?.Location?.locality ? ` — ${nextRace.Circuit.Location.locality}` : ''}${nextRace.Circuit?.Location?.country ? `, ${nextRace.Circuit.Location.country}` : ''}`
                : 'Loading official Grand Prix schedule from F1 data feeds.'
              }
            </p>

            {/* Lights-out rig */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                {[0, 1, 2, 3, 4].map(idx => {
                  const isOn = !isLightsOut && idx < litCount;
                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center shadow-lg ${
                        isOn
                          ? 'bg-red-500 border-red-400 shadow-red-500/50 animate-pulse'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${isOn ? 'bg-white' : 'bg-slate-800'}`}></div>
                    </div>
                  );
                })}
              </div>

              <span className="text-xs font-black text-cyan-400 tracking-wider">
                {countdownText}
              </span>
            </div>
          </div>

          {/* Live Doppler Circuit Weather Radar (1 Column) */}
          <div className="lg:col-span-1">
            <CircuitWeatherRadar
              initialLat={nextRace?.Circuit?.Location?.lat}
              initialLon={nextRace?.Circuit?.Location?.long}
              circuitName={nextRace?.Circuit?.circuitName}
              locality={nextRace?.Circuit?.Location?.locality}
              country={nextRace?.Circuit?.Location?.country}
              flag="🏁"
              circuitId={nextRace?.Circuit?.circuitId}
            />
          </div>
        </div>

        {/* CHAMPIONSHIP LEADERS & RECENT RESULT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* TOP DRIVERS SUMMARY */}
          <div 
            style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
            className="p-5 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  DRIVER CHAMPIONSHIP LEADERS
                </h3>
              </div>
              <Link href="/standings" className="text-[10px] font-bold text-cyan-400 hover:underline">
                FULL STANDINGS &rarr;
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {standingsLoading ? (
                <p className="text-slate-400 py-4 text-center">Loading standings…</p>
              ) : drivers.slice(0, 3).map((d) => (
                <div key={d.Driver.driverId} className="p-3 bg-[#0D121F] rounded-lg border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center font-black text-cyan-300 text-[11px]">
                      P{d.position}
                    </span>
                    <div>
                      <span className="font-black text-white block">{d.Driver.givenName} {d.Driver.familyName}</span>
                      <span className="text-[10px] text-amber-400 font-bold">{d.Constructors[0]?.name}</span>
                    </div>
                  </div>
                  <span className="font-black text-emerald-400 text-sm">{d.points} PTS</span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP CONSTRUCTORS SUMMARY */}
          <div 
            style={{ backgroundColor: '#070A10', background: '#070A10', opacity: 1 }}
            className="p-5 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base">🏎️</span>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  CONSTRUCTOR CHAMPIONSHIP LEADERS
                </h3>
              </div>
              <Link href="/standings" className="text-[10px] font-bold text-cyan-400 hover:underline">
                FULL STANDINGS &rarr;
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {standingsLoading ? (
                <p className="text-slate-400 py-4 text-center">Loading standings…</p>
              ) : constructors.slice(0, 3).map((c) => (
                <div key={c.Constructor.constructorId} className="p-3 bg-[#0D121F] rounded-lg border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-950 border border-amber-700 flex items-center justify-center font-black text-amber-300 text-[11px]">
                      P{c.position}
                    </span>
                    <div>
                      <span className="font-black text-white block">{c.Constructor.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{c.wins} Race Wins</span>
                    </div>
                  </div>
                  <span className="font-black text-emerald-400 text-sm">{c.points} PTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
