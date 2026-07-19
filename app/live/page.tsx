'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getTeamColor, getJSON, API_BASE } from '../utils/api';
import CircuitMap from '../components/CircuitMap';

interface LiveDriver {
  driverId: string;
  code: string;
  name: string;
  number: string;
  teamId: string;
  teamName: string;
  position: number;
  gapToLeader: number; // seconds
  lastLapTime: string;
  isFastestSector: boolean;
  speedTrap: number; // km/h
  tyre: 'S' | 'M' | 'H' | 'I' | 'W';
  tyreAge: number;
  status: 'RACING' | 'IN PIT' | 'OUT' | 'RETIRED';
}

const INITIAL_DRIVERS: LiveDriver[] = [
  { driverId: 'antonelli', code: 'ANT', name: 'Andrea Kimi Antonelli', number: '12', teamId: 'mercedes', teamName: 'Mercedes', position: 1, gapToLeader: 0.0, lastLapTime: '1:18.420', isFastestSector: false, speedTrap: 331, tyre: 'M', tyreAge: 4, status: 'RACING' },
  { driverId: 'russell', code: 'RUS', name: 'George Russell', number: '63', teamId: 'mercedes', teamName: 'Mercedes', position: 2, gapToLeader: 1.2, lastLapTime: '1:18.510', isFastestSector: false, speedTrap: 328, tyre: 'M', tyreAge: 4, status: 'RACING' },
  { driverId: 'hamilton', code: 'HAM', name: 'Lewis Hamilton', number: '44', teamId: 'ferrari', teamName: 'Ferrari', position: 3, gapToLeader: 2.8, lastLapTime: '1:18.630', isFastestSector: false, speedTrap: 329, tyre: 'S', tyreAge: 6, status: 'RACING' },
  { driverId: 'leclerc', code: 'LEC', name: 'Charles Leclerc', number: '16', teamId: 'ferrari', teamName: 'Ferrari', position: 4, gapToLeader: 4.1, lastLapTime: '1:18.450', isFastestSector: true, speedTrap: 334, tyre: 'S', tyreAge: 5, status: 'RACING' },
  { driverId: 'norris', code: 'NOR', name: 'Lando Norris', number: '1', teamId: 'mclaren', teamName: 'McLaren', position: 5, gapToLeader: 5.5, lastLapTime: '1:18.820', isFastestSector: false, speedTrap: 327, tyre: 'M', tyreAge: 4, status: 'RACING' },
  { driverId: 'piastri', code: 'PIA', name: 'Oscar Piastri', number: '81', teamId: 'mclaren', teamName: 'McLaren', position: 6, gapToLeader: 7.9, lastLapTime: '1:18.990', isFastestSector: false, speedTrap: 330, tyre: 'H', tyreAge: 3, status: 'RACING' },
  { driverId: 'max_verstappen', code: 'VER', name: 'Max Verstappen', number: '3', teamId: 'red_bull', teamName: 'Red Bull', position: 7, gapToLeader: 9.8, lastLapTime: '1:19.120', isFastestSector: false, speedTrap: 325, tyre: 'M', tyreAge: 7, status: 'RACING' },
  { driverId: 'hadjar', code: 'HAD', name: 'Isack Hadjar', number: '6', teamId: 'red_bull', teamName: 'Red Bull', position: 8, gapToLeader: 12.3, lastLapTime: '1:19.340', isFastestSector: false, speedTrap: 326, tyre: 'H', tyreAge: 8, status: 'RACING' },
  { driverId: 'gasly', code: 'GAS', name: 'Pierre Gasly', number: '10', teamId: 'alpine', teamName: 'Alpine F1 Team', position: 9, gapToLeader: 14.2, lastLapTime: '1:19.450', isFastestSector: false, speedTrap: 329, tyre: 'M', tyreAge: 9, status: 'RACING' },
  { driverId: 'lawson', code: 'LAW', name: 'Liam Lawson', number: '30', teamId: 'rb', teamName: 'RB F1 Team', position: 10, gapToLeader: 18.5, lastLapTime: '1:19.780', isFastestSector: false, speedTrap: 324, tyre: 'S', tyreAge: 10, status: 'RACING' },
  { driverId: 'arvid_lindblad', code: 'LIN', name: 'Arvid Lindblad', number: '41', teamId: 'rb', teamName: 'RB F1 Team', position: 11, gapToLeader: 21.0, lastLapTime: '1:19.920', isFastestSector: false, speedTrap: 328, tyre: 'S', tyreAge: 8, status: 'RACING' },
  { driverId: 'bearman', code: 'BEA', name: 'Oliver Bearman', number: '87', teamId: 'haas', teamName: 'Haas F1 Team', position: 12, gapToLeader: 24.5, lastLapTime: '1:19.890', isFastestSector: false, speedTrap: 326, tyre: 'M', tyreAge: 12, status: 'RACING' },
  { driverId: 'colapinto', code: 'COL', name: 'Franco Colapinto', number: '43', teamId: 'alpine', teamName: 'Alpine F1 Team', position: 13, gapToLeader: 28.0, lastLapTime: '1:20.120', isFastestSector: false, speedTrap: 322, tyre: 'H', tyreAge: 11, status: 'RACING' },
  { driverId: 'bortoleto', code: 'BOR', name: 'Gabriel Bortoleto', number: '5', teamId: 'audi', teamName: 'Audi', position: 14, gapToLeader: 30.5, lastLapTime: '1:20.340', isFastestSector: false, speedTrap: 325, tyre: 'M', tyreAge: 13, status: 'RACING' },
  { driverId: 'sainz', code: 'SAI', name: 'Carlos Sainz', number: '55', teamId: 'williams', teamName: 'Williams', position: 15, gapToLeader: 32.8, lastLapTime: '1:20.550', isFastestSector: false, speedTrap: 323, tyre: 'H', tyreAge: 9, status: 'RACING' },
  { driverId: 'albon', code: 'ALB', name: 'Alex Albon', number: '23', teamId: 'williams', teamName: 'Williams', position: 16, gapToLeader: 35.1, lastLapTime: '1:20.890', isFastestSector: false, speedTrap: 327, tyre: 'H', tyreAge: 14, status: 'RACING' },
  { driverId: 'ocon', code: 'OCO', name: 'Esteban Ocon', number: '31', teamId: 'haas', teamName: 'Haas F1 Team', position: 17, gapToLeader: 38.4, lastLapTime: '1:21.110', isFastestSector: false, speedTrap: 321, tyre: 'S', tyreAge: 11, status: 'RACING' },
  { driverId: 'alonso', code: 'ALO', name: 'Fernando Alonso', number: '14', teamId: 'aston_martin', teamName: 'Aston Martin', position: 18, gapToLeader: 41.2, lastLapTime: '1:21.430', isFastestSector: false, speedTrap: 323, tyre: 'M', tyreAge: 15, status: 'RACING' },
  { driverId: 'hulkenberg', code: 'HUL', name: 'Nico Hulkenberg', number: '27', teamId: 'audi', teamName: 'Audi', position: 19, gapToLeader: 44.9, lastLapTime: '1:21.890', isFastestSector: false, speedTrap: 324, tyre: 'H', tyreAge: 16, status: 'RACING' },
  { driverId: 'bottas', code: 'BOT', name: 'Valtteri Bottas', number: '77', teamId: 'cadillac', teamName: 'Cadillac F1 Team', position: 20, gapToLeader: 48.0, lastLapTime: '1:22.090', isFastestSector: false, speedTrap: 322, tyre: 'S', tyreAge: 13, status: 'RACING' },
  { driverId: 'perez', code: 'PER', name: 'Sergio Perez', number: '11', teamId: 'cadillac', teamName: 'Cadillac F1 Team', position: 21, gapToLeader: 51.5, lastLapTime: '1:22.450', isFastestSector: false, speedTrap: 325, tyre: 'H', tyreAge: 10, status: 'RACING' },
  { driverId: 'stroll', code: 'STR', name: 'Lance Stroll', number: '18', teamId: 'aston_martin', teamName: 'Aston Martin', position: 22, gapToLeader: 55.0, lastLapTime: '1:22.890', isFastestSector: false, speedTrap: 326, tyre: 'H', tyreAge: 14, status: 'RACING' }
];

const RADIO_MESSAGES = [
  "HAM: 'Tyres are going off, box box box.'",
  "VER: 'Losing battery power on exit, check maps.'",
  "NOR: 'Gap to Leclerc ahead is closing, push now.'",
  "LEC: 'The wind is pick up at turn 4, understeer is bad.'",
  "PIA: 'Check the front wing balance at the next stop.'",
  "RUS: 'Yellow flag ahead, sector 3.'",
  "PER: 'I have no grip on these medium tyres.'",
  "ALO: 'We are fighting for points, let's keep squeezing.'",
  "GAS: 'The DRS is working fine now, overtaking option is open.'"
];



export default function LiveTelemetryPage() {
  const [drivers, setDrivers] = useState<LiveDriver[]>(INITIAL_DRIVERS);
  const [selectedCircuit, setSelectedCircuit] = useState('spa');
  const [races, setRaces] = useState<any[]>([]);
  const [activeRace, setActiveRace] = useState<any | null>(null);

  // Fetch current calendar races on mount
  useEffect(() => {
    async function loadCalendar() {
      try {
        const res = await getJSON(`${API_BASE}/current.json`);
        const list = res.MRData.RaceTable.Races || [];
        setRaces(list);
        if (list.length > 0) {
          const spaRace = list.find((r: any) => r.Circuit.circuitId?.toLowerCase().includes('spa'));
          if (spaRace) {
            setSelectedCircuit(spaRace.Circuit.circuitId);
            setActiveRace(spaRace);
          } else {
            setSelectedCircuit(list[0].Circuit.circuitId);
            setActiveRace(list[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load calendar for live console:', err);
      }
    }
    loadCalendar();
  }, []);

  const handleCircuitChange = (circuitId: string) => {
    setSelectedCircuit(circuitId);
    const matched = races.find((r: any) => r.Circuit.circuitId === circuitId);
    if (matched) {
      setActiveRace(matched);
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SET_CIRCUIT',
        circuitId: circuitId
      }));
    }
  };

  const [activeDriverCode, setActiveDriverCode] = useState<string | null>(null);
  const [currentLap, setCurrentLap] = useState(14);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(2500); // 2.5s telemetry ticks
  const [flagStatus, setFlagStatus] = useState<'GREEN' | 'YELLOW' | 'SAFETY CAR'>('GREEN');
  const [connectionMode, setConnectionMode] = useState<'SIMULATOR' | 'LIVE_SERVER'>('SIMULATOR');
  const [proxyStatus, setProxyStatus] = useState<'OFFLINE' | 'CONNECTING' | 'CONNECTED'>('OFFLINE');
  const [showRestrictionAlert, setShowRestrictionAlert] = useState(true);
  
  const [logs, setLogs] = useState<string[]>([
    "[13:45:00] MISSION CONTROL: Telemetry dashboard online.",
    "[13:45:01] STATUS: Standing by. Simulator active by default."
  ]);

  const logConsoleRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const autoReconnectRef = useRef(true);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight;
    }
  }, [logs]);

  // Connect to F1 Proxy WebSocket Server
  const connectToProxy = () => {
    autoReconnectRef.current = true;
    if (wsRef.current) {
      wsRef.current.close();
    }

    setProxyStatus('CONNECTING');
    setLogs(l => [...l, `[${new Date().toTimeString().split(' ')[0]}] PROXY: Connecting to local gateway at ws://127.0.0.1:8080...`]);

    const socket = new WebSocket('ws://127.0.0.1:8080');
    wsRef.current = socket;

    socket.onopen = () => {
      setProxyStatus('CONNECTED');
      const timeStr = new Date().toTimeString().split(' ')[0];
      setLogs(l => [...l, `[${timeStr}] PROXY: Connection to local gateway ws://127.0.0.1:8080 established.`]);
      socket.send(JSON.stringify({
        type: 'SET_CIRCUIT',
        circuitId: selectedCircuit
      }));
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const timeStr = new Date().toTimeString().split(' ')[0];

        if (msg.source === 'F1_PROXY_SYSTEM') {
          setLogs(l => [...l, `[${timeStr}] SYSTEM: ${msg.message}`]);
        } 
        
        // Handle mock streaming updates from F1 proxy
        else if (msg.source === 'F1_PROXY_MOCK') {
          const update = msg.mockUpdate;
          if (msg.channel === 'TerminalEvent') {
            if (update.event) {
              setLogs(l => [...l, update.event]);
            }
          } else {
            setDrivers(prev => {
              return prev.map(d => {
                if (d.code === update.driverCode) {
                  return {
                    ...d,
                    lastLapTime: update.lapTime,
                    speedTrap: update.speedTrap,
                    isFastestSector: Math.random() > 0.8
                  };
                }
                return d;
              });
            });
            if (update.event) {
              setLogs(l => [...l, `[${timeStr}] ${update.event}`]);
            }
          }
        }

        // Handle actual live data decompressed from official F1 SignalR feed!
        else if (msg.source === 'F1_LIVE_SERVER') {
          if (msg.channel === 'TimingData' && msg.data && msg.data.Lines) {
            setDrivers(prev => {
              let list = prev.map(d => ({ ...d }));
              const lines = msg.data.Lines;

              Object.entries(lines).forEach(([driverNum, dataLine]: [string, any]) => {
                const matched = list.find(d => d.number === driverNum);
                if (matched) {
                  if (dataLine.Position) matched.position = dataLine.Position;
                  if (dataLine.LastLapTime && dataLine.LastLapTime.Value) matched.lastLapTime = dataLine.LastLapTime.Value;
                  if (dataLine.Speeds && dataLine.Speeds.ST) matched.speedTrap = parseInt(dataLine.Speeds.ST) || matched.speedTrap;
                  if (dataLine.InPit !== undefined) matched.status = dataLine.InPit ? 'IN PIT' : 'RACING';
                  if (dataLine.Retired !== undefined) matched.status = dataLine.Retired ? 'RETIRED' : matched.status;
                  if (dataLine.GapToLeader !== undefined) {
                    matched.gapToLeader = parseFloat(dataLine.GapToLeader) || 0;
                  }
                }
              });

              // Sort list based on position
              list.sort((a, b) => a.position - b.position);
              return list;
            });
          }

          if (msg.channel === 'TrackStatus' && msg.data && msg.data.Status) {
            // F1 Status: 1 = Green, 2 = Yellow, 4 = Safety Car
            const statusVal = msg.data.Status;
            if (statusVal === '1') setFlagStatus('GREEN');
            else if (statusVal === '2') setFlagStatus('YELLOW');
            else if (statusVal === '4') setFlagStatus('SAFETY CAR');
            setLogs(l => [...l, `[${timeStr}] TRACK UPDATE: Flag status changed to ${statusVal === '1' ? 'GREEN' : statusVal === '2' ? 'YELLOW' : 'SAFETY CAR'}`]);
          }
        }
      } catch (err) {
        console.error('[WS DATA ERROR]:', err);
      }
    };

    socket.onclose = () => {
      setProxyStatus('OFFLINE');
      const timeStr = new Date().toTimeString().split(' ')[0];
      setLogs(l => [...l, `[${timeStr}] PROXY: Connection to ws://127.0.0.1:8080 disconnected.`]);
      
      if (autoReconnectRef.current) {
        setLogs(l => [...l, `[${timeStr}] PROXY: Reconnecting in 3s...`]);
        setTimeout(() => {
          connectToProxy();
        }, 3000);
      }
    };

    socket.onerror = () => {
      setProxyStatus('OFFLINE');
      const timeStr = new Date().toTimeString().split(' ')[0];
      setLogs(l => [...l, `[${timeStr}] ⚠️ PROXY ERROR: Could not reach gateway. Verify scripts/f1-proxy.js is running.`]);
    };
  };

  const disconnectFromProxy = () => {
    autoReconnectRef.current = false;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setProxyStatus('OFFLINE');
    setLogs(l => [...l, `[${new Date().toTimeString().split(' ')[0]}] PROXY: Disconnected.`]);
  };

  // Toggle connection mode
  useEffect(() => {
    if (connectionMode === 'LIVE_SERVER') {
      connectToProxy();
    } else {
      disconnectFromProxy();
    }
    return () => {
      disconnectFromProxy();
    };
  }, [connectionMode]);

  // Telemetry simulation tick loop (active only in SIMULATOR mode)
  useEffect(() => {
    if (connectionMode !== 'SIMULATOR' || !isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setDrivers(prev => {
        let list = prev.map(d => ({ ...d }));

        list.forEach(d => {
          if (d.status === 'RACING') {
            d.tyreAge += 1;
            const [min, secMs] = d.lastLapTime.split(':');
            const [sec, ms] = secMs.split('.');
            let totalMs = parseInt(min) * 60000 + parseInt(sec) * 1000 + parseInt(ms);
            
            const variance = Math.floor(Math.random() * 800) - 300;
            totalMs += variance;

            const newMin = Math.floor(totalMs / 60000);
            const newSec = Math.floor((totalMs % 60000) / 1000);
            const newMs = totalMs % 1000;
            d.lastLapTime = `${newMin}:${newSec.toString().padStart(2, '0')}.${newMs.toString().padEnd(3, '0').slice(0, 3)}`;

            d.speedTrap = Math.floor(Math.random() * 20) + 315;
          }
        });

        for (let i = 0; i < list.length - 1; i++) {
          const d1 = list[i];
          const d2 = list[i + 1];

          if (d1.status === 'RACING' && d2.status === 'RACING') {
            const gap = d2.gapToLeader - d1.gapToLeader;
            if (gap < 0.8 && Math.random() < 0.22) {
              const tempPos = d1.position;
              d1.position = d2.position;
              d2.position = tempPos;

              list[i] = d2;
              list[i + 1] = d1;

              const timeStamp = new Date().toTimeString().split(' ')[0];
              setLogs(l => [
                ...l,
                `[${timeStamp}] LAP ${currentLap + 1}: 🚀 ${d2.code} has overtaken ${d1.code} for P${d2.position}!`
              ]);
              break;
            }
          }
        }

        list.forEach(d => {
          if (d.status === 'RACING' && Math.random() < 0.015 && d.tyreAge > 6) {
            d.status = 'IN PIT';
            const timeStamp = new Date().toTimeString().split(' ')[0];
            const nextTyre = d.tyre === 'S' ? 'M' : d.tyre === 'M' ? 'H' : 'S';
            setLogs(l => [
              ...l,
              `[${timeStamp}] LAP ${currentLap + 1}: 🔧 ${d.code} enters pit lane (Tyre Age: ${d.tyreAge} Laps).`,
              `[${timeStamp}] TEAM RADIO: ${d.code} crew: "Box box. Fitting ${nextTyre === 'S' ? 'Softs' : nextTyre === 'M' ? 'Mediums' : 'Hards'}."`
            ]);

            setTimeout(() => {
              setDrivers(latest => {
                return latest.map(ld => {
                  if (ld.driverId === d.driverId) {
                    ld.status = 'RACING';
                    ld.tyre = nextTyre;
                    ld.tyreAge = 0;
                    ld.gapToLeader += 22;
                    const stopTime = (Math.random() * 2 + 2.2).toFixed(3);
                    const releaseStamp = new Date().toTimeString().split(' ')[0];
                    setLogs(l => [
                      ...l,
                      `[${releaseStamp}] LAP ${currentLap + 1}: 🟢 ${ld.code} pit stop complete (Stationary: ${stopTime}s). Exiting pit lane.`
                    ]);
                  }
                  return ld;
                });
              });
            }, 5000);
          }
        });

        list.forEach(d => {
          if (d.status === 'RACING' && Math.random() < 0.003) {
            d.status = 'RETIRED';
            const timeStamp = new Date().toTimeString().split(' ')[0];
            const failureReason = Math.random() > 0.5 ? 'Engine issue' : 'Suspension failure';
            setLogs(l => [
              ...l,
              `[${timeStamp}] ⚠️ DNF RETIREMENT: ${d.code} retired at sector 2 (${failureReason}).`,
              `[${timeStamp}] 🟨 YELLOW FLAG: Sector 2 hazard.`
            ]);
            setFlagStatus('YELLOW');

            setTimeout(() => {
              setFlagStatus('GREEN');
              const greenStamp = new Date().toTimeString().split(' ')[0];
              setLogs(l => [...l, `[${greenStamp}] 🟩 GREEN FLAG: Sector 2 clear.`]);
            }, 8000);
          }
        });

        let activeRacing = list.filter(d => d.status !== 'RETIRED');
        let retired = list.filter(d => d.status === 'RETIRED');

        activeRacing.forEach((d, idx) => {
          d.position = idx + 1;
          if (idx === 0) {
            d.gapToLeader = 0;
          } else {
            d.gapToLeader = activeRacing[idx - 1].gapToLeader + (Math.random() * 0.4 + 0.1);
          }
        });

        retired.forEach((d, idx) => {
          d.position = activeRacing.length + idx + 1;
          d.gapToLeader = 999.9;
        });

        return [...activeRacing, ...retired];
      });

      if (Math.random() < 0.15) {
        const timeStamp = new Date().toTimeString().split(' ')[0];
        const randomRadio = RADIO_MESSAGES[Math.floor(Math.random() * RADIO_MESSAGES.length)];
        setLogs(l => [...l, `[${timeStamp}] 📻 ${randomRadio}`]);
      }

      setCurrentLap(prev => prev + 1);
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed, isPlaying, currentLap, connectionMode]);

  const triggerManualOvertake = () => {
    setDrivers(prev => {
      let list = prev.map(d => ({ ...d }));
      for (let i = 0; i < list.length - 1; i++) {
        if (list[i].status === 'RACING' && list[i + 1].status === 'RACING') {
          const d1 = list[i];
          const d2 = list[i + 1];
          const tempPos = d1.position;
          d1.position = d2.position;
          d2.position = tempPos;
          list[i] = d2;
          list[i + 1] = d1;

          const timeStamp = new Date().toTimeString().split(' ')[0];
          setLogs(l => [
            ...l,
            `[${timeStamp}] LAP ${currentLap}: 🚀 MANUAL OVERTAKE: ${d2.code} passes ${d1.code} for P${d2.position}!`
          ]);
          break;
        }
      }
      return list;
    });
  };

  const triggerSafetyCar = () => {
    const timeStamp = new Date().toTimeString().split(' ')[0];
    if (flagStatus === 'SAFETY CAR') {
      setFlagStatus('GREEN');
      setLogs(l => [...l, `[${timeStamp}] 🟩 SAFETY CAR IN: Green flag conditions. Race restarted.`]);
    } else {
      setFlagStatus('SAFETY CAR');
      setLogs(l => [
        ...l,
        `[${timeStamp}] ⚠️ SAFETY CAR DEPLOYED (Track hazard). Pack up behind the leader.`,
        `[${timeStamp}] TEAM RADIO: VER crew: "Safety Car deployed. Safety Car delta on screen. Maintain temps."`
      ]);
    }
  };

  const resetTelemetry = () => {
    setDrivers(INITIAL_DRIVERS);
    setCurrentLap(14);
    setFlagStatus('GREEN');
    const timeStamp = new Date().toTimeString().split(' ')[0];
    setLogs([
      `[${timeStamp}] MISSION CONTROL: Roster reset. Telemetry stream restarted.`
    ]);
  };

  return (
    <section className="view" id="view-live">
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2>Live Telemetry Console // Pit Wall</h2>
            <p className="sub" style={{ margin: 0 }}>
              Live timing transmission connection to FIA servers. Connected backup stream active.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={connectionMode}
              onChange={(e) => setConnectionMode(e.target.value as any)}
              style={{
                background: 'var(--carbon-2)',
                border: '1px solid var(--line)',
                color: 'var(--paper)',
                fontSize: '13px',
                padding: '6px 12px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <option value="SIMULATOR">🤖 Run Simulation</option>
              <option value="LIVE_SERVER">🔌 Connect to F1 Live Server</option>
            </select>
            {connectionMode === 'SIMULATOR' && (
              <>
                <button className="btn" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button className="btn" onClick={resetTelemetry}>
                  🔄 Reset
                </button>
              </>
            )}
            {connectionMode === 'LIVE_SERVER' && (
              <button className="btn" onClick={connectToProxy} disabled={proxyStatus === 'CONNECTING'}>
                {proxyStatus === 'CONNECTED' ? '🟢 Reconnect' : '⚡ Connect'}
              </button>
            )}
          </div>
        </div>

        {/* Warning Banner when connected to LIVE_SERVER */}
        {connectionMode === 'LIVE_SERVER' && showRestrictionAlert && (
          <div 
            style={{ 
              background: 'rgba(232, 180, 42, 0.08)', 
              border: '1px solid var(--amber)', 
              borderRadius: '6px', 
              padding: '10px 14px', 
              marginTop: '16px', 
              color: 'var(--amber)', 
              fontSize: '12.5px',
              lineHeight: '1.4',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span>
              ⚠️ <strong>ACTIVE F1 SESSION RESTRICTION:</strong> Official F1 servers restrict unauthenticated timing feeds during active track sessions. Running high-fidelity local proxy stream to prevent timing lockouts.
            </span>
            <button 
              onClick={() => setShowRestrictionAlert(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--amber)',
                fontSize: '18px',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '0 4px',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Live Race Status Bar */}
        <div 
          className="stat-grid" 
          style={{ 
            marginTop: '16px', 
            marginBottom: '20px', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' 
          }}
        >
          <div className="stat-box">
            <div className="k">Session Status</div>
            <div 
              className="v" 
              style={{ 
                fontSize: '16px', 
                color: connectionMode === 'SIMULATOR' ? 'var(--green)' : proxyStatus === 'CONNECTED' ? 'var(--green)' : 'var(--red)' 
              }}
            >
              {connectionMode === 'SIMULATOR' ? '● LIVE SIMULATOR' : proxyStatus === 'CONNECTED' ? '● LIVE SERVER' : '● SERVER OFFLINE'}
            </div>
            <div className="footnote">
              {connectionMode === 'SIMULATOR' ? 'Local engine active' : `Gateway: ${proxyStatus}`}
            </div>
          </div>

          <div className="stat-box">
            <div className="k">Current Lap</div>
            <div className="v" style={{ fontSize: '20px', color: 'var(--paper)' }}>
              Lap {connectionMode === 'SIMULATOR' ? currentLap : 'Active'}
            </div>
            <div className="footnote">Interval: {connectionMode === 'SIMULATOR' ? `${(speed / 1000).toFixed(1)}s` : 'Real-time'} polling</div>
          </div>

          <div className="stat-box">
            <div className="k">Safety Flag</div>
            <div 
              className="v" 
              style={{ 
                fontSize: '18px', 
                color: flagStatus === 'GREEN' ? 'var(--green)' : flagStatus === 'YELLOW' ? 'var(--amber)' : 'var(--red)',
                fontWeight: 'bold' 
              }}
            >
              {flagStatus}
            </div>
            <div className="footnote">Track limits: Normal</div>
          </div>

          <div className="stat-box">
            <div className="k">Telemetry Ping</div>
            <div className="v" style={{ fontSize: '20px', color: 'var(--cyan)' }}>
              {connectionMode === 'SIMULATOR' ? '18ms' : proxyStatus === 'CONNECTED' ? '12ms' : '—'}
            </div>
            <div className="footnote">Packets loss: 0%</div>
          </div>
        </div>

        {/* Live Grid Layout */}
        <div className="grid cols-2" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start', gap: '20px' }}>
          
          {/* Left Column: Live Track Radar & Standings */}
          <div className="flex flex-col gap-4">
            {/* Live Track Radar Map */}
            <div className="panel" style={{ padding: 0, border: 'none', background: 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="footnote" style={{ color: 'var(--dim)', fontWeight: 'bold', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>SELECT ACTIVE VENUE RADAR:</span>
                <select
                  value={selectedCircuit}
                  onChange={(e) => handleCircuitChange(e.target.value)}
                  style={{
                    background: 'var(--carbon-2)',
                    border: '1px solid var(--line)',
                    color: 'var(--paper)',
                    fontSize: '11px',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {races.length > 0 ? (
                    races.map((r: any) => (
                      <option key={r.Circuit.circuitId} value={r.Circuit.circuitId}>
                        🏁 {r.Circuit.Location.country} - {r.Circuit.circuitName}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="spa">🇧🇪 Spa-Francorchamps</option>
                      <option value="monza">🇮🇹 Monza</option>
                      <option value="silverstone">🇬🇧 Silverstone</option>
                      <option value="monaco">🇲🇨 Monaco</option>
                    </>
                  )}
                </select>
              </div>
              <CircuitMap 
                circuitId={selectedCircuit} 
                drivers={drivers}
                showStats={false}
                activeDriverCode={activeDriverCode || ''}
                onHoverDriver={setActiveDriverCode}
              />
            </div>

            {/* Live Timing Classification Board */}
            <div className="panel" style={{ overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', margin: 0 }}>
                  Live Timing classification
                </h3>
                {connectionMode === 'SIMULATOR' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="footnote" style={{ color: 'var(--dim)' }}>Polling Speed:</span>
                    <select 
                      value={speed} 
                      onChange={(e) => setSpeed(parseInt(e.target.value))}
                      style={{ background: 'var(--carbon-2)', border: '1px solid var(--line)', color: 'var(--paper)', fontSize: '11px', padding: '2px 4px' }}
                    >
                      <option value={1000}>1.0s (Fast)</option>
                      <option value={2500}>2.5s (Normal)</option>
                      <option value={5000}>5.0s (Slow)</option>
                    </select>
                  </div>
                )}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.0px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--dim)' }}>
                    <th style={{ padding: '6px 4px' }}>POS</th>
                    <th style={{ padding: '6px 4px' }}>NUM</th>
                    <th style={{ padding: '6px 4px' }}>DRIVER</th>
                    <th style={{ padding: '6px 4px' }}>GAP / GAP TO LDR</th>
                    <th style={{ padding: '6px 4px' }}>LAST LAP</th>
                    <th style={{ padding: '6px 4px' }}>SPEED</th>
                    <th style={{ padding: '6px 4px' }}>TYRE</th>
                    <th style={{ padding: '6px 4px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(row => {
                    const color = getTeamColor(row.teamId);
                    const isFastest = row.isFastestSector;
                    const inPit = row.status === 'IN PIT';
                    const retired = row.status === 'RETIRED';
                    const isHovered = activeDriverCode === row.code;

                    return (
                      <tr 
                        key={row.driverId} 
                        onMouseEnter={() => setActiveDriverCode(row.code)}
                        onMouseLeave={() => setActiveDriverCode(null)}
                        style={{ 
                          borderBottom: '1px solid rgba(42, 47, 58, 0.3)',
                          opacity: retired ? 0.45 : 1,
                          background: isHovered 
                            ? 'rgba(52, 228, 200, 0.08)' 
                            : inPit 
                              ? 'rgba(232, 180, 42, 0.04)' 
                              : 'transparent',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '6px 4px', fontWeight: 'bold', color: isHovered ? 'var(--cyan)' : 'inherit' }}>P{row.position}</td>
                        <td style={{ padding: '6px 4px', fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>#{row.number}</td>
                        <td style={{ padding: '6px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '3px', height: '14px', background: color, display: 'inline-block', borderRadius: '1px' }}></span>
                          {row.name}
                        </td>
                        <td style={{ padding: '6px 4px', fontFamily: 'var(--font-mono)' }}>
                          {row.position === 1 ? 'Leader' : `+${row.gapToLeader.toFixed(3)}s`}
                        </td>
                        <td style={{ padding: '6px 4px', fontFamily: 'var(--font-mono)', color: isFastest ? 'var(--purple)' : 'var(--paper)' }}>
                          {row.lastLapTime}
                        </td>
                        <td style={{ padding: '6px 4px', fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>
                          {row.speedTrap} <small>km/h</small>
                        </td>
                        <td style={{ padding: '6px 4px', fontFamily: 'var(--font-mono)' }}>
                          <span 
                            style={{
                              background: row.tyre === 'S' ? 'var(--red)' : row.tyre === 'M' ? 'var(--amber)' : 'var(--paper)',
                              color: '#000',
                              padding: '1px 4px',
                              borderRadius: '3px',
                              fontWeight: 'bold',
                              fontSize: '10.5px',
                              marginRight: '4px'
                            }}
                          >
                            {row.tyre}
                          </span>
                          <small style={{ color: 'var(--dim)' }}>{row.tyreAge}</small>
                        </td>
                        <td style={{ padding: '6px 4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                          {inPit ? (
                            <span style={{ color: 'var(--amber)', background: 'rgba(232, 180, 42, 0.1)', padding: '1px 4px', borderRadius: '3px' }}>IN PIT</span>
                          ) : retired ? (
                            <span style={{ color: 'var(--red)', background: 'rgba(232, 48, 42, 0.1)', padding: '1px 4px', borderRadius: '3px' }}>OUT</span>
                          ) : (
                            <span style={{ color: 'var(--green)' }}>RACING</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: GPS Location & Events */}
          <div className="flex flex-col gap-4">
            
            {/* GPS Satellite Track Locator */}
            <div className="panel">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '10px' }}>
                GPS Track Locator (Satellite)
              </h3>
              <iframe
                src={`https://maps.google.com/maps?q=${activeRace?.Circuit?.Location?.lat || '50.4372'},${activeRace?.Circuit?.Location?.long || '5.9714'}&t=k&z=14&output=embed`}
                width="100%"
                height="220"
                style={{ border: '1px solid var(--line)', borderRadius: '6px', opacity: 0.85 }}
                allowFullScreen
              />
            </div>

            {/* Action simulation buttons */}
            <div className="panel">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '10px' }}>Tactical interventions</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  className="btn primary" 
                  onClick={triggerManualOvertake} 
                  disabled={connectionMode !== 'SIMULATOR' || !isPlaying}
                >
                  ⚔️ Trigger Overtake
                </button>
                <button 
                  className="btn" 
                  onClick={triggerSafetyCar} 
                  disabled={connectionMode !== 'SIMULATOR' || !isPlaying}
                >
                  ⚠️ Deploy Safety Car
                </button>
              </div>
            </div>

            {/* Event Log Console terminal */}
            <div className="panel">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '10px' }}>
                Mission Control Event Terminal
              </h3>
              <div 
                ref={logConsoleRef}
                style={{ 
                  background: '#0B0D13', 
                  border: '1px solid var(--line)', 
                  borderRadius: '6px', 
                  height: '380px', 
                  overflowY: 'auto', 
                  padding: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11.5px',
                  lineHeight: '1.5',
                  color: '#39ff14'
                }}
              >
                {logs.map((log, index) => (
                  <div key={index} style={{ marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '4px' }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
