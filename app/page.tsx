'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSeason } from './contexts/SeasonContext';
import { getJSON, API_BASE, getTeamColor, fetchCircuitWeather, WeatherData } from './utils/api';

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
  const { selectedSeason } = useSeason();

  // Next race states
  const [nextRace, setNextRace] = useState<Race | null>(null);
  const [lastRace, setLastRace] = useState<Race | null>(null);
  const [totalRaces, setTotalRaces] = useState<number>(0);
  const [countdownText, setCountdownText] = useState('Loading countdown…');
  const [litCount, setLitCount] = useState(0);
  const [isLightsOut, setIsLightsOut] = useState(false);

  // Weather states
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Standings states
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(true);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch next & last race info
  useEffect(() => {
    async function fetchCalendar() {
      try {
        const sched = await getJSON(`${API_BASE}/current.json`);
        const races = sched.MRData.RaceTable.Races as Race[];
        setTotalRaces(races.length);
        const now = new Date();
        const past = races.filter(r => new Date(r.date + 'T' + (r.time || '00:00:00Z')) <= now);
        const future = races.filter(r => new Date(r.date + 'T' + (r.time || '00:00:00Z')) > now);

        if (future.length > 0) {
          setNextRace(future[0]);
        } else if (races.length > 0) {
          setNextRace(races[races.length - 1]);
        }

        if (past.length > 0) {
          setLastRace(past[past.length - 1]);
        }
      } catch (e: any) {
        setCountdownText('Countdown feed unavailable');
      }
    }
    fetchCalendar();
  }, []);

  // Fetch weather when nextRace is loaded
  useEffect(() => {
    const lat = nextRace?.Circuit?.Location?.lat;
    const long = nextRace?.Circuit?.Location?.long;
    if (!lat || !long) return;

    async function loadWeather() {
      setWeatherLoading(true);
      try {
        const wData = await fetchCircuitWeather(lat!, long!);
        setWeather(wData);
      } catch (err: any) {
        // Fallback gracefully
      } finally {
        setWeatherLoading(false);
      }
    }
    loadWeather();
  }, [nextRace]);

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

        const dList = dRes?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
        const cList = cRes?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

        setDrivers(dList);
        setConstructors(cList);
      } catch (e: any) {
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
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-wider text-white uppercase font-display">
                  PADDOCK COMMAND CENTER
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-black uppercase rounded bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-md">
                  LIVE INTELLIGENCE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Official Formula 1 Race Control, Telemetry & Analytics Hub
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
          className="p-6 border-2 border-slate-700/80 rounded-xl shadow-2xl relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center"
        >
          {/* Next Race Info (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase rounded bg-red-950 text-red-400 border border-red-800">
                NEXT ON THE CALENDAR
              </span>
              {nextRace && (
                <span className="text-xs font-bold text-cyan-400">
                  ROUND {nextRace.round} OF {totalRaces}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-display tracking-wide">
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

          {/* Weather Widget (1 Column) */}
          <div className="bg-[#0D121F] p-4 rounded-xl border-2 border-slate-700 shadow-xl space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-black text-white uppercase">CIRCUIT WEATHER RADAR</span>
              <span className="text-[10px] text-cyan-400 font-bold">OPEN-METEO LIVE</span>
            </div>

            {weatherLoading ? (
              <p className="text-slate-400 py-4 text-center">Loading weather radar…</p>
            ) : weather ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">TRACK TEMP:</span>
                  <span className="font-black text-amber-400 text-sm">{weather.temp}°C ({Math.round(weather.temp * 1.8 + 32)}°F)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">CONDITIONS:</span>
                  <span className="font-black text-white">{weather.description}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">WIND SPEED:</span>
                  <span className="font-black text-cyan-300">{weather.windSpeed} km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">PRECIPITATION:</span>
                  <span className="font-black text-emerald-400">{weather.humidity}% Humidity ({weather.trackStatus})</span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 py-4 text-center">Weather radar data available near session start.</p>
            )}
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
