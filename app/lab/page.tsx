'use client';

import React, { useState, useEffect } from 'react';
import { useSeason } from '../contexts/SeasonContext';
import { getJSON, API_BASE, parseLapTime } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface RoundItem {
  round: string;
  raceName: string;
}

interface StintResult {
  total: number;
  lapTimes: number[];
}

export default function LabPage() {
  const { selectedSeason } = useSeason();

  const [rounds, setRounds] = useState<RoundItem[]>([]);
  const [selectedRound, setSelectedRound] = useState('');
  
  const [loadingRounds, setLoadingRounds] = useState(true);
  const [roundsError, setRoundsError] = useState('');

  // Simulation inputs
  const [laps, setLaps] = useState(58);
  const [baseTime, setBaseTime] = useState(92.0);
  const [degradation, setDegradation] = useState(0.09);
  const [pitLoss, setPitLoss] = useState(22);
  const [stopsA, setStopsA] = useState(2);
  const [stopsB, setStopsB] = useState(1);

  // Load real track status
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [trackStatus, setTrackStatus] = useState('');

  // Simulation outputs
  const [results, setResults] = useState<{
    totalA: number;
    totalB: number;
    delta: number;
    lapTimesA: number[];
    lapTimesB: number[];
  } | null>(null);

  // Fetch rounds for selected season
  useEffect(() => {
    async function loadRounds() {
      setLoadingRounds(true);
      setRoundsError('');
      setSelectedRound('');
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
    setResults(null);
  }, [selectedSeason]);

  // Load real track telemetry into inputs
  const loadTrackData = async () => {
    if (!selectedRound) return;
    setLoadingTrack(true);
    setTrackStatus('Pulling real race data…');
    try {
      const data = await getJSON(`${API_BASE}/${selectedSeason}/${selectedRound}/results.json`);
      const raceInfo = data.MRData.RaceTable.Races[0];
      const raceResults = raceInfo?.Results || [];
      if (raceResults.length === 0) {
        setTrackStatus('No results on record for that round yet.');
        return;
      }

      const lapsRun = Math.max(...raceResults.map((r: any) => parseInt(r.laps) || 0));
      const fastest = raceResults.filter((r: any) => r.FastestLap).sort((a: any, b: any) => parseInt(a.FastestLap.rank) - parseInt(b.FastestLap.rank))[0];
      const fastestSecs = fastest ? parseLapTime(fastest.FastestLap.Time.time) : null;

      if (lapsRun) setLaps(lapsRun);
      if (fastestSecs) setBaseTime(parseFloat(fastestSecs.toFixed(1)));
      
      setTrackStatus(`Loaded ${raceInfo.raceName} ${raceInfo.season}: ${lapsRun} real race laps, fastest race lap ${fastestSecs ? fastestSecs.toFixed(3) + 's' : 'n/a'}. Degradation and pit-lane loss stay as estimates you tune — no public API exposes tyre wear or pit loss data.`);
    } catch (e: any) {
      setTrackStatus(`Couldn't load real data. ${e.message}`);
    } finally {
      setLoadingTrack(false);
    }
  };

  // Run simulation
  const simulateStrategy = (
    totalLaps: number,
    base: number,
    deg: number,
    loss: number,
    stops: number
  ): StintResult => {
    const stintLen = Math.ceil(totalLaps / (stops + 1));
    let total = 0;
    const lapTimes: number[] = [];
    let lapCount = 0;

    for (let s = 0; s <= stops; s++) {
      const thisStintLen = Math.min(stintLen, totalLaps - lapCount);
      for (let i = 0; i < thisStintLen; i++) {
        const t = base + deg * i;
        lapTimes.push(t);
        total += t;
        lapCount++;
      }
      if (s < stops) total += loss;
    }
    return { total, lapTimes };
  };

  const handleSimulate = () => {
    const resA = simulateStrategy(laps, baseTime, degradation, pitLoss, stopsA);
    const resB = simulateStrategy(laps, baseTime, degradation, pitLoss, stopsB);
    const delta = resA.total - resB.total;

    setResults({
      totalA: resA.total,
      totalB: resB.total,
      delta,
      lapTimesA: resA.lapTimes,
      lapTimesB: resB.lapTimes
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = (s % 60).toFixed(1);
    return `${m}:${sec.padStart(4, '0')}`;
  };

  // Chart configuration
  const chartLabels = Array.from({ length: laps }, (_, i) => i + 1);
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `Strategy A (${stopsA}-stop)`,
        data: results?.lapTimesA || [],
        borderColor: '#34E4C8',
        backgroundColor: 'rgba(52, 228, 200, 0.08)',
        fill: true,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: `Strategy B (${stopsB}-stop)`,
        data: results?.lapTimesB || [],
        borderColor: '#E8302A',
        backgroundColor: 'rgba(232, 48, 42, 0.08)',
        fill: true,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#EEF1F6',
          font: {
            family: 'var(--font-mono)',
            size: 11
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Lap', color: '#8791A3' },
        ticks: { color: '#8791A3', font: { family: 'var(--font-mono)', size: 9 }, maxTicksLimit: 12 },
        grid: { color: '#2A2F3A' }
      },
      y: {
        title: { display: true, text: 'Lap time (s)', color: '#8791A3' },
        ticks: { color: '#8791A3', font: { family: 'var(--font-mono)', size: 10 } },
        grid: { color: '#2A2F3A' }
      }
    }
  };

  return (
    <section className="view" id="view-lab">
      <div className="panel">
        <h2>Pit strategy simulator</h2>
        <p className="sub">A simplified tyre-degradation model — not live data. Load a real circuit to pull its actual race distance and lap pace, then tune it and see how a one-stop vs two-stop plays out.</p>
        
        {loadingRounds ? (
          <div className="loading">Loading rounds…</div>
        ) : roundsError ? (
          <div className="err">{roundsError}</div>
        ) : (
          <div className="row-controls">
            <select 
              value={selectedRound} 
              onChange={(e) => setSelectedRound(e.target.value)}
            >
              <option value="">Select a round…</option>
              {rounds.map(r => (
                <option key={r.round} value={r.round}>R{r.round} — {r.raceName}</option>
              ))}
            </select>
            <button 
              className="btn primary" 
              onClick={loadTrackData}
              disabled={loadingTrack || !selectedRound}
            >
              {loadingTrack ? 'Loading…' : 'Load real track data'}
            </button>
            <span id="labTrackStatus" className="footnote" style={{ margin: 0 }}>
              {trackStatus}
            </span>
          </div>
        )}

        <div className="lab-controls">
          <label>Race laps
            <input 
              type="number" 
              value={laps} 
              onChange={(e) => setLaps(Math.max(1, parseInt(e.target.value) || 0))}
              min="10" 
              max="90" 
            />
          </label>
          <label>Base lap time (s)
            <input 
              type="number" 
              value={baseTime} 
              onChange={(e) => setBaseTime(Math.max(10, parseFloat(e.target.value) || 0))}
              step="0.1" 
              min="55" 
              max="140" 
            />
          </label>
          <label>Tyre degradation (s/lap)
            <input 
              type="number" 
              value={degradation} 
              onChange={(e) => setDegradation(Math.max(0, parseFloat(e.target.value) || 0))}
              step="0.01" 
              min="0" 
              max="0.5" 
            />
          </label>
          <label>Pit stop loss (s)
            <input 
              type="number" 
              value={pitLoss} 
              onChange={(e) => setPitLoss(Math.max(0, parseFloat(e.target.value) || 0))}
              step="0.5" 
              min="10" 
              max="35" 
            />
          </label>
          <label>Strategy A stops
            <select value={stopsA} onChange={(e) => setStopsA(parseInt(e.target.value))}>
              <option value={1}>1-stop</option>
              <option value={2}>2-stop</option>
              <option value={3}>3-stop</option>
            </select>
          </label>
          <label>Strategy B stops
            <select value={stopsB} onChange={(e) => setStopsB(parseInt(e.target.value))}>
              <option value={1}>1-stop</option>
              <option value={2}>2-stop</option>
              <option value={3}>3-stop</option>
            </select>
          </label>
        </div>

        <button className="btn primary" onClick={handleSimulate}>Simulate race</button>
        
        {results && (
          <>
            <div style={{ marginTop: '20px', height: '280px', position: 'relative' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
            <div className="result-strip">
              <div className="stat-box">
                <div className="k">{stopsA}-stop total</div>
                <div className="v" style={{ color: '#34E4C8' }}>{formatTime(results.totalA)}</div>
              </div>
              <div className="stat-box">
                <div className="k">{stopsB}-stop total</div>
                <div className="v" style={{ color: '#E8302A' }}>{formatTime(results.totalB)}</div>
              </div>
              <div className="stat-box">
                <div className="k">Gap at flag</div>
                <div className="v" style={{ color: '#FFB020' }}>
                  {Math.abs(results.delta).toFixed(1)}s {results.delta < 0 ? '(A ahead)' : '(B ahead)'}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="footnote" style={{ marginTop: '20px' }}>
          Race laps and base lap time can be pulled from a real Grand Prix&apos;s actual distance and fastest race lap. Degradation and pit loss stay as estimates you tune yourself — the public API doesn&apos;t expose tyre wear or pit lane loss models. Simulation model: degradation resets each stop, lap time = base + deg×(laps since stop).
        </div>
      </div>
    </section>
  );
}
