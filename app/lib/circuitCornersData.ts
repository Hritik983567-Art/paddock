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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Fast exit of the triple-apex carousel launching cars at 250 km/h downhill towards Turn 19.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '240 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '-1.8 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (High-Speed Exit)',
          brakingZone: 'Full throttle blast accelerating towards Turn 19 braking.',
          racingLine: 'Let the car drift out naturally across the exit kerb towards the left track edge.',
          trackLimits: 'Exit tarmac run-off strictly policed.'
        },
        history: "The breathtaking culmination of the 3-apex carousel directly beneath the Austin observation tower.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't19': {
        id: 't19',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 19',
        turns: 'Turn 19 (T19)',
        description: 'Fast downhill off-camber left-hander infamous for track-limit controversies.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-3.5 m',
          drs: 'Pre-Final Corner Zone'
        },
        racing: {
          overtakingPotential: '5.5 / 10 (Late Braking Risk)',
          brakingZone: 'Firm braking downhill with chassis unweighting.',
          racingLine: 'Commit early to the left apex, but avoid running all four wheels over the painted exit kerb.',
          trackLimits: 'The most strictly enforced track limits corner at COTA; dozens of qualifying laps deleted here.'
        },
        history: "Famous for dramatic qualifying lap cancellations and Verstappen-Hamilton race encounters.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't20': {
        id: 't20',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 20',
        turns: 'Turn 20 (T20)',
        description: 'The final corner of Circuit of the Americas, critical for launch onto the uphill start/finish straight.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '115 km/h',
          exitSpeed: '175 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-3.2 G',
          elevationChange: '+1.2 m',
          drs: 'Main Straight DRS Launch'
        },
        racing: {
          overtakingPotential: '6.0 / 10 (Final Turn Exit Pass)',
          brakingZone: 'Hard braking on approach to the final 90-degree left hander.',
          racingLine: 'Square off the exit to achieve maximum straight-line acceleration onto the uphill pit straight.',
          trackLimits: 'Exit kerb white line policed rigorously.'
        },
        history: "Decisive final corner where good traction can earn 2-3 tenths down the main straight or defend an undercut.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
          typicalGear: '3rd Gear',
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
          typicalGear: '4th Gear',
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
          typicalGear: '3rd Gear',
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
          typicalGear: '5th Gear',
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
          typicalGear: '5th Gear',
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Fast exit of the triple-apex carousel launching cars at 250 km/h downhill towards Turn 19.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '240 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '-1.8 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (High-Speed Exit)',
          brakingZone: 'Full throttle blast accelerating towards Turn 19 braking.',
          racingLine: 'Let the car drift out naturally across the exit kerb towards the left track edge.',
          trackLimits: 'Exit tarmac run-off strictly policed.'
        },
        history: "The breathtaking culmination of the 3-apex carousel directly beneath the Austin observation tower.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Fast exit of the triple-apex carousel launching cars at 250 km/h downhill towards Turn 19.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '240 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '-1.8 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (High-Speed Exit)',
          brakingZone: 'Full throttle blast accelerating towards Turn 19 braking.',
          racingLine: 'Let the car drift out naturally across the exit kerb towards the left track edge.',
          trackLimits: 'Exit tarmac run-off strictly policed.'
        },
        history: "The breathtaking culmination of the 3-apex carousel directly beneath the Austin observation tower.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't19': {
        id: 't19',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 19',
        turns: 'Turn 19 (T19)',
        description: 'Fast downhill off-camber left-hander infamous for track-limit controversies.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-3.5 m',
          drs: 'Pre-Final Corner Zone'
        },
        racing: {
          overtakingPotential: '5.5 / 10 (Late Braking Risk)',
          brakingZone: 'Firm braking downhill with chassis unweighting.',
          racingLine: 'Commit early to the left apex, but avoid running all four wheels over the painted exit kerb.',
          trackLimits: 'The most strictly enforced track limits corner at COTA; dozens of qualifying laps deleted here.'
        },
        history: "Famous for dramatic qualifying lap cancellations and Verstappen-Hamilton race encounters.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Fast exit of the triple-apex carousel launching cars at 250 km/h downhill towards Turn 19.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '240 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '-1.8 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (High-Speed Exit)',
          brakingZone: 'Full throttle blast accelerating towards Turn 19 braking.',
          racingLine: 'Let the car drift out naturally across the exit kerb towards the left track edge.',
          trackLimits: 'Exit tarmac run-off strictly policed.'
        },
        history: "The breathtaking culmination of the 3-apex carousel directly beneath the Austin observation tower.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      }
    }
  },
  'hungaroring': {
    circuitId: 'hungaroring',
    circuitName: 'Hungaroring',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Fast exit of the triple-apex carousel launching cars at 250 km/h downhill towards Turn 19.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '240 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '-1.8 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (High-Speed Exit)',
          brakingZone: 'Full throttle blast accelerating towards Turn 19 braking.',
          racingLine: 'Let the car drift out naturally across the exit kerb towards the left track edge.',
          trackLimits: 'Exit tarmac run-off strictly policed.'
        },
        history: "The breathtaking culmination of the 3-apex carousel directly beneath the Austin observation tower.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't19': {
        id: 't19',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 19',
        turns: 'Turn 19 (T19)',
        description: 'Fast downhill off-camber left-hander infamous for track-limit controversies.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '190 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-3.5 G',
          elevationChange: '-3.5 m',
          drs: 'Pre-Final Corner Zone'
        },
        racing: {
          overtakingPotential: '5.5 / 10 (Late Braking Risk)',
          brakingZone: 'Firm braking downhill with chassis unweighting.',
          racingLine: 'Commit early to the left apex, but avoid running all four wheels over the painted exit kerb.',
          trackLimits: 'The most strictly enforced track limits corner at COTA; dozens of qualifying laps deleted here.'
        },
        history: "Famous for dramatic qualifying lap cancellations and Verstappen-Hamilton race encounters.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
    }
  },
  'baku': {
    circuitId: 'baku',
    circuitName: 'Baku City Circuit',
    corners: {
      't1': {
        id: 't1',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Fast exit of the triple-apex carousel launching cars at 250 km/h downhill towards Turn 19.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '240 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '-1.8 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (High-Speed Exit)',
          brakingZone: 'Full throttle blast accelerating towards Turn 19 braking.',
          racingLine: 'Let the car drift out naturally across the exit kerb towards the left track edge.',
          trackLimits: 'Exit tarmac run-off strictly policed.'
        },
        history: "The breathtaking culmination of the 3-apex carousel directly beneath the Austin observation tower.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Fast exit of the triple-apex carousel launching cars at 250 km/h downhill towards Turn 19.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '240 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '-1.8 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (High-Speed Exit)',
          brakingZone: 'Full throttle blast accelerating towards Turn 19 braking.',
          racingLine: 'Let the car drift out naturally across the exit kerb towards the left track edge.',
          trackLimits: 'Exit tarmac run-off strictly policed.'
        },
        history: "The breathtaking culmination of the 3-apex carousel directly beneath the Austin observation tower.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 17',
        turns: 'Turn 17 (T17)',
        description: 'Mid-section of the carousel with speeds climbing past 215 km/h under 4.6G lateral load.',
        technical: {
          entrySpeed: '195 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-2.1 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (Aero Sensitive)',
          brakingZone: 'Full or partial throttle depending on tyre life and wind conditions.',
          racingLine: 'Hold continuous tight right radius, adjusting steering angle for bump disturbances.',
          trackLimits: 'Natural track limits contained by high cornering load.'
        },
        history: "Severe tyre torture zone where front-left graining can occur if pushed too hard in traffic.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 18',
        turns: 'Turn 18 (T18)',
        description: 'Fast exit of the triple-apex carousel launching cars at 250 km/h downhill towards Turn 19.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '240 km/h',
          exitSpeed: '250 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '-1.8 m',
          drs: 'Sustained High-G Arc'
        },
        racing: {
          overtakingPotential: '1.5 / 10 (High-Speed Exit)',
          brakingZone: 'Full throttle blast accelerating towards Turn 19 braking.',
          racingLine: 'Let the car drift out naturally across the exit kerb towards the left track edge.',
          trackLimits: 'Exit tarmac run-off strictly policed.'
        },
        history: "The breathtaking culmination of the 3-apex carousel directly beneath the Austin observation tower.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 16',
        turns: 'Turn 16 (T16)',
        description: 'Entry into COTA\'s famous multi-apex right-hand carousel, reminiscent of Istanbul Park Turn 8.',
        technical: {
          entrySpeed: '180 km/h',
          apexSpeed: '170 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-1.2 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (High Aero Loading)',
          brakingZone: 'Gentle entry trail-braking to seat the front right tyre.',
          racingLine: 'Hug the right side and begin the continuous triple-apex arc.',
          trackLimits: 'Monitored on inside kerb placement.'
        },
        history: "First apex of the grueling triple-apex curve that puts immense sustained load on front-left tyres.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 1 (\'Big Red\')',
        turns: 'Turn 1 (T1)',
        description: 'Turn 1 (\'Big Red\') is COTA\'s iconic uphill left hairpin, rising 41 meters to a blind apex that fans out dramatically.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '82 km/h',
          exitSpeed: '165 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.9 G',
          elevationChange: '+40.9 m',
          drs: 'DRS on Approach Straight'
        },
        racing: {
          overtakingPotential: '9.4 / 10 (Premier Overtaking Zone)',
          brakingZone: 'Deep uphill threshold braking; 11% gradient helps decelerate from 315 km/h into crest.',
          racingLine: 'Climb wide on entry, clip the tight apex kerb at the crest, then open steering downhill for early throttle pick-up.',
          trackLimits: 'Strict FIA white line monitored on exit kerb and tarmac run-off.'
        },
        history: "Turn 1 ('Big Red')—steep 40-meter uphill climb into a blind left hairpin, creating dramatic 5-wide turn 1 starts.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 2',
        turns: 'Turn 2 (T2)',
        description: 'Fast downhill right-hander leading directly into the high-speed Esses complex.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '195 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '-8.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Follow-Through Zone)',
          brakingZone: 'Light tap on the brakes while settling the rear for the rapid downhill descent.',
          racingLine: 'Sacrifice maximum exit width to position the car on the right for Turn 3.',
          trackLimits: 'White line enforced on corner exit kerbing.'
        },
        history: "Rapid downhill plunge transferring mass into the sweeping Maggotts/Becketts-inspired S-curves.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 3',
        turns: 'Turn 3 (T3)',
        description: 'The opening sweeper of the esses, entered at extreme velocity pulling nearly 5G lateral.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '250 km/h',
          exitSpeed: '255 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '-3.2 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.2 / 10 (Aero Lockout)',
          brakingZone: 'Flat out or slight lift to pin the front nose.',
          racingLine: 'Aggressive kerb strike on the inside, keeping momentum high for the direction change.',
          trackLimits: 'Monitored on exit flat kerbs.'
        },
        history: "First apex of the flowing snake sequence inspired by Silverstone's iconic Maggotts-Becketts complex.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 4',
        turns: 'Turn 4 (T4)',
        description: 'High-G left transition requiring maximum aerodynamic downforce and chassis stiffness.',
        technical: {
          entrySpeed: '255 km/h',
          apexSpeed: '225 km/h',
          exitSpeed: '230 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.4 G',
          elevationChange: '-1.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Follow-Through)',
          brakingZone: 'Quick brush of the brake pedal to rotate the front axle across the kerb.',
          racingLine: 'Precise apex transition; missing the apex kerb compromises the next three corners.',
          trackLimits: 'Strict exit tracking to avoid track-limit lap deletion.'
        },
        history: "Fast direction switch testing driver neck endurance under repeated 4.5G loads.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 5',
        turns: 'Turn 5 (T5)',
        description: 'Sweeping right-hander loading the left tyres heavily in the mid-sector rhythm.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '210 km/h',
          exitSpeed: '215 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.6 G',
          elevationChange: '+0.8 m',
          drs: 'High-Downforce Arc'
        },
        racing: {
          overtakingPotential: '1.0 / 10 (Technical Section)',
          brakingZone: 'Controlled lift and trail-brake to balance aerodynamic pitch.',
          racingLine: 'Hold tight right line to open the entry for the blind left-hand Turn 6.',
          trackLimits: 'FIA white line strictly observed.'
        },
        history: "High-lateral-load curve where tyre thermal degradation begins to show during long stints.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 6',
        turns: 'Turn 6 (T6)',
        description: 'Blind left-hand exit of the Esses sequence, marking the official Sector 1 intermediate timing line.',
        technical: {
          entrySpeed: '215 km/h',
          apexSpeed: '190 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+2.1 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Intermediate 1 Split)',
          brakingZone: 'Firm braking on entry while transitioning lateral load left.',
          racingLine: 'Clip the inside kerb and maintain mid-track line for Turn 7 setup.',
          trackLimits: 'Exit kerb edge monitored by FIA timing sensors.'
        },
        history: "End of the high-speed snake sequence; cars that lose rear grip here risk snap oversteer into the gravel.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 7',
        turns: 'Turn 7 (T7)',
        description: 'Opening right hander of Sector 2 leading into the technical downhill switchback.',
        technical: {
          entrySpeed: '210 km/h',
          apexSpeed: '175 km/h',
          exitSpeed: '185 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.6 G',
          elevationChange: '+1.2 m',
          drs: 'Sector 2 Entry'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Opportunity on Error)',
          brakingZone: 'Trail-braking into the medium-speed right hander.',
          racingLine: 'Tight apex hugging the kerb to avoid being pushed wide onto marbles.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "Technical corner demanding good front-end bite and responsive steering turn-in.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 8',
        turns: 'Turn 8 (T8)',
        description: 'Downhill left curve that easily triggers front-left tyre lockups under braking.',
        technical: {
          entrySpeed: '185 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '170 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '-1.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Challenging Pass)',
          brakingZone: 'Braking downhill while turning, testing front locking sensitivity.',
          racingLine: 'Smooth arc prioritizing mid-corner balance over raw entry speed.',
          trackLimits: 'Standard FIA white line limits.'
        },
        history: "Deceptive corner with downhill camber changes that test differential and suspension compliance.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 9',
        turns: 'Turn 9 (T9)',
        description: 'Uphill right-hand sweeper where drivers aim for aggressive early throttle pick-up.',
        technical: {
          entrySpeed: '175 km/h',
          apexSpeed: '165 km/h',
          exitSpeed: '205 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+4.6 m',
          drs: 'Acceleration Zone'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Exit Traction Setup)',
          brakingZone: 'Light brake pressure to plant the nose uphill.',
          racingLine: 'Early power delivery over the crest kerb to build speed towards Turn 10.',
          trackLimits: 'Exit kerbing monitored for track extent violations.'
        },
        history: "Elevation rise masks the exit vision, requiring blind trust in braking and turn-in references.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 10',
        turns: 'Turn 10 (T10)',
        description: 'Thrilling blind crest left kink where the car unweights before heavy braking into Turn 11.',
        technical: {
          entrySpeed: '220 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.5 G',
          elevationChange: '-6.2 m',
          drs: 'Pre-Hairpin Acceleration'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (High Speed Sweep)',
          brakingZone: 'Flat-out sweep over blind crest downhill.',
          racingLine: 'Graze the left inside line and immediately prepare straight braking for Turn 11.',
          trackLimits: 'White line strictly policed on high-speed exit.'
        },
        history: "A high-commitment crest where any rear unbalance can trigger high-speed spins.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 11',
        turns: 'Turn 11 (T11)',
        description: 'Tight 2nd-gear left hairpin; the most critical corner on the circuit for lap time and back straight top speed.',
        technical: {
          entrySpeed: '275 km/h',
          apexSpeed: '78 km/h',
          exitSpeed: '140 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Detection Zone 2'
        },
        racing: {
          overtakingPotential: '8.6 / 10 (Hairpin Dive Opportunity)',
          brakingZone: 'Heavy threshold braking down from 275 km/h into a tight 180-degree hairpin.',
          racingLine: 'Deep late apex line to maximize throttle exit onto the massive 1.02 km back straight.',
          trackLimits: 'Inside apex kerb clipped; exit run-off monitored.'
        },
        history: "Scene of aggressive dive-bombs and switchback counter-attacks onto the long back straight.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 12',
        turns: 'Turn 12 (T12)',
        description: 'Prime overtaking spot at COTA at the conclusion of the 1km DRS back straight.',
        technical: {
          entrySpeed: '338 km/h',
          apexSpeed: '85 km/h',
          exitSpeed: '145 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-5.2 G',
          elevationChange: '+1.2 m',
          drs: 'DRS Zone 2 Exit (Braking)'
        },
        racing: {
          overtakingPotential: '9.6 / 10 (Top Passing Hotspot)',
          brakingZone: 'Massive deceleration zone from 338 km/h down to 85 km/h under 5.2G braking forces.',
          racingLine: 'Deep braking into the apex, squaring off exit into the amphitheatre stadium section.',
          trackLimits: 'Strict exit enforcement on the kerb transition.'
        },
        history: "COTA's most dramatic overtaking battleground, including memorable Verstappen-Raikkonen and Hamilton-Rosberg duels.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 13',
        turns: 'Turn 13 (T13)',
        description: 'Sharp right hander entering the stadium amphitheatre, demanding nimble low-speed rotation.',
        technical: {
          entrySpeed: '145 km/h',
          apexSpeed: '95 km/h',
          exitSpeed: '120 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.8 G',
          elevationChange: '+0.4 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '4.5 / 10 (Switchback Battleground)',
          brakingZone: 'Trail-braking right while transitioning out of Turn 12 exit.',
          racingLine: 'Clip apex tightly to open Turn 14 immediately on the left.',
          trackLimits: 'White line monitored on exit.'
        },
        history: "First element of the stadium complex where fans in the grandstands have panoramic views of slow-speed car control.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 14',
        turns: 'Turn 14 (T14)',
        description: 'Quick right chicane flick linking Turn 13 to Turn 15.',
        technical: {
          entrySpeed: '120 km/h',
          apexSpeed: '125 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.2 m',
          drs: 'Stadium Rhythm Zone'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Positional Pressure)',
          brakingZone: 'Light brake balance modulation to pivot car through chicane.',
          racingLine: 'Double apex consideration, positioning left for Turn 15.',
          trackLimits: 'Inside sausage kerbs must be avoided.'
        },
        history: "Low-speed technical switch testing mechanical grip and steering rack precision.",
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'americas',
        name: 'Circuit of the Americas Turn 15',
        turns: 'Turn 15 (T15)',
        description: 'Sharp left-hander exit from the stadium complex onto the sweeping southern loop.',
        technical: {
          entrySpeed: '115 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '155 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-3.6 G',
          elevationChange: '+0.5 m',
          drs: 'Standard Aero Zone'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Stadium Overtake Zone)',
          brakingZone: 'Hard braking into a sharp 90-degree left hander.',
          racingLine: 'Late apex allowing immediate full-throttle drive towards the multi-apex carousel.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: "Common site of switchback passing attempts when cars go side-by-side through Turns 12-15.",
        status: 'VERIFIED',
        x: 660, y: 250,
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
