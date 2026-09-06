export interface CornerImage {
  src: string;
  source: string;
  sourceUrl?: string;
  license: string;
  attribution?: string;
  type: 'real';
  verified: boolean;
  alt: string;
}

export interface CornerTechnicalData {
  entrySpeed?: string;
  apexSpeed?: string;
  exitSpeed?: string;
  typicalGear?: string;
  brakingIntensity?: string;
  elevationChange?: string;
  drs?: string;
}

export interface CornerRacingData {
  overtakingPotential?: string;
  brakingZone?: string;
  racingLine?: string;
  trackLimits?: string;
}

export type CornerInventoryStatus = 'VERIFIED' | 'IMPORTED' | 'MISSING' | 'PENDING';

export interface CircuitCorner {
  id: string;
  circuitId: string;
  name: string;
  turns: string;
  direction?: string;
  type?: string;
  gear?: number;
  speed_kph?: number;
  characteristics?: string;
  description: string;
  technical?: CornerTechnicalData;
  racing?: CornerRacingData;
  history?: string;
  status: CornerInventoryStatus;
  x: number;
  y: number;
  images: CornerImage[];
}

export interface CircuitCornerCollection {
  circuitId: string;
  circuitName: string;
  corners: Record<string, CircuitCorner>;
}

export interface CircuitInventoryItem {
  circuitId: string;
  circuitName: string;
  cornerId: string;
  cornerName: string;
  turns: string;
  status: CornerInventoryStatus;
  hasRealPhoto: boolean;
  photoCount: number;
  primarySource: string;
  primaryLicense: string;
  primaryAttribution: string;
}

export const ALL_CIRCUIT_CORNERS: Record<string, CircuitCornerCollection> = {
  'bahrain': {
    circuitId: 'bahrain',
    circuitName: 'Bahrain International Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Bahrain International Circuit Turn 1 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '108 km/h',
          exitSpeed: '224 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Bahrain International Circuit Turn 2 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '271 km/h',
          apexSpeed: '168 km/h',
          exitSpeed: '258 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 638, y: 315,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Bahrain International Circuit Turn 3 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '304 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '268 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 574, y: 369,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Bahrain International Circuit Turn 4 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '312 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 402,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Bahrain International Circuit Turn 5 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '278 km/h',
          apexSpeed: '149 km/h',
          exitSpeed: '228 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '0.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 373, y: 409,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Bahrain International Circuit Turn 6 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '253 km/h',
          apexSpeed: '187 km/h',
          exitSpeed: '202 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 270, y: 389,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Bahrain International Circuit Turn 7 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '265 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 344,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Bahrain International Circuit Turn 8 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '288 km/h',
          apexSpeed: '97 km/h',
          exitSpeed: '254 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 146, y: 283,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Bahrain International Circuit Turn 9 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '311 km/h',
          apexSpeed: '104 km/h',
          exitSpeed: '225 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '1.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 146, y: 217,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Bahrain International Circuit Turn 10 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '319 km/h',
          apexSpeed: '157 km/h',
          exitSpeed: '224 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 156,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Bahrain International Circuit Turn 11 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '299 km/h',
          apexSpeed: '205 km/h',
          exitSpeed: '194 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 270, y: 111,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Bahrain International Circuit Turn 12 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '307 km/h',
          apexSpeed: '145 km/h',
          exitSpeed: '236 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 373, y: 91,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Bahrain International Circuit Turn 13 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '313 km/h',
          apexSpeed: '182 km/h',
          exitSpeed: '253 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.6 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 98,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Bahrain International Circuit Turn 14 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '301 km/h',
          apexSpeed: '202 km/h',
          exitSpeed: '218 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 574, y: 131,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'bahrain',
        name: 'Bahrain International Circuit Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Bahrain International Circuit Turn 15 section of Bahrain International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '277 km/h',
          apexSpeed: '202 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Bahrain International Circuit (Bahrain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 638, y: 185,
        images: []
      },
    }
  },
  'jeddah': {
    circuitId: 'jeddah',
    circuitName: 'Jeddah Corniche Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Jeddah Corniche Circuit Turn 1 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '312 km/h',
          apexSpeed: '168 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Jeddah Corniche Circuit Turn 2 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '318 km/h',
          apexSpeed: '197 km/h',
          exitSpeed: '261 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 652, y: 290,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Jeddah Corniche Circuit Turn 3 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '250 km/h',
          apexSpeed: '143 km/h',
          exitSpeed: '201 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 628, y: 327,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Jeddah Corniche Circuit Turn 4 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '290 km/h',
          apexSpeed: '149 km/h',
          exitSpeed: '244 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 590, y: 360,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Jeddah Corniche Circuit Turn 5 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '259 km/h',
          apexSpeed: '182 km/h',
          exitSpeed: '206 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-0.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 539, y: 385,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Jeddah Corniche Circuit Turn 6 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '272 km/h',
          apexSpeed: '132 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 402,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Jeddah Corniche Circuit Turn 7 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '289 km/h',
          apexSpeed: '98 km/h',
          exitSpeed: '191 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '-1.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 416, y: 410,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Jeddah Corniche Circuit Turn 8 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '288 km/h',
          apexSpeed: '100 km/h',
          exitSpeed: '227 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.2 G',
          elevationChange: '-0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 351, y: 407,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Jeddah Corniche Circuit Turn 9 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '250 km/h',
          apexSpeed: '134 km/h',
          exitSpeed: '187 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 289, y: 395,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Jeddah Corniche Circuit Turn 10 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '264 km/h',
          apexSpeed: '202 km/h',
          exitSpeed: '204 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 234, y: 373,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Jeddah Corniche Circuit Turn 11 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '270 km/h',
          apexSpeed: '207 km/h',
          exitSpeed: '244 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 344,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Jeddah Corniche Circuit Turn 12 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '134 km/h',
          exitSpeed: '191 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-1.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 158, y: 309,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Jeddah Corniche Circuit Turn 13 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '277 km/h',
          apexSpeed: '204 km/h',
          exitSpeed: '183 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '0.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 142, y: 270,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Jeddah Corniche Circuit Turn 14 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '267 km/h',
          apexSpeed: '152 km/h',
          exitSpeed: '219 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 142, y: 230,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Jeddah Corniche Circuit Turn 15 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '285 km/h',
          apexSpeed: '152 km/h',
          exitSpeed: '252 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 158, y: 191,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Jeddah Corniche Circuit Turn 16 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '250 km/h',
          apexSpeed: '163 km/h',
          exitSpeed: '269 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '-1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 16 (T16) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 156,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Jeddah Corniche Circuit Turn 17 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '287 km/h',
          apexSpeed: '118 km/h',
          exitSpeed: '202 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '0.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 17 (T17) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 234, y: 127,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Jeddah Corniche Circuit Turn 18 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '259 km/h',
          apexSpeed: '126 km/h',
          exitSpeed: '214 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 18 (T18) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 289, y: 105,
        images: []
      },
      't19': {
        id: 't19',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 19',
        turns: 'Turn 19 (T19)',
        description: 'Jeddah Corniche Circuit Turn 19 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '250 km/h',
          apexSpeed: '200 km/h',
          exitSpeed: '246 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 19 (T19) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 351, y: 93,
        images: []
      },
      't20': {
        id: 't20',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 20',
        turns: 'Turn 20 (T20)',
        description: 'Jeddah Corniche Circuit Turn 20 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '292 km/h',
          apexSpeed: '200 km/h',
          exitSpeed: '258 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 20 (T20) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 416, y: 90,
        images: []
      },
      't21': {
        id: 't21',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 21',
        turns: 'Turn 21 (T21)',
        description: 'Jeddah Corniche Circuit Turn 21 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '270 km/h',
          apexSpeed: '111 km/h',
          exitSpeed: '228 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-0.4 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 21 (T21) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 98,
        images: []
      },
      't22': {
        id: 't22',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 22',
        turns: 'Turn 22 (T22)',
        description: 'Jeddah Corniche Circuit Turn 22 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '289 km/h',
          apexSpeed: '192 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 22 (T22) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 539, y: 115,
        images: []
      },
      't23': {
        id: 't23',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 23',
        turns: 'Turn 23 (T23)',
        description: 'Jeddah Corniche Circuit Turn 23 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '286 km/h',
          apexSpeed: '149 km/h',
          exitSpeed: '194 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 23 (T23) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 590, y: 140,
        images: []
      },
      't24': {
        id: 't24',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 24',
        turns: 'Turn 24 (T24)',
        description: 'Jeddah Corniche Circuit Turn 24 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '207 km/h',
          exitSpeed: '256 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 24 (T24) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 628, y: 173,
        images: []
      },
      't25': {
        id: 't25',
        circuitId: 'jeddah',
        name: 'Jeddah Corniche Circuit Turn 25',
        turns: 'Turn 25 (T25)',
        description: 'Jeddah Corniche Circuit Turn 25 section of Jeddah Corniche Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '283 km/h',
          apexSpeed: '206 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-0.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 25 (T25) at Jeddah Corniche Circuit (Saudi Arabia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 652, y: 210,
        images: []
      },
    }
  },
  'albert_park': {
    circuitId: 'albert_park',
    circuitName: 'Albert Park Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Albert Park Circuit Turn 1 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '188 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '1.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Albert Park Circuit Turn 2 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '253 km/h',
          apexSpeed: '128 km/h',
          exitSpeed: '224 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 634, y: 319,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Albert Park Circuit Turn 3 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '293 km/h',
          apexSpeed: '154 km/h',
          exitSpeed: '218 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 562, y: 375,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Albert Park Circuit Turn 4 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '313 km/h',
          apexSpeed: '171 km/h',
          exitSpeed: '242 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 458, y: 406,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Albert Park Circuit Turn 5 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '127 km/h',
          exitSpeed: '238 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 342, y: 406,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Albert Park Circuit Turn 6 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '311 km/h',
          apexSpeed: '100 km/h',
          exitSpeed: '189 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '-1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 238, y: 375,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Albert Park Circuit Turn 7 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '279 km/h',
          apexSpeed: '144 km/h',
          exitSpeed: '259 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 166, y: 319,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Albert Park Circuit Turn 8 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '182 km/h',
          exitSpeed: '207 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '-0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Albert Park Circuit Turn 9 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '257 km/h',
          apexSpeed: '138 km/h',
          exitSpeed: '214 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 166, y: 181,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Albert Park Circuit Turn 10 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '277 km/h',
          apexSpeed: '145 km/h',
          exitSpeed: '224 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 238, y: 125,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Albert Park Circuit Turn 11 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '282 km/h',
          apexSpeed: '206 km/h',
          exitSpeed: '198 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 342, y: 94,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Albert Park Circuit Turn 12 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '314 km/h',
          apexSpeed: '167 km/h',
          exitSpeed: '252 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 458, y: 94,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Albert Park Circuit Turn 13 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '288 km/h',
          apexSpeed: '163 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.3 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 562, y: 125,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'albert_park',
        name: 'Albert Park Circuit Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Albert Park Circuit Turn 14 section of Albert Park Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '96 km/h',
          exitSpeed: '226 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Albert Park Circuit (Australia) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 634, y: 181,
        images: []
      },
    }
  },
  'suzuka': {
    circuitId: 'suzuka',
    circuitName: 'Suzuka International Racing Course',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'suzuka',
        name: 'Turn 1 Sweeper',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 Sweeper section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '264 km/h',
          apexSpeed: '106 km/h',
          exitSpeed: '186 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '-1.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Fast sweeping downhill right turn taken at 280 km/h.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'suzuka',
        name: 'Turn 2 Tight Right',
        turns: 'Turn 2 (T2)',
        description: 'Turn 2 Tight Right section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '303 km/h',
          apexSpeed: '184 km/h',
          exitSpeed: '181 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tightening right exit leading directly into the rhythmic S-Curves.",
        status: 'MISSING',
        x: 644, y: 305,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'suzuka',
        name: 'S-Curves Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'S-Curves Turn 3 section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '271 km/h',
          apexSpeed: '180 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '-1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "First left-hand turn of the flowing S-Curves.",
        status: 'MISSING',
        x: 599, y: 353,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'suzuka',
        name: 'S-Curves Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'S-Curves Turn 4 section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '265 km/h',
          apexSpeed: '177 km/h',
          exitSpeed: '268 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Right-hand rhythm turn requiring smooth weight transfer.",
        status: 'MISSING',
        x: 530, y: 389,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'suzuka',
        name: 'S-Curves Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'S-Curves Turn 5 section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '285 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '0.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Left-hand turn through the S-Curves uphill climb.",
        status: 'MISSING',
        x: 445, y: 408,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'suzuka',
        name: 'S-Curves Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'S-Curves Turn 6 section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '258 km/h',
          apexSpeed: '91 km/h',
          exitSpeed: '253 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Right-hand sweeper leading towards Dunlop.",
        status: 'MISSING',
        x: 355, y: 408,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'suzuka',
        name: 'Dunlop Curve',
        turns: 'Turn 7 (T7)',
        description: 'Dunlop Curve section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '298 km/h',
          apexSpeed: '154 km/h',
          exitSpeed: '231 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Dunlop uphill long left curve where high lateral Gs wear the right-front tire.",
        status: 'MISSING',
        x: 270, y: 389,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'suzuka',
        name: 'Degner 1',
        turns: 'Turn 8 (T8)',
        description: 'Degner 1 section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '268 km/h',
          apexSpeed: '156 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Degner 1—fast 240 km/h right turn named after Ernst Degner who crashed here in 1962.",
        status: 'MISSING',
        x: 201, y: 353,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'suzuka',
        name: 'Degner 2',
        turns: 'Turn 9 (T9)',
        description: 'Degner 2 section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '251 km/h',
          apexSpeed: '121 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '0.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Degner 2—tight right-hander under the track bridge.",
        status: 'MISSING',
        x: 156, y: 305,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'suzuka',
        name: 'Underpass Right',
        turns: 'Turn 10 (T10)',
        description: 'Underpass Right section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '264 km/h',
          apexSpeed: '99 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Hairpin approach under the 3D crossover bridge.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'suzuka',
        name: 'Hairpin Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Hairpin Turn 11 section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '259 km/h',
          apexSpeed: '186 km/h',
          exitSpeed: '267 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Hairpin—heavy braking zone and top overtaking spot surrounded by passionate Japanese fans.",
        status: 'MISSING',
        x: 156, y: 195,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'suzuka',
        name: '200R',
        turns: 'Turn 12 (T12)',
        description: '200R section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '276 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '225 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '-1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "200R long sweeping right turn accelerating towards Spoon.",
        status: 'MISSING',
        x: 201, y: 147,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'suzuka',
        name: 'Spoon Curve Entry',
        turns: 'Turn 13 (T13)',
        description: 'Spoon Curve Entry section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '312 km/h',
          apexSpeed: '106 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '0.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Spoon Curve entry—downhill left-hander.",
        status: 'MISSING',
        x: 270, y: 111,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'suzuka',
        name: 'Spoon Curve Apex',
        turns: 'Turn 14 (T14)',
        description: 'Spoon Curve Apex section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '295 km/h',
          apexSpeed: '173 km/h',
          exitSpeed: '232 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Spoon Curve exit—off-camber left turn opening onto the back straight.",
        status: 'MISSING',
        x: 355, y: 92,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'suzuka',
        name: '130R High Speed Sweep',
        turns: 'Turn 15 (T15)',
        description: '130R (Turn 15) is Suzuka ultra-famous 130-meter radius left-hand curve. Taken at 305 km/h in top gear, it tests driver nerve and vehicle aerodynamics.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '305 km/h',
          exitSpeed: '310 km/h',
          typicalGear: '7th / 8th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '+1.8 m',
          drs: 'Back Straight DRS'
        },
        racing: {
          overtakingPotential: '8.5 / 10 (Inside line slipstream pass)',
          brakingZone: 'Lift or slight dab before entry',
          racingLine: 'Sweeping left hugging inner kerb',
          trackLimits: 'Outer astro-turf & gravel'
        },
        history: "130R—terrifying 305 km/h left-hand sweep named after its 130m radius, site of Alonso's 2005 pass on Schumacher.",
        status: 'MISSING',
        x: 445, y: 92,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'suzuka',
        name: 'Casio Triangle Chicane T16',
        turns: 'Turn 16 (T16)',
        description: 'Casio Triangle Chicane T16 section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '284 km/h',
          apexSpeed: '172 km/h',
          exitSpeed: '209 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Casio Triangle chicane entry, site of Prost and Senna's championship-deciding collision in 1989.",
        status: 'MISSING',
        x: 530, y: 111,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'suzuka',
        name: 'Casio Triangle Chicane T17',
        turns: 'Turn 17 (T17)',
        description: 'Casio Triangle Chicane T17 section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '297 km/h',
          apexSpeed: '143 km/h',
          exitSpeed: '207 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '0.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Casio Triangle exit onto the main pit straight.",
        status: 'MISSING',
        x: 599, y: 147,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'suzuka',
        name: 'Final Corner',
        turns: 'Turn 18 (T18)',
        description: 'Final Corner section of Suzuka International Racing Course. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '301 km/h',
          apexSpeed: '204 km/h',
          exitSpeed: '241 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 18 (T18) at Suzuka International Racing Course (Japan) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 644, y: 195,
        images: []
      },
    }
  },
  'shanghai': {
    circuitId: 'shanghai',
    circuitName: 'Shanghai International Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Shanghai International Circuit Turn 1 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '285 km/h',
          apexSpeed: '91 km/h',
          exitSpeed: '243 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Shanghai International Circuit Turn 2 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '293 km/h',
          apexSpeed: '194 km/h',
          exitSpeed: '207 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 640, y: 311,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Shanghai International Circuit Turn 3 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '258 km/h',
          apexSpeed: '207 km/h',
          exitSpeed: '254 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 584, y: 363,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Shanghai International Circuit Turn 4 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '265 km/h',
          apexSpeed: '152 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 499, y: 398,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Shanghai International Circuit Turn 5 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '272 km/h',
          apexSpeed: '112 km/h',
          exitSpeed: '216 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '0.8 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 400, y: 410,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Shanghai International Circuit Turn 6 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '289 km/h',
          apexSpeed: '132 km/h',
          exitSpeed: '261 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 301, y: 398,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Shanghai International Circuit Turn 7 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '312 km/h',
          apexSpeed: '155 km/h',
          exitSpeed: '266 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 216, y: 363,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Shanghai International Circuit Turn 8 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '254 km/h',
          apexSpeed: '193 km/h',
          exitSpeed: '236 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 160, y: 311,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Shanghai International Circuit Turn 9 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '316 km/h',
          apexSpeed: '99 km/h',
          exitSpeed: '192 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Shanghai International Circuit Turn 10 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '268 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '200 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 160, y: 189,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Shanghai International Circuit Turn 11 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '298 km/h',
          apexSpeed: '119 km/h',
          exitSpeed: '210 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 216, y: 137,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Shanghai International Circuit Turn 12 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '91 km/h',
          exitSpeed: '186 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 301, y: 102,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Shanghai International Circuit Turn 13 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '258 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '210 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '0.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 400, y: 90,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Shanghai International Circuit Turn 14 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '193 km/h',
          exitSpeed: '193 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 499, y: 102,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Shanghai International Circuit Turn 15 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '316 km/h',
          apexSpeed: '115 km/h',
          exitSpeed: '269 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 584, y: 137,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'shanghai',
        name: 'Shanghai International Circuit Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Shanghai International Circuit Turn 16 section of Shanghai International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '110 km/h',
          exitSpeed: '193 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 16 (T16) at Shanghai International Circuit (China) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 640, y: 189,
        images: []
      },
    }
  },
  'miami': {
    circuitId: 'miami',
    circuitName: 'Miami International Autodrome',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Miami International Autodrome Turn 1 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '302 km/h',
          apexSpeed: '185 km/h',
          exitSpeed: '225 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '0.4 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '5.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Miami International Autodrome Turn 2 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '289 km/h',
          apexSpeed: '168 km/h',
          exitSpeed: '219 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '-1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 642, y: 308,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Miami International Autodrome Turn 3 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '297 km/h',
          apexSpeed: '189 km/h',
          exitSpeed: '253 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 592, y: 358,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Miami International Autodrome Turn 4 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '265 km/h',
          apexSpeed: '180 km/h',
          exitSpeed: '212 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 516, y: 393,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Miami International Autodrome Turn 5 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '284 km/h',
          apexSpeed: '206 km/h',
          exitSpeed: '204 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 424, y: 409,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Miami International Autodrome Turn 6 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '138 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 329, y: 404,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Miami International Autodrome Turn 7 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '282 km/h',
          apexSpeed: '138 km/h',
          exitSpeed: '213 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 243, y: 378,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Miami International Autodrome Turn 8 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '113 km/h',
          exitSpeed: '189 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 179, y: 334,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Miami International Autodrome Turn 9 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '276 km/h',
          apexSpeed: '144 km/h',
          exitSpeed: '244 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '1.4 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 144, y: 279,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Miami International Autodrome Turn 10 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '162 km/h',
          exitSpeed: '269 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '1.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 144, y: 221,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Miami International Autodrome Turn 11 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '284 km/h',
          apexSpeed: '101 km/h',
          exitSpeed: '196 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 179, y: 166,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Miami International Autodrome Turn 12 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '122 km/h',
          exitSpeed: '202 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 243, y: 122,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Miami International Autodrome Turn 13 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '284 km/h',
          apexSpeed: '116 km/h',
          exitSpeed: '216 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-0.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 329, y: 96,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Miami International Autodrome Turn 14 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '268 km/h',
          apexSpeed: '208 km/h',
          exitSpeed: '183 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 424, y: 91,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Miami International Autodrome Turn 15 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '274 km/h',
          apexSpeed: '105 km/h',
          exitSpeed: '226 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 516, y: 107,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Miami International Autodrome Turn 16 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '290 km/h',
          apexSpeed: '91 km/h',
          exitSpeed: '243 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '1.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 16 (T16) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 592, y: 142,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'miami',
        name: 'Miami International Autodrome Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Miami International Autodrome Turn 17 section of Miami International Autodrome. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '251 km/h',
          apexSpeed: '171 km/h',
          exitSpeed: '248 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '-0.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 17 (T17) at Miami International Autodrome (United States) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 642, y: 192,
        images: []
      },
    }
  },
  'imola': {
    circuitId: 'imola',
    circuitName: 'Autodromo Enzo e Dino Ferrari',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 1 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '256 km/h',
          apexSpeed: '167 km/h',
          exitSpeed: '180 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '-1.8 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tamburello chicane entry—reconfigured after the 1994 San Marino GP to honor Ayrton Senna's memory.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 2 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '296 km/h',
          apexSpeed: '192 km/h',
          exitSpeed: '219 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Right apex of Tamburello chicane.",
        status: 'MISSING',
        x: 642, y: 308,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 3 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '289 km/h',
          apexSpeed: '154 km/h',
          exitSpeed: '208 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Exit of Tamburello accelerating along the Santerno riverbank.",
        status: 'MISSING',
        x: 592, y: 358,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 4 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '291 km/h',
          apexSpeed: '108 km/h',
          exitSpeed: '267 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Villeneuve chicane entry, named after Canadian legend Gilles Villeneuve.",
        status: 'MISSING',
        x: 516, y: 393,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 5 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '250 km/h',
          apexSpeed: '180 km/h',
          exitSpeed: '249 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.3 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Villeneuve chicane exit leading to Tosa.",
        status: 'MISSING',
        x: 424, y: 409,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 6 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '318 km/h',
          apexSpeed: '126 km/h',
          exitSpeed: '261 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tosa braking zone surrounded by the passionate Italian Tifosi hill.",
        status: 'MISSING',
        x: 329, y: 404,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 7 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '281 km/h',
          apexSpeed: '133 km/h',
          exitSpeed: '232 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tosa hairpin exit—steep uphill acceleration towards Piratella.",
        status: 'MISSING',
        x: 243, y: 378,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 8 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '187 km/h',
          exitSpeed: '244 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Piratella—blind downhill left-hand corner leading into the Acque Minerali valley.",
        status: 'MISSING',
        x: 179, y: 334,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 9 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '266 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '2.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Acque Minerali entry—downhill dip into double-right corner named after local mineral springs.",
        status: 'MISSING',
        x: 144, y: 279,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 10 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '319 km/h',
          apexSpeed: '132 km/h',
          exitSpeed: '199 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Acque Minerali apex pulling heavy lateral Gs.",
        status: 'MISSING',
        x: 144, y: 221,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 11 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '281 km/h',
          apexSpeed: '117 km/h',
          exitSpeed: '211 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Variante Alta entry—high kerb chicane at the top of the circuit.",
        status: 'MISSING',
        x: 179, y: 166,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 12 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '181 km/h',
          exitSpeed: '242 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Variante Alta exit launching downhill towards Rivazza.",
        status: 'MISSING',
        x: 243, y: 122,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 13 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '313 km/h',
          apexSpeed: '131 km/h',
          exitSpeed: '186 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Rivazza 1—downhill braking zone into left turn.",
        status: 'MISSING',
        x: 329, y: 96,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 14 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '271 km/h',
          apexSpeed: '177 km/h',
          exitSpeed: '213 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Rivazza 2—final left turn launching cars onto the pit straight.",
        status: 'MISSING',
        x: 424, y: 91,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 15 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '294 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '231 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Autodromo Enzo e Dino Ferrari (Italy) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 516, y: 107,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 16 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '308 km/h',
          apexSpeed: '184 km/h',
          exitSpeed: '204 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 16 (T16) at Autodromo Enzo e Dino Ferrari (Italy) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 592, y: 142,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'imola',
        name: 'Autodromo Enzo e Dino Ferrari Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Autodromo Enzo e Dino Ferrari Turn 17 section of Autodromo Enzo e Dino Ferrari. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '257 km/h',
          apexSpeed: '194 km/h',
          exitSpeed: '209 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 17 (T17) at Autodromo Enzo e Dino Ferrari (Italy) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 642, y: 192,
        images: []
      },
    }
  },
  'monaco': {
    circuitId: 'monaco',
    circuitName: 'Circuit de Monaco',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'monaco',
        name: 'Sainte Dévote',
        turns: 'Turn 1 (T1)',
        description: 'Sainte Dévote (Turn 1) is a sharp right-hand corner around the church of Saint Devota. Drivers brake hard from 290 km/h into the narrow armco barrier opening.',
        technical: {
          entrySpeed: '290 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '150 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '+2.0 m',
          drs: 'Main Straight DRS'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Monaco primary pass zone)',
          brakingZone: 'Braking 80m before right turn-in',
          racingLine: 'Clipping inner kerb barrier',
          trackLimits: 'Armco barrier lining turn'
        },
        history: "Right-hand corner named after Monaco's patron saint and 11th-century chapel. Infamous for turn-1 funneling crashes into the Beau Rivage hill.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'monaco',
        name: 'Beau Rivage Climb',
        turns: 'Turn 2 (T2)',
        description: 'Beau Rivage Climb section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '282 km/h',
          apexSpeed: '166 km/h',
          exitSpeed: '252 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Blind uphill climb past luxury hotel balconies where V10 and hybrid engines echo off Monte Carlo cliffs.",
        status: 'MISSING',
        x: 646, y: 302,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'monaco',
        name: 'Massenet',
        turns: 'Turn 3 (T3)',
        description: 'Massenet section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '118 km/h',
          exitSpeed: '206 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '-0.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Long left-hand curve leaning against outer armco barriers past the Opera de Monte-Carlo.",
        status: 'MISSING',
        x: 605, y: 348,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'monaco',
        name: 'Casino Square',
        turns: 'Turn 4 (T4)',
        description: 'Casino Square section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '316 km/h',
          apexSpeed: '98 km/h',
          exitSpeed: '256 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '-1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Sweeping right corner past the Casino de Monte-Carlo, where cars brush barriers inches from high society spectators.",
        status: 'MISSING',
        x: 542, y: 384,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'monaco',
        name: 'Mirabeau Haute',
        turns: 'Turn 5 (T5)',
        description: 'Mirabeau Haute section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '264 km/h',
          apexSpeed: '200 km/h',
          exitSpeed: '199 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '0.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Downhill right-hand dip into the bumpy braking zone before the hairpin.",
        status: 'MISSING',
        x: 464, y: 405,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'monaco',
        name: 'Fairmont Hairpin',
        turns: 'Turn 6 (T6)',
        description: 'Fairmont Hairpin (Turn 6) is the slowest corner in Formula 1. Drivers apply maximum steering lock at just 45 km/h past the Grand Hotel.',
        technical: {
          entrySpeed: '95 km/h',
          apexSpeed: '45 km/h',
          exitSpeed: '70 km/h',
          typicalGear: '1st Gear (Full Steering Lock)',
          brakingIntensity: '-2.0 G',
          elevationChange: '-6.5 m',
          drs: 'No DRS'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Nose-to-tail procession)',
          brakingZone: 'Early braking on downhill descent',
          racingLine: 'Hugging inner curb inches from metal barrier',
          trackLimits: 'Guardrail barriers'
        },
        history: "The slowest corner in F1 (~45 km/h), requiring full steering lock as cars weave past the Fairmont hotel.",
        status: 'MISSING',
        x: 379, y: 409,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'monaco',
        name: 'Mirabeau Bas',
        turns: 'Turn 7 (T7)',
        description: 'Mirabeau Bas section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '274 km/h',
          apexSpeed: '184 km/h',
          exitSpeed: '234 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Downhill right turn into Portier where Ayrton Senna famously crashed out while leading the 1988 GP by 55 seconds.",
        status: 'MISSING',
        x: 296, y: 397,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'monaco',
        name: 'Portier',
        turns: 'Turn 8 (T8)',
        description: 'Portier section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '264 km/h',
          apexSpeed: '124 km/h',
          exitSpeed: '188 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tight right turn leading directly into the seaside tunnel.",
        status: 'MISSING',
        x: 224, y: 368,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'monaco',
        name: 'Tunnel Exit',
        turns: 'Turn 9 (T9)',
        description: 'Tunnel Exit section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '303 km/h',
          apexSpeed: '208 km/h',
          exitSpeed: '223 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-1.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Blasting through the dark seaside tunnel at 290 km/h before blinding sunlight hits drivers at the exit.",
        status: 'MISSING',
        x: 171, y: 326,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'monaco',
        name: 'Nouvelle Chicane Entry',
        turns: 'Turn 10 (T10)',
        description: 'Nouvelle Chicane Entry section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '311 km/h',
          apexSpeed: '159 km/h',
          exitSpeed: '206 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Heavy braking zone out of the tunnel onto the harbour edge, site of famous late-braking overtakes.",
        status: 'MISSING',
        x: 144, y: 276,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'monaco',
        name: 'Nouvelle Chicane Exit',
        turns: 'Turn 11 (T11)',
        description: 'Nouvelle Chicane Exit section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '280 km/h',
          apexSpeed: '128 km/h',
          exitSpeed: '189 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Exit of Nouvelle Chicane accelerating along the harbour quay.",
        status: 'MISSING',
        x: 144, y: 224,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'monaco',
        name: 'Tabac',
        turns: 'Turn 12 (T12)',
        description: 'Tabac section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '259 km/h',
          apexSpeed: '135 km/h',
          exitSpeed: '245 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Fast left-hand sweep bordering superyachts, named after the historic tobacco shop on the harbour quay.",
        status: 'MISSING',
        x: 171, y: 174,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'monaco',
        name: 'Louis Chiron (Swimming Pool 1)',
        turns: 'Turn 13 (T13)',
        description: 'Louis Chiron (Swimming Pool 1) section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '304 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '263 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "High-speed S-chicane entry around the Rainier III nautical stadium.",
        status: 'MISSING',
        x: 224, y: 132,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'monaco',
        name: 'Swimming Pool 2',
        turns: 'Turn 14 (T14)',
        description: 'Swimming Pool 2 section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '289 km/h',
          apexSpeed: '112 km/h',
          exitSpeed: '191 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '1.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Right-hand flick over high kerbs inside the Swimming Pool complex.",
        status: 'MISSING',
        x: 296, y: 103,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'monaco',
        name: 'Swimming Pool Chicane 3',
        turns: 'Turn 15 (T15)',
        description: 'Swimming Pool Chicane 3 section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '259 km/h',
          apexSpeed: '113 km/h',
          exitSpeed: '265 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tight left-right chicane exit where cars clip inner barriers at 200 km/h.",
        status: 'MISSING',
        x: 379, y: 91,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'monaco',
        name: 'Swimming Pool Exit',
        turns: 'Turn 16 (T16)',
        description: 'Swimming Pool Exit section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '297 km/h',
          apexSpeed: '92 km/h',
          exitSpeed: '188 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Exit of Swimming Pool heading towards Rascasse.",
        status: 'MISSING',
        x: 464, y: 95,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'monaco',
        name: 'Rascasse',
        turns: 'Turn 17 (T17)',
        description: 'Rascasse section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '274 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-5.0 G',
          elevationChange: '-1.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tight hairpin named after the Rascasse seafood restaurant, infamous for Michael Schumacher's 2006 qualifying parking incident.",
        status: 'MISSING',
        x: 542, y: 116,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'monaco',
        name: 'Virage Antony Noghès',
        turns: 'Turn 18 (T18)',
        description: 'Virage Antony Noghès section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '311 km/h',
          apexSpeed: '204 km/h',
          exitSpeed: '229 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Apex of Rascasse requiring precise throttle control on slippery asphalt.",
        status: 'MISSING',
        x: 605, y: 152,
        images: []
      },
      't19': {
        id: 't19',
        circuitId: 'monaco',
        name: 'Pit Straight Bend',
        turns: 'Turn 19 (T19)',
        description: 'Pit Straight Bend section of Circuit de Monaco. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '205 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '-1.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Final right turn named after the founder of the Monaco Grand Prix who organized the first race in 1929.",
        status: 'MISSING',
        x: 646, y: 198,
        images: []
      },
    }
  },
  'villeneuve': {
    circuitId: 'villeneuve',
    circuitName: 'Circuit Gilles Villeneuve',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Circuit Gilles Villeneuve Turn 1 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '305 km/h',
          apexSpeed: '162 km/h',
          exitSpeed: '258 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.8 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Circuit Gilles Villeneuve Turn 2 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '305 km/h',
          apexSpeed: '102 km/h',
          exitSpeed: '180 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 634, y: 319,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Circuit Gilles Villeneuve Turn 3 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '282 km/h',
          apexSpeed: '140 km/h',
          exitSpeed: '247 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 562, y: 375,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Circuit Gilles Villeneuve Turn 4 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '269 km/h',
          apexSpeed: '208 km/h',
          exitSpeed: '241 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 458, y: 406,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Circuit Gilles Villeneuve Turn 5 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '256 km/h',
          apexSpeed: '164 km/h',
          exitSpeed: '264 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '0.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 342, y: 406,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Circuit Gilles Villeneuve Turn 6 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '312 km/h',
          apexSpeed: '110 km/h',
          exitSpeed: '212 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 238, y: 375,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Circuit Gilles Villeneuve Turn 7 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '270 km/h',
          apexSpeed: '143 km/h',
          exitSpeed: '192 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 166, y: 319,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Circuit Gilles Villeneuve Turn 8 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '283 km/h',
          apexSpeed: '92 km/h',
          exitSpeed: '196 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '2.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Circuit Gilles Villeneuve Turn 9 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '304 km/h',
          apexSpeed: '141 km/h',
          exitSpeed: '235 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 166, y: 181,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Circuit Gilles Villeneuve Turn 10 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '314 km/h',
          apexSpeed: '183 km/h',
          exitSpeed: '201 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 238, y: 125,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Circuit Gilles Villeneuve Turn 11 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '267 km/h',
          apexSpeed: '138 km/h',
          exitSpeed: '212 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 342, y: 94,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Circuit Gilles Villeneuve Turn 12 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '250 km/h',
          apexSpeed: '200 km/h',
          exitSpeed: '251 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 458, y: 94,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Circuit Gilles Villeneuve Turn 13 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '304 km/h',
          apexSpeed: '91 km/h',
          exitSpeed: '241 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '-1.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 562, y: 125,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'villeneuve',
        name: 'Circuit Gilles Villeneuve Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Circuit Gilles Villeneuve Turn 14 section of Circuit Gilles Villeneuve. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '259 km/h',
          apexSpeed: '137 km/h',
          exitSpeed: '198 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Circuit Gilles Villeneuve (Canada) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 634, y: 181,
        images: []
      },
    }
  },
  'catalunya': {
    circuitId: 'catalunya',
    circuitName: 'Circuit de Barcelona-Catalunya',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Circuit de Barcelona-Catalunya Turn 1 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '265 km/h',
          apexSpeed: '126 km/h',
          exitSpeed: '202 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-1.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Circuit de Barcelona-Catalunya Turn 2 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '313 km/h',
          apexSpeed: '155 km/h',
          exitSpeed: '247 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 634, y: 319,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Circuit de Barcelona-Catalunya Turn 3 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '146 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 562, y: 375,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Circuit de Barcelona-Catalunya Turn 4 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '99 km/h',
          exitSpeed: '238 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 458, y: 406,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Circuit de Barcelona-Catalunya Turn 5 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '257 km/h',
          apexSpeed: '151 km/h',
          exitSpeed: '214 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '0.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 342, y: 406,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Circuit de Barcelona-Catalunya Turn 6 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '309 km/h',
          apexSpeed: '128 km/h',
          exitSpeed: '243 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 238, y: 375,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Circuit de Barcelona-Catalunya Turn 7 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '261 km/h',
          apexSpeed: '93 km/h',
          exitSpeed: '256 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 166, y: 319,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Circuit de Barcelona-Catalunya Turn 8 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '271 km/h',
          apexSpeed: '129 km/h',
          exitSpeed: '266 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Circuit de Barcelona-Catalunya Turn 9 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '122 km/h',
          exitSpeed: '184 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '0.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 166, y: 181,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Circuit de Barcelona-Catalunya Turn 10 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '282 km/h',
          apexSpeed: '117 km/h',
          exitSpeed: '263 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '2.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 238, y: 125,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Circuit de Barcelona-Catalunya Turn 11 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '300 km/h',
          apexSpeed: '173 km/h',
          exitSpeed: '234 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 342, y: 94,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Circuit de Barcelona-Catalunya Turn 12 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '287 km/h',
          apexSpeed: '129 km/h',
          exitSpeed: '256 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 458, y: 94,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Circuit de Barcelona-Catalunya Turn 13 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '294 km/h',
          apexSpeed: '114 km/h',
          exitSpeed: '193 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '1.8 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 562, y: 125,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'catalunya',
        name: 'Circuit de Barcelona-Catalunya Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Circuit de Barcelona-Catalunya Turn 14 section of Circuit de Barcelona-Catalunya. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Circuit de Barcelona-Catalunya (Spain) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 634, y: 181,
        images: []
      },
    }
  },
  'red_bull_ring': {
    circuitId: 'red_bull_ring',
    circuitName: 'Red Bull Ring',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Red Bull Ring Turn 1 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '253 km/h',
          apexSpeed: '130 km/h',
          exitSpeed: '243 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '1.6 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Red Bull Ring Turn 2 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '181 km/h',
          exitSpeed: '265 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 610, y: 344,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Red Bull Ring Turn 3 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '254 km/h',
          apexSpeed: '191 km/h',
          exitSpeed: '226 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-0.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 402,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Red Bull Ring Turn 4 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '308 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '192 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 320, y: 402,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Red Bull Ring Turn 5 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '161 km/h',
          exitSpeed: '254 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.2 G',
          elevationChange: '1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 344,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Red Bull Ring Turn 6 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '268 km/h',
          apexSpeed: '97 km/h',
          exitSpeed: '217 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Red Bull Ring Turn 7 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '279 km/h',
          apexSpeed: '167 km/h',
          exitSpeed: '212 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 156,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Red Bull Ring Turn 8 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '287 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 320, y: 98,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Red Bull Ring Turn 9 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '266 km/h',
          apexSpeed: '106 km/h',
          exitSpeed: '214 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '5.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 98,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'red_bull_ring',
        name: 'Red Bull Ring Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Red Bull Ring Turn 10 section of Red Bull Ring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '299 km/h',
          apexSpeed: '91 km/h',
          exitSpeed: '227 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Red Bull Ring (Austria) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 610, y: 156,
        images: []
      },
    }
  },
  'silverstone': {
    circuitId: 'silverstone',
    circuitName: 'Silverstone Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'silverstone',
        name: 'Abbey',
        turns: 'Turn 1 (T1)',
        description: 'Abbey (Turn 1) is a terrifying 290 km/h right-hand corner taken with a tiny dab of brake in modern high-downforce F1 cars.',
        technical: {
          entrySpeed: '310 km/h',
          apexSpeed: '285 km/h',
          exitSpeed: '295 km/h',
          typicalGear: '7th Gear',
          brakingIntensity: '-2.4 G',
          elevationChange: '+0.8 m',
          drs: 'DRS Zone Exit'
        },
        racing: {
          overtakingPotential: '7.0 / 10 (Outbraking down the inside)',
          brakingZone: 'Minimal brush on brakes',
          racingLine: 'Smooth right turn clipping inner kerb',
          trackLimits: 'Exit green paint'
        },
        history: "High-speed 290 km/h right turn opening the lap, named after Luffield Abbey ruins.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'silverstone',
        name: 'Farm Curve',
        turns: 'Turn 2 (T2)',
        description: 'Farm Curve section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '280 km/h',
          apexSpeed: '155 km/h',
          exitSpeed: '223 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Left kink leading into the Arena infield section.",
        status: 'MISSING',
        x: 644, y: 305,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'silverstone',
        name: 'Village',
        turns: 'Turn 3 (T3)',
        description: 'Village section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '300 km/h',
          apexSpeed: '145 km/h',
          exitSpeed: '269 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Village corner—a prime overtaking spot in front of packed grandstands.",
        status: 'MISSING',
        x: 599, y: 353,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'silverstone',
        name: 'The Loop',
        turns: 'Turn 4 (T4)',
        description: 'The Loop section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '157 km/h',
          exitSpeed: '187 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '-2.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tight left loop requiring patient throttle application.",
        status: 'MISSING',
        x: 530, y: 389,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'silverstone',
        name: 'Aintree',
        turns: 'Turn 5 (T5)',
        description: 'Aintree section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '258 km/h',
          apexSpeed: '132 km/h',
          exitSpeed: '184 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Aintree corner launching cars onto the Wellington Straight.",
        status: 'MISSING',
        x: 445, y: 408,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'silverstone',
        name: 'Wellington Straight Bend',
        turns: 'Turn 6 (T6)',
        description: 'Wellington Straight Bend section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '209 km/h',
          exitSpeed: '243 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Brooklands heavy braking zone at the end of Wellington Straight.",
        status: 'MISSING',
        x: 355, y: 408,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'silverstone',
        name: 'Brooklands',
        turns: 'Turn 7 (T7)',
        description: 'Brooklands section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '316 km/h',
          apexSpeed: '116 km/h',
          exitSpeed: '236 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Luffield long right-hand sweeper where drivers modulate throttle.",
        status: 'MISSING',
        x: 270, y: 389,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'silverstone',
        name: 'Luffield',
        turns: 'Turn 8 (T8)',
        description: 'Luffield section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '278 km/h',
          apexSpeed: '113 km/h',
          exitSpeed: '203 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Woodcote fast sweep onto the National Pit Straight.",
        status: 'MISSING',
        x: 201, y: 353,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'silverstone',
        name: 'Woodcote',
        turns: 'Turn 9 (T9)',
        description: 'Woodcote section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '303 km/h',
          apexSpeed: '138 km/h',
          exitSpeed: '248 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.4 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Flat-out 290 km/h corner named after Copse Wood, scene of the 2021 Hamilton-Verstappen collision.",
        status: 'MISSING',
        x: 156, y: 305,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'silverstone',
        name: 'Copse',
        turns: 'Turn 10 (T10)',
        description: 'Copse (Turn 10) is one of motorsport fastest, most famous corners. F1 cars enter Copse at 300 km/h pulling over 5 G of lateral force.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '290 km/h',
          exitSpeed: '305 km/h',
          typicalGear: '8th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '0.0 m',
          drs: 'No DRS'
        },
        racing: {
          overtakingPotential: '8.5 / 10 (High speed bravery pass)',
          brakingZone: 'Slight lift or light touch on brakes',
          racingLine: 'Commitment to the inner right kerb',
          trackLimits: 'Gravel run-off area'
        },
        history: "First right-hand entry of the legendary Maggotts-Becketts flow complex.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'silverstone',
        name: 'Maggotts',
        turns: 'Turn 11 (T11)',
        description: 'Maggotts, Becketts, and Chapel (Turns 11-14) form the ultimate high-speed chicane complex in world motorsport. Cars change direction at over 250 km/h.',
        technical: {
          entrySpeed: '300 km/h',
          apexSpeed: '245 km/h',
          exitSpeed: '280 km/h',
          typicalGear: '6th / 7th Gear',
          brakingIntensity: '-3.0 G',
          elevationChange: '+1.2 m',
          drs: 'Hangar Straight DRS Setup'
        },
        racing: {
          overtakingPotential: '5.0 / 10 (Pure aero flow and momentum)',
          brakingZone: 'Throttle feathering and light trail braking',
          racingLine: 'Dancing across left-right-left kerbs',
          trackLimits: 'Strict track limit lines'
        },
        history: "Left-hand flick at 290 km/h pulling 5G of lateral force.",
        status: 'MISSING',
        x: 156, y: 195,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'silverstone',
        name: 'Becketts 1',
        turns: 'Turn 12 (T12)',
        description: 'Becketts 1 section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '317 km/h',
          apexSpeed: '204 km/h',
          exitSpeed: '198 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Right-hand apex of Becketts demanding supreme chassis balance.",
        status: 'MISSING',
        x: 201, y: 147,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'silverstone',
        name: 'Becketts 2',
        turns: 'Turn 13 (T13)',
        description: 'Becketts 2 section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '299 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '199 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '1.3 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Left-hand exit onto Chapel curve.",
        status: 'MISSING',
        x: 270, y: 111,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'silverstone',
        name: 'Chapel',
        turns: 'Turn 14 (T14)',
        description: 'Chapel section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '303 km/h',
          apexSpeed: '119 km/h',
          exitSpeed: '234 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Chapel exit launching cars onto the Hangar Straight.",
        status: 'MISSING',
        x: 355, y: 92,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'silverstone',
        name: 'Stowe',
        turns: 'Turn 15 (T15)',
        description: 'Stowe (Turn 15) is a high-speed right-hander at the end of the Hangar Straight. Cars brake from 330 km/h down to 200 km/h.',
        technical: {
          entrySpeed: '330 km/h',
          apexSpeed: '200 km/h',
          exitSpeed: '245 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-1.0 m',
          drs: 'Hangar Straight DRS Active'
        },
        racing: {
          overtakingPotential: '9.0 / 10 (Prime DRS overtaking zone)',
          brakingZone: 'Braking at 80m board',
          racingLine: 'Deep entry and wide exit power delivery',
          trackLimits: 'Outer asphalt & gravel'
        },
        history: "Stowe corner—fast right-hand turn named after Stowe School, terminating Hangar Straight.",
        status: 'MISSING',
        x: 445, y: 92,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'silverstone',
        name: 'Vale',
        turns: 'Turn 16 (T16)',
        description: 'Vale section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '250 km/h',
          apexSpeed: '132 km/h',
          exitSpeed: '244 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-0.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Vale heavy braking dip before the final complex.",
        status: 'MISSING',
        x: 530, y: 111,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'silverstone',
        name: 'Club Left',
        turns: 'Turn 17 (T17)',
        description: 'Club Left section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '261 km/h',
          apexSpeed: '207 km/h',
          exitSpeed: '259 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-1.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Club corner right-hand entry.",
        status: 'MISSING',
        x: 599, y: 147,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'silverstone',
        name: 'Club Final Corner',
        turns: 'Turn 18 (T18)',
        description: 'Club Final Corner section of Silverstone Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '119 km/h',
          exitSpeed: '242 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '-1.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Club final corner leading onto Hamilton Straight, where Lewis Hamilton won on 3 tires in 2020.",
        status: 'MISSING',
        x: 644, y: 195,
        images: []
      },
    }
  },
  'hungaroring': {
    circuitId: 'hungaroring',
    circuitName: 'Hungaroring',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Hungaroring Turn 1 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '303 km/h',
          apexSpeed: '199 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '1.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Hungaroring Turn 2 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '267 km/h',
          apexSpeed: '196 km/h',
          exitSpeed: '182 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 634, y: 319,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Hungaroring Turn 3 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '311 km/h',
          apexSpeed: '128 km/h',
          exitSpeed: '251 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 562, y: 375,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Hungaroring Turn 4 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '268 km/h',
          apexSpeed: '201 km/h',
          exitSpeed: '232 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 458, y: 406,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Hungaroring Turn 5 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '276 km/h',
          apexSpeed: '140 km/h',
          exitSpeed: '252 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '0.4 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 342, y: 406,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Hungaroring Turn 6 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '292 km/h',
          apexSpeed: '139 km/h',
          exitSpeed: '259 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-0.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 238, y: 375,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Hungaroring Turn 7 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '266 km/h',
          apexSpeed: '148 km/h',
          exitSpeed: '181 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '2.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 166, y: 319,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Hungaroring Turn 8 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '292 km/h',
          apexSpeed: '144 km/h',
          exitSpeed: '256 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '2.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Hungaroring Turn 9 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '268 km/h',
          apexSpeed: '118 km/h',
          exitSpeed: '246 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '-2.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 166, y: 181,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Hungaroring Turn 10 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '276 km/h',
          apexSpeed: '137 km/h',
          exitSpeed: '197 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 238, y: 125,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Hungaroring Turn 11 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '261 km/h',
          apexSpeed: '184 km/h',
          exitSpeed: '268 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 342, y: 94,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Hungaroring Turn 12 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '291 km/h',
          apexSpeed: '134 km/h',
          exitSpeed: '189 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 458, y: 94,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Hungaroring Turn 13 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '254 km/h',
          apexSpeed: '96 km/h',
          exitSpeed: '234 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '1.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 562, y: 125,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'hungaroring',
        name: 'Hungaroring Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Hungaroring Turn 14 section of Hungaroring. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '316 km/h',
          apexSpeed: '196 km/h',
          exitSpeed: '209 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Hungaroring (Hungary) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 634, y: 181,
        images: []
      },
    }
  },
  'spa': {
    circuitId: 'spa',
    circuitName: 'Circuit de Spa-Francorchamps',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'spa',
        name: 'La Source Hairpin',
        turns: 'Turn 1 (T1)',
        description: 'La Source Hairpin (Turn 1) is a tight right-hand hairpin immediately after the start line. Cars slow from 285 km/h to just 75 km/h.',
        technical: {
          entrySpeed: '285 km/h',
          apexSpeed: '75 km/h',
          exitSpeed: '130 km/h',
          typicalGear: '1st / 2nd Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-4.0 m',
          drs: 'Start/Finish DRS Exit'
        },
        racing: {
          overtakingPotential: '9.2 / 10 (Premier opening lap spectacle)',
          brakingZone: 'Heavy braking at 100m marker',
          racingLine: 'Tight inner hair-pin clip',
          trackLimits: 'Tarmac run-off area'
        },
        history: "Downhill hairpin named after Ardennes mineral springs. Famous for dramatic opening lap scrambles, including the 13-car pileup in 1998 and Fernando Alonso's airborne crash over Leclerc in 2018.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'spa',
        name: 'Eau Rouge Left',
        turns: 'Turn 2 (T2)',
        description: 'Eau Rouge & Raidillon (Turns 2-4) is the most iconic corner complex in Formula 1 history. Cars compress downhill across the stream before launching up an 18% incline.',
        technical: {
          entrySpeed: '305 km/h',
          apexSpeed: '300 km/h',
          exitSpeed: '315 km/h',
          typicalGear: '7th / 8th Gear',
          brakingIntensity: '0.0 G (Flat Out)',
          elevationChange: '+24.0 m (Steep Climb)',
          drs: 'Kemmel Straight DRS Entry'
        },
        racing: {
          overtakingPotential: '9.5 / 10 (Kemmel Straight draft launch)',
          brakingZone: 'No braking — full throttle commitment',
          racingLine: 'Left dip across Eau Rouge stream, right blind crest up Raidillon',
          trackLimits: 'Raidillon crest kerb sensors'
        },
        history: "Compression dip at the base of Eau Rouge stream. Cars compress under 5G of vertical force before climbing the 17% gradient.",
        status: 'MISSING',
        x: 646, y: 302,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'spa',
        name: 'Raidillon Right',
        turns: 'Turn 3 (T3)',
        description: 'Raidillon Right section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '257 km/h',
          apexSpeed: '157 km/h',
          exitSpeed: '239 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '0.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "The blind uphill right turn into Raidillon. Drivers take this crest flat-out at 300+ km/h relying entirely on muscle memory and downforce.",
        status: 'MISSING',
        x: 605, y: 348,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'spa',
        name: 'Raidillon Crest',
        turns: 'Turn 4 (T4)',
        description: 'Raidillon Crest section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '304 km/h',
          apexSpeed: '117 km/h',
          exitSpeed: '267 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Summit of Raidillon launching cars onto the 2km Kemmel Straight.",
        status: 'MISSING',
        x: 542, y: 384,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'spa',
        name: 'Les Combes 1',
        turns: 'Turn 5 (T5)',
        description: 'Les Combes 1 section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '251 km/h',
          apexSpeed: '181 km/h',
          exitSpeed: '184 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-1.6 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Les Combes chicane at the highest point of the circuit (Hautes Fagnes), the primary overtaking zone after slipstreaming up Kemmel.",
        status: 'MISSING',
        x: 464, y: 405,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'spa',
        name: 'Les Combes 2',
        turns: 'Turn 6 (T6)',
        description: 'Les Combes 2 section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '295 km/h',
          apexSpeed: '183 km/h',
          exitSpeed: '182 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Middle apex of Les Combes requiring smooth weight transfer.",
        status: 'MISSING',
        x: 379, y: 409,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'spa',
        name: 'Malmedy',
        turns: 'Turn 7 (T7)',
        description: 'Malmedy section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '314 km/h',
          apexSpeed: '129 km/h',
          exitSpeed: '206 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Exit of Les Combes leading downhill towards Malmedy and Bruxelles.",
        status: 'MISSING',
        x: 296, y: 397,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'spa',
        name: 'Bruxelles Hairpin',
        turns: 'Turn 8 (T8)',
        description: 'Bruxelles Hairpin section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '266 km/h',
          apexSpeed: '164 km/h',
          exitSpeed: '245 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Off-camber 180-degree downhill right hairpin where front tires struggle for grip over the steep gradient.",
        status: 'MISSING',
        x: 224, y: 368,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'spa',
        name: 'Speaker Corner',
        turns: 'Turn 9 (T9)',
        description: 'Speaker Corner section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '285 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '267 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '0.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Fast downhill left-hand sweeper leading into the Ardennes forest valley.",
        status: 'MISSING',
        x: 171, y: 326,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'spa',
        name: 'Pouhon Entry',
        turns: 'Turn 10 (T10)',
        description: 'Pouhon (Turns 10-11) is a breathtaking double-apex left-handed sweeper taken downhill at 260 km/h with over 5 G of lateral acceleration.',
        technical: {
          entrySpeed: '290 km/h',
          apexSpeed: '260 km/h',
          exitSpeed: '275 km/h',
          typicalGear: '6th / 7th Gear',
          brakingIntensity: '-2.1 G',
          elevationChange: '-12.0 m',
          drs: 'No DRS'
        },
        racing: {
          overtakingPotential: '5.5 / 10 (Aero grip commitment corner)',
          brakingZone: 'Dab of brake on entry',
          racingLine: 'Double apex sweep hugging left kerb',
          trackLimits: 'Outer gravel trap'
        },
        history: "Super-fast 260 km/h downhill left corner pulling 5.2G of lateral load—a true test of driver bravery and aerodynamic downforce.",
        status: 'MISSING',
        x: 144, y: 276,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'spa',
        name: 'Pouhon Apex',
        turns: 'Turn 11 (T11)',
        description: 'Pouhon Apex section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '279 km/h',
          apexSpeed: '206 km/h',
          exitSpeed: '264 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Second apex of Pouhon, taken with progressive throttle as the track opens up.",
        status: 'MISSING',
        x: 144, y: 224,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'spa',
        name: 'Fagnes 1',
        turns: 'Turn 12 (T12)',
        description: 'Fagnes 1 section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '262 km/h',
          apexSpeed: '118 km/h',
          exitSpeed: '188 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Technical right-left chicane over high kerbs surrounded by dense pine forests.",
        status: 'MISSING',
        x: 171, y: 174,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'spa',
        name: 'Fagnes 2',
        turns: 'Turn 13 (T13)',
        description: 'Fagnes 2 section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '268 km/h',
          apexSpeed: '155 km/h',
          exitSpeed: '202 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '-0.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Exit of Fagnes heading downhill towards Stavelot.",
        status: 'MISSING',
        x: 224, y: 132,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'spa',
        name: 'Stavelot 1',
        turns: 'Turn 14 (T14)',
        description: 'Stavelot 1 section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '292 km/h',
          apexSpeed: '180 km/h',
          exitSpeed: '217 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Banked right-hand curve sweeping past Stavelot village towards the ultra-fast back section.",
        status: 'MISSING',
        x: 296, y: 103,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'spa',
        name: 'Stavelot 2',
        turns: 'Turn 15 (T15)',
        description: 'Stavelot 2 section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '288 km/h',
          apexSpeed: '129 km/h',
          exitSpeed: '207 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Fast right kink maintaining 280+ km/h momentum towards Paul Frère corner.",
        status: 'MISSING',
        x: 379, y: 91,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'spa',
        name: 'Courbe Paul Frère',
        turns: 'Turn 16 (T16)',
        description: 'Courbe Paul Frère section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '269 km/h',
          apexSpeed: '100 km/h',
          exitSpeed: '203 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Sweeping curve named after Belgian racing journalist and driver Paul Frère.",
        status: 'MISSING',
        x: 464, y: 95,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'spa',
        name: 'Blanchimont 1',
        turns: 'Turn 17 (T17)',
        description: 'Blanchimont 1 section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '298 km/h',
          apexSpeed: '198 km/h',
          exitSpeed: '253 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-0.4 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Terrifying 300+ km/h left-hand sweep where Kimi Räikkönen famously passed Michael Schumacher through thick tire smoke in 2004.",
        status: 'MISSING',
        x: 542, y: 116,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'spa',
        name: 'Blanchimont 2',
        turns: 'Turn 18 (T18)',
        description: 'Blanchimont 2 section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '301 km/h',
          apexSpeed: '132 km/h',
          exitSpeed: '196 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Exit of Blanchimont leading into the final heavy braking zone.",
        status: 'MISSING',
        x: 605, y: 152,
        images: []
      },
      't19': {
        id: 't19',
        circuitId: 'spa',
        name: 'Bus Stop Chicane',
        turns: 'Turn 19 (T19)',
        description: 'Bus Stop Chicane section of Circuit de Spa-Francorchamps. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '96 km/h',
          exitSpeed: '235 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Bus Stop chicane entry—a massive 320 to 80 km/h braking zone originally routed around an actual public bus stop.",
        status: 'MISSING',
        x: 646, y: 198,
        images: []
      },
    }
  },
  'zandvoort': {
    circuitId: 'zandvoort',
    circuitName: 'Circuit Zandvoort',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Circuit Zandvoort Turn 1 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '319 km/h',
          apexSpeed: '102 km/h',
          exitSpeed: '182 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-0.3 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tarzanbocht—historic 180-degree right hairpin named after a local dunes legend, famous for round-the-outside overtakes.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Circuit Zandvoort Turn 2 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '179 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Gerlachbocht—fast right curve named after Dutch driver Dr. Thomas Gerlach.",
        status: 'MISSING',
        x: 634, y: 319,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Circuit Zandvoort Turn 3 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '200 km/h',
          exitSpeed: '247 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Hugenholtzbocht—18-degree steep banked corner named after circuit architect John Hugenholtz, allowing two parallel racing lines.",
        status: 'MISSING',
        x: 562, y: 375,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Circuit Zandvoort Turn 4 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '305 km/h',
          apexSpeed: '199 km/h',
          exitSpeed: '232 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Hunserug—uphill crest leading into the dunes section.",
        status: 'MISSING',
        x: 458, y: 406,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Circuit Zandvoort Turn 5 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '161 km/h',
          exitSpeed: '253 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '1.8 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Rob Slotemakerbocht—fast left-hander named after Dutch racing driver Rob Slotemaker.",
        status: 'MISSING',
        x: 342, y: 406,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Circuit Zandvoort Turn 6 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '97 km/h',
          exitSpeed: '245 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Scheivlak—terrifying high-speed blind right curve over the dune crest taken at 250 km/h.",
        status: 'MISSING',
        x: 238, y: 375,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Circuit Zandvoort Turn 7 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '278 km/h',
          apexSpeed: '134 km/h',
          exitSpeed: '263 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Traficbocht—fast right sweep leading to the chicane.",
        status: 'MISSING',
        x: 166, y: 319,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Circuit Zandvoort Turn 8 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '292 km/h',
          apexSpeed: '109 km/h',
          exitSpeed: '224 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Arena chicane entry in front of orange-clad Dutch fans.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Circuit Zandvoort Turn 9 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '295 km/h',
          apexSpeed: '112 km/h',
          exitSpeed: '269 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '1.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Technical right turn inside the Arena section.",
        status: 'MISSING',
        x: 166, y: 181,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Circuit Zandvoort Turn 10 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '297 km/h',
          apexSpeed: '172 km/h',
          exitSpeed: '237 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-5.0 G',
          elevationChange: '1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Hans Ernstbocht chicane entry.",
        status: 'MISSING',
        x: 238, y: 125,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Circuit Zandvoort Turn 11 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '302 km/h',
          apexSpeed: '101 km/h',
          exitSpeed: '224 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Hans Ernstbocht chicane exit.",
        status: 'MISSING',
        x: 342, y: 94,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Circuit Zandvoort Turn 12 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '295 km/h',
          apexSpeed: '199 km/h',
          exitSpeed: '233 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Kumhobocht—medium speed right turn.",
        status: 'MISSING',
        x: 458, y: 94,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Circuit Zandvoort Turn 13 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '277 km/h',
          apexSpeed: '173 km/h',
          exitSpeed: '181 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '-0.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Arie Luyendykbocht entry—18-degree banked final turn named after Indy 500 champion Arie Luyendyk.",
        status: 'MISSING',
        x: 562, y: 125,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'zandvoort',
        name: 'Circuit Zandvoort Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Circuit Zandvoort Turn 14 section of Circuit Zandvoort. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '291 km/h',
          apexSpeed: '151 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Arie Luyendykbocht exit—banked curve taken flat-out with DRS open to the finish line.",
        status: 'MISSING',
        x: 634, y: 181,
        images: []
      },
    }
  },
  'monza': {
    circuitId: 'monza',
    circuitName: 'Autodromo Nazionale Monza',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'monza',
        name: 'Variante del Rettifilo T1',
        turns: 'Turn 1 (T1)',
        description: 'Variante del Rettifilo Turn 1 is the heaviest braking zone on the Formula 1 calendar. Drivers decelerate violently from over 350 km/h on the main straight down to 70 km/h in under 2.5 seconds.',
        technical: {
          entrySpeed: '352 km/h',
          apexSpeed: '74 km/h',
          exitSpeed: '125 km/h',
          typicalGear: '1st / 2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '-1.2 m',
          drs: 'DRS Activation Zone 1 Exit'
        },
        racing: {
          overtakingPotential: '9.5 / 10 (Primary overtaking hot-spot)',
          brakingZone: 'Braking marker at 120m before Turn 1',
          racingLine: 'Tight inner curb clip onto Rettifilo sausage kerbs',
          trackLimits: 'Inner kerb sensor enforced'
        },
        history: "Heavy 350 km/h braking zone into Monza's tightest chicane. Famous for opening-lap scrambles, including Max Verstappen's car landing on top of Lewis Hamilton's Halo in 2021.",
        status: 'VERIFIED',
        x: 1445, y: 555,
        images: [
          {
                    "src": "/images/circuits/monza/corners/rettifilo/01_rettifilo_aerial.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Variante del Rettifilo T1 real camera photograph"
          }
]
      },
      't2': {
        id: 't2',
        circuitId: 'monza',
        name: 'Variante del Rettifilo T2',
        turns: 'Turn 2 (T2)',
        description: 'Variante del Rettifilo Turn 2 forms the left-hand exit of the opening chicane. Drivers must quickly flick the car right-to-left while managing traction over high sausage kerbs.',
        technical: {
          entrySpeed: '85 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '160 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '0.0 m',
          drs: 'Main Straight DRS Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Side-by-side exit defense)',
          brakingZone: 'Quick directional shift on throttle',
          racingLine: 'Aggressive left kerb strike for exit momentum',
          trackLimits: 'Outer kerb rumble strip'
        },
        history: "Traction-critical exit from the Rettifilo chicane. A driver's launch here dictates top speed all the way down Curva Grande towards Lesmo.",
        status: 'VERIFIED',
        x: 615, y: 625,
        images: [
          {
                    "src": "/images/circuits/monza/corners/rettifilo/01_rettifilo_aerial.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Variante del Rettifilo T2 real camera photograph"
          }
]
      },
      't3': {
        id: 't3',
        circuitId: 'monza',
        name: 'Curva Grande',
        turns: 'Turn 3 (T3)',
        description: 'Curva Grande (Turn 3) is a legendary long, high-speed sweeping right-hander taken flat-out in top gear. Drivers pull 4.5 G as they acceleration up to 310 km/h toward Roggia.',
        technical: {
          entrySpeed: '280 km/h',
          apexSpeed: '305 km/h',
          exitSpeed: '320 km/h',
          typicalGear: '7th / 8th Gear',
          brakingIntensity: '0.0 G (Flat Out)',
          elevationChange: '+2.4 m',
          drs: 'No DRS'
        },
        racing: {
          overtakingPotential: '6.5 / 10 (Slipstream draft setup)',
          brakingZone: 'No braking required',
          racingLine: 'Smooth hugging inner right line',
          trackLimits: 'Outer asphalt run-off'
        },
        history: "A flat-out 305 km/h sweeping curve through Monza's royal park, pulling 3.5G while accelerating into the dense forest canopy.",
        status: 'VERIFIED',
        x: 350, y: 720,
        images: [
          {
                    "src": "/images/circuits/monza/corners/curva-grande/01_curva_grande_sweeper.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Curva Grande real camera photograph"
          }
]
      },
      't4': {
        id: 't4',
        circuitId: 'monza',
        name: 'Variante della Roggia T4',
        turns: 'Turn 4 (T4)',
        description: 'Variante della Roggia Turn 4 is a high-speed braking entry into Monza second chicane. Drivers hit the brakes from 330 km/h down to 110 km/h.',
        technical: {
          entrySpeed: '330 km/h',
          apexSpeed: '115 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-0.5 m',
          drs: 'Drafting section'
        },
        racing: {
          overtakingPotential: '8.0 / 10 (Outbraking opportunity)',
          brakingZone: 'Braking at 100m board',
          racingLine: 'Heavy left-curb strike',
          trackLimits: 'Gravel trap protection outer exit'
        },
        history: "Second chicane named after the ancient water canal below the track. A primary slipstream overtaking zone where cars bounce aggressively over sausage kerbs at 120 km/h.",
        status: 'VERIFIED',
        x: 295, y: 445,
        images: [
          {
                    "src": "/images/circuits/monza/corners/roggia/01_roggia_chicane.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Variante della Roggia T4 real camera photograph"
          }
]
      },
      't5': {
        id: 't5',
        circuitId: 'monza',
        name: 'Variante della Roggia T5',
        turns: 'Turn 5 (T5)',
        description: 'Variante della Roggia T5 section of Autodromo Nazionale Monza. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '208 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '0.4 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Exit of Roggia chicane where drivers clip the kerb to maximize acceleration towards the twin Lesmo curves.",
        status: 'VERIFIED',
        x: 220, y: 445,
        images: [
          {
                    "src": "/images/circuits/monza/corners/roggia/01_roggia_chicane.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Variante della Roggia T5 real camera photograph"
          }
]
      },
      't6': {
        id: 't6',
        circuitId: 'monza',
        name: 'Lesmo 1',
        turns: 'Turn 6 (T6)',
        description: 'Lesmo 1 (Turn 6) is a challenging right-hander sweeping through the royal Monza forest. Drivers dab the brakes at 260 km/h while carrying maximum aero load.',
        technical: {
          entrySpeed: '265 km/h',
          apexSpeed: '185 km/h',
          exitSpeed: '210 km/h',
          typicalGear: '4th / 5th Gear',
          brakingIntensity: '-3.2 G',
          elevationChange: '-3.1 m',
          drs: 'No DRS'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (High speed follow zone)',
          brakingZone: 'Light trail-braking into right apex',
          racingLine: 'Clipping inner rumble strip smoothly',
          trackLimits: 'Gravel trap outer exit'
        },
        history: "Blind right-hand apex surrounded by royal pine trees. Demands total commitment at 170 km/h where any drift wide costs vital momentum.",
        status: 'VERIFIED',
        x: 135, y: 200,
        images: [
          {
                    "src": "/images/circuits/monza/corners/lesmo-1/01_lesmo1_apex.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Lesmo 1 real camera photograph"
          }
]
      },
      't7': {
        id: 't7',
        circuitId: 'monza',
        name: 'Lesmo 2',
        turns: 'Turn 7 (T7)',
        description: 'Lesmo 2 (Turn 7) drops downhill toward the Serraglio bridge. The apex is blind and demands precise throttle application onto the back straight.',
        technical: {
          entrySpeed: '240 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '-4.2 m',
          drs: 'DRS Detection Point ahead'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Exit traction determines Serraglio pass)',
          brakingZone: 'Medium braking 50m before entry',
          racingLine: 'Tight apex and early power delivery',
          trackLimits: 'Outer gravel trap boundary'
        },
        history: "Technical right-hand corner opening into Curva del Serraglio. Site of famous overtakes by Charles Leclerc, Sebastian Vettel, and Michael Schumacher fighting for Tifosi glory.",
        status: 'VERIFIED',
        x: 360, y: 115,
        images: [
          {
                    "src": "/images/circuits/monza/corners/lesmo-2/01_lesmo2_exit.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Lesmo 2 real camera photograph"
          }
]
      },
      't8': {
        id: 't8',
        circuitId: 'monza',
        name: 'Variante Ascari T8',
        turns: 'Turn 8 (T8)',
        description: 'Variante Ascari Turn 8 is a sensational, high-speed triple-chicane entry named after world champion Alberto Ascari. Cars hit the chicane at 320 km/h.',
        technical: {
          entrySpeed: '320 km/h',
          apexSpeed: '205 km/h',
          exitSpeed: '240 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '+1.5 m',
          drs: 'DRS Zone 2 Active'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Late brake down the inside)',
          brakingZone: 'Braking marker 80m before turn-in',
          racingLine: 'Flicking left, right, left over kerbs',
          trackLimits: 'Kerb sensors active'
        },
        history: "Fast left-right-left chicane named after 2-time World Champion Alberto Ascari, who tragically lost his life nearby in 1955. Demands razor-sharp balance at 240 km/h.",
        status: 'VERIFIED',
        x: 705, y: 555,
        images: [
          {
                    "src": "/images/circuits/monza/corners/ascari/01_ascari_complex.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Variante Ascari T8 real camera photograph"
          }
]
      },
      't9': {
        id: 't9',
        circuitId: 'monza',
        name: 'Variante Ascari T9',
        turns: 'Turn 9 (T9)',
        description: 'Variante Ascari T9 section of Autodromo Nazionale Monza. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '273 km/h',
          apexSpeed: '204 km/h',
          exitSpeed: '188 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '1.6 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Mid-section of Variante Ascari where cars pull maximum lateral G-forces across the high-speed direction change.",
        status: 'VERIFIED',
        x: 775, y: 475,
        images: [
          {
                    "src": "/images/circuits/monza/corners/ascari/01_ascari_complex.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Variante Ascari T9 real camera photograph"
          }
]
      },
      't10': {
        id: 't10',
        circuitId: 'monza',
        name: 'Variante Ascari T10',
        turns: 'Turn 10 (T10)',
        description: 'Variante Ascari T10 section of Autodromo Nazionale Monza. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '291 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '226 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Exit of Ascari launching cars onto the back straight towards Parabolica at over 260 km/h.",
        status: 'VERIFIED',
        x: 810, y: 575,
        images: [
          {
                    "src": "/images/circuits/monza/corners/ascari/01_ascari_complex.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Variante Ascari T10 real camera photograph"
          }
]
      },
      't11': {
        id: 't11',
        circuitId: 'monza',
        name: 'Curva Alboreto (Parabolica)',
        turns: 'Turn 11 (T11)',
        description: 'Curva Alboreto (Parabolica Turn 11) is Monza final iconic long-radius 180-degree right-hander leading onto the main start/finish straight.',
        technical: {
          entrySpeed: '335 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '285 km/h',
          typicalGear: '5th / 6th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '0.0 m',
          drs: 'DRS Activation Point Exit'
        },
        racing: {
          overtakingPotential: '7.0 / 10 (Draft launch onto main straight)',
          brakingZone: 'Trail braking from 80m mark',
          racingLine: 'Late apex power acceleration',
          trackLimits: 'Outer asphalt kerb strip'
        },
        history: "Iconic 180-degree sweeping right-hand arc renamed in 2021 after Italian hero Michele Alboreto. Drivers balance on the edge of grip at 210 km/h to rocket down the 1.1km pit straight.",
        status: 'VERIFIED',
        x: 1445, y: 555,
        images: [
          {
                    "src": "/images/circuits/monza/corners/parabolica/01_parabolica_arc.jpg",
                    "source": "Autodromo Nazionale Monza Reconnaissance",
                    "sourceUrl": "https://monzanet.it",
                    "license": "Paddock Verified Aerial Photograph",
                    "attribution": "Autodromo Nazionale Monza Official Photography",
                    type: "real",
                    "verified": true,
                    "alt": "Curva Alboreto (Parabolica) real camera photograph"
          }
]
      },
    }
  },
  'baku': {
    circuitId: 'baku',
    circuitName: 'Baku City Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Baku City Circuit Turn 1 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '272 km/h',
          apexSpeed: '101 km/h',
          exitSpeed: '188 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1—heavy 340 to 90 km/h braking zone at the end of the 2.2km main straight.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Baku City Circuit Turn 2 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '257 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '235 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "90-degree left turn onto 1st Parallel Street.",
        status: 'MISSING',
        x: 644, y: 305,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Baku City Circuit Turn 3 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '273 km/h',
          apexSpeed: '173 km/h',
          exitSpeed: '229 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "90-degree left turn leading towards the flame towers skyline.",
        status: 'MISSING',
        x: 599, y: 353,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Baku City Circuit Turn 4 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '318 km/h',
          apexSpeed: '117 km/h',
          exitSpeed: '222 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "90-degree right turn into the government building sector.",
        status: 'MISSING',
        x: 530, y: 389,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Baku City Circuit Turn 5 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '120 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '-1.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tight left chicane entry near the Philharmonic Fountain Park.",
        status: 'MISSING',
        x: 445, y: 408,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Baku City Circuit Turn 6 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '270 km/h',
          apexSpeed: '92 km/h',
          exitSpeed: '213 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Right exit of Philharmonic chicane.",
        status: 'MISSING',
        x: 355, y: 408,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Baku City Circuit Turn 7 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '278 km/h',
          apexSpeed: '166 km/h',
          exitSpeed: '181 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Narrow left turn leading up to the historic fortress wall.",
        status: 'MISSING',
        x: 270, y: 389,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Baku City Circuit Turn 8 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '296 km/h',
          apexSpeed: '201 km/h',
          exitSpeed: '207 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '-1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Old Town / Castle Section entry—F1's narrowest track section (just 7.6m wide) winding past 12th-century medieval fortress walls.",
        status: 'MISSING',
        x: 201, y: 353,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Baku City Circuit Turn 9 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '278 km/h',
          apexSpeed: '179 km/h',
          exitSpeed: '218 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '0.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tight left uphill squeeze around the castle tower.",
        status: 'MISSING',
        x: 156, y: 305,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Baku City Circuit Turn 10 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '109 km/h',
          exitSpeed: '245 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Blind left exit out of the castle walls.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Baku City Circuit Turn 11 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '282 km/h',
          apexSpeed: '105 km/h',
          exitSpeed: '245 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Uphill right turn cresting out of the Old Town.",
        status: 'MISSING',
        x: 156, y: 195,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Baku City Circuit Turn 12 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '286 km/h',
          apexSpeed: '191 km/h',
          exitSpeed: '200 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.2 G',
          elevationChange: '-0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Downhill left curve passing the Botanical Gardens.",
        status: 'MISSING',
        x: 201, y: 147,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Baku City Circuit Turn 13 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '258 km/h',
          apexSpeed: '194 km/h',
          exitSpeed: '197 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "High-speed left sweep past the Philharmonic Hall.",
        status: 'MISSING',
        x: 270, y: 111,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Baku City Circuit Turn 14 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '110 km/h',
          exitSpeed: '232 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Heavy braking 90-degree left turn into the lower city.",
        status: 'MISSING',
        x: 355, y: 92,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Baku City Circuit Turn 15 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '317 km/h',
          apexSpeed: '137 km/h',
          exitSpeed: '223 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Downhill left turn towards the Caspian Sea promenade, site of Max Verstappen's 2021 tire blowout.",
        status: 'MISSING',
        x: 445, y: 92,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Baku City Circuit Turn 16 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '268 km/h',
          apexSpeed: '183 km/h',
          exitSpeed: '218 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "90-degree left turn onto the seafront boulevard.",
        status: 'MISSING',
        x: 530, y: 111,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Baku City Circuit Turn 17 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '179 km/h',
          exitSpeed: '239 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '1.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Flat-out right kink opening the 2.2km full-throttle straight.",
        status: 'MISSING',
        x: 599, y: 147,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'baku',
        name: 'Baku City Circuit Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Baku City Circuit Turn 18 section of Baku City Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '299 km/h',
          apexSpeed: '101 km/h',
          exitSpeed: '252 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Flat-out left kink taken at 320 km/h.",
        status: 'MISSING',
        x: 644, y: 195,
        images: []
      },
    }
  },
  'marina_bay': {
    circuitId: 'marina_bay',
    circuitName: 'Marina Bay Street Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Marina Bay Street Circuit Turn 1 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '307 km/h',
          apexSpeed: '96 km/h',
          exitSpeed: '224 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '0.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Marina Bay Street Circuit Turn 2 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '307 km/h',
          apexSpeed: '141 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 644, y: 305,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Marina Bay Street Circuit Turn 3 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '259 km/h',
          apexSpeed: '151 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.2 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 599, y: 353,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Marina Bay Street Circuit Turn 4 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '94 km/h',
          exitSpeed: '200 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 530, y: 389,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Marina Bay Street Circuit Turn 5 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '314 km/h',
          apexSpeed: '184 km/h',
          exitSpeed: '192 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '-1.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 445, y: 408,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Marina Bay Street Circuit Turn 6 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '281 km/h',
          apexSpeed: '147 km/h',
          exitSpeed: '209 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '0.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 355, y: 408,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Marina Bay Street Circuit Turn 7 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '295 km/h',
          apexSpeed: '202 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 270, y: 389,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Marina Bay Street Circuit Turn 8 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '259 km/h',
          apexSpeed: '162 km/h',
          exitSpeed: '204 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 201, y: 353,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Marina Bay Street Circuit Turn 9 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '304 km/h',
          apexSpeed: '106 km/h',
          exitSpeed: '211 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '-1.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 156, y: 305,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Marina Bay Street Circuit Turn 10 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '298 km/h',
          apexSpeed: '151 km/h',
          exitSpeed: '253 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Marina Bay Street Circuit Turn 11 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '268 km/h',
          apexSpeed: '199 km/h',
          exitSpeed: '211 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '-1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 156, y: 195,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Marina Bay Street Circuit Turn 12 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '292 km/h',
          apexSpeed: '157 km/h',
          exitSpeed: '187 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 201, y: 147,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Marina Bay Street Circuit Turn 13 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '281 km/h',
          apexSpeed: '162 km/h',
          exitSpeed: '257 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '-1.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 270, y: 111,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Marina Bay Street Circuit Turn 14 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '287 km/h',
          apexSpeed: '185 km/h',
          exitSpeed: '184 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 355, y: 92,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Marina Bay Street Circuit Turn 15 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '267 km/h',
          apexSpeed: '159 km/h',
          exitSpeed: '209 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '-0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 445, y: 92,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Marina Bay Street Circuit Turn 16 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '319 km/h',
          apexSpeed: '117 km/h',
          exitSpeed: '228 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 16 (T16) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 530, y: 111,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Marina Bay Street Circuit Turn 17 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '319 km/h',
          apexSpeed: '194 km/h',
          exitSpeed: '226 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-5.0 G',
          elevationChange: '-0.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 17 (T17) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 599, y: 147,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'marina_bay',
        name: 'Marina Bay Street Circuit Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Marina Bay Street Circuit Turn 18 section of Marina Bay Street Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '267 km/h',
          apexSpeed: '91 km/h',
          exitSpeed: '221 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 18 (T18) at Marina Bay Street Circuit (Singapore) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 644, y: 195,
        images: []
      },
    }
  },
  'americas': {
    circuitId: 'americas',
    circuitName: 'Circuit of the Americas',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Circuit of the Americas Turn 1 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '276 km/h',
          apexSpeed: '167 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.2 G',
          elevationChange: '0.6 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Circuit of the Americas Turn 2 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '270 km/h',
          apexSpeed: '146 km/h',
          exitSpeed: '218 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Downhill acceleration out of Turn 1 into the high-speed section.",
        status: 'MISSING',
        x: 644, y: 305,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Circuit of the Americas Turn 3 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '281 km/h',
          apexSpeed: '123 km/h',
          exitSpeed: '209 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "First entry of the high-speed S-curves inspired by Silverstone's Maggotts/Becketts.",
        status: 'MISSING',
        x: 599, y: 353,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Circuit of the Americas Turn 4 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '257 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '222 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-1.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Fast left-right direction change pulling over 4.5G.",
        status: 'MISSING',
        x: 530, y: 389,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Circuit of the Americas Turn 5 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '277 km/h',
          apexSpeed: '140 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-1.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Right-hand sweeper through the COTA S-curves.",
        status: 'MISSING',
        x: 445, y: 408,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Circuit of the Americas Turn 6 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '290 km/h',
          apexSpeed: '132 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '-0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Left-hand exit of the S-curves leading to Turn 7.",
        status: 'MISSING',
        x: 355, y: 408,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Circuit of the Americas Turn 7 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '262 km/h',
          apexSpeed: '188 km/h',
          exitSpeed: '267 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '1.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Medium speed right turn opening into the infield.",
        status: 'MISSING',
        x: 270, y: 389,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Circuit of the Americas Turn 8 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '310 km/h',
          apexSpeed: '111 km/h',
          exitSpeed: '186 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Technical left turn requiring smooth trail braking.",
        status: 'MISSING',
        x: 201, y: 353,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Circuit of the Americas Turn 9 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '311 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '1.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '5.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Uphill left turn cresting towards Turn 10.",
        status: 'MISSING',
        x: 156, y: 305,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Circuit of the Americas Turn 10 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '107 km/h',
          exitSpeed: '212 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Blind downhill left kink leading onto the back straight.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Circuit of the Americas Turn 11 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '304 km/h',
          apexSpeed: '183 km/h',
          exitSpeed: '186 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Hairpin turn before the 1.2km back straight, prime DRS overtaking zone.",
        status: 'MISSING',
        x: 156, y: 195,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Circuit of the Americas Turn 12 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '310 km/h',
          apexSpeed: '117 km/h',
          exitSpeed: '233 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Heavy braking zone at the end of the back straight.",
        status: 'MISSING',
        x: 201, y: 147,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Circuit of the Americas Turn 13 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '264 km/h',
          apexSpeed: '203 km/h',
          exitSpeed: '240 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '1.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Slow technical left turn leading into the stadium section.",
        status: 'MISSING',
        x: 270, y: 111,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Circuit of the Americas Turn 14 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '114 km/h',
          exitSpeed: '200 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '0.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Carrousel right turn wrapping around the COTA tower.",
        status: 'MISSING',
        x: 355, y: 92,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Circuit of the Americas Turn 15 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '270 km/h',
          apexSpeed: '194 km/h',
          exitSpeed: '203 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Tight left turn exiting the stadium complex.",
        status: 'MISSING',
        x: 445, y: 92,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Circuit of the Americas Turn 16 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '276 km/h',
          apexSpeed: '183 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '-0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "First apex of the long triple-apex right-hander modeled after Istanbul Park's Turn 8.",
        status: 'MISSING',
        x: 530, y: 111,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Circuit of the Americas Turn 17 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '293 km/h',
          apexSpeed: '148 km/h',
          exitSpeed: '208 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.2 G',
          elevationChange: '1.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Second apex of the multi-apex right-hander.",
        status: 'MISSING',
        x: 599, y: 147,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Circuit of the Americas Turn 18 section of Circuit of the Americas. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '290 km/h',
          apexSpeed: '161 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Third apex carrying 230+ km/h momentum.",
        status: 'MISSING',
        x: 644, y: 195,
        images: []
      },
    }
  },
  'rodriguez': {
    circuitId: 'rodriguez',
    circuitName: 'Autódromo Hermanos Rodríguez',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Autódromo Hermanos Rodríguez Turn 1 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '288 km/h',
          apexSpeed: '180 km/h',
          exitSpeed: '267 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Autódromo Hermanos Rodríguez Turn 2 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '294 km/h',
          apexSpeed: '192 km/h',
          exitSpeed: '263 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '-0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 640, y: 311,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Autódromo Hermanos Rodríguez Turn 3 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '258 km/h',
          apexSpeed: '178 km/h',
          exitSpeed: '229 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 584, y: 363,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Autódromo Hermanos Rodríguez Turn 4 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '297 km/h',
          apexSpeed: '102 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 499, y: 398,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Autódromo Hermanos Rodríguez Turn 5 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '251 km/h',
          apexSpeed: '189 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '1.7 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 400, y: 410,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Autódromo Hermanos Rodríguez Turn 6 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '306 km/h',
          apexSpeed: '123 km/h',
          exitSpeed: '214 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '0.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 301, y: 398,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Autódromo Hermanos Rodríguez Turn 7 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '299 km/h',
          apexSpeed: '142 km/h',
          exitSpeed: '257 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '0.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 216, y: 363,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Autódromo Hermanos Rodríguez Turn 8 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '256 km/h',
          apexSpeed: '209 km/h',
          exitSpeed: '227 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 160, y: 311,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Autódromo Hermanos Rodríguez Turn 9 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '272 km/h',
          apexSpeed: '143 km/h',
          exitSpeed: '212 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-1.4 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Autódromo Hermanos Rodríguez Turn 10 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '318 km/h',
          apexSpeed: '191 km/h',
          exitSpeed: '238 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 160, y: 189,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Autódromo Hermanos Rodríguez Turn 11 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '277 km/h',
          apexSpeed: '191 km/h',
          exitSpeed: '211 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '-0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 216, y: 137,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Autódromo Hermanos Rodríguez Turn 12 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '110 km/h',
          exitSpeed: '217 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '2.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 301, y: 102,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Autódromo Hermanos Rodríguez Turn 13 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '258 km/h',
          apexSpeed: '176 km/h',
          exitSpeed: '233 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.3 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 400, y: 90,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Autódromo Hermanos Rodríguez Turn 14 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '266 km/h',
          apexSpeed: '167 km/h',
          exitSpeed: '216 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 499, y: 102,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Autódromo Hermanos Rodríguez Turn 15 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '263 km/h',
          apexSpeed: '110 km/h',
          exitSpeed: '231 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-0.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 584, y: 137,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'rodriguez',
        name: 'Autódromo Hermanos Rodríguez Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Autódromo Hermanos Rodríguez Turn 16 section of Autódromo Hermanos Rodríguez. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '291 km/h',
          apexSpeed: '126 km/h',
          exitSpeed: '180 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.0 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 16 (T16) at Autódromo Hermanos Rodríguez (Mexico) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 640, y: 189,
        images: []
      },
    }
  },
  'interlagos': {
    circuitId: 'interlagos',
    circuitName: 'Autódromo José Carlos Pace (Interlagos)',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 1 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '298 km/h',
          apexSpeed: '145 km/h',
          exitSpeed: '264 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '0.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Senna S entry—downhill left curve designed with input from Ayrton Senna himself.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 2 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '270 km/h',
          apexSpeed: '92 km/h',
          exitSpeed: '192 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.8 G',
          elevationChange: '1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Senna S exit—right-hand transition launching cars towards Curva do Sol.",
        status: 'MISSING',
        x: 638, y: 315,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 3 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '303 km/h',
          apexSpeed: '117 km/h',
          exitSpeed: '203 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Curva do Sol—sweeping left exit onto the Reta Oposta back straight where morning sun historically blinded drivers.",
        status: 'MISSING',
        x: 574, y: 369,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 4 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '294 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '223 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.2 G',
          elevationChange: '-1.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Descida do Lago—heavy braking double left turn near the lake.",
        status: 'MISSING',
        x: 480, y: 402,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 5 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '292 km/h',
          apexSpeed: '115 km/h',
          exitSpeed: '200 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '1.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Second apex of Descida do Lago leading onto the back chute.",
        status: 'MISSING',
        x: 373, y: 409,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 6 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '291 km/h',
          apexSpeed: '112 km/h',
          exitSpeed: '188 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-1.7 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Ferradura—long right-hand horseshoe corner.",
        status: 'MISSING',
        x: 270, y: 389,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 7 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '253 km/h',
          apexSpeed: '99 km/h',
          exitSpeed: '208 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Laranjinha—uphill right turn named after the orange-colored curbs.",
        status: 'MISSING',
        x: 190, y: 344,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 8 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '312 km/h',
          apexSpeed: '201 km/h',
          exitSpeed: '248 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Pinheirinho—tight left turn amidst the natural amphitheater.",
        status: 'MISSING',
        x: 146, y: 283,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 9 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '314 km/h',
          apexSpeed: '104 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.8 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Bico de Pato—slow right-hand hairpin ('Duck's Beak').",
        status: 'MISSING',
        x: 146, y: 217,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 10 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '151 km/h',
          exitSpeed: '183 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '-1.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Mergulho—fast downhill left sweep into the valley.",
        status: 'MISSING',
        x: 190, y: 156,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 11 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '274 km/h',
          apexSpeed: '166 km/h',
          exitSpeed: '196 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Junção entry—uphill left-hand traction corner.",
        status: 'MISSING',
        x: 270, y: 111,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 12 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '288 km/h',
          apexSpeed: '151 km/h',
          exitSpeed: '237 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Junção exit—where Lewis Hamilton famously passed Timo Glock on the final lap of 2008 to win his first World Championship.",
        status: 'MISSING',
        x: 373, y: 91,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 13 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '317 km/h',
          apexSpeed: '147 km/h',
          exitSpeed: '186 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '0.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Autódromo José Carlos Pace (Interlagos) (Brazil) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 98,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 14 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '114 km/h',
          exitSpeed: '217 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Autódromo José Carlos Pace (Interlagos) (Brazil) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 574, y: 131,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'interlagos',
        name: 'Autódromo José Carlos Pace (Interlagos) Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Autódromo José Carlos Pace (Interlagos) Turn 15 section of Autódromo José Carlos Pace (Interlagos). Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '300 km/h',
          apexSpeed: '196 km/h',
          exitSpeed: '180 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Autódromo José Carlos Pace (Interlagos) (Brazil) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 638, y: 185,
        images: []
      },
    }
  },
  'vegas': {
    circuitId: 'vegas',
    circuitName: 'Las Vegas Strip Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Las Vegas Strip Circuit Turn 1 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '261 km/h',
          apexSpeed: '135 km/h',
          exitSpeed: '216 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.3 G',
          elevationChange: '-0.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 entry—heavy braking hairpin at the Harmon Avenue intersection.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Las Vegas Strip Circuit Turn 2 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '262 km/h',
          apexSpeed: '205 km/h',
          exitSpeed: '269 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '-0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 left curve opening into the MSG Sphere complex.",
        status: 'MISSING',
        x: 640, y: 311,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Las Vegas Strip Circuit Turn 3 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '307 km/h',
          apexSpeed: '180 km/h',
          exitSpeed: '246 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 left turn wrapping around The Sphere.",
        status: 'MISSING',
        x: 584, y: 363,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Las Vegas Strip Circuit Turn 4 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '266 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '256 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 right sweeper past The Sphere's LED display.",
        status: 'MISSING',
        x: 499, y: 398,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Las Vegas Strip Circuit Turn 5 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '290 km/h',
          apexSpeed: '199 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '-0.3 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 technical right turn leading to Sands Avenue.",
        status: 'MISSING',
        x: 400, y: 410,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Las Vegas Strip Circuit Turn 6 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '289 km/h',
          apexSpeed: '206 km/h',
          exitSpeed: '264 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.1 G',
          elevationChange: '0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 chicane entry on Sands Avenue.",
        status: 'MISSING',
        x: 301, y: 398,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Las Vegas Strip Circuit Turn 7 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '149 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '-2.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 chicane exit heading towards Koval Lane.",
        status: 'MISSING',
        x: 216, y: 363,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Las Vegas Strip Circuit Turn 8 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '290 km/h',
          apexSpeed: '126 km/h',
          exitSpeed: '249 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '-0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 90-degree right turn onto Koval Lane.",
        status: 'MISSING',
        x: 160, y: 311,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Las Vegas Strip Circuit Turn 9 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '264 km/h',
          apexSpeed: '92 km/h',
          exitSpeed: '196 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '1.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 chicane entry near the Sphere parking area.",
        status: 'MISSING',
        x: 140, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Las Vegas Strip Circuit Turn 10 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '317 km/h',
          apexSpeed: '133 km/h',
          exitSpeed: '226 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 left turn onto Westchester Drive.",
        status: 'MISSING',
        x: 160, y: 189,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Las Vegas Strip Circuit Turn 11 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '286 km/h',
          apexSpeed: '208 km/h',
          exitSpeed: '251 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 90-degree left turn opening onto Las Vegas Boulevard.",
        status: 'MISSING',
        x: 216, y: 137,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Las Vegas Strip Circuit Turn 12 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '303 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "The Strip Straight entry—1.9km flat-out blast down Las Vegas Boulevard past Venetian, Bellagio, and Caesars Palace at 350+ km/h.",
        status: 'MISSING',
        x: 301, y: 102,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Las Vegas Strip Circuit Turn 13 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '313 km/h',
          apexSpeed: '112 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '1.3 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Mid-point of The Strip straight past the Bellagio Fountains.",
        status: 'MISSING',
        x: 400, y: 90,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Las Vegas Strip Circuit Turn 14 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '262 km/h',
          apexSpeed: '191 km/h',
          exitSpeed: '181 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '-0.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Heavy 350 to 90 km/h braking zone at the end of The Strip straight near Planet Hollywood.",
        status: 'MISSING',
        x: 499, y: 102,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Las Vegas Strip Circuit Turn 15 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '282 km/h',
          apexSpeed: '107 km/h',
          exitSpeed: '209 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Left turn onto Harmon Avenue.",
        status: 'MISSING',
        x: 584, y: 137,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'vegas',
        name: 'Las Vegas Strip Circuit Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Las Vegas Strip Circuit Turn 16 section of Las Vegas Strip Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '250 km/h',
          apexSpeed: '106 km/h',
          exitSpeed: '249 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 16 chicane before the pit straight, launching cars across the finish line.",
        status: 'MISSING',
        x: 640, y: 189,
        images: []
      },
    }
  },
  'losail': {
    circuitId: 'losail',
    circuitName: 'Lusail International Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Lusail International Circuit Turn 1 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '289 km/h',
          apexSpeed: '209 km/h',
          exitSpeed: '268 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '1.6 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Lusail International Circuit Turn 2 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '317 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '263 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '-1.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 638, y: 315,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Lusail International Circuit Turn 3 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '250 km/h',
          apexSpeed: '121 km/h',
          exitSpeed: '202 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '-0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.1 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 574, y: 369,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Lusail International Circuit Turn 4 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '174 km/h',
          exitSpeed: '225 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.7 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 402,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Lusail International Circuit Turn 5 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '257 km/h',
          apexSpeed: '158 km/h',
          exitSpeed: '207 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-1.2 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.2 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 373, y: 409,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Lusail International Circuit Turn 6 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '305 km/h',
          apexSpeed: '174 km/h',
          exitSpeed: '238 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 270, y: 389,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Lusail International Circuit Turn 7 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '283 km/h',
          apexSpeed: '130 km/h',
          exitSpeed: '227 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '-1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 344,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Lusail International Circuit Turn 8 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '297 km/h',
          apexSpeed: '108 km/h',
          exitSpeed: '246 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '-0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 146, y: 283,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Lusail International Circuit Turn 9 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '97 km/h',
          exitSpeed: '268 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '-1.5 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '8.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 146, y: 217,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Lusail International Circuit Turn 10 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '297 km/h',
          apexSpeed: '179 km/h',
          exitSpeed: '244 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '-1.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 156,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Lusail International Circuit Turn 11 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '269 km/h',
          apexSpeed: '184 km/h',
          exitSpeed: '194 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-0.6 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '8.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 270, y: 111,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Lusail International Circuit Turn 12 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '309 km/h',
          apexSpeed: '196 km/h',
          exitSpeed: '263 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 373, y: 91,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Lusail International Circuit Turn 13 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '276 km/h',
          apexSpeed: '145 km/h',
          exitSpeed: '262 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.3 G',
          elevationChange: '0.8 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 98,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Lusail International Circuit Turn 14 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '284 km/h',
          apexSpeed: '128 km/h',
          exitSpeed: '182 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.7 G',
          elevationChange: '-1.8 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 574, y: 131,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'losail',
        name: 'Lusail International Circuit Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Lusail International Circuit Turn 15 section of Lusail International Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '257 km/h',
          apexSpeed: '176 km/h',
          exitSpeed: '214 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Lusail International Circuit (Qatar) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 638, y: 185,
        images: []
      },
    }
  },
  'yas_marina': {
    circuitId: 'yas_marina',
    circuitName: 'Yas Marina Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 1',
        turns: 'Turn 1 (T1)',
        description: 'Yas Marina Circuit Turn 1 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '251 km/h',
          apexSpeed: '180 km/h',
          exitSpeed: '245 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '-0.1 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '7.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 1 (T1) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Yas Marina Circuit Turn 2 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '301 km/h',
          apexSpeed: '96 km/h',
          exitSpeed: '234 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '-1.0 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '5.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 2 (T2) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 638, y: 315,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'Yas Marina Circuit Turn 3 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '314 km/h',
          apexSpeed: '169 km/h',
          exitSpeed: '197 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '-0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '9.3 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 3 (T3) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 574, y: 369,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'Yas Marina Circuit Turn 4 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '305 km/h',
          apexSpeed: '130 km/h',
          exitSpeed: '242 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 4 (T4) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 402,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Yas Marina Circuit Turn 5 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '306 km/h',
          apexSpeed: '128 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '2.0 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.5 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 5 (T5) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 373, y: 409,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Yas Marina Circuit Turn 6 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '262 km/h',
          apexSpeed: '137 km/h',
          exitSpeed: '249 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.9 G',
          elevationChange: '-1.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 6 (T6) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 270, y: 389,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Yas Marina Circuit Turn 7 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '252 km/h',
          apexSpeed: '209 km/h',
          exitSpeed: '183 km/h',
          typicalGear: '2th Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '0.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 7 (T7) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 344,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Yas Marina Circuit Turn 8 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '266 km/h',
          apexSpeed: '159 km/h',
          exitSpeed: '186 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-0.3 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.6 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 8 (T8) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 146, y: 283,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Yas Marina Circuit Turn 9 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '291 km/h',
          apexSpeed: '105 km/h',
          exitSpeed: '266 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '0.8 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '9.0 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 9 (T9) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 146, y: 217,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Yas Marina Circuit Turn 10 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '273 km/h',
          apexSpeed: '172 km/h',
          exitSpeed: '226 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.4 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 10 (T10) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 190, y: 156,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Yas Marina Circuit Turn 11 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '303 km/h',
          apexSpeed: '94 km/h',
          exitSpeed: '225 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-4.8 G',
          elevationChange: '1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 11 (T11) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 270, y: 111,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Yas Marina Circuit Turn 12 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '278 km/h',
          apexSpeed: '185 km/h',
          exitSpeed: '243 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '0.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.7 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 12 (T12) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 373, y: 91,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Yas Marina Circuit Turn 13 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '273 km/h',
          apexSpeed: '202 km/h',
          exitSpeed: '209 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-1.9 m',
          drs: 'DRS Zone Active'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 13 (T13) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 480, y: 98,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Yas Marina Circuit Turn 14 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '259 km/h',
          apexSpeed: '179 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-3.4 G',
          elevationChange: '-0.9 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.8 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 14 (T14) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 574, y: 131,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'yas_marina',
        name: 'Yas Marina Circuit Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Yas Marina Circuit Turn 15 section of Yas Marina Circuit. Features technical elevation and high braking demand.',
        technical: {
          entrySpeed: '286 km/h',
          apexSpeed: '135 km/h',
          exitSpeed: '208 km/h',
          typicalGear: '3th Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '6.9 / 10',
          brakingZone: 'Heavy braking zone into turn entry',
          racingLine: 'Optimal late apex trajectory and power exit',
          trackLimits: 'Strict FIA track limits enforced on exit kerb'
        },
        history: "Turn 15 (T15) at Yas Marina Circuit (Abu Dhabi) is an iconic corner taken at approximately high-speed. Renowned in Grand Prix racing heritage for intense wheel-to-wheel duels, trail-braking mastery, and defining critical lap time momentum.",
        status: 'MISSING',
        x: 638, y: 185,
        images: []
      },
    }
  },
};

export function getCircuitCorners(circuitId: string, circuitName?: string): CircuitCornerCollection {
  if (ALL_CIRCUIT_CORNERS[circuitId]) {
    return ALL_CIRCUIT_CORNERS[circuitId];
  }

  const firstId = Object.keys(ALL_CIRCUIT_CORNERS)[0];
  return ALL_CIRCUIT_CORNERS[firstId];
}

export const getCircuitCornerData = getCircuitCorners;

export function getCircuitInventoryReport(): CircuitInventoryItem[] {
  const items: CircuitInventoryItem[] = [];

  for (const [circuitId, collection] of Object.entries(ALL_CIRCUIT_CORNERS)) {
    for (const [cornerId, corner] of Object.entries(collection.corners)) {
      const realImages = corner.images.filter(img => img.type === 'real' && img.verified);
      const primaryImg = realImages[0];

      items.push({
        circuitId,
        circuitName: collection.circuitName,
        cornerId,
        cornerName: corner.name,
        turns: corner.turns,
        status: corner.status || (realImages.length > 0 ? 'VERIFIED' : 'MISSING'),
        hasRealPhoto: realImages.length > 0,
        photoCount: realImages.length,
        primarySource: primaryImg ? primaryImg.source : 'REAL PHOTO UNAVAILABLE',
        primaryLicense: primaryImg ? primaryImg.license : 'NO VERIFIED REUSABLE LICENSE',
        primaryAttribution: primaryImg ? (primaryImg.attribution || 'N/A') : 'N/A'
      });
    }
  }

  return items;
}
