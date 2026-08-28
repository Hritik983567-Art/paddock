'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, fetchAllPaged, API_BASE, getTeamColor, NATIONALITY_FLAGS } from '../utils/api';

interface Driver {
  driverId: string;
  givenName: string;
  familyName: string;
}

interface DriverProfile {
  permanentNumber: string;
  givenName: string;
  familyName: string;
  nationality: string;
  dateOfBirth: string;
  championships: number;
  latestTeamName: string;
  active: boolean;
  careerSpan: string;
  starts: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  totalPoints: number;
  winPct: string;
  podPct: string;
  dnfs: number;
  sprintPoints: number;
  sprintRacesCount: number;
  sprintWins: number;
  color: string;
}

export default function DriversPage() {
  const { selectedSeason } = useSeason();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profile, setProfile] = useState<DriverProfile | null>(null);

  // Load drivers list for the selected season
  useEffect(() => {
    async function loadDriverList() {
      setLoadingList(true);
      setListError('');
      try {
        const res = await getJSON(`${API_BASE}/${selectedSeason}/drivers.json?limit=60`);
        const list = res.MRData.DriverTable.Drivers as Driver[];
        setDrivers(list);
        if (list.length > 0) {
          setSelectedDriverId(list[0].driverId);
        }
      } catch (e: any) {
        setListError(e.message || 'Couldn\'t load drivers.');
      } finally {
        setLoadingList(false);
      }
    }
    loadDriverList();
    setProfile(null);
  }, [selectedSeason]);

  const loadProfile = async () => {
    if (!selectedDriverId) return;

    setLoadingProfile(true);
    setProfileError('');
    setProfile(null);

    try {
      // Active driver check
      let activeDriversSet = new Set<string>();
      try {
        const activeRes = await getJSON(`${API_BASE}/current/drivers.json?limit=60`);
        activeDriversSet = new Set(activeRes.MRData.DriverTable.Drivers.map((d: any) => d.driverId));
      } catch (e) {
        console.error('Failed to query current active drivers roster', e);
      }

      const [infoRes, races, qualiRaces, sprintRaces, standingsList] = await Promise.all([
        getJSON(`${API_BASE}/drivers/${selectedDriverId}.json`),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/results.json`, 'RaceTable', 'Races'),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/qualifying.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/sprint.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/drivers/${selectedDriverId}/driverStandings.json`, 'StandingsTable', 'StandingsLists').catch(() => [])
      ]);

      const info = infoRes.MRData.DriverTable.Drivers[0];
      if (!info) throw new Error('Driver details not found.');

      let wins = 0, podiums = 0, points = 0, dnfs = 0, fastestLaps = 0;
      const seasons = new Set<string>();
      let latestTeamId = '';
      let latestTeamName = '—';

      // Sort by season and round to get chronological order
      const sortedRaces = [...races].sort((a, b) => {
        const yearDiff = parseInt(a.season) - parseInt(b.season);
        if (yearDiff !== 0) return yearDiff;
        return parseInt(a.round) - parseInt(b.round);
      });

      sortedRaces.forEach(r => {
        const res = r.Results[0];
        if (!res) return;
        seasons.add(r.season);
        const pos = parseInt(res.position);
        const finished = res.status === 'Finished' || /^\+\d+ Lap/.test(res.status);
        if (!finished) dnfs++;
        if (!isNaN(pos) && pos === 1) wins++;
        if (!isNaN(pos) && pos <= 3) podiums++;
        if (res.FastestLap && res.FastestLap.rank === '1') fastestLaps++;
        points += parseFloat(res.points) || 0;
        latestTeamId = res.Constructor.constructorId;
        latestTeamName = res.Constructor.name;
      });

      let poles = 0;
      qualiRaces.forEach(r => {
        if (r.QualifyingResults && r.QualifyingResults[0] && r.QualifyingResults[0].position === '1') {
          poles++;
        }
      });

      let sprintPoints = 0, sprintWins = 0;
      sprintRaces.forEach(r => {
        const res = r.SprintResults && r.SprintResults[0];
        if (!res) return;
        sprintPoints += parseFloat(res.points) || 0;
        if (res.position === '1') sprintWins++;
      });

      const totalPoints = points + sprintPoints;

      // Championships: last standings entry of each completed season, position 1
      const bySeason: Record<string, any> = {};
      standingsList.forEach(sl => {
        const prev = bySeason[sl.season];
        if (!prev || parseInt(sl.round) > parseInt(prev.round)) {
          bySeason[sl.season] = sl;
        }
      });

      const thisYear = new Date().getFullYear();
      let championships = 0;
      Object.values(bySeason).forEach(sl => {
        if (parseInt(sl.season) >= thisYear) return; // ignore current incomplete season
        const ds = sl.DriverStandings && sl.DriverStandings[0];
        if (ds && ds.position === '1') championships++;
      });

      const seasonList = Array.from(seasons).sort((a, b) => parseInt(a) - parseInt(b));
      const active = activeDriversSet.has(selectedDriverId);
      const careerSpan = active 
        ? `${seasonList[0]}–Present` 
        : seasonList.length > 0 
          ? `${seasonList[0]}–${seasonList[seasonList.length - 1]}`
          : '—';
          
      const winPct = races.length ? ((wins / races.length) * 100).toFixed(1) : '0.0';
      const podPct = races.length ? ((podiums / races.length) * 100).toFixed(1) : '0.0';
      const color = getTeamColor(latestTeamId);

      setProfile({
        permanentNumber: info.permanentNumber || '—',
        givenName: info.givenName,
        familyName: info.familyName,
        nationality: info.nationality,
        dateOfBirth: info.dateOfBirth,
        championships,
        latestTeamName,
        active,
        careerSpan,
        starts: races.length,
        wins,
        podiums,
        poles,
        fastestLaps,
        totalPoints,
        winPct,
        podPct,
        dnfs,
        sprintPoints,
        sprintRacesCount: sprintRaces.length,
        sprintWins,
        color
      });
    } catch (e: any) {
      setProfileError(e.message || 'Couldn\'t load career profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const renderPVCFigure = (color: string) => {
    const mainColor = color || '#38BDF8';
    return (
      <svg viewBox="0 0 140 150" width="112" height="128" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
        <defs>
          <linearGradient id="helmetGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={mainColor} stopOpacity="0.95"/>
            <stop offset="60%" stopColor="#0F172A" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#050810" stopOpacity="0.98"/>
          </linearGradient>
          <linearGradient id="visorReflect" x1="0" y1="0" x2="1" y2="0.8">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.95"/>
            <stop offset="35%" stopColor="#3B82F6" stopOpacity="0.8"/>
            <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.75"/>
          </linearGradient>
          <linearGradient id="carbonBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155"/>
            <stop offset="100%" stopColor="#0F172A"/>
          </linearGradient>
          <pattern id="hexGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 4 0 L 8 2 L 8 6 L 4 8 L 0 6 L 0 2 Z" fill="none" stroke="#38BDF8" strokeWidth="0.4" opacity="0.15"/>
          </pattern>
        </defs>

        {/* Carbon Fiber HUD Frame Background */}
        <polygon points="70,6 126,36 126,110 70,140 14,110 14,36" fill="url(#carbonBase)" stroke="#1E293B" strokeWidth="2.5"/>
        <polygon points="70,6 126,36 126,110 70,140 14,110 14,36" fill="url(#hexGrid)"/>
        <polygon points="70,10 122,38 122,108 70,136 18,108 18,38" fill="none" stroke={mainColor} strokeWidth="1.5" opacity="0.6"/>

        {/* Outer Orbiting Telemetry Arc Gauges */}
        <circle cx="70" cy="72" r="58" fill="none" stroke="#00F0FF" strokeWidth="1" strokeDasharray="6 4" opacity="0.4"/>
        <path d="M 22 72 A 48 48 0 0 1 118 72" fill="none" stroke={mainColor} strokeWidth="2" strokeDasharray="3 3" opacity="0.8"/>

        {/* HUD Corner Tech Brackets */}
        <path d="M 22 42 L 22 34 L 30 34" fill="none" stroke="#00F0FF" strokeWidth="2"/>
        <path d="M 118 42 L 118 34 L 110 34" fill="none" stroke="#00F0FF" strokeWidth="2"/>
        <path d="M 22 102 L 22 110 L 30 110" fill="none" stroke="#00F0FF" strokeWidth="2"/>
        <path d="M 118 102 L 118 110 L 110 110" fill="none" stroke="#00F0FF" strokeWidth="2"/>

        {/* Ambient Hologram Platform Base */}
        <ellipse cx="70" cy="132" rx="36" ry="6" fill="#000000" opacity="0.6"/>
        <ellipse cx="70" cy="132" rx="32" ry="4" fill="none" stroke={mainColor} strokeWidth="1.5" opacity="0.8"/>

        {/* Driver HANS & Suit Collar */}
        <path d="M 38 118 C 46 102 94 102 102 118 C 106 124 34 124 38 118 Z" fill="url(#carbonBase)" stroke="#475569" strokeWidth="1.5"/>
        <path d="M 48 106 L 92 106 L 88 116 L 52 116 Z" fill={mainColor} opacity="0.85"/>
        <rect x="62" y="108" width="16" height="4" rx="2" fill="#FFFFFF" opacity="0.9"/>

        {/* Aerodynamic Helmet Shell */}
        <path d="M 36 66 C 36 28 52 14 70 14 C 88 14 104 28 104 66 C 104 88 98 104 70 104 C 42 104 36 88 36 66 Z" fill="url(#helmetGlow)" stroke="#64748B" strokeWidth="2"/>

        {/* Helmet Crown Stripes */}
        <path d="M 62 15 L 78 15 L 76 52 L 64 52 Z" fill="#FFFFFF" opacity="0.85"/>
        <path d="M 66 15 L 74 15 L 73 52 L 67 52 Z" fill={mainColor}/>

        {/* High-Tech Visor & Shield */}
        <path d="M 42 46 C 55 42 85 42 98 46 C 104 64 102 78 94 82 C 70 86 46 84 46 82 C 38 78 36 64 42 46 Z" fill="url(#visorReflect)" stroke="#00F0FF" strokeWidth="1.5"/>
        
        {/* Animated Laser Scanline across Visor */}
        <line x1="42" y1="62" x2="98" y2="62" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" strokeDasharray="8 4"/>

        {/* Visor Telemetry Text Overlay */}
        <text x="70" y="66" fill="#FFFFFF" fontFamily="monospace" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="1">F1 TELEMETRY</text>
        
        {/* Chin Vent Details */}
        <path d="M 56 90 L 84 90 L 80 96 L 60 96 Z" fill="#0F172A" stroke="#334155" strokeWidth="1"/>
        <line x1="64" y1="90" x2="64" y2="96" stroke={mainColor} strokeWidth="1.5"/>
        <line x1="70" y1="90" x2="70" y2="96" stroke="#FFFFFF" strokeWidth="1.5"/>
        <line x1="76" y1="90" x2="76" y2="96" stroke={mainColor} strokeWidth="1.5"/>
      </svg>
    );
  };

  const flag = profile ? NATIONALITY_FLAGS[profile.nationality] || '' : '';

  return (
    <section className="view" id="view-drivers">
      <div className="panel">
        <h2>Driver profile</h2>
        <p className="sub">Career stats pulled from every result and qualifying session on record for the selected driver.</p>
        
        {loadingList ? (
          <div className="loading">Loading driver list…</div>
        ) : listError ? (
          <div className="err">{listError}</div>
        ) : (
          <div className="driver-picker">
            <div className="pick">
              <label className="small">Driver</label>
              <select 
                value={selectedDriverId} 
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                {drivers.map(d => (
                  <option key={d.driverId} value={d.driverId}>{d.givenName} {d.familyName}</option>
                ))}
              </select>
            </div>
            <button className="btn primary" onClick={loadProfile}>Load profile</button>
          </div>
        )}

        {loadingProfile && (
          <div id="drvBody" className="loading">Pulling career archive (paging through every season)…</div>
        )}

        {profileError && (
          <div className="err" style={{ marginTop: '16px' }}>{profileError}</div>
        )}

        {profile && (
          <div id="drvBody" style={{ marginTop: '20px' }}>
            <div className="profile-head">
              <div className="fig">{renderPVCFigure(profile.color)}</div>
              <div className="num">{profile.permanentNumber}</div>
              <div>
                <h3>
                  {profile.givenName} {profile.familyName}
                  {profile.championships > 0 && (
                    <span style={{ color: 'var(--amber)', fontSize: '16px', marginLeft: '8px' }}>
                      · {profile.championships}× World Champion
                    </span>
                  )}
                </h3>
                <div className="team-line">
                  {profile.nationality} {flag} · born {profile.dateOfBirth}
                </div>
                <div className="team-line">
                  {profile.active ? 'Current' : 'Last'} team: {profile.latestTeamName} · Career: {profile.careerSpan} ·{' '}
                  <span style={{ color: profile.active ? 'var(--green)' : 'var(--dim)' }}>
                    {profile.active ? 'Active' : 'Retired'}
                  </span>
                </div>
              </div>
            </div>

            <div className="stat-grid">
              <div className="stat-box">
                <div className="k">Races started</div>
                <div className="v">{profile.starts}</div>
              </div>
              <div className="stat-box">
                <div className="k">GP wins</div>
                <div className="v" style={{ color: 'var(--amber)' }}>{profile.wins}</div>
              </div>
              <div className="stat-box">
                <div className="k">Podiums</div>
                <div className="v" style={{ color: 'var(--cyan)' }}>{profile.podiums}</div>
              </div>
              <div className="stat-box">
                <div className="k">Poles</div>
                <div className="v" style={{ color: 'var(--purple)' }}>{profile.poles}</div>
              </div>
              <div className="stat-box">
                <div className="k">Fastest laps</div>
                <div className="v" style={{ color: 'var(--green)' }}>{profile.fastestLaps}</div>
              </div>
              <div className="stat-box">
                <div className="k">Career points</div>
                <div className="v">{profile.totalPoints.toFixed(0)}</div>
              </div>
              <div className="stat-box">
                <div className="k">Win rate</div>
                <div className="v">{profile.winPct}%</div>
              </div>
              <div className="stat-box">
                <div className="k">Podium rate</div>
                <div className="v">{profile.podPct}%</div>
              </div>
              <div className="stat-box">
                <div className="k">Non-finishes</div>
                <div className="v" style={{ color: 'var(--red)' }}>{profile.dnfs}</div>
              </div>
            </div>
            
            <div className="footnote">
              Career points include {profile.sprintPoints.toFixed(0)} pts from {profile.sprintRacesCount} sprint race{profile.sprintRacesCount === 1 ? '' : 's'}
              {profile.sprintWins > 0 && ` (${profile.sprintWins} sprint win${profile.sprintWins === 1 ? '' : 's'}, not counted in GP wins above)`}.
              World championship count only credits fully completed seasons. Figures mix eras with different points systems, so treat totals as a rough measure of output rather than a strict like-for-like ranking.
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
