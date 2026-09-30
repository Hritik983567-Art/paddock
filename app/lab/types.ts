export type ToolId = 'telemetry' | 'pace' | 'strategy' | 'tyres';

export interface RoundItem {
  round: string;
  raceName: string;
  date: string;
  circuitId: string;
}

export interface DriverResultItem {
  driverId: string;
  code: string;
  givenName: string;
  familyName: string;
  constructorName: string;
  grid: string;
  position: string;
  status: string;
  fastestLapSecs?: number;
  fastestLapSpeed?: string;
  lapsCompleted: number;
}

export interface ToolCard {
  id: ToolId;
  icon: string;
  name: string;
  shortDesc: string;
  status: 'AVAILABLE' | 'ACTIVE' | 'EXPERIMENTAL';
  badge: string;
}

export const LAB_TOOLS: ToolCard[] = [
  {
    id: 'telemetry',
    icon: '⚡',
    name: 'TELEMETRY & LAP ANALYZER',
    shortDesc: 'Analyze real lap-by-lap pace, sector breakdown, top speeds, and consistency index.',
    status: 'AVAILABLE',
    badge: 'REAL DATA'
  },
  {
    id: 'pace',
    icon: '⚔️',
    name: 'DRIVER RACE PACE DELTA',
    shortDesc: 'Compare head-to-head lap times, position changes, and cumulative time gaps between two drivers.',
    status: 'AVAILABLE',
    badge: 'DERIVED METRIC'
  },
  {
    id: 'strategy',
    icon: '📊',
    name: 'PIT STRATEGY SIMULATOR',
    shortDesc: 'Simulate 1-stop vs 2-stop vs 3-stop stint degradation calibrated with real GP pace.',
    status: 'AVAILABLE',
    badge: 'CALIBRATED MODEL'
  },
  {
    id: 'tyres',
    icon: '🔴',
    name: 'TYRE DEGRADATION LAB',
    shortDesc: 'Analyze compound thermal wear rates (Soft / Medium / Hard) derived from real race stints.',
    status: 'AVAILABLE',
    badge: 'EXPERIMENTAL'
  }
];
