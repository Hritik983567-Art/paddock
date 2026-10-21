'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTeamColor, getJSON, API_BASE } from '../utils/api';
import CircuitMap from '../components/CircuitMap';
import { TRACKS_REGISTRY, getTrackDefinition } from '../lib/tracksRegistry';

export interface SectorData {
  value: string;
  isPersonalFastest?: boolean;
  isOverallFastest?: boolean;
}

export interface LiveWeatherData {
  airTemp?: string;
  trackTemp?: string;
  humidity?: string;
  pressure?: string;
  windSpeed?: string;
  windDirection?: string;
  rainfall?: string;
}

interface LiveDriver {
  driverId: string;
  code: string;
  name: string;
  number: string;
  teamId: string;
  teamName: string;
  position: number;
  gapToLeader: number; // seconds
  intervalToAhead?: number; // seconds to car directly ahead
  lastLapTime: string;
  bestLapTime?: string;
  isFastestSector: boolean;
  isFastestLap?: boolean;
  sector1?: SectorData;
  sector2?: SectorData;
  sector3?: SectorData;
  speedTrap: number; // km/h
  tyre: 'S' | 'M' | 'H' | 'I' | 'W';
  tyreAge: number;
  status: 'RACING' | 'IN PIT' | 'OUT' | 'RETIRED';
  pitStops?: number;
}

function formatLapTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}


function getTyreBadgeStyle(compound: string) {
  switch (compound) {
    case 'S':
      return {
        bg: '#E10600',
        text: '#FFFFFF',
        border: 'rgba(255, 60, 60, 0.7)',
        glow: 'rgba(225, 6, 0, 0.45)'
      };
    case 'M':
      return {
        bg: '#FFB800',
        text: '#0C0E12',
        border: 'rgba(255, 184, 0, 0.8)',
        glow: 'rgba(255, 184, 0, 0.45)'
      };
    case 'H':
      return {
        bg: '#FFFFFF',
        text: '#0C0E12',
        border: 'rgba(255, 255, 255, 0.9)',
        glow: 'rgba(255, 255, 255, 0.3)'
      };
    case 'I':
      return {
        bg: '#00D2BE',
        text: '#0C0E12',
        border: 'rgba(0, 210, 190, 0.8)',
        glow: 'rgba(0, 210, 190, 0.4)'
      };
    case 'W':
      return {
        bg: '#2563EB',
        text: '#FFFFFF',
        border: 'rgba(37, 99, 235, 0.8)',
        glow: 'rgba(37, 99, 235, 0.4)'
      };
    default:
      return {
        bg: '#FFB800',
        text: '#0C0E12',
        border: 'rgba(255, 184, 0, 0.8)',
        glow: 'rgba(255, 184, 0, 0.45)'
      };
  }
}



export interface CompetitiveSession {
  id: 'sprint_qualifying' | 'sprint_race' | 'qualifying' | 'race';
  name: string;
  shortName: string;
  badge: string;
  icon: string;
  rawDate: string | null;
  dateStr: string;
  timeStr: string;
  startTimeUtc: string | null;
  endTimeUtc: string | null;
  status: 'LIVE' | 'UPCOMING' | 'COMPLETED' | 'NOT_SCHEDULED';
  durationMinutes: number;
  startMs: number | null;
  endMs: number | null;
}

function parseCompetitiveSessions(race: any, nowDate = new Date()): CompetitiveSession[] {
  if (!race) return [];

  const configs: Array<{
    id: 'sprint_qualifying' | 'sprint_race' | 'qualifying' | 'race';
    name: string;
    shortName: string;
    badge: string;
    icon: string;
    raw: { date?: string; time?: string } | undefined;
    duration: number;
  }> = [
    {
      id: 'sprint_qualifying',
      name: 'Sprint Qualifying',
      shortName: 'SPRINT QUALI',
      badge: 'SQ',
      icon: '⏱️',
      raw: race.SprintQualifying || race.SprintShootout,
      duration: 45
    },
    {
      id: 'sprint_race',
      name: 'Sprint Race',
      shortName: 'SPRINT RACE',
      badge: 'SPRINT',
      icon: '⚡',
      raw: race.Sprint,
      duration: 60
    },
    {
      id: 'qualifying',
      name: 'Qualifying',
      shortName: 'QUALIFYING',
      badge: 'QUALI',
      icon: '🏁',
      raw: race.Qualifying,
      duration: 60
    },
    {
      id: 'race',
      name: 'Grand Prix (Race)',
      shortName: 'GRAND PRIX',
      badge: 'RACE',
      icon: '🏆',
      raw: race.date ? { date: race.date, time: race.time } : undefined,
      duration: 120
    }
  ];

  return configs.map(c => {
    if (!c.raw || !c.raw.date) {
      return {
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        badge: c.badge,
        icon: c.icon,
        rawDate: null,
        status: 'NOT_SCHEDULED',
        dateStr: 'Not Scheduled',
        timeStr: '—',
        startTimeUtc: null,
        endTimeUtc: null,
        durationMinutes: c.duration,
        startMs: null,
        endMs: null
      };
    }

    const isoString = c.raw.time 
      ? (c.raw.time.endsWith('Z') ? `${c.raw.date}T${c.raw.time}` : `${c.raw.date}T${c.raw.time}Z`)
      : `${c.raw.date}T12:00:00Z`;

    const startMs = Date.parse(isoString);
    const endMs = startMs + c.duration * 60 * 1000;
    const nowMs = nowDate.getTime();

    let status: 'LIVE' | 'UPCOMING' | 'COMPLETED' | 'NOT_SCHEDULED' = 'UPCOMING';
    if (nowMs >= startMs && nowMs <= endMs) {
      status = 'LIVE';
    } else if (nowMs > endMs) {
      status = 'COMPLETED';
    }

    const d = new Date(startMs);
    const dateFormatted = d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeFormatted = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      id: c.id,
      name: c.name,
      shortName: c.shortName,
      badge: c.badge,
      icon: c.icon,
      rawDate: c.raw.date,
      status,
      dateStr: dateFormatted,
      timeStr: timeFormatted,
      startTimeUtc: isoString,
      endTimeUtc: new Date(endMs).toISOString(),
      durationMinutes: c.duration,
      startMs,
      endMs
    };
  });
}

function isTodayCompetitiveDay(sessions: CompetitiveSession[], nowDate = new Date()): boolean {
  const localYear = nowDate.getFullYear();
  const localMonth = String(nowDate.getMonth() + 1).padStart(2, '0');
  const localDay = String(nowDate.getDate()).padStart(2, '0');
  const localDateStr = `${localYear}-${localMonth}-${localDay}`;
  const utcDateStr = nowDate.toISOString().split('T')[0];

  return sessions.some(s => {
    if (!s.rawDate) return false;
    if (s.rawDate === localDateStr || s.rawDate === utcDateStr) return true;
    if (s.status === 'LIVE') return true;
    return false;
  });
}

function formatCountdown(targetMs: number, nowMs = Date.now()): string {
  const diff = targetMs - nowMs;
  if (diff <= 0) return '0m 00s';
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}



const ALL_CIRCUITS_ROSTER = [
  { id: 'monza', name: 'Autodromo Nazionale Monza', flag: '🇮🇹', country: 'Italy' },
  { id: 'silverstone', name: 'Silverstone Circuit', flag: '🇬🇧', country: 'Great Britain' },
  { id: 'spa', name: 'Circuit de Spa-Francorchamps', flag: '🇧🇪', country: 'Belgium' },
  { id: 'monaco', name: 'Circuit de Monaco', flag: '🇲🇨', country: 'Monaco' },
  { id: 'suzuka', name: 'Suzuka International Racing Course', flag: '🇯🇵', country: 'Japan' },
  { id: 'bahrain', name: 'Bahrain International Circuit', flag: '🇧🇭', country: 'Bahrain' },
  { id: 'jeddah', name: 'Jeddah Corniche Circuit', flag: '🇸🇦', country: 'Saudi Arabia' },
  { id: 'albert_park', name: 'Albert Park Circuit', flag: '🇦🇺', country: 'Australia' },
  { id: 'shanghai', name: 'Shanghai International Circuit', flag: '🇨🇳', country: 'China' },
  { id: 'miami', name: 'Miami International Autodrome', flag: '🇺🇸', country: 'United States' },
  { id: 'imola', name: 'Autodromo Enzo e Dino Ferrari (Imola)', flag: '🇮🇹', country: 'Italy' },
  { id: 'catalunya', name: 'Circuit de Barcelona-Catalunya', flag: '🇪🇸', country: 'Spain' },
  { id: 'villeneuve', name: 'Circuit Gilles Villeneuve', flag: '🇨🇦', country: 'Canada' },
  { id: 'red_bull_ring', name: 'Red Bull Ring', flag: '🇦🇹', country: 'Austria' },
  { id: 'hungaroring', name: 'Hungaroring', flag: '🇭🇺', country: 'Hungary' },
  { id: 'zandvoort', name: 'Circuit Zandvoort', flag: '🇳🇱', country: 'Netherlands' },
  { id: 'baku', name: 'Baku City Circuit', flag: '🇦🇿', country: 'Azerbaijan' },
  { id: 'marina_bay', name: 'Marina Bay Street Circuit', flag: '🇸🇬', country: 'Singapore' },
  { id: 'americas', name: 'Circuit of the Americas (COTA)', flag: '🇺🇸', country: 'United States' },
  { id: 'rodriguez', name: 'Autódromo Hermanos Rodríguez', flag: '🇲🇽', country: 'Mexico' },
  { id: 'interlagos', name: 'Autódromo José Carlos Pace (Interlagos)', flag: '🇧🇷', country: 'Brazil' },
  { id: 'vegas', name: 'Las Vegas Strip Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'las_vegas', name: 'Las Vegas Street Circuit (Caesars Palace GP)', flag: '🇺🇸', country: 'United States' },
  { id: 'madring', name: 'Madring Circuit (Madrid)', flag: '🇪🇸', country: 'Spain' },
  { id: 'losail', name: 'Lusail International Circuit', flag: '🇶🇦', country: 'Qatar' },
  { id: 'yas_marina', name: 'Yas Marina Circuit', flag: '🇦🇪', country: 'Abu Dhabi' },
  // HISTORIC & RETRO F1 CIRCUITS
  { id: 'nurburgring', name: 'Nürburgring Nordschleife & GP-Strecke', flag: '🇩🇪', country: 'Germany' },
  { id: 'hockenheimring', name: 'Hockenheimring Baden-Württemberg', flag: '🇩🇪', country: 'Germany' },
  { id: 'sepang', name: 'Sepang International Circuit', flag: '🇲🇾', country: 'Malaysia' },
  { id: 'indianapolis', name: 'Indianapolis Motor Speedway (IMS)', flag: '🇺🇸', country: 'United States' },
  { id: 'kyalami', name: 'Kyalami Grand Prix Circuit', flag: '🇿🇦', country: 'South Africa' },
  { id: 'brands_hatch', name: 'Brands Hatch Circuit', flag: '🇬🇧', country: 'Great Britain' },
  { id: 'fuji', name: 'Fuji Speedway', flag: '🇯🇵', country: 'Japan' },
  { id: 'istanbul', name: 'Intercity Istanbul Park', flag: '🇹🇷', country: 'Turkey' },
  { id: 'ricard', name: 'Circuit Paul Ricard (Le Castellet)', flag: '🇫🇷', country: 'France' },
  { id: 'portimao', name: 'Autódromo Internacional do Algarve (Portimão)', flag: '🇵🇹', country: 'Portugal' },
  { id: 'mugello', name: 'Autodromo Internazionale del Mugello', flag: '🇮🇹', country: 'Italy' },
  { id: 'sochi', name: 'Sochi Autodrom', flag: '🇷🇺', country: 'Russia' },
  { id: 'magny_cours', name: 'Circuit de Nevers Magny-Cours', flag: '🇫🇷', country: 'France' },
  { id: 'estoril', name: 'Autódromo do Estoril', flag: '🇵🇹', country: 'Portugal' },
  { id: 'adelaide', name: 'Adelaide Street Circuit', flag: '🇦🇺', country: 'Australia' },
  { id: 'buddh', name: 'Buddh International Circuit (Greater Noida)', flag: '🇮🇳', country: 'India' },
  { id: 'yeongam', name: 'Korean International Circuit (Yeongam)', flag: '🇰🇷', country: 'South Korea' },
  { id: 'valencia', name: 'Valencia Street Circuit', flag: '🇪🇸', country: 'Spain' },
  { id: 'watkins_glen', name: 'Watkins Glen International', flag: '🇺🇸', country: 'United States' },
  { id: 'zolder', name: 'Circuit Zolder', flag: '🇧🇪', country: 'Belgium' },
  { id: 'donington', name: 'Donington Park', flag: '🇬🇧', country: 'Great Britain' },
  { id: 'jerez', name: 'Circuito de Jerez-Ángel Nieto', flag: '🇪🇸', country: 'Spain' },
  { id: 'jarama', name: 'Circuito del Jarama', flag: '🇪🇸', country: 'Spain' },
  { id: 'long_beach', name: 'Long Beach Street Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'detroit', name: 'Detroit Street Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'dallas', name: 'Fair Park Dallas Grand Prix Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'phoenix', name: 'Phoenix Street Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'riverside', name: 'Riverside International Raceway', flag: '🇺🇸', country: 'United States' },
  { id: 'sebring', name: 'Sebring International Raceway', flag: '🇺🇸', country: 'United States' },
  { id: 'mosport', name: 'Mosport International Raceway (Canadian Tire Motorsport Park)', flag: '🇨🇦', country: 'Canada' },
  { id: 'tremblant', name: 'Circuit Mont-Tremblant', flag: '🇨🇦', country: 'Canada' },
  { id: 'galvez', name: 'Autódromo Juan y Oscar Gálvez (Buenos Aires)', flag: '🇦🇷', country: 'Argentina' },
  { id: 'jacarepagua', name: 'Autódromo Internacional Nelson Piquet (Jacarepaguá)', flag: '🇧🇷', country: 'Brazil' },
  { id: 'george', name: 'Prince George Circuit (East London)', flag: '🇿🇦', country: 'South Africa' },
  { id: 'ain-diab', name: 'Ain-Diab Circuit (Casablanca)', flag: '🇲🇦', country: 'Morocco' },
  { id: 'aintree', name: 'Aintree Motor Racing Circuit', flag: '🇬🇧', country: 'Great Britain' },
  { id: 'anderstorp', name: 'Scandinavian Raceway (Anderstorp)', flag: '🇸🇪', country: 'Sweden' },
  { id: 'avus', name: 'Automobil-Verkehrs- und Übungsstraße (AVUS)', flag: '🇩🇪', country: 'Germany' },
  { id: 'boavista', name: 'Circuito da Boavista (Porto)', flag: '🇵🇹', country: 'Portugal' },
  { id: 'bremgarten', name: 'Circuit Bremgarten (Bern)', flag: '🇨🇭', country: 'Switzerland' },
  { id: 'charade', name: 'Charade Circuit (Circuit Louis Rosier)', flag: '🇫🇷', country: 'France' },
  { id: 'dijon', name: 'Circuit de Dijon-Prenois', flag: '🇫🇷', country: 'France' },
  { id: 'essarts', name: 'Rouen-Les-Essarts', flag: '🇫🇷', country: 'France' },
  { id: 'lemans', name: 'Circuit de la Sarthe / Bugatti (Le Mans)', flag: '🇫🇷', country: 'France' },
  { id: 'reims', name: 'Reims-Gueux', flag: '🇫🇷', country: 'France' },
  { id: 'monsanto', name: 'Monsanto Park Circuit (Lisbon)', flag: '🇵🇹', country: 'Portugal' },
  { id: 'montjuic', name: 'Montjuïc Circuit (Barcelona)', flag: '🇪🇸', country: 'Spain' },
  { id: 'pedralbes', name: 'Pedralbes Circuit (Barcelona)', flag: '🇪🇸', country: 'Spain' },
  { id: 'pescara', name: 'Pescara Circuit (Coppa Acerbo)', flag: '🇮🇹', country: 'Italy' },
  { id: 'nivelles', name: 'Nivelles-Baulers', flag: '🇧🇪', country: 'Belgium' },
  { id: 'okayama', name: 'TI Circuit Okayama (Aida)', flag: '🇯🇵', country: 'Japan' },
  { id: 'zeltweg', name: 'Zeltweg Airfield Circuit', flag: '🇦🇹', country: 'Austria' }
];

export default function LiveTelemetryPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const driversRef = useRef<LiveDriver[]>([]);
  const flushRafRef = useRef<number | null>(null);

  const scheduleDriverFlush = () => {
    if (flushRafRef.current !== null) return;
    flushRafRef.current = requestAnimationFrame(() => {
      flushRafRef.current = null;
      setDrivers([...driversRef.current]);
    });
  };

  useEffect(() => {
    return () => {
      if (flushRafRef.current !== null) {
        cancelAnimationFrame(flushRafRef.current);
      }
    };
  }, []);

  const [selectedCircuit, setSelectedCircuit] = useState('marina_bay');
  const userChangedCircuitRef = useRef(false);
  const selectedCircuitRef = useRef('marina_bay');

  const currentTrackDef = getTrackDefinition(selectedCircuit);
  const currentCircuitInfo = ALL_CIRCUITS_ROSTER.find(c => c.id === selectedCircuit);
  const currentVenueName = currentCircuitInfo?.name || currentTrackDef?.name || selectedCircuit.toUpperCase();
  const currentCountryName = currentCircuitInfo?.country || currentTrackDef?.country || '';
  const totalLaps = currentTrackDef?.laps || 62;

  // Calendar & Competitive Sessions
  const [calendarRaces, setCalendarRaces] = useState<any[]>([]);
  const activeRaceDataRef = useRef<any>(null);
  const [sessions, setSessions] = useState<CompetitiveSession[]>([]);
  const [activeDriverCode, setActiveDriverCode] = useState<string | null>(null);
  const [currentLap, setCurrentLap] = useState<number | string>('—');
  const [flagStatus, setFlagStatus] = useState<'GREEN' | 'YELLOW' | 'SAFETY CAR' | 'RED FLAG'>('GREEN');
  const [proxyStatus, setProxyStatus] = useState<'OFFLINE' | 'CONNECTING' | 'CONNECTED' | 'STANDBY'>('OFFLINE');
  const [isLiveTransmitting, setIsLiveTransmitting] = useState(false);
  const [showNoticeAlert, setShowNoticeAlert] = useState(true);
  const [gapDisplayMode, setGapDisplayMode] = useState<'dual' | 'gap' | 'interval'>('dual');
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);

  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toTimeString().split(' ')[0]}] MISSION CONTROL: Pit-wall telemetry uplink initialized.`,
    `[${new Date().toTimeString().split(' ')[0]}] TELEMETRY POLICY: Telemetry stream activates strictly on Sprint Quali, Sprint Race, Quali, and Race.`
  ]);

  const logConsoleRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight;
    }
  }, [logs]);

  // Fetch current calendar races on mount
  useEffect(() => {
    async function loadCalendar() {
      try {
        const res = await getJSON(`${API_BASE}/current.json`) as { MRData?: { RaceTable?: { Races?: Record<string, unknown>[] } } };
        const list = res?.MRData?.RaceTable?.Races || [];
        setCalendarRaces(list);

        if (list.length > 0 && !userChangedCircuitRef.current) {
          const today = new Date().toISOString().split('T')[0];
          const activeRace = (list.find((r: any) => r.date === today) 
            || list.find((r: any) => r.date >= today)
            || list[list.length - 1]);

          activeRaceDataRef.current = activeRace;

          const rawCircuitId = (activeRace as any)?.Circuit?.circuitId?.toLowerCase();
          if (rawCircuitId) {
            const resolvedId = ALL_CIRCUITS_ROSTER.find(c => 
              c.id === rawCircuitId || 
              c.id === rawCircuitId.replace(/-/g, '_') ||
              rawCircuitId.includes(c.id) ||
              c.id.includes(rawCircuitId)
            )?.id || (rawCircuitId === 'singapore' ? 'marina_bay' : rawCircuitId);
            
            setSelectedCircuit(resolvedId);
            selectedCircuitRef.current = resolvedId;

            const parsed = parseCompetitiveSessions(activeRace);
            setSessions(parsed);

            const raceName = (activeRace as any)?.raceName || resolvedId.toUpperCase();
            const timeStr = new Date().toTimeString().split(' ')[0];
            setLogs(l => [
              ...l,
              `[${timeStr}] 🏁 CALENDAR RADAR SYNC: Locked to ${raceName}. Competitive session timetable synchronized.`
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load calendar for live console:', err);
      }
    }
    loadCalendar();
  }, []);

  const handleCircuitChange = (circuitId: string) => {
    userChangedCircuitRef.current = true;
    selectedCircuitRef.current = circuitId;
    setSelectedCircuit(circuitId);

    const circuitInfo = ALL_CIRCUITS_ROSTER.find(c => c.id === circuitId);
    const trackDef = getTrackDefinition(circuitId);
    const venueName = circuitInfo?.name || trackDef?.name || circuitId.toUpperCase();
    const countryName = circuitInfo?.country || trackDef?.country || '';

    // Try finding matching race in calendar for this circuit
    const matchedRace = calendarRaces.find((r: any) => {
      const cid = r.Circuit?.circuitId?.toLowerCase() || '';
      return cid === circuitId || cid === circuitId.replace(/_/g, '-') || circuitId.includes(cid);
    });

    if (matchedRace) {
      activeRaceDataRef.current = matchedRace;
      setSessions(parseCompetitiveSessions(matchedRace));
    } else {
      activeRaceDataRef.current = null;
      setSessions([
        { id: 'sprint_qualifying', name: 'Sprint Qualifying', shortName: 'SPRINT QUALI', badge: 'SQ', icon: '⏱️', rawDate: null, status: 'NOT_SCHEDULED', dateStr: 'Not Scheduled', timeStr: '—', startTimeUtc: null, endTimeUtc: null, durationMinutes: 45, startMs: null, endMs: null },
        { id: 'sprint_race', name: 'Sprint Race', shortName: 'SPRINT RACE', badge: 'SPRINT', icon: '⚡', rawDate: null, status: 'NOT_SCHEDULED', dateStr: 'Not Scheduled', timeStr: '—', startTimeUtc: null, endTimeUtc: null, durationMinutes: 60, startMs: null, endMs: null },
        { id: 'qualifying', name: 'Qualifying', shortName: 'QUALIFYING', badge: 'QUALI', icon: '🏁', rawDate: null, status: 'NOT_SCHEDULED', dateStr: 'Track Benchmark', timeStr: '14:00', startTimeUtc: null, endTimeUtc: null, durationMinutes: 60, startMs: null, endMs: null },
        { id: 'race', name: 'Grand Prix (Race)', shortName: 'GRAND PRIX', badge: 'RACE', icon: '🏆', rawDate: null, status: 'NOT_SCHEDULED', dateStr: 'Track Benchmark', timeStr: '15:00', startTimeUtc: null, endTimeUtc: null, durationMinutes: 120, startMs: null, endMs: null }
      ]);
    }

    const timeStamp = new Date().toTimeString().split(' ')[0];
    setLogs(l => [
      ...l,
      `[${timeStamp}] 🏁 VENUE RADAR SYNCHRONIZED: Switched to ${venueName}${countryName ? ` (${countryName})` : ''}. Standing by for session telemetry uplink.`
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SET_CIRCUIT',
        circuitId: circuitId
      }));
    }
  };

  // Real-time 1s session scheduler ticker (NO fake simulation, strictly updates session times)
  useEffect(() => {
    const ticker = setInterval(() => {
      if (activeRaceDataRef.current) {
        setSessions(parseCompetitiveSessions(activeRaceDataRef.current));
      }
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  // Connect to F1 Proxy WebSocket Server
  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setProxyStatus('CONNECTING');
    try {
      const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1';
      const socket = new WebSocket(`ws://${host}:8080`);
      wsRef.current = socket;

      socket.onopen = () => {
        setProxyStatus('CONNECTED');
        const timeStr = new Date().toTimeString().split(' ')[0];
        setLogs(l => [...l, `[${timeStr}] TELEMETRY: Pit-wall telemetry uplink synchronized on ws://${host}:8080.`]);
        socket.send(JSON.stringify({
          type: 'SET_CIRCUIT',
          circuitId: selectedCircuitRef.current || selectedCircuit
        }));
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const timeStr = new Date().toTimeString().split(' ')[0];

          if (msg.source === 'F1_PROXY_SYSTEM') {
            if (msg.status === 'CONNECTED') {
              setProxyStatus('CONNECTED');
              setIsLiveTransmitting(true);
            } else {
              setProxyStatus('STANDBY');
              setIsLiveTransmitting(false);
            }
            setLogs(l => [...l.slice(-79), `[${timeStr}] SYSTEM: ${msg.message}`]);
          }

          else if (msg.source === 'F1_LIVE_SERVER') {
            setIsLiveTransmitting(true);

            if (msg.channel === 'TimingData' && msg.data && msg.data.Lines) {
              const lines = msg.data.Lines;
              const list = driversRef.current;

              Object.entries(lines).forEach(([driverNum, dataLine]) => {
                const lineObj = dataLine as Record<string, any>;
                let matched = list.find(d => d.number === driverNum);
                if (!matched) {
                  matched = {
                    driverId: `car_${driverNum}`,
                    code: `CAR ${driverNum}`,
                    name: `Car #${driverNum}`,
                    number: driverNum,
                    teamId: 'unknown',
                    teamName: 'F1 Team',
                    position: parseInt(lineObj.Position) || (list.length + 1),
                    gapToLeader: 0,
                    intervalToAhead: 0,
                    lastLapTime: '—',
                    bestLapTime: '—',
                    isFastestSector: false,
                    speedTrap: 0,
                    tyre: 'M',
                    tyreAge: 0,
                    status: 'RACING',
                    pitStops: 0
                  };
                  list.push(matched);
                }

                if (matched) {
                  if (lineObj.Position) matched.position = parseInt(lineObj.Position) || matched.position;
                  if (lineObj.LastLapTime?.Value) matched.lastLapTime = lineObj.LastLapTime.Value;
                  if (lineObj.BestLapTime?.Value) matched.bestLapTime = lineObj.BestLapTime.Value;
                  if (lineObj.Speeds?.ST) matched.speedTrap = parseInt(lineObj.Speeds.ST) || matched.speedTrap;
                  if (lineObj.InPit !== undefined) matched.status = lineObj.InPit ? 'IN PIT' : 'RACING';
                  if (lineObj.Retired !== undefined) matched.status = lineObj.Retired ? 'RETIRED' : matched.status;
                  
                  const rawGap = typeof lineObj.GapToLeader === 'object' && lineObj.GapToLeader !== null
                    ? lineObj.GapToLeader.Value 
                    : lineObj.GapToLeader;
                  if (rawGap !== undefined && rawGap !== null) {
                    const p = parseFloat(String(rawGap).replace('+', ''));
                    if (!isNaN(p)) matched.gapToLeader = p;
                  }

                  const rawInt = typeof lineObj.IntervalToPositionAhead === 'object' && lineObj.IntervalToPositionAhead !== null
                    ? lineObj.IntervalToPositionAhead.Value
                    : lineObj.IntervalToPositionAhead;
                  if (rawInt !== undefined && rawInt !== null) {
                    const p = parseFloat(String(rawInt).replace('+', ''));
                    if (!isNaN(p)) matched.intervalToAhead = p;
                  }

                  if (lineObj.NumberOfPitStops !== undefined) {
                    matched.pitStops = Number(lineObj.NumberOfPitStops) || 0;
                  }

                  // Parse Sectors (S1, S2, S3)
                  if (lineObj.Sectors && typeof lineObj.Sectors === 'object') {
                    const s0 = lineObj.Sectors['0'];
                    const s1 = lineObj.Sectors['1'];
                    const s2 = lineObj.Sectors['2'];

                    if (s0) {
                      const val = s0.Value || s0.PreviousValue;
                      if (val) {
                        matched.sector1 = {
                          value: String(val),
                          isPersonalFastest: Boolean(s0.Fastest || s0.PersonalFastest),
                          isOverallFastest: Boolean(s0.OverallFastest)
                        };
                      }
                    }
                    if (s1) {
                      const val = s1.Value || s1.PreviousValue;
                      if (val) {
                        matched.sector2 = {
                          value: String(val),
                          isPersonalFastest: Boolean(s1.Fastest || s1.PersonalFastest),
                          isOverallFastest: Boolean(s1.OverallFastest)
                        };
                      }
                    }
                    if (s2) {
                      const val = s2.Value || s2.PreviousValue;
                      if (val) {
                        matched.sector3 = {
                          value: String(val),
                          isPersonalFastest: Boolean(s2.Fastest || s2.PersonalFastest),
                          isOverallFastest: Boolean(s2.OverallFastest)
                        };
                      }
                    }
                  }

                  if (lineObj.BestLapTime?.OverallFastest) {
                    matched.isFastestLap = true;
                  }
                }
              });

              list.sort((a, b) => a.position - b.position);
              scheduleDriverFlush();
            }

            // Ingest DriverList (Official Session Entry Roster)
            if (msg.channel === 'DriverList' && msg.data && typeof msg.data === 'object') {
              const list = driversRef.current;
              Object.entries(msg.data).forEach(([driverNum, rawInfo]) => {
                const info = rawInfo as Record<string, any>;
                const matched = list.find(d => d.number === driverNum);
                const code = info.Tla || info.BroadcastName?.substring(0, 3) || `C${driverNum}`;
                const name = info.FullName || info.BroadcastName || `Driver ${driverNum}`;
                const teamName = info.TeamName || 'Formula 1 Team';
                const teamId = (info.TeamName || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
                const driverId = (info.LastName || info.FullName || `driver_${driverNum}`).toLowerCase().replace(/[^a-z0-9]/g, '_');
                const pos = parseInt(info.Line) || (list.length + 1);

                if (matched) {
                  matched.code = code;
                  matched.name = name;
                  matched.teamName = teamName;
                  matched.teamId = teamId;
                  matched.driverId = driverId;
                } else {
                  list.push({
                    driverId,
                    code,
                    name,
                    number: driverNum,
                    teamId,
                    teamName,
                    position: pos,
                    gapToLeader: 0,
                    intervalToAhead: 0,
                    lastLapTime: '—',
                    bestLapTime: '—',
                    isFastestSector: false,
                    speedTrap: 0,
                    tyre: 'M',
                    tyreAge: 0,
                    status: 'RACING',
                    pitStops: 0
                  });
                }
              });
              list.sort((a, b) => a.position - b.position);
              scheduleDriverFlush();
            }

            // Ingest TimingAppData (Tyre Stints & Tyre Age)
            if (msg.channel === 'TimingAppData' && msg.data && msg.data.Lines) {
              const appLines = msg.data.Lines;
              const list = driversRef.current;

              Object.entries(appLines).forEach(([driverNum, appLine]) => {
                let matched = list.find(d => d.number === driverNum);
                if (!matched) {
                  matched = {
                    driverId: `car_${driverNum}`,
                    code: `CAR ${driverNum}`,
                    name: `Car #${driverNum}`,
                    number: driverNum,
                    teamId: 'unknown',
                    teamName: 'F1 Team',
                    position: list.length + 1,
                    gapToLeader: 0,
                    intervalToAhead: 0,
                    lastLapTime: '—',
                    bestLapTime: '—',
                    isFastestSector: false,
                    speedTrap: 0,
                    tyre: 'M',
                    tyreAge: 0,
                    status: 'RACING',
                    pitStops: 0
                  };
                  list.push(matched);
                }

                if (matched && appLine && typeof appLine === 'object') {
                  const lineObj = appLine as Record<string, any>;
                  const stints = lineObj.Stints;
                  let latestStint: any = null;

                  if (Array.isArray(stints) && stints.length > 0) {
                    latestStint = stints[stints.length - 1];
                  } else if (typeof stints === 'object' && stints !== null) {
                    const keys = Object.keys(stints);
                    if (keys.length > 0) {
                      latestStint = stints[keys[keys.length - 1]];
                    }
                  }

                  if (latestStint) {
                    const rawCompound = String(latestStint.Compound || '').toUpperCase();
                    if (rawCompound.includes('SOFT')) matched.tyre = 'S';
                    else if (rawCompound.includes('MEDIUM')) matched.tyre = 'M';
                    else if (rawCompound.includes('HARD')) matched.tyre = 'H';
                    else if (rawCompound.includes('INTER')) matched.tyre = 'I';
                    else if (rawCompound.includes('WET')) matched.tyre = 'W';

                    const totalLaps = parseInt(String(latestStint.TotalLaps || '0'), 10);
                    if (!isNaN(totalLaps) && totalLaps > 0) {
                      matched.tyreAge = totalLaps;
                    }
                  }
                }
              });

              scheduleDriverFlush();
            }

            // Ingest WeatherData (Air Temp, Track Temp, Humidity, Rain)
            if (msg.channel === 'WeatherData' && msg.data) {
              setWeatherData({
                airTemp: msg.data.AirTemp,
                trackTemp: msg.data.TrackTemp,
                humidity: msg.data.Humidity,
                pressure: msg.data.Pressure,
                windSpeed: msg.data.WindSpeed,
                windDirection: msg.data.WindDirection,
                rainfall: msg.data.Rainfall
              });
            }

            if (msg.channel === 'TrackStatus' && msg.data && msg.data.Status) {
              const statusVal = msg.data.Status;
              if (statusVal === '1') setFlagStatus('GREEN');
              else if (statusVal === '2') setFlagStatus('YELLOW');
              else if (statusVal === '4') setFlagStatus('SAFETY CAR');
              else if (statusVal === '5') setFlagStatus('RED FLAG');
              setLogs(l => [...l.slice(-79), `[${timeStr}] 🏁 FIA TRACK STATUS: Flag condition ${statusVal === '1' ? 'GREEN' : statusVal === '2' ? 'YELLOW' : statusVal === '4' ? 'SAFETY CAR' : 'RED FLAG'}`]);
            }

            if (msg.channel === 'RaceControlMessages' && msg.data && msg.data.Messages) {
              const messages = Object.values(msg.data.Messages) as Array<{ Message?: string; Utc?: string }>;
              messages.forEach(m => {
                if (m.Message) {
                  const msgTime = m.Utc ? new Date(m.Utc).toTimeString().split(' ')[0] : timeStr;
                  setLogs(l => [...l.slice(-79), `[${msgTime}] 🏁 FIA RACE CONTROL: ${m.Message}`]);
                }
              });
            }
          }
        } catch (err) {
          console.error('[WS DATA ERROR]:', err);
        }
      };

      socket.onclose = () => {
        setProxyStatus('STANDBY');
        setIsLiveTransmitting(false);
        // Automatic resilient reconnect with 3s debounce
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            connectWebSocket();
          }, 3000);
        }
      };

      socket.onerror = () => {
        setProxyStatus('OFFLINE');
        setIsLiveTransmitting(false);
      };
    } catch {
      setProxyStatus('OFFLINE');
      setIsLiveTransmitting(false);
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const activeLiveSession = sessions.find(s => s.status === 'LIVE');
  const nextUpcomingSession = sessions.find(s => s.status === 'UPCOMING');
  const isCompetitiveDay = isTodayCompetitiveDay(sessions);
  const isCompetitiveSessionLive = Boolean(activeLiveSession) || isLiveTransmitting;

  const todaySession = sessions.find(s => {
    const nowDate = new Date();
    const localYear = nowDate.getFullYear();
    const localMonth = String(nowDate.getMonth() + 1).padStart(2, '0');
    const localDay = String(nowDate.getDate()).padStart(2, '0');
    const localDateStr = `${localYear}-${localMonth}-${localDay}`;
    const utcDateStr = nowDate.toISOString().split('T')[0];
    return s.rawDate === localDateStr || s.rawDate === utcDateStr || s.status === 'LIVE';
  });

  const countdownToNext = nextUpcomingSession && nextUpcomingSession.startMs 
    ? formatCountdown(nextUpcomingSession.startMs) 
    : null;

  // Live timing and driver telemetry only show on the actual day of race, quali, sprint race, or sprint quali
  // (or when official live telemetry is transmitting on track)
  const isLiveTimingActive = isCompetitiveDay || isCompetitiveSessionLive;

  return (
    <section className="view w-full max-w-[1440px] mx-auto overflow-hidden box-border px-2 sm:px-4" id="view-live">
      <div className="panel w-full max-w-full overflow-hidden">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center gap-1">
                <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
                <span className="text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                  PIT-WALL TELEMETRY
                </span>
              </span>
              <span className="text-slate-700 font-sans text-xs">•</span>
              <span className="text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
                OFFICIAL SESSIONS ONLY
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight f1-text-gradient uppercase">
              LIVE TELEMETRY CONSOLE
            </h1>
            <p className="text-xs font-sans text-slate-400 mt-1 max-w-xl leading-relaxed">
              Official F1 Timing Tower, Micro-Sector Speeds, FIA Race Director Log &amp; Dynamic Circuit Position Tracker.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-semibold ${
              isCompetitiveSessionLive
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : isCompetitiveDay
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isCompetitiveSessionLive 
                  ? 'bg-emerald-400 animate-pulse' 
                  : isCompetitiveDay
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-cyan-400'
              }`}></span>
              <span>
                {isCompetitiveSessionLive 
                  ? '🔴 LIVE TRANSMITTING' 
                  : isCompetitiveDay
                    ? `🟡 SESSION DAY: ${(todaySession?.shortName || 'ACTIVE').toUpperCase()}`
                    : 'STANDBY (OFF-DAY)'}
              </span>
            </div>

            <button 
              className="btn flex items-center gap-1.5 text-xs font-mono" 
              onClick={connectWebSocket}
              title="Reconnect to pit-wall telemetry proxy"
            >
              <span>🔄</span> Reconnect Uplink
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {showNoticeAlert && (
          <div 
            style={{ 
              background: isCompetitiveSessionLive 
                ? 'rgba(16, 185, 129, 0.08)' 
                : isCompetitiveDay 
                  ? 'rgba(245, 158, 11, 0.08)' 
                  : 'rgba(52, 228, 200, 0.08)', 
              border: `1px solid ${isCompetitiveSessionLive ? 'var(--green)' : isCompetitiveDay ? 'var(--amber)' : 'var(--cyan)'}`, 
              borderRadius: '6px', 
              padding: '10px 14px', 
              marginTop: '16px', 
              color: isCompetitiveSessionLive ? 'var(--green)' : isCompetitiveDay ? 'var(--amber)' : 'var(--cyan)', 
              fontSize: '12.5px',
              lineHeight: '1.4',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCompetitiveSessionLive ? 'var(--green)' : isCompetitiveDay ? 'var(--amber)' : 'var(--cyan)', display: 'inline-block', boxShadow: `0 0 8px ${isCompetitiveSessionLive ? 'var(--green)' : isCompetitiveDay ? 'var(--amber)' : 'var(--cyan)'}` }}></span>
              <span>
                {isCompetitiveSessionLive ? (
                  <><strong>OFFICIAL SESSION LIVE:</strong> Pit-wall telemetry and live timing active for {activeLiveSession?.name || 'Track Action'}.</>
                ) : isCompetitiveDay ? (
                  <><strong>SESSION DAY DETECTED:</strong> Today is the official day of {todaySession?.name || 'Competitive Action'}. Telemetry will stream when pit-wall cars fire up.</>
                ) : (
                  <><strong>OFF-DAY STANDBY:</strong> Live timing unlocks strictly on the day of Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix. View upcoming timetable below.</>
                )}
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowNoticeAlert(false)}
              className="text-slate-400 hover:text-white text-base px-1.5 leading-none cursor-pointer"
              title="Dismiss banner"
            >
              ×
            </button>
          </div>
        )}

        {/* 4 Competitive Sessions Schedule Cards */}
        <div style={{ marginTop: '16px', marginBottom: '16px' }}>
          <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-white font-bold tracking-wider">OFFICIAL COMPETITIVE SESSIONS TIMETABLE:</span>
              <span className="text-slate-400 hidden md:inline">
                Activates strictly on Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix.
              </span>
            </div>
            <div className="text-[11px] font-semibold flex items-center gap-2">
              {activeLiveSession ? (
                <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  ACTIVE ON TRACK: {activeLiveSession.shortName}
                </span>
              ) : countdownToNext ? (
                <span className="text-cyan-400">
                  NEXT: {nextUpcomingSession?.shortName} in {countdownToNext}
                </span>
              ) : (
                <span className="text-slate-400">TELEMETRY STANDBY</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {sessions.map(s => {
              const isLive = s.status === 'LIVE';
              const isUpcoming = s.status === 'UPCOMING';
              const isCompleted = s.status === 'COMPLETED';
              const isNotSched = s.status === 'NOT_SCHEDULED';

              return (
                <div 
                  key={s.id}
                  className={`relative p-3 rounded-lg border transition-all ${
                    isLive 
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : isUpcoming
                        ? 'bg-slate-900/70 border-cyan-500/40 hover:border-cyan-400'
                        : isCompleted
                          ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                          : 'bg-slate-950/40 border-slate-900 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {s.icon} {s.badge}
                    </span>
                    {isLive && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        LIVE NOW
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950/50 text-cyan-300 border border-cyan-500/30">
                        UPCOMING
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800/60 text-slate-400">
                        ✓ CONCLUDED
                      </span>
                    )}
                    {isNotSched && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 text-slate-500">
                        NOT SCHEDULED
                      </span>
                    )}
                  </div>

                  <div className="font-display font-black text-sm text-white uppercase tracking-tight mb-1 truncate">
                    {s.name}
                  </div>

                  <div className="text-xs font-mono text-slate-300 flex items-center justify-between">
                    <span>{s.dateStr}</span>
                    <span className="font-semibold text-white">{s.timeStr}</span>
                  </div>

                  {isUpcoming && s.startMs && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 text-[11px] font-mono text-cyan-400 flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">STARTS IN:</span>
                      <span className="font-bold">{formatCountdown(s.startMs)}</span>
                    </div>
                  )}
                  {isLive && (
                    <div className="mt-1.5 pt-1.5 border-t border-emerald-800/40 text-[11px] font-mono text-emerald-300 flex items-center justify-between">
                      <span className="text-emerald-400 text-[10px]">TRACK SESSION:</span>
                      <span className="font-bold">IN PROGRESS</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!isLiveTimingActive ? (
          <div className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-6 sm:p-10 text-center my-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>OFFICIAL TIMETABLE • TELEMETRY STANDBY</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-display tracking-tight text-white uppercase">
                {nextUpcomingSession ? `NEXT: ${nextUpcomingSession.name}` : `UPCOMING: ${currentVenueName}`}
              </h2>

              <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-slate-400">
                <span>📍 {currentVenueName}{currentCountryName ? ` (${currentCountryName})` : ''}</span>
                <span>•</span>
                <span>🏁 {totalLaps} LAPS</span>
                {weatherData?.trackTemp && (
                  <>
                    <span>•</span>
                    <span>🌡️ TRACK {weatherData.trackTemp}°C / AIR {weatherData.airTemp || '—'}°C</span>
                  </>
                )}
              </div>

              {countdownToNext && (
                <div className="py-4 my-2 border-y border-slate-800/80">
                  <div className="text-[11px] font-mono uppercase text-slate-400 tracking-widest mb-1.5 font-bold">
                    SESSION STARTS IN
                  </div>
                  <div className="text-3xl sm:text-5xl md:text-6xl font-black font-mono text-cyan-300 tracking-tight drop-shadow-[0_0_16px_rgba(52,228,200,0.4)]">
                    {countdownToNext}
                  </div>
                  {nextUpcomingSession && (
                    <div className="text-xs font-mono text-slate-400 mt-2">
                      Official Schedule: <span className="text-white font-semibold">{nextUpcomingSession.dateStr}</span> at <span className="text-white font-semibold">{nextUpcomingSession.timeStr}</span> Local Time
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 font-sans leading-relaxed text-left sm:text-center">
                <p>
                  🔒 <strong>Live Telemetry Policy:</strong> Official F1 Timing Tower, S1/S2/S3 micro-sector splits, tyre compound stints, and dynamic circuit radar unlock exclusively on the calendar day of <strong>Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix</strong> sessions.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={connectWebSocket}
                  className="btn flex items-center gap-2 px-4 py-2.5 text-xs font-mono text-slate-300 hover:text-white rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 cursor-pointer transition"
                  title="Test WebSocket uplink"
                >
                  <span>🔄</span>
                  <span>CHECK UPLINK STATUS</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>

            {/* Live Race Status Bar */}
            <div 
              className="stat-grid" 
          style={{ 
            marginTop: '8px', 
            marginBottom: '20px', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' 
          }}
        >
          <div className="stat-box">
            <div className="k">Session Status</div>
            <div 
              className="v" 
              style={{ 
                fontSize: '15px', 
                color: isCompetitiveSessionLive ? 'var(--green)' : 'var(--paper)' 
              }}
            >
              {isCompetitiveSessionLive ? `● LIVE: ${activeLiveSession?.name || 'ON TRACK'}` : `STANDBY`}
            </div>
            <div className="footnote">
              {currentVenueName} · {isCompetitiveSessionLive ? 'Pit-wall feed active' : 'Awaiting next session'}
            </div>
          </div>

          <div className="stat-box">
            <div className="k">Next Session Window</div>
            <div className="v" style={{ fontSize: '17px', color: 'var(--paper)' }}>
              {isCompetitiveSessionLive 
                ? 'ON TRACK' 
                : countdownToNext 
                  ? countdownToNext 
                  : 'CONCLUDED'}
            </div>
            <div className="footnote">
              {nextUpcomingSession ? `${nextUpcomingSession.shortName} · ${nextUpcomingSession.timeStr}` : 'All weekend sessions complete'}
            </div>
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
            <div className="footnote">FIA Race Control track condition</div>
          </div>

          <div className="stat-box">
            <div className="k">Telemetry Uplink</div>
            <div className="v" style={{ fontSize: '18px', color: 'var(--cyan)' }}>
              {isCompetitiveSessionLive ? '14ms HIGH PRECISION' : 'STANDBY (READY)'}
            </div>
            <div className="footnote">Signal: Official F1 SignalR pass-through</div>
          </div>

          <div className="stat-box">
            <div className="k">Track Environment</div>
            <div className="v" style={{ fontSize: '16px', color: 'var(--paper)' }}>
              {weatherData?.trackTemp 
                ? `${weatherData.trackTemp}°C / ${weatherData.airTemp || '—'}°C` 
                : '— / —'}
            </div>
            <div className="footnote">
              {weatherData 
                ? `Rain: ${weatherData.rainfall === '1' ? 'WET' : 'DRY'} · Wind: ${weatherData.windSpeed || '0'}km/h` 
                : 'Awaiting session weather telemetry'}
            </div>
          </div>
        </div>

        {/* Live Responsive Desktop Grid Layout — Clean Full-Width Display */}
        <div className="flex flex-col gap-4 w-full max-w-full overflow-hidden">
          
          {/* Live Track Radar Map */}
          <div className="w-full max-w-full overflow-hidden" style={{ padding: 0, border: 'none', background: 'transparent' }}>
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
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {ALL_CIRCUITS_ROSTER.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flag} {c.country} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <CircuitMap 
              circuitId={selectedCircuit} 
              drivers={drivers}
              showStats={false}
              showCorners={true}
              activeDriverCode={activeDriverCode || ''}
              onHoverDriver={setActiveDriverCode}
              onCornerSelect={(corner) => {
                if (corner) {
                  const cornerKey = `t${corner.number}${corner.letter || ''}`.toLowerCase();
                  router.push(`/gallery?circuit=${selectedCircuit}&corner=${cornerKey}`);
                }
              }}
            />
          </div>

          {/* Live Timing Classification Board */}
          <div className="panel w-full max-w-full overflow-hidden bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isCompetitiveSessionLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-cyan-400'}`}></span>
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                  {isCompetitiveSessionLive 
                    ? `OFFICIAL LIVE TIMING // ${(activeLiveSession?.name || 'COMPETITIVE SESSION').toUpperCase()}`
                    : `OFFICIAL LIVE TIMING STANDBY // ${currentVenueName.toUpperCase()}`}
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-cyan-500/30">
                  {isCompetitiveSessionLive ? 'TRANSMITTING LIVE' : 'STANDBY'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Sector Micro-split Legend */}
                <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono px-2 py-1 rounded bg-slate-900/90 border border-slate-800 text-slate-400">
                  <span className="flex items-center gap-1 text-[#F0ABFC]">
                    <span className="w-2 h-2 rounded-full bg-[#D946EF]"></span> S-BEST
                  </span>
                  <span className="flex items-center gap-1 text-[#34D399]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> P-BEST
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span> SECTOR
                  </span>
                </div>

                {/* Timing View Toggle Buttons */}
                <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold px-1 hidden sm:inline">VIEW:</span>
                  <button
                    type="button"
                    onClick={() => setGapDisplayMode('dual')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      gapDisplayMode === 'dual'
                        ? 'bg-[#E10600] text-white shadow-[0_0_8px_rgba(225,6,0,0.5)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Show both Gap to Leader and Interval to ahead"
                  >
                    DUAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setGapDisplayMode('gap')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      gapDisplayMode === 'gap'
                        ? 'bg-[#E10600] text-white shadow-[0_0_8px_rgba(225,6,0,0.5)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Show Gap to Leader"
                  >
                    GAP
                  </button>
                  <button
                    type="button"
                    onClick={() => setGapDisplayMode('interval')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      gapDisplayMode === 'interval'
                        ? 'bg-[#E10600] text-white shadow-[0_0_8px_rgba(225,6,0,0.5)]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Show Interval to car ahead"
                  >
                    INTERVAL
                  </button>
                </div>
              </div>
            </div>

            <div style={{ maxHeight: '420px', overflowY: 'auto', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: gapDisplayMode === 'dual' ? '920px' : '860px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--dim)' }}>
                    <th style={{ padding: '8px 6px', width: '42px' }}>POS</th>
                    <th style={{ padding: '8px 6px', width: '40px' }}>NUM</th>
                    <th style={{ padding: '8px 6px', minWidth: '130px' }}>DRIVER</th>
                    {gapDisplayMode === 'dual' && (
                      <>
                        <th style={{ padding: '8px 6px', minWidth: '76px' }}>GAP</th>
                        <th style={{ padding: '8px 6px', minWidth: '70px' }}>INT</th>
                      </>
                    )}
                    {gapDisplayMode === 'gap' && (
                      <th style={{ padding: '8px 6px', minWidth: '85px' }}>GAP (LEADER)</th>
                    )}
                    {gapDisplayMode === 'interval' && (
                      <th style={{ padding: '8px 6px', minWidth: '85px' }}>INTERVAL (AHEAD)</th>
                    )}
                    <th style={{ padding: '8px 5px', textAlign: 'center', minWidth: '56px' }}>S1</th>
                    <th style={{ padding: '8px 5px', textAlign: 'center', minWidth: '56px' }}>S2</th>
                    <th style={{ padding: '8px 5px', textAlign: 'center', minWidth: '56px' }}>S3</th>
                    <th style={{ padding: '8px 6px', minWidth: '76px' }}>LAST LAP</th>
                    <th style={{ padding: '8px 6px', minWidth: '82px' }}>BEST LAP</th>
                    <th style={{ padding: '8px 6px', minWidth: '58px' }}>SPEED</th>
                    <th style={{ padding: '8px 6px', minWidth: '95px' }}>TYRE &amp; STINT</th>
                    <th style={{ padding: '8px 6px', minWidth: '76px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.length === 0 ? (
                    <tr>
                      <td 
                        colSpan={gapDisplayMode === 'dual' ? 13 : 12}
                        style={{
                          padding: '44px 20px',
                          textAlign: 'center',
                          background: 'rgba(15, 23, 42, 0.45)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', maxWidth: '580px', margin: '0 auto' }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: 'rgba(225, 6, 0, 0.1)',
                            border: '1px solid rgba(225, 6, 0, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px'
                          }}>
                            📡
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              display: 'inline-block',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: '#E8B42A',
                              boxShadow: '0 0 8px rgba(232, 180, 42, 0.8)'
                            }}></span>
                            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', color: '#E8B42A', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                              FIA Pit-Wall Telemetry Standby
                            </span>
                          </div>
                          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--paper)', margin: 0 }}>
                            Awaiting Live Session Green Flag
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--dim)', lineHeight: 1.6, margin: 0 }}>
                            Live timing uplink connects directly to the official FIA F1 SignalR tunnel (<code style={{ color: 'var(--cyan)', fontSize: '11px' }}>ws://127.0.0.1:8080</code>). Drivers and real-time lap telemetry stream strictly during official Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix sessions.
                          </p>
                          {nextUpcomingSession && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              fontSize: '11.5px',
                              fontFamily: 'var(--font-mono)',
                              color: 'var(--paper)',
                              marginTop: '4px'
                            }}>
                              <span style={{ color: 'var(--dim)' }}>NEXT SESSION:</span>
                              <span style={{ color: '#E10600', fontWeight: 700 }}>{nextUpcomingSession.name.toUpperCase()}</span>
                              {countdownToNext && (
                                <>
                                  <span style={{ color: 'var(--dim)' }}>•</span>
                                  <span style={{ color: 'var(--cyan)' }}>Starts in {countdownToNext}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    drivers.map(row => {
                    const color = getTeamColor(row.teamId);
                    const isFastest = row.isFastestSector;
                    const inPit = row.status === 'IN PIT';
                    const retired = row.status === 'RETIRED';
                    const isHovered = activeDriverCode === row.code;
                    const tyreStyle = getTyreBadgeStyle(row.tyre);
                    const isOldTyre = (row.tyre === 'S' && row.tyreAge >= 18) || (row.tyre === 'M' && row.tyreAge >= 26) || (row.tyre === 'H' && row.tyreAge >= 36);

                    const renderSector = (sec?: SectorData) => {
                      if (!sec || !sec.value) {
                        return <span style={{ color: 'var(--dim)', opacity: 0.5 }}>—</span>;
                      }
                      const isOverall = sec.isOverallFastest;
                      const isPersonal = sec.isPersonalFastest;

                      let bg = 'rgba(255, 255, 255, 0.04)';
                      let textColor = 'var(--paper)';
                      let border = '1px solid rgba(255, 255, 255, 0.08)';
                      let shadow = 'none';

                      if (isOverall) {
                        bg = 'rgba(217, 70, 239, 0.18)';
                        textColor = '#F0ABFC';
                        border = '1px solid rgba(217, 70, 239, 0.5)';
                        shadow = '0 0 6px rgba(217, 70, 239, 0.35)';
                      } else if (isPersonal) {
                        bg = 'rgba(16, 185, 129, 0.18)';
                        textColor = '#34D399';
                        border = '1px solid rgba(16, 185, 129, 0.5)';
                        shadow = '0 0 6px rgba(16, 185, 129, 0.3)';
                      }

                      return (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 5px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: isOverall || isPersonal ? 700 : 500,
                            background: bg,
                            color: textColor,
                            border: border,
                            boxShadow: shadow,
                            minWidth: '48px',
                            textAlign: 'center'
                          }}
                          title={isOverall ? 'Session Fastest Sector (Purple)' : isPersonal ? 'Personal Best Sector (Green)' : 'Sector Time'}
                        >
                          {sec.value}
                        </span>
                      );
                    };

                    return (
                      <tr 
                        key={row.driverId} 
                        onMouseEnter={() => setActiveDriverCode(row.code)}
                        onMouseLeave={() => setActiveDriverCode(null)}
                        style={{ 
                          borderBottom: '1px solid rgba(42, 47, 58, 0.4)',
                          opacity: retired ? 0.45 : 1,
                          background: isHovered 
                            ? 'rgba(52, 228, 200, 0.1)' 
                            : inPit 
                              ? 'rgba(232, 180, 42, 0.06)' 
                              : 'transparent',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '6px 6px', fontWeight: 'bold', color: isHovered ? 'var(--cyan)' : 'inherit' }}>
                          P{row.position}
                        </td>
                        <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>
                          #{row.number}
                        </td>
                        <td style={{ padding: '6px 6px', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '3.5px', height: '16px', background: color, display: 'inline-block', borderRadius: '1.5px', boxShadow: `0 0 6px ${color}80` }}></span>
                            <span style={{ color: 'var(--paper)', letterSpacing: '0.01em' }}>{row.name}</span>
                          </div>
                        </td>

                        {gapDisplayMode === 'dual' && (
                          <>
                            <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)' }}>
                              {row.position === 1 ? (
                                <span style={{ color: 'var(--green)', fontWeight: 700 }}>LEADER</span>
                              ) : (
                                <span style={{ color: 'var(--paper)' }}>+{row.gapToLeader.toFixed(3)}s</span>
                              )}
                            </td>
                            <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>
                              {row.position === 1 ? (
                                <span>—</span>
                              ) : (
                                <span>+{(row.intervalToAhead ?? 0).toFixed(3)}s</span>
                              )}
                            </td>
                          </>
                        )}
                        {gapDisplayMode === 'gap' && (
                          <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)' }}>
                            {row.position === 1 ? (
                              <span style={{ color: 'var(--green)', fontWeight: 700 }}>LEADER</span>
                            ) : (
                              <span style={{ color: 'var(--paper)' }}>+{row.gapToLeader.toFixed(3)}s</span>
                            )}
                          </td>
                        )}
                        {gapDisplayMode === 'interval' && (
                          <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)' }}>
                            {row.position === 1 ? (
                              <span style={{ color: 'var(--green)', fontWeight: 700 }}>LEADER</span>
                            ) : (
                              <span style={{ color: 'var(--paper)' }}>+{(row.intervalToAhead ?? 0).toFixed(3)}s</span>
                            )}
                          </td>
                        )}

                        {/* Micro-Sectors S1, S2, S3 */}
                        <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                          {renderSector(row.sector1)}
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                          {renderSector(row.sector2)}
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                          {renderSector(row.sector3)}
                        </td>

                        {/* Last Lap Time */}
                        <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ 
                            color: isFastest ? '#D946EF' : 'var(--paper)', 
                            fontWeight: isFastest ? 700 : 500,
                            textShadow: isFastest ? '0 0 8px rgba(217, 70, 239, 0.5)' : 'none'
                          }}>
                            {row.lastLapTime}
                          </span>
                        </td>

                        {/* Best Lap Time with Purple FL Badge */}
                        <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ 
                              color: row.isFastestLap ? '#D946EF' : 'var(--paper)', 
                              fontWeight: row.isFastestLap ? 700 : 500,
                              textShadow: row.isFastestLap ? '0 0 8px rgba(217, 70, 239, 0.5)' : 'none'
                            }}>
                              {row.bestLapTime || row.lastLapTime}
                            </span>
                            {row.isFastestLap && (
                              <span 
                                style={{
                                  background: 'rgba(217, 70, 239, 0.2)',
                                  color: '#F0ABFC',
                                  border: '1px solid rgba(217, 70, 239, 0.5)',
                                  borderRadius: '3px',
                                  fontSize: '9.5px',
                                  padding: '0.5px 3.5px',
                                  fontWeight: 800,
                                  boxShadow: '0 0 6px rgba(217, 70, 239, 0.35)'
                                }}
                                title="Fastest Lap of Session (Purple FL)"
                              >
                                FL
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>
                          {row.speedTrap} <small style={{ fontSize: '10px' }}>km/h</small>
                        </td>

                        <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <span 
                              style={{
                                background: tyreStyle.bg,
                                color: tyreStyle.text,
                                border: `1.5px solid ${tyreStyle.border}`,
                                boxShadow: `0 0 8px ${tyreStyle.glow}`,
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                                fontSize: '11px',
                                fontFamily: 'var(--font-display)',
                                lineHeight: 1
                              }}
                              title={`Pirelli Compound: ${row.tyre === 'S' ? 'Soft' : row.tyre === 'M' ? 'Medium' : row.tyre === 'H' ? 'Hard' : row.tyre}`}
                            >
                              {row.tyre}
                            </span>
                            <span style={{ 
                              fontSize: '11.5px', 
                              fontWeight: 600,
                              color: isOldTyre ? 'var(--amber)' : 'var(--paper)' 
                            }}>
                              {row.tyreAge}L
                            </span>
                            {row.pitStops && row.pitStops > 0 ? (
                              <span style={{
                                fontSize: '9px',
                                padding: '1px 3px',
                                borderRadius: '2px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: 'var(--dim)',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                              }} title={`${row.pitStops} Pit Stop${row.pitStops > 1 ? 's' : ''}`}>
                                {row.pitStops}P
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                          {inPit ? (
                            <span style={{ 
                              color: '#FFB800', 
                              background: 'rgba(255, 184, 0, 0.15)', 
                              border: '1px solid rgba(255, 184, 0, 0.4)',
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 0 8px rgba(255, 184, 0, 0.3)'
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFB800' }}></span>
                              IN PIT
                            </span>
                          ) : retired ? (
                            <span style={{ 
                              color: '#EF4444', 
                              background: 'rgba(239, 68, 68, 0.15)', 
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              fontWeight: 700 
                            }}>
                              OUT
                            </span>
                          ) : isCompetitiveSessionLive ? (
                            <span style={{ 
                              color: 'var(--green)', 
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green)' }}></span>
                              RACING
                            </span>
                          ) : (
                            <span style={{ 
                              color: 'var(--cyan)', 
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--cyan)' }}></span>
                              {row.status || 'STANDBY'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              </table>
            </div>
          </div>

          {/* Mission Control // Race Director Live Feed */}
          <div className="panel w-full max-w-full overflow-hidden bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                  MISSION CONTROL // FIA RACE DIRECTOR &amp; PIT-WALL STATUS
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">
                  {logs.length} EVENTS RECORDED
                </span>
                <button
                  type="button"
                  onClick={() => setLogs([`[${new Date().toTimeString().split(' ')[0]}] MISSION CONTROL: Console cleared.`])}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition cursor-pointer"
                >
                  CLEAR
                </button>
              </div>
            </div>

            <div 
              ref={logConsoleRef}
              className="font-mono text-xs text-slate-300 space-y-1.5 max-h-52 overflow-y-auto p-3 rounded-lg bg-slate-950/90 border border-slate-800/60 scroll-smooth shadow-inner"
            >
              {logs.map((log, idx) => {
                const isFIA = log.includes('FIA') || log.includes('TRACK STATUS');
                const isWarning = log.includes('⚠️') || log.includes('SAFETY CAR') || log.includes('YELLOW') || log.includes('RED FLAG');
                const isSystem = log.includes('SYSTEM') || log.includes('MISSION CONTROL') || log.includes('TELEMETRY');

                return (
                  <div 
                    key={idx}
                    className={`leading-relaxed px-2 py-1 rounded transition-colors ${
                      isWarning
                        ? 'text-amber-300 bg-amber-950/20 border-l-2 border-amber-500 font-semibold'
                        : isFIA
                          ? 'text-cyan-300 bg-cyan-950/20 border-l-2 border-cyan-500 font-semibold'
                          : isSystem
                            ? 'text-emerald-300 bg-emerald-950/10'
                            : 'text-slate-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    )}
  </div>
</section>
  );
}
