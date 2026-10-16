export type QuestionId =
  | 'replay'
  | 'tyre_stints'
  | 'pit_stop_review'
  | 'strategy_duel'
  | 'turning_points'
  | 'debrief'
  | 'circuit_strengths'
  | 'time_lost';

// Backward compatibility alias for any existing consumers
export type ToolId = QuestionId | 'venue_form' | 'telemetry' | 'tyres';

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
    id: 'replay',
    title: 'Strategy Replay',
    question: 'What actually happened during this race and when did key gaps open?',
    icon: '⏱️',
    shortDesc: 'Interactive continuous lap time chart, head-to-head pace delta, outlier explanations, and synchronized pit events.',
    badge: 'FEATURE A • REPLAY',
    badgeVariant: 'blue',
    evidenceType: 'Continuous Discrete Lap Records'
  },
  {
    id: 'tyre_stints',
    title: 'Tyre Life & Pace',
    question: 'How did tyre degradation and fuel burnoff shape stint longevity?',
    icon: '🔴',
    shortDesc: 'Stint pace curves, fuel-corrected wear slopes (&Delta;s/lap), regression on true lap numbers, and qualified compound badges.',
    badge: 'FEATURE B • TYRE PACE',
    badgeVariant: 'amber',
    evidenceType: 'Stint Pace & Linear Wear Models'
  },
  {
    id: 'pit_stop_review',
    title: 'Undercut Analyzer',
    question: 'Did pit stop timing and box execution yield a track position advantage?',
    icon: '🛑',
    shortDesc: 'Official FIA stationary box durations, in-lap vs out-lap pace delta, net pit cycle time loss, and pit lane timeline.',
    badge: 'FEATURE C • UNDERCUT RADAR',
    badgeVariant: 'emerald',
    evidenceType: 'Recorded FIA Pit Transponder Records'
  },
  {
    id: 'strategy_duel',
    title: 'What-If Simulator',
    question: 'How would an alternate stop lap or tyre choice have changed the outcome?',
    icon: '⚔️',
    shortDesc: 'Plan A vs Plan B tactical simulator with configurable parameters: pit loss delta, fuel burnoff rate, and safety car discount.',
    badge: 'FEATURE D • WHAT-IF ENGINE',
    badgeVariant: 'purple',
    evidenceType: 'Deterministic Tactical Model'
  },
  {
    id: 'turning_points',
    title: 'Turning Points',
    question: 'Which specific laps and events altered the race trajectory?',
    icon: '🚩',
    shortDesc: 'Verified event timeline linking pit cycles, safety car periods, and pace dropoffs directly to corresponding race laps.',
    badge: 'FEATURE E • TURNING POINTS',
    badgeVariant: 'red',
    evidenceType: 'Verified Race Interruption & Classification Logs'
  },
  {
    id: 'debrief',
    title: 'Strategy Debrief',
    question: 'What is the executive takeaway and evidence-backed race summary?',
    icon: '📋',
    shortDesc: 'Concise, shareable strategy debrief synthesizing observed pace facts, pit cycle execution, and model limitations.',
    badge: 'FEATURE F • STRATEGY DEBRIEF',
    badgeVariant: 'zinc',
    evidenceType: 'Executive Analytical Synthesis'
  },
  {
    id: 'circuit_strengths',
    title: 'Circuit DNA',
    question: 'Which aerodynamic, mechanical, and power unit demands define this venue?',
    icon: '🧬',
    shortDesc: 'Track geometry calibration, full-throttle percentages, downforce wing setups, and deep links to the 78-circuit gallery.',
    badge: 'VENUE DEMANDS & DNA',
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
