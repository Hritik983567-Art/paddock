'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, getTeamColor } from '../utils/api';

interface DriverItem {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  permanentNumber?: string;
}

interface TeamRoster {
  constructorId: string;
  constructorName: string;
  drivers: DriverItem[];
}

export default function TeammatesPage() {
  const { selectedSeason } = useSeason();
  const [rosters, setRosters] = useState<TeamRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTeammates() {
      setLoading(true);
      setError('');
      try {
        const data = await getJSON(`${API_BASE}/${selectedSeason}/driverStandings.json`);
        const standingsList = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];

        if (standingsList.length === 0) {
          setError('No driver rosters found for this season.');
          setLoading(false);
          return;
        }

        // Group drivers by constructor
        const groupings: Record<string, { name: string; drivers: DriverItem[] }> = {};
        standingsList.forEach((item: any) => {
          const constr = item.Constructors[0];
          if (!constr) return;

          const cid = constr.constructorId;
          const cname = constr.name;
          const driver = item.Driver;

          if (!groupings[cid]) {
            groupings[cid] = { name: cname, drivers: [] };
          }

          // Add driver details (avoiding duplicate drivers if any)
          if (!groupings[cid].drivers.some(d => d.driverId === driver.driverId)) {
            groupings[cid].drivers.push({
              driverId: driver.driverId,
              code: driver.code || driver.familyName.slice(0, 3).toUpperCase(),
              givenName: driver.givenName,
              familyName: driver.familyName,
              permanentNumber: driver.permanentNumber
            });
          }
        });

        const compiledRosters: TeamRoster[] = Object.entries(groupings).map(([cid, info]) => ({
          constructorId: cid,
          constructorName: info.name,
          drivers: info.drivers
        }));

        setRosters(compiledRosters);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch team rosters.');
      } finally {
        setLoading(false);
      }
    }

    loadTeammates();
  }, [selectedSeason]);

  const renderPVCFigure = (color: string, code: string) => {
    return (
      <svg viewBox="0 0 100 132" width="92" height="122" className="fig" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="figGloss" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5"/>
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.06"/>
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28"/>
          </linearGradient>
          <radialGradient id="figHi" cx="32%" cy="22%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75"/>
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="podiumTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A404C"/>
            <stop offset="100%" stopColor="#22262E"/>
          </linearGradient>
        </defs>
        
        {/* podium base */}
        <ellipse cx="50" cy="122" rx="34" ry="7" fill="#000" opacity="0.35"/>
        <path d="M18 116 L82 116 L74 100 L26 100 Z" fill="url(#podiumTop)" stroke="#0A0B0D" strokeWidth="1"/>
        <rect x="26" y="100" width="12" height="4" fill="var(--red)"/>
        <rect x="38" y="100" width="12" height="4" fill="var(--paper)"/>
        <rect x="50" y="100" width="12" height="4" fill="var(--red)"/>
        <rect x="62" y="100" width="12" height="4" fill="var(--paper)"/>

        {/* legs victory */}
        <rect x="34" y="76" width="12" height="26" rx="6" fill="#15181E"/>
        <rect x="54" y="76" width="12" height="26" rx="6" fill="#15181E"/>
        <rect x="32" y="97" width="16" height="7" rx="3" fill="#0A0B0D"/>
        <rect x="52" y="97" width="16" height="7" rx="3" fill="#0A0B0D"/>

        {/* torso */}
        <rect x="30" y="52" width="40" height="30" rx="14" fill={color}/>
        <rect x="30" y="52" width="40" height="30" rx="14" fill="url(#figGloss)"/>
        <circle cx="50" cy="66" r="6" fill="#0A0B0D" opacity="0.55"/>

        {/* Driver chest code tag */}
        <text 
          x="50" 
          y="70" 
          fill="#FFF" 
          fontSize="9" 
          fontWeight="700" 
          fontFamily="var(--font-mono)" 
          textAnchor="middle"
        >
          {code}
        </text>
        
        {/* victory arm left */}
        <rect x="14" y="30" width="12" height="30" rx="6" fill={color} transform="rotate(-28 20 55)"/>
        <circle cx="12" cy="32" r="8" fill="#15181E"/>
        
        {/* arm hip right */}
        <rect x="68" y="54" width="11" height="24" rx="5.5" fill={color}/>
        <circle cx="73" cy="80" r="7" fill="#15181E"/>

        {/* bobblehead */}
        <ellipse cx="50" cy="28" rx="24" ry="25" fill={color}/>
        <rect x="28" y="21" width="44" height="13" rx="6.5" fill="#0A0B0D"/>
        <ellipse cx="50" cy="28" rx="24" ry="25" fill="url(#figGloss)"/>
        <ellipse cx="50" cy="28" rx="24" ry="25" fill="url(#figHi)"/>
      </svg>
    );
  };

  return (
    <section className="view" id="view-teammates">
      <div className="panel">
        <h2>Teammate Showroom — Season {selectedSeason === 'current' ? 'Live' : selectedSeason}</h2>
        <p className="sub">Visual F1 garage lineups. Teammate driver pairings represented as collectible glossy PVC figures wearing their official team colors.</p>

        {loading ? (
          <div className="loading">Opening garages…</div>
        ) : error ? (
          <div className="err">{error}</div>
        ) : (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', 
              gap: '20px',
              marginTop: '20px'
            }}
          >
            {rosters.map(team => {
              const color = getTeamColor(team.constructorId);
              return (
                <div 
                  key={team.constructorId} 
                  className="panel" 
                  style={{ borderTop: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', margin: 0, textTransform: 'uppercase', color: 'var(--paper)', textAlign: 'center' }}>
                    {team.constructorName}
                  </h3>

                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: '24px', 
                      flexWrap: 'wrap' 
                    }}
                  >
                    {team.drivers.slice(0, 3).map(driver => (
                      <div 
                        key={driver.driverId} 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          width: '100px', 
                          textAlign: 'center' 
                        }}
                      >
                        <div 
                          className="profile-head" 
                          style={{ margin: 0, display: 'block', pointerEvents: 'none' }}
                        >
                          <div className="fig" style={{ animationDuration: '3.6s' }}>
                            {renderPVCFigure(color, driver.code)}
                          </div>
                        </div>
                        <div 
                          style={{ 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            color: 'var(--paper)', 
                            marginTop: '6px',
                            lineHeight: '1.2' 
                          }}
                        >
                          {driver.givenName}<br />
                          {driver.familyName}
                        </div>
                        <span 
                          style={{ 
                            fontFamily: 'var(--font-mono)', 
                            fontSize: '10.5px', 
                            color: 'var(--dim)', 
                            marginTop: '3px',
                            background: 'var(--carbon-2)',
                            padding: '1px 5px',
                            borderRadius: '3px'
                          }}
                        >
                          {driver.permanentNumber ? `#${driver.permanentNumber} · ` : ''}{driver.code}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
