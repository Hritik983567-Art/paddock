'use client';

import React, { useState, useEffect } from 'react';
import { getJSON, fetchAllPaged, API_BASE } from '../utils/api';

interface Circuit {
  circuitId: string;
  circuitName: string;
  Location: {
    country: string;
  };
}

interface DriverIndex {
  driverId: string;
  name: string;
}

interface DriverSummary {
  starts: number;
  wins: number;
  podiums: number;
  poles: number;
  points: number;
  best: number | null;
  byYear: Record<string, { position: string; team: string }>;
}

export default function ComparePage() {
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [driversList, setDriversList] = useState<DriverIndex[]>([]);
  const [driverIndexByName, setDriverIndexByName] = useState<Record<string, string>>({});
  
  const [circuitId, setCircuitId] = useState('');
  const [driverAName, setDriverAName] = useState('');
  const [driverBName, setDriverBName] = useState('');
  
  const [loadingIndex, setLoadingIndex] = useState(true);
  const [indexError, setIndexError] = useState('');
  
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [compareError, setCompareError] = useState('');
  const [compareResults, setCompareResults] = useState<{
    nameA: string;
    nameB: string;
    sumA: DriverSummary;
    sumB: DriverSummary;
    years: string[];
  } | null>(null);

  // Load circuits and drivers lists once on mount
  useEffect(() => {
    async function loadInitialData() {
      setLoadingIndex(true);
      setIndexError('');
      try {
        const circs = await fetchAllPaged(`${API_BASE}/circuits.json`, 'CircuitTable', 'Circuits');
        circs.sort((a, b) => a.circuitName.localeCompare(b.circuitName));
        setCircuits(circs);

        const drivers = await fetchAllPaged(`${API_BASE}/drivers.json`, 'DriverTable', 'Drivers');
        const mapping: Record<string, string> = {};
        const indexList = drivers.map((d: any) => {
          const fullName = `${d.givenName} ${d.familyName}`;
          mapping[fullName.toLowerCase()] = d.driverId;
          return { driverId: d.driverId, name: fullName };
        });
        setDriversList(indexList);
        setDriverIndexByName(mapping);
      } catch (e: any) {
        setIndexError(e.message || 'Couldn\'t load indices.');
      } finally {
        setLoadingIndex(false);
      }
    }
    loadInitialData();
  }, []);

  const runCompare = async () => {
    setCompareError('');
    setCompareResults(null);

    if (!circuitId) {
      setCompareError('Pick a circuit first.');
      return;
    }

    const idA = driverIndexByName[driverAName.trim().toLowerCase()];
    const idB = driverIndexByName[driverBName.trim().toLowerCase()];

    if (!idA || !idB) {
      setCompareError(`Couldn't match "${!idA ? driverAName : driverBName}" to a driver — pick a name from the suggestions as you type.`);
      return;
    }

    setLoadingCompare(true);

    try {
      const [resA, qA, resB, qB] = await Promise.all([
        fetchAllPaged(`${API_BASE}/circuits/${circuitId}/drivers/${idA}/results.json`, 'RaceTable', 'Races'),
        fetchAllPaged(`${API_BASE}/circuits/${circuitId}/drivers/${idA}/qualifying.json`, 'RaceTable', 'Races').catch(() => []),
        fetchAllPaged(`${API_BASE}/circuits/${circuitId}/drivers/${idB}/results.json`, 'RaceTable', 'Races'),
        fetchAllPaged(`${API_BASE}/circuits/${circuitId}/drivers/${idB}/qualifying.json`, 'RaceTable', 'Races').catch(() => [])
      ]);

      if (resA.length === 0 && resB.length === 0) {
        setCompareError('Neither driver has raced at this circuit on record.');
        setLoadingCompare(false);
        return;
      }

      const summarize = (races: any[], qualiRaces: any[]): DriverSummary => {
        let wins = 0, podiums = 0, points = 0;
        const positions: number[] = [];
        const byYear: Record<string, { position: string; team: string }> = {};

        races.forEach(r => {
          const res = r.Results[0];
          if (!res) return;
          const pos = parseInt(res.position);
          if (!isNaN(pos)) {
            positions.push(pos);
            if (pos === 1) wins++;
            if (pos <= 3) podiums++;
          }
          points += parseFloat(res.points) || 0;
          byYear[r.season] = { position: res.positionText || res.position, team: res.Constructor.name };
        });

        let poles = 0;
        qualiRaces.forEach(r => {
          if (r.QualifyingResults && r.QualifyingResults[0] && r.QualifyingResults[0].position === '1') {
            poles++;
          }
        });

        const best = positions.length ? Math.min(...positions) : null;
        return { starts: races.length, wins, podiums, poles, points, best, byYear };
      };

      const sumA = summarize(resA, qA);
      const sumB = summarize(resB, qB);
      
      const years = Array.from(new Set([...Object.keys(sumA.byYear), ...Object.keys(sumB.byYear)]))
        .sort((a, b) => parseInt(b) - parseInt(a));

      setCompareResults({
        nameA: driverAName,
        nameB: driverBName,
        sumA,
        sumB,
        years
      });
    } catch (e: any) {
      setCompareError(e.message || 'Couldn\'t build comparison data.');
    } finally {
      setLoadingCompare(false);
    }
  };

  return (
    <section className="view" id="view-compare">
      <div className="panel">
        <h2>Circuit specialist</h2>
        <p className="sub">Pick a circuit and any two drivers from F1 history — see their whole record at that track, any era, side by side.</p>
        
        {loadingIndex ? (
          <div id="circStatus" className="loading">Loading the driver and circuit indexes…</div>
        ) : indexError ? (
          <div className="err">{indexError}</div>
        ) : (
          <>
            <div className="compare-picks">
              <div className="pick" style={{ flex: 1, minWidth: '220px' }}>
                <label className="small">Circuit</label>
                <select value={circuitId} onChange={(e) => setCircuitId(e.target.value)}>
                  <option value="">Select a circuit…</option>
                  {circuits.map(c => (
                    <option key={c.circuitId} value={c.circuitId}>{c.circuitName} — {c.Location.country}</option>
                  ))}
                </select>
              </div>
              <div className="pick">
                <label className="small">Driver A</label>
                <input 
                  list="circDriverListA" 
                  value={driverAName}
                  onChange={(e) => setDriverAName(e.target.value)}
                  placeholder="Type a name…" 
                  autoComplete="off" 
                />
                <datalist id="circDriverListA">
                  {driversList.map(d => (
                    <option key={d.driverId} value={d.name} />
                  ))}
                </datalist>
              </div>
              <div className="pick">
                <label className="small">Driver B</label>
                <input 
                  list="circDriverListB" 
                  value={driverBName}
                  onChange={(e) => setDriverBName(e.target.value)}
                  placeholder="Type a name…" 
                  autoComplete="off" 
                />
                <datalist id="circDriverListB">
                  {driversList.map(d => (
                    <option key={d.driverId} value={d.name} />
                  ))}
                </datalist>
              </div>
              <div className="pick" style={{ justifyContent: 'flex-end' }}>
                <label className="small">&nbsp;</label>
                <button className="btn primary" onClick={runCompare}>Compare</button>
              </div>
            </div>

            {loadingCompare && (
              <div id="circStatus" className="loading">Pulling both drivers&apos; full record at this circuit…</div>
            )}
            
            {compareError && (
              <div className="err" style={{ marginBottom: '16px' }}>{compareError}</div>
            )}

            {compareResults && (
              <div id="circBody">
                <div className="circ-cols">
                  <div className="circ-card">
                    <h3>{compareResults.nameA}</h3>
                    <div className="stat-grid">
                      <div className="stat-box">
                        <div className="k">Starts</div>
                        <div className="v">{compareResults.sumA.starts}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Wins</div>
                        <div className="v" style={{ color: 'var(--amber)' }}>{compareResults.sumA.wins}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Podiums</div>
                        <div className="v" style={{ color: 'var(--cyan)' }}>{compareResults.sumA.podiums}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Poles</div>
                        <div className="v" style={{ color: 'var(--purple)' }}>{compareResults.sumA.poles}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Points</div>
                        <div className="v">{compareResults.sumA.points.toFixed(0)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Best finish</div>
                        <div className="v">{compareResults.sumA.best ?? '—'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="circ-card">
                    <h3>{compareResults.nameB}</h3>
                    <div className="stat-grid">
                      <div className="stat-box">
                        <div className="k">Starts</div>
                        <div className="v">{compareResults.sumB.starts}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Wins</div>
                        <div className="v" style={{ color: 'var(--amber)' }}>{compareResults.sumB.wins}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Podiums</div>
                        <div className="v" style={{ color: 'var(--cyan)' }}>{compareResults.sumB.podiums}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Poles</div>
                        <div className="v" style={{ color: 'var(--purple)' }}>{compareResults.sumB.poles}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Points</div>
                        <div className="v">{compareResults.sumB.points.toFixed(0)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Best finish</div>
                        <div className="v">{compareResults.sumB.best ?? '—'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="circ-timeline">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', marginBottom: '6px' }}>Year by year</h3>
                  {compareResults.years.map(y => {
                    const ya = compareResults.sumA.byYear[y];
                    const yb = compareResults.sumB.byYear[y];
                    return (
                      <div key={y} className="circ-year-row">
                        <div className="yr">{y}</div>
                        <div>{ya ? `P${ya.position} — ${ya.team}` : '—'}</div>
                        <div>{yb ? `P${yb.position} — ${yb.team}` : '—'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
        <div className="footnote">Figures come from every result and qualifying session on record for that driver at that specific circuit — across every year they raced there, whatever the era.</div>
      </div>
    </section>
  );
}
