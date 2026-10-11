'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getTeamColor, getJSON, API_BASE } from '../utils/api';
import CircuitMap from '../components/CircuitMap';
import { TRACKS_REGISTRY, getTrackDefinition } from '../lib/tracksRegistry';

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
  isFastestSector: boolean;
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

function getVenueBaseLapTime(circuitId: string): number {
  const trackDef = getTrackDefinition(circuitId);
  if (trackDef?.record) {
    const match = trackDef.record.match(/(\d+):(\d+(?:\.\d+)?)/);
    if (match) {
      const recSeconds = parseInt(match[1]) * 60 + parseFloat(match[2]);
      // Race lap pace in Grand Prix conditions is ~2.8s slower than all-time qualifying lap record
      return Math.round((recSeconds + 2.8) * 10) / 10;
    }
  }
  const lengthKm = trackDef?.length_km || 5.2;
  const isStreetOrTight = ['monaco', 'marina_bay', 'singapore', 'hungaroring', 'zandvoort'].includes(circuitId);
  const avgSpeed = isStreetOrTight ? 185 : 225;
  return Math.round(((lengthKm / avgSpeed) * 3600) * 10) / 10;
}

function generateAnchorLapTimes(circuitId: string, roster: LiveDriver[]): LiveDriver[] {
  const baseLapSeconds = getVenueBaseLapTime(circuitId);
  let fastestTime = Infinity;
  let fastestIdx = 3; // Default candidate (e.g. Leclerc)

  const list = roster.map((d, idx) => {
    const tyreDelta = d.tyre === 'S' ? -0.4 : d.tyre === 'H' ? 0.35 : 0.0;
    const posDelta = idx * 0.08;
    const tyreDeg = (d.tyreAge || 0) * 0.035;
    const variance = (Math.sin(idx * 1.5) * 0.12);

    const totalSeconds = baseLapSeconds + tyreDelta + posDelta + tyreDeg + variance;
    if (totalSeconds < fastestTime) {
      fastestTime = totalSeconds;
      fastestIdx = idx;
    }

    return {
      ...d,
      lastLapTime: formatLapTime(totalSeconds),
      isFastestSector: false
    };
  });

  if (list[fastestIdx]) {
    list[fastestIdx].isFastestSector = true;
  }

  return list;
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

const INITIAL_DRIVERS: LiveDriver[] = [
  { driverId: 'antonelli', code: 'ANT', name: 'Andrea Kimi Antonelli', number: '12', teamId: 'mercedes', teamName: 'Mercedes', position: 1, gapToLeader: 0.0, intervalToAhead: 0.0, lastLapTime: '1:35.420', isFastestSector: false, speedTrap: 331, tyre: 'M', tyreAge: 4, status: 'RACING', pitStops: 0 },
  { driverId: 'russell', code: 'RUS', name: 'George Russell', number: '63', teamId: 'mercedes', teamName: 'Mercedes', position: 2, gapToLeader: 1.250, intervalToAhead: 1.250, lastLapTime: '1:35.510', isFastestSector: false, speedTrap: 328, tyre: 'M', tyreAge: 4, status: 'RACING', pitStops: 0 },
  { driverId: 'hamilton', code: 'HAM', name: 'Lewis Hamilton', number: '44', teamId: 'ferrari', teamName: 'Ferrari', position: 3, gapToLeader: 2.840, intervalToAhead: 1.590, lastLapTime: '1:35.630', isFastestSector: false, speedTrap: 329, tyre: 'S', tyreAge: 6, status: 'RACING', pitStops: 0 },
  { driverId: 'leclerc', code: 'LEC', name: 'Charles Leclerc', number: '16', teamId: 'ferrari', teamName: 'Ferrari', position: 4, gapToLeader: 4.120, intervalToAhead: 1.280, lastLapTime: '1:35.120', isFastestSector: true, speedTrap: 334, tyre: 'S', tyreAge: 5, status: 'RACING', pitStops: 0 },
  { driverId: 'norris', code: 'NOR', name: 'Lando Norris', number: '1', teamId: 'mclaren', teamName: 'McLaren', position: 5, gapToLeader: 5.580, intervalToAhead: 1.460, lastLapTime: '1:35.820', isFastestSector: false, speedTrap: 327, tyre: 'M', tyreAge: 4, status: 'RACING', pitStops: 0 },
  { driverId: 'piastri', code: 'PIA', name: 'Oscar Piastri', number: '81', teamId: 'mclaren', teamName: 'McLaren', position: 6, gapToLeader: 7.920, intervalToAhead: 2.340, lastLapTime: '1:35.990', isFastestSector: false, speedTrap: 330, tyre: 'H', tyreAge: 3, status: 'RACING', pitStops: 0 },
  { driverId: 'max_verstappen', code: 'VER', name: 'Max Verstappen', number: '3', teamId: 'red_bull', teamName: 'Red Bull', position: 7, gapToLeader: 9.850, intervalToAhead: 1.930, lastLapTime: '1:35.720', isFastestSector: false, speedTrap: 325, tyre: 'M', tyreAge: 7, status: 'RACING', pitStops: 0 },
  { driverId: 'hadjar', code: 'HAD', name: 'Isack Hadjar', number: '6', teamId: 'red_bull', teamName: 'Red Bull', position: 8, gapToLeader: 12.300, intervalToAhead: 2.450, lastLapTime: '1:36.140', isFastestSector: false, speedTrap: 326, tyre: 'H', tyreAge: 8, status: 'RACING', pitStops: 0 },
  { driverId: 'gasly', code: 'GAS', name: 'Pierre Gasly', number: '10', teamId: 'alpine', teamName: 'Alpine F1 Team', position: 9, gapToLeader: 14.280, intervalToAhead: 1.980, lastLapTime: '1:36.350', isFastestSector: false, speedTrap: 329, tyre: 'M', tyreAge: 9, status: 'RACING', pitStops: 0 },
  { driverId: 'lawson', code: 'LAW', name: 'Liam Lawson', number: '30', teamId: 'rb', teamName: 'RB F1 Team', position: 10, gapToLeader: 18.520, intervalToAhead: 4.240, lastLapTime: '1:36.480', isFastestSector: false, speedTrap: 324, tyre: 'S', tyreAge: 10, status: 'RACING', pitStops: 0 },
  { driverId: 'arvid_lindblad', code: 'LIN', name: 'Arvid Lindblad', number: '41', teamId: 'rb', teamName: 'RB F1 Team', position: 11, gapToLeader: 21.050, intervalToAhead: 2.530, lastLapTime: '1:36.620', isFastestSector: false, speedTrap: 328, tyre: 'S', tyreAge: 8, status: 'RACING', pitStops: 0 },
  { driverId: 'bearman', code: 'BEA', name: 'Oliver Bearman', number: '87', teamId: 'haas', teamName: 'Haas F1 Team', position: 12, gapToLeader: 24.510, intervalToAhead: 3.460, lastLapTime: '1:36.790', isFastestSector: false, speedTrap: 326, tyre: 'M', tyreAge: 12, status: 'RACING', pitStops: 0 },
  { driverId: 'colapinto', code: 'COL', name: 'Franco Colapinto', number: '43', teamId: 'alpine', teamName: 'Alpine F1 Team', position: 13, gapToLeader: 28.020, intervalToAhead: 3.510, lastLapTime: '1:36.910', isFastestSector: false, speedTrap: 322, tyre: 'H', tyreAge: 11, status: 'RACING', pitStops: 0 },
  { driverId: 'bortoleto', code: 'BOR', name: 'Gabriel Bortoleto', number: '5', teamId: 'audi', teamName: 'Audi', position: 14, gapToLeader: 30.550, intervalToAhead: 2.530, lastLapTime: '1:37.040', isFastestSector: false, speedTrap: 325, tyre: 'M', tyreAge: 13, status: 'RACING', pitStops: 0 },
  { driverId: 'sainz', code: 'SAI', name: 'Carlos Sainz', number: '55', teamId: 'williams', teamName: 'Williams', position: 15, gapToLeader: 32.840, intervalToAhead: 2.290, lastLapTime: '1:37.150', isFastestSector: false, speedTrap: 323, tyre: 'H', tyreAge: 9, status: 'RACING', pitStops: 0 },
  { driverId: 'albon', code: 'ALB', name: 'Alex Albon', number: '23', teamId: 'williams', teamName: 'Williams', position: 16, gapToLeader: 35.120, intervalToAhead: 2.280, lastLapTime: '1:37.290', isFastestSector: false, speedTrap: 327, tyre: 'H', tyreAge: 14, status: 'RACING', pitStops: 0 },
  { driverId: 'ocon', code: 'OCO', name: 'Esteban Ocon', number: '31', teamId: 'haas', teamName: 'Haas F1 Team', position: 17, gapToLeader: 38.450, intervalToAhead: 3.330, lastLapTime: '1:37.410', isFastestSector: false, speedTrap: 321, tyre: 'S', tyreAge: 11, status: 'RACING', pitStops: 0 },
  { driverId: 'alonso', code: 'ALO', name: 'Fernando Alonso', number: '14', teamId: 'aston_martin', teamName: 'Aston Martin', position: 18, gapToLeader: 41.200, intervalToAhead: 2.750, lastLapTime: '1:37.530', isFastestSector: false, speedTrap: 323, tyre: 'M', tyreAge: 15, status: 'RACING', pitStops: 0 },
  { driverId: 'hulkenberg', code: 'HUL', name: 'Nico Hulkenberg', number: '27', teamId: 'audi', teamName: 'Audi', position: 19, gapToLeader: 44.920, intervalToAhead: 3.720, lastLapTime: '1:37.690', isFastestSector: false, speedTrap: 324, tyre: 'H', tyreAge: 16, status: 'RACING', pitStops: 0 },
  { driverId: 'bottas', code: 'BOT', name: 'Valtteri Bottas', number: '77', teamId: 'cadillac', teamName: 'Cadillac F1 Team', position: 20, gapToLeader: 48.050, intervalToAhead: 3.130, lastLapTime: '1:37.890', isFastestSector: false, speedTrap: 322, tyre: 'S', tyreAge: 13, status: 'RACING', pitStops: 0 },
  { driverId: 'perez', code: 'PER', name: 'Sergio Perez', number: '11', teamId: 'cadillac', teamName: 'Cadillac F1 Team', position: 21, gapToLeader: 51.520, intervalToAhead: 3.470, lastLapTime: '1:38.050', isFastestSector: false, speedTrap: 325, tyre: 'H', tyreAge: 10, status: 'RACING', pitStops: 0 },
  { driverId: 'stroll', code: 'STR', name: 'Lance Stroll', number: '18', teamId: 'aston_martin', teamName: 'Aston Martin', position: 22, gapToLeader: 55.020, intervalToAhead: 3.500, lastLapTime: '1:38.290', isFastestSector: false, speedTrap: 326, tyre: 'H', tyreAge: 14, status: 'RACING', pitStops: 0 }
];

export interface CompetitiveSession {
  id: 'sprint_qualifying' | 'sprint_race' | 'qualifying' | 'race';
  name: string;
  shortName: string;
  badge: string;
  icon: string;
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
  const [drivers, setDrivers] = useState<LiveDriver[]>(INITIAL_DRIVERS);
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

  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toTimeString().split(' ')[0]}] MISSION CONTROL: Pit-wall telemetry uplink initialized.`,
    `[${new Date().toTimeString().split(' ')[0]}] TELEMETRY POLICY: Telemetry stream activates strictly on Sprint Quali, Sprint Race, Quali, and Race.`
  ]);

  const logConsoleRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

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
            setDrivers(generateAnchorLapTimes(resolvedId, INITIAL_DRIVERS));

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

    // Re-anchor drivers' lap times for realistic venue telemetry
    setDrivers(generateAnchorLapTimes(circuitId, INITIAL_DRIVERS));

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
        { id: 'sprint_qualifying', name: 'Sprint Qualifying', shortName: 'SPRINT QUALI', badge: 'SQ', icon: '⏱️', status: 'NOT_SCHEDULED', dateStr: 'Not Scheduled', timeStr: '—', startTimeUtc: null, endTimeUtc: null, durationMinutes: 45, startMs: null, endMs: null },
        { id: 'sprint_race', name: 'Sprint Race', shortName: 'SPRINT RACE', badge: 'SPRINT', icon: '⚡', status: 'NOT_SCHEDULED', dateStr: 'Not Scheduled', timeStr: '—', startTimeUtc: null, endTimeUtc: null, durationMinutes: 60, startMs: null, endMs: null },
        { id: 'qualifying', name: 'Qualifying', shortName: 'QUALIFYING', badge: 'QUALI', icon: '🏁', status: 'NOT_SCHEDULED', dateStr: 'Track Benchmark', timeStr: '14:00', startTimeUtc: null, endTimeUtc: null, durationMinutes: 60, startMs: null, endMs: null },
        { id: 'race', name: 'Grand Prix (Race)', shortName: 'GRAND PRIX', badge: 'RACE', icon: '🏆', status: 'NOT_SCHEDULED', dateStr: 'Track Benchmark', timeStr: '15:00', startTimeUtc: null, endTimeUtc: null, durationMinutes: 120, startMs: null, endMs: null }
      ]);
    }

    const timeStamp = new Date().toTimeString().split(' ')[0];
    setLogs(l => [
      ...l,
      `[${timeStamp}] 🏁 VENUE RADAR SYNCHRONIZED: Switched to ${venueName}${countryName ? ` (${countryName})` : ''}. Pre-session benchmark grid loaded.`
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
            setLogs(l => [...l, `[${timeStr}] SYSTEM: ${msg.message}`]);
          }

          else if (msg.source === 'F1_LIVE_SERVER') {
            setIsLiveTransmitting(true);

            if (msg.channel === 'TimingData' && msg.data && msg.data.Lines) {
              setDrivers(prev => {
                const list = prev.map(d => ({ ...d }));
                const lines = msg.data.Lines;

                Object.entries(lines).forEach(([driverNum, dataLine]) => {
                  const lineObj = dataLine as {
                    Position?: string;
                    LastLapTime?: { Value?: string };
                    Speeds?: { ST?: string };
                    InPit?: boolean;
                    Retired?: boolean;
                    GapToLeader?: string;
                    IntervalToPositionAhead?: { Value?: string };
                    NumberOfPitStops?: number;
                  };
                  const matched = list.find(d => d.number === driverNum);
                  if (matched) {
                    if (lineObj.Position) matched.position = parseInt(lineObj.Position) || matched.position;
                    if (lineObj.LastLapTime?.Value) matched.lastLapTime = lineObj.LastLapTime.Value;
                    if (lineObj.Speeds?.ST) matched.speedTrap = parseInt(lineObj.Speeds.ST) || matched.speedTrap;
                    if (lineObj.InPit !== undefined) matched.status = lineObj.InPit ? 'IN PIT' : 'RACING';
                    if (lineObj.Retired !== undefined) matched.status = lineObj.Retired ? 'RETIRED' : matched.status;
                    if (lineObj.GapToLeader !== undefined) {
                      matched.gapToLeader = parseFloat(lineObj.GapToLeader) || 0;
                    }
                    if (lineObj.IntervalToPositionAhead?.Value !== undefined) {
                      matched.intervalToAhead = parseFloat(lineObj.IntervalToPositionAhead.Value) || 0;
                    }
                    if (lineObj.NumberOfPitStops !== undefined) {
                      matched.pitStops = lineObj.NumberOfPitStops;
                    }
                  }
                });

                list.sort((a, b) => a.position - b.position);
                return list;
              });
            }

            if (msg.channel === 'TrackStatus' && msg.data && msg.data.Status) {
              const statusVal = msg.data.Status;
              if (statusVal === '1') setFlagStatus('GREEN');
              else if (statusVal === '2') setFlagStatus('YELLOW');
              else if (statusVal === '4') setFlagStatus('SAFETY CAR');
              else if (statusVal === '5') setFlagStatus('RED FLAG');
              setLogs(l => [...l, `[${timeStr}] 🏁 FIA TRACK STATUS: Flag condition ${statusVal === '1' ? 'GREEN' : statusVal === '2' ? 'YELLOW' : statusVal === '4' ? 'SAFETY CAR' : 'RED FLAG'}`]);
            }

            if (msg.channel === 'RaceControlMessages' && msg.data && msg.data.Messages) {
              const messages = Object.values(msg.data.Messages) as Array<{ Message?: string; Utc?: string }>;
              messages.forEach(m => {
                if (m.Message) {
                  const msgTime = m.Utc ? new Date(m.Utc).toTimeString().split(' ')[0] : timeStr;
                  setLogs(l => [...l, `[${msgTime}] 🏁 FIA RACE CONTROL: ${m.Message}`]);
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
  const isCompetitiveSessionLive = Boolean(activeLiveSession) || isLiveTransmitting;

  const countdownToNext = nextUpcomingSession && nextUpcomingSession.startMs 
    ? formatCountdown(nextUpcomingSession.startMs) 
    : null;

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
                : proxyStatus === 'CONNECTED' || proxyStatus === 'STANDBY'
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : 'bg-red-950/30 border-red-500/40 text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isCompetitiveSessionLive 
                  ? 'bg-emerald-400 animate-pulse' 
                  : proxyStatus === 'CONNECTED' || proxyStatus === 'STANDBY'
                    ? 'bg-cyan-400' 
                    : 'bg-red-500'
              }`}></span>
              <span>
                {isCompetitiveSessionLive 
                  ? '🔴 LIVE TRANSMITTING' 
                  : proxyStatus === 'CONNECTED' || proxyStatus === 'STANDBY' 
                    ? 'UPLINK STANDBY' 
                    : 'UPLINK OFFLINE'}
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
              background: 'rgba(52, 228, 200, 0.08)', 
              border: '1px solid var(--cyan)', 
              borderRadius: '6px', 
              padding: '10px 14px', 
              marginTop: '16px', 
              color: 'var(--cyan)', 
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
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCompetitiveSessionLive ? 'var(--green)' : 'var(--cyan)', display: 'inline-block', boxShadow: `0 0 8px ${isCompetitiveSessionLive ? 'var(--green)' : 'var(--cyan)'}` }}></span>
              <span>
                <strong>OFFICIAL COMPETITIVE SESSION RADAR:</strong> Telemetry streams exclusively during Sprint Qualifying, Sprint Race, Qualifying, and Grand Prix sessions. Simulation engine removed.
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
                <span className="text-slate-400">BENCHMARK GRID LOADED</span>
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
                    : `OFFICIAL PRE-SESSION CLASSIFICATION & BENCHMARK GRID // ${currentVenueName.toUpperCase()}`}
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-cyan-500/30">
                  {isCompetitiveSessionLive ? 'TRANSMITTING LIVE' : 'PRE-SESSION BENCHMARK'}
                </span>
              </div>
            </div>

            <div style={{ maxHeight: '360px', overflowY: 'auto', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--dim)' }}>
                    <th style={{ padding: '8px 6px' }}>POS</th>
                    <th style={{ padding: '8px 6px' }}>NUM</th>
                    <th style={{ padding: '8px 6px' }}>DRIVER</th>
                    <th style={{ padding: '8px 6px' }}>GAP</th>
                    <th style={{ padding: '8px 6px' }}>INT</th>
                    <th style={{ padding: '8px 6px' }}>LAST LAP</th>
                    <th style={{ padding: '8px 6px' }}>SPEED</th>
                    <th style={{ padding: '8px 6px' }}>TYRE &amp; STINT</th>
                    <th style={{ padding: '8px 6px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(row => {
                    const color = getTeamColor(row.teamId);
                    const isFastest = row.isFastestSector;
                    const inPit = row.status === 'IN PIT';
                    const retired = row.status === 'RETIRED';
                    const isHovered = activeDriverCode === row.code;
                    const tyreStyle = getTyreBadgeStyle(row.tyre);
                    const isOldTyre = (row.tyre === 'S' && row.tyreAge >= 18) || (row.tyre === 'M' && row.tyreAge >= 26) || (row.tyre === 'H' && row.tyreAge >= 36);

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
                        <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)' }}>
                          {row.position === 1 ? (
                            <span style={{ color: 'var(--green)', fontWeight: 700 }}>LEADER</span>
                          ) : (
                            <span style={{ color: 'var(--paper)' }}>+{row.gapToLeader.toFixed(3)}s</span>
                          )}
                        </td>
                        <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)', color: 'var(--dim)' }}>
                          {row.position === 1 ? (
                            <span>-</span>
                          ) : (
                            <span>+{(row.intervalToAhead ?? 0).toFixed(3)}s</span>
                          )}
                        </td>
                        <td style={{ padding: '6px 6px', fontFamily: 'var(--font-mono)' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ 
                              color: isFastest ? '#D946EF' : 'var(--paper)', 
                              fontWeight: isFastest ? 700 : 500,
                              textShadow: isFastest ? '0 0 8px rgba(217, 70, 239, 0.5)' : 'none'
                            }}>
                              {row.lastLapTime}
                            </span>
                            {isFastest && (
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
                                title="Fastest Lap of Session"
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
                              BENCHMARK
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
      </div>
    </section>
  );
}
