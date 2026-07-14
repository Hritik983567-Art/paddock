'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, getTeamColor } from '../utils/api';

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

export default function StandingsPage() {
  const { selectedSeason } = useSeason();
  
  const [drivers, setDrivers] = useState<DriverStanding[]>([]);
  const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roundInfo, setRoundInfo] = useState('');
  const [seasonYear, setSeasonYear] = useState('');

  useEffect(() => {
    async function loadStandings() {
      setLoading(true);
      setError('');
      try {
        const [dRes, cRes] = await Promise.all([
          getJSON(`${API_BASE}/${selectedSeason}/driverStandings.json`),
          getJSON(`${API_BASE}/${selectedSeason}/constructorStandings.json`)
        ]);

        const dTable = dRes.MRData.StandingsTable.StandingsLists[0];
        const cTable = cRes.MRData.StandingsTable.StandingsLists[0];

        if (!dTable || !cTable) {
          throw new Error('No standings on record for that season.');
        }

        setSeasonYear(dRes.MRData.StandingsTable.season);
        setRoundInfo(`after round ${dTable.round}`);
        setDrivers(dTable.DriverStandings || []);
        setConstructors(cTable.ConstructorStandings || []);
      } catch (e: any) {
        setError(e.message || 'Couldn\'t reach the timing feed.');
      } finally {
        setLoading(false);
      }
    }

    loadStandings();
  }, [selectedSeason]);

  const maxDriverPts = Math.max(...drivers.map(d => parseFloat(d.points) || 0), 1);
  const maxConstructorPts = Math.max(...constructors.map(c => parseFloat(c.points) || 0), 1);

  if (loading) {
    return (
      <section className="view" id="view-standings">
        <div className="grid cols-2">
          <div className="panel">
            <h2>Drivers&apos; Championship</h2>
            <div className="loading">Pulling telemetry…</div>
          </div>
          <div className="panel">
            <h2>Constructors&apos; Championship</h2>
            <div className="loading">Pulling telemetry…</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="view" id="view-standings">
        <div className="grid cols-2">
          <div className="panel">
            <h2>Drivers&apos; Championship</h2>
            <div className="err">{error}</div>
          </div>
          <div className="panel">
            <h2>Constructors&apos; Championship</h2>
            <div className="err">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="view" id="view-standings">
      <div className="grid cols-2">
        <div className="panel">
          <h2>Drivers&apos; Championship</h2>
          <p className="sub" id="stDriverSub">
            Season {seasonYear} · {roundInfo}
          </p>
          <div id="stDrivers">
            {drivers.map(d => {
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
          <h2>Constructors&apos; Championship</h2>
          <p className="sub" id="stConstructorSub">
            Season {seasonYear} · {roundInfo}
          </p>
          <div id="stConstructors">
            {constructors.map(c => {
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
    </section>
  );
}
