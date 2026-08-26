'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSeason } from './contexts/SeasonContext';
import { getJSON, API_BASE, getTeamColor, fetchCircuitWeather, WeatherData } from './utils/api';
import CircuitMap from './components/CircuitMap';

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
  const [totalRaces, setTotalRaces] = useState<number>(0);
  const [countdownText, setCountdownText] = useState('Loading countdown…');
  const [litCount, setLitCount] = useState(0);
  const [isLightsOut, setIsLightsOut] = useState(false);

  // Weather states
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState('');

  // Standings states
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [standingsError, setStandingsError] = useState('');

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch next race info (always tracks current season)
  useEffect(() => {
    async function fetchNextRace() {
      try {
        const sched = await getJSON(`${API_BASE}/current.json`);
        const races = sched.MRData.RaceTable.Races as Race[];
        setTotalRaces(races.length);
        const now = new Date();
        let next = races.find(r => new Date(r.date + 'T' + (r.time || '00:00:00Z')) > now);
        if (!next && races.length > 0) {
          next = races[races.length - 1];
        }
        setNextRace(next || null);
      } catch (e: any) {
        setCountdownText('Countdown feed unavailable');
        console.error(e);
      }
    }
    fetchNextRace();
  }, []);

  // Fetch weather when nextRace is loaded
  useEffect(() => {
    const lat = nextRace?.Circuit?.Location?.lat;
    const long = nextRace?.Circuit?.Location?.long;
    if (!lat || !long) return;

    async function loadWeather() {
      setWeatherLoading(true);
      setWeatherError('');
      try {
        const wData = await fetchCircuitWeather(lat!, long!);
        setWeather(wData);
      } catch (err: any) {
        setWeatherError('Weather radar offline');
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
        setCountdownText('Lights out — race weekend underway');
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        return;
      }

      setIsLightsOut(false);
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdownText(`T-minus ${days}d ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`);

      const totalWindow = 7 * 86400000; // a week window
      const calculatedLit = Math.min(5, Math.max(0, 5 - Math.floor(diff / (totalWindow / 5))));
      setLitCount(calculatedLit);
    };

    tick();
    countdownIntervalRef.current = setInterval(tick, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [nextRace]);

  // Fetch standings (respects selectedSeason, but overview only renders if it is 'current')
  useEffect(() => {
    if (selectedSeason !== 'current') {
      setStandingsLoading(false);
      return;
    }

    async function loadStandings() {
      setStandingsLoading(true);
      setStandingsError('');
      try {
        const [dRes, cRes] = await Promise.all([
          getJSON(`${API_BASE}/current/driverStandings.json`),
          getJSON(`${API_BASE}/current/constructorStandings.json`)
        ]);

        const dList = dRes.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
        const cList = cRes.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];

        setDrivers(dList);
        setConstructors(cList);
      } catch (e: any) {
        setStandingsError(e.message || 'Timing feed unavailable.');
      } finally {
        setStandingsLoading(false);
      }
    }

    loadStandings();
  }, [selectedSeason]);

  const maxDriverPts = Math.max(...drivers.map(d => parseFloat(d.points) || 0), 1);
  const maxConstructorPts = Math.max(...constructors.map(c => parseFloat(c.points) || 0), 1);

  return (
    <section className="view" id="view-overview">
      {/* Hero Gantry Header Card */}
      <div className="hero">
        <div className="hero-left">
          <div className="eyebrow">NEXT ON THE CALENDAR</div>
          <h1>{nextRace ? nextRace.raceName : 'Loading grid…'}</h1>
          <p>
            {nextRace 
              ? `${nextRace.Circuit.circuitName}, ${nextRace.Circuit.Location.locality}, ${nextRace.Circuit.Location.country} — Round ${nextRace.round} of ${totalRaces}.`
              : 'Fetching live season data from the F1 timing feed.'
            }
          </p>
          <div className="lights-rig">
            {[0, 1, 2, 3, 4].map(idx => {
              const isOn = !isLightsOut && idx < litCount;
              const isGo = isLightsOut;
              return (
                <div 
                  key={idx}
                  className={`light ${isOn ? 'on' : ''} ${isGo ? 'go' : ''}`}
                ></div>
              );
            })}
          </div>
          <div className="countdown" dangerouslySetInnerHTML={{ __html: countdownText }}></div>
        </div>

        <div className="hero-right">
          <div className="eyebrow" style={{ fontSize: '11px', marginBottom: '8px' }}>SESSION METRICS // ROUND {nextRace ? nextRace.round : '—'}</div>
          <div className="meta-row">
            <span>Championship Round</span>
            <span>{nextRace ? `${nextRace.round} / ${totalRaces}` : '—'}</span>
          </div>
          <div className="meta-row">
            <span>Circuit Venue</span>
            <span>{nextRace ? nextRace.Circuit.circuitName : '—'}</span>
          </div>
          <div className="meta-row">
            <span>Location</span>
            <span>{nextRace ? `${nextRace.Circuit.Location.locality}, ${nextRace.Circuit.Location.country}` : '—'}</span>
          </div>
          <div className="meta-row">
            <span>Scheduled Start</span>
            <span>{nextRace ? new Date(nextRace.date + 'T' + (nextRace.time || '13:00:00Z')).toUTCString().replace(' GMT', ' UTC') : '—'}</span>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed var(--line)' }}>
            <div className="eyebrow" style={{ fontSize: '11px', marginBottom: '10px' }}>LIVE VENUE WEATHER TELEMETRY</div>
            {weatherLoading ? (
              <span className="footnote" style={{ color: 'var(--paper)' }}>Tracking weather radar...</span>
            ) : weatherError ? (
              <span className="footnote" style={{ color: 'var(--amber)' }}>{weatherError}</span>
            ) : weather ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#BAC4D8' }}>Weather Condition</span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{weather.description}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#BAC4D8' }}>Track Temp / Humidity</span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{weather.temp}°C / {weather.humidity}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#BAC4D8' }}>Wind Speed / Rain</span>
                  <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{weather.windSpeed} km/h / {weather.rain} mm</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#BAC4D8' }}>Tyre Allocation</span>
                  <span style={{ fontWeight: 600, color: weather.trackStatus === 'Dry' ? 'var(--cyan)' : 'var(--amber)' }}>
                    {weather.tyreRecommendation}
                  </span>
                </div>
              </div>
            ) : (
              <span className="footnote" style={{ color: 'var(--dim)' }}>No weather data available</span>
            )}
          </div>
        </div>
      </div>

      {/* 3D Isometric Circuit Radar (Left) & GPS Satellite Radar (Right) */}
      {nextRace && nextRace.Circuit.circuitId && (
        <div style={{ marginBottom: '28px' }}>
          <div className="grid cols-2" style={{ gap: '20px' }}>
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
              <div className="eyebrow" style={{ fontSize: '11px', marginBottom: '0' }}>📐 3D ISOMETRIC TELEMETRY CONSOLE</div>
              <div style={{ flex: 1 }}>
                <CircuitMap circuitId={nextRace.Circuit.circuitId} showStats={false} />
              </div>
            </div>

            {nextRace.Circuit.Location.lat && nextRace.Circuit.Location.long && (
              <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
                <div className="eyebrow" style={{ fontSize: '11px', marginBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🛰️ GPS SATELLITE &amp; TRACK RADAR</span>
                  <span style={{ fontSize: '10px', color: 'var(--cyan)' }}>LIVE LAT/LONG GPS</span>
                </div>
                <div style={{ flex: 1, minHeight: '340px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--line)', position: 'relative' }}>
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(parseFloat(nextRace.Circuit.Location.long) - 0.03).toFixed(4)},${(parseFloat(nextRace.Circuit.Location.lat) - 0.02).toFixed(4)},${(parseFloat(nextRace.Circuit.Location.long) + 0.03).toFixed(4)},${(parseFloat(nextRace.Circuit.Location.lat) + 0.02).toFixed(4)}&layer=mapnik&marker=${nextRace.Circuit.Location.lat},${nextRace.Circuit.Location.long}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, opacity: 0.9, width: '100%', height: '100%', minHeight: '340px' }}
                    allowFullScreen
                    title="GPS Satellite Track Radar"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedSeason !== 'current' ? (
        <div className="grid cols-2">
          <div className="panel">
            <h2>Driver standings</h2>
            <div className="footnote">
              Overview always tracks the live current season — switch the season selector back to &quot;Current season&quot; to see it here.
            </div>
          </div>
          <div className="panel">
            <h2>Constructor standings</h2>
            <div className="footnote">
              Switch back to &quot;Current season&quot; for the live overview.
            </div>
          </div>
        </div>
      ) : standingsLoading ? (
        <div className="grid cols-2">
          <div className="panel">
            <h2>Driver standings</h2>
            <div className="loading">Pulling telemetry…</div>
          </div>
          <div className="panel">
            <h2>Constructor standings</h2>
            <div className="loading">Pulling telemetry…</div>
          </div>
        </div>
      ) : standingsError ? (
        <div className="grid cols-2">
          <div className="panel">
            <h2>Driver standings</h2>
            <div className="err">{standingsError}</div>
          </div>
          <div className="panel">
            <h2>Constructor standings</h2>
            <div className="err">{standingsError}</div>
          </div>
        </div>
      ) : (
        <div className="grid cols-2">
          <div className="panel">
            <h2>Driver standings</h2>
            <p className="sub">Current championship order · live from Jolpica F1</p>
            <div id="ovDrivers">
              {drivers.slice(0, 8).map(d => {
                const team = d.Constructors[0];
                const color = getTeamColor(team?.constructorId || '');
                const pts = parseFloat(d.points) || 0;
                const widthPct = (pts / maxDriverPts) * 100;
                return (
                  <div key={d.position} className="standing-row">
                    <div className="pos">{d.position}</div>
                    <div className="name-wrap">
                      <div className="team-chip" style={{ background: color }}></div>
                      <div>
                        <div className="name">{d.Driver.givenName} {d.Driver.familyName}</div>
                        <div className="team">{team?.name || '—'}</div>
                      </div>
                    </div>
                    <div className="pts">{d.points}</div>
                    <div></div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${widthPct.toFixed(1)}%`, background: color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <h2>Constructor standings</h2>
            <p className="sub">Team points, current season</p>
            <div id="ovConstructors">
              {constructors.slice(0, 8).map(c => {
                const color = getTeamColor(c.Constructor.constructorId);
                const pts = parseFloat(c.points) || 0;
                const widthPct = (pts / maxConstructorPts) * 100;
                return (
                  <div key={c.position} className="standing-row">
                    <div className="pos">{c.position}</div>
                    <div className="name-wrap">
                      <div className="team-chip" style={{ background: color }}></div>
                      <div>
                        <div className="name">{c.Constructor.name}</div>
                        <div className="team">{c.wins} win{c.wins === '1' ? '' : 's'}</div>
                      </div>
                    </div>
                    <div className="pts">{c.points}</div>
                    <div></div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${widthPct.toFixed(1)}%`, background: color }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
