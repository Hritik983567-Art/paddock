export type QuestionId = 'pit_stop_review' | 'time_lost' | 'tyre_stints' | 'circuit_strengths';

// Backward compatibility alias for any existing consumers
export type ToolId = QuestionId | 'venue_form' | 'telemetry' | 'strategy_duel' | 'tyres';

export interface RoundItem {
  round: string;
  raceName: string;
  date: string;
  circuitId: string;
  circuitName?: string;
}

export interface DriverResultItem {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  constructorName: string;
  constructorId?: string;
  grid: string;
  position: string;
  status: string;
  points?: string;
  fastestLapSecs?: number;
  fastestLapSpeed?: string;
  fastestLapRawTime?: string;
  lapsCompleted: number;
}

export interface LapRecord {
  lapNumber: number; // 1-based official race lap number
  time: number | null; // Lap time in seconds, or null if missing / excluded
  rawTime?: string; // Original string e.g. "1:34.205"
  position?: number;
  isPitStop?: boolean;
  isOutlier?: boolean; // Stoppage, red flag, SC or VSC
}

export interface DriverLapsDataset {
  driverId: string;
  code: string;
  name: string;
  constructorName: string;
  constructorId: string;
  totalLaps: number;
  laps: LapRecord[]; // Padded exactly from Lap 1 to totalRaceLaps (1-to-1 indexed)
  cleanLapsCount: number;
  bestLapSec: number | null;
  avgCleanPaceSec: number | null;
  stdDevSec: number | null;
  consistencyScore: number | null; // 0-100%
}

export interface PitStopItem {
  driverId: string;
  driverCode: string;
  driverName: string;
  constructorName: string;
  constructorId: string;
  lap: number; // Lap on which driver entered pit lane
  stopNumber: number;
  durationSec: number | null; // Stationary pit duration in seconds
  rawDuration: string;
  timeOfDay?: string;
}

export interface StintSummary {
  driverId: string;
  driverCode: string;
  constructorName: string;
  constructorId: string;
  stintNumber: number;
  startLap: number;
  endLap: number;
  totalLaps: number;
  cleanLaps: number;
  avgPaceSec: number | null;
  wearSlopeSecPerLap: number | null; // Fuel-corrected tyre wear slope (s/lap)
  inferredCompound?: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET' | 'UNKNOWN';
}

export interface GrandPrixSummary {
  season: string;
  round: string;
  raceName: string;
  circuitId: string;
  circuitName: string;
  locality?: string;
  country?: string;
  date: string;
  totalRaceLaps: number;
  winner?: {
    driverId: string;
    name: string;
    code: string;
    constructorName: string;
  };
  fastestLap?: {
    driverName: string;
    code: string;
    time: string;
    speed?: string;
  };
  polePosition?: {
    driverName: string;
    code: string;
    time?: string;
  };
}

export interface QuestionCard {
  id: QuestionId;
  question: string;
  title: string;
  icon: string;
  shortDesc: string;
  badge: string;
  badgeVariant: 'emerald' | 'blue' | 'amber' | 'purple' | 'red' | 'zinc';
  evidenceType: string;
}

export const QUESTION_WORKSPACES: QuestionCard[] = [
  {
    id: 'pit_stop_review',
    title: 'Pit Stop Review',
    question: 'When did drivers pit and what was the observed track impact?',
    icon: '🛑',
    shortDesc: 'Investigate recorded pit stop timing, crew stationary durations, undercut/overcut windows, and in-lap vs out-lap pace delta.',
    badge: 'OFFICIAL PIT TELEMETRY',
    badgeVariant: 'emerald',
    evidenceType: 'Recorded FIA Pit Transponder Records'
  },
  {
    id: 'time_lost',
    title: 'Where Was Time Lost?',
    question: 'Where and when did pace drop or gaps open up?',
    icon: '⏱️',
    shortDesc: 'Inspect discrete lap-by-lap pace traces, head-to-head delta progression, stint averages, and consistency without shifting lap indices.',
    badge: 'RECORDED TIMING TRACE',
    badgeVariant: 'blue',
    evidenceType: 'Continuous Discrete Lap Time Records'
  },
  {
    id: 'tyre_stints',
    title: 'Tyre Stint Story',
    question: 'How did tyres hold up across each stint?',
    icon: '🔴',
    shortDesc: 'Explore recorded stint longevity, fuel-corrected wear slopes (s/lap), and qualified thermal degradation models.',
    badge: 'STINT PACE & DEGRADATION',
    badgeVariant: 'amber',
    evidenceType: 'Recorded Stint Lengths & Wear Rate Fits'
  },
  {
    id: 'circuit_strengths',
    title: 'Circuit Strengths',
    question: 'Which car characteristics and sector demands define this venue?',
    icon: '🧬',
    shortDesc: 'Examine track layout geometry, aerodynamic vs mechanical demands, speed traps, and explore interactive corner physics in the gallery.',
    badge: 'CIRCUIT DEMANDS & GEOMETRY',
    badgeVariant: 'purple',
    evidenceType: 'Track Physics Calibration & Speed Traps'
  }
];

// Retain legacy LAB_TOOLS for backward compatibility
export const LAB_TOOLS = QUESTION_WORKSPACES.map(q => ({
  id: q.id as ToolId,
  icon: q.icon,
  name: q.title.toUpperCase(),
  shortDesc: q.shortDesc,
  status: 'AVAILABLE' as const,
  badge: q.badge
}));
