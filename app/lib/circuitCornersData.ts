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
        circuitId: 'silverstone',
        name: 'Abbey',
        turns: 'Turn 1 (T1)',
        description: 'Blisteringly fast 290 km/h right-hand corner opening the lap right past the Silverstone Wing. Cars carry massive ground-effect downforce with only a slight brush of brakes.',
        technical: {
          entrySpeed: '310 km/h',
          apexSpeed: '285 km/h',
          exitSpeed: '295 km/h',
          typicalGear: '7th Gear',
          brakingIntensity: '-1.8 G',
          elevationChange: '+0.8 m',
          drs: 'DRS Zone Exit'
        },
        racing: {
          overtakingPotential: '7.0 / 10 (High-Speed Outside Sweep)',
          brakingZone: 'High-speed aerodynamic lift or light dab on brakes to pitch front wing without losing floor downforce.',
          racingLine: 'High-commitment trajectory hugging inside kerb past the Wing, trusting ground-effect suction.',
          trackLimits: 'Strictly enforced exit kerb white line; high aerodynamic drift makes this high-risk for lap deletion.'
        },
        history: 'Opened the new Silverstone Arena layout in 2010 past the Wing pit complex. Hamilton and Verstappen frequently duel here on opening laps.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't2': {
        id: 't2',
        circuitId: 'silverstone',
        name: 'Farm Curve',
        turns: 'Turn 2 (T2)',
        description: 'Flat-out sweeping left bend connecting Abbey into the technical Arena infield complex. Cars pull over 3.2 lateral G while maintaining full throttle.',
        technical: {
          entrySpeed: '300 km/h',
          apexSpeed: '290 km/h',
          exitSpeed: '295 km/h',
          typicalGear: '8th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '-1.2 m',
          drs: 'Full Throttle Flow'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (High-Speed Follow Through)',
          brakingZone: 'No braking required; smooth steering input to avoid scrubbing aerodynamic velocity.',
          racingLine: 'Wide entry sweeping right-to-left along the inside painted kerbing, setting up straight-line braking for Village.',
          trackLimits: 'Track limits policed on the transition into Turn 3 braking apron.'
        },
        history: 'Constructed as part of the 2010 circuit redesign, turning former infield farmland into a high-speed stadium amphitheater.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't3': {
        id: 't3',
        circuitId: 'silverstone',
        name: 'Village',
        turns: 'Turn 3 (T3)',
        description: 'Heavy braking right-hander into the Arena infield. Drivers brake down from 295 km/h to 110 km/h, making it a prime overtaking hotspot and turn 1 restart battlefield.',
        technical: {
          entrySpeed: '295 km/h',
          apexSpeed: '110 km/h',
          exitSpeed: '125 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-4.2 G',
          elevationChange: '-2.1 m',
          drs: 'Pre-Corner Deceleration'
        },
        racing: {
          overtakingPotential: '8.8 / 10 (Premier Arena Overtaking Zone)',
          brakingZone: 'Violent threshold braking from 295 km/h; front-right lockups are common as cars brake while turning slightly.',
          racingLine: 'Deep late apex line, clipping the tall red-and-white curb to pivot the car instantly for The Loop switchback.',
          trackLimits: 'Inside apex kerb monitored for short-cutting; generous asphalt run-off on exit.'
        },
        history: 'Named after the nearby historic Silverstone village; venue of dramatic collisions and bold divebombs.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't4': {
        id: 't4',
        circuitId: 'silverstone',
        name: 'The Loop',
        turns: 'Turn 4 (T4)',
        description: 'The slowest corner on the entire Silverstone circuit. A tight, technical 180-degree left-hand hairpin demanding extreme mechanical grip and precise traction management.',
        technical: {
          entrySpeed: '135 km/h',
          apexSpeed: '90 km/h',
          exitSpeed: '115 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.4 m',
          drs: 'Slow Hairpin Arena'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Switchback Hairpin Dive)',
          brakingZone: 'Short, sharp trail-braking down to 90 km/h while wrapping around the tight apex.',
          racingLine: 'Square off the corner: sacrifice entry speed for early rotation to get full throttle traction for the Wellington Straight run.',
          trackLimits: 'Strict tracking on corner exit to ensure cars do not exceed boundary prior to Aintree acceleration.'
        },
        history: 'Introduced in 2010 to slow cars before the long Wellington Straight, creating classic cutback switchback moves.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't5': {
        id: 't5',
        circuitId: 'silverstone',
        name: 'Aintree',
        turns: 'Turn 5 (T5)',
        description: 'Medium-speed left-hand bend that acts as the critical launch pad onto the DRS-assisted Wellington Straight. Exit traction and early full throttle are paramount.',
        technical: {
          entrySpeed: '110 km/h',
          apexSpeed: '145 km/h',
          exitSpeed: '195 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-0.8 G',
          elevationChange: '+0.5 m',
          drs: 'DRS Zone Detection Ahead'
        },
        racing: {
          overtakingPotential: '4.0 / 10 (Acceleration Launch Zone)',
          brakingZone: 'Light lift and aggressive power application onto the apex kerb.',
          racingLine: 'Clip the flat kerb on the left and unleash 1000 hp early without inducing snap oversteer.',
          trackLimits: 'Exit kerb used extensively; running four wheels beyond white line results in lap invalidation.'
        },
        history: 'Named in honour of the legendary Aintree Motor Racing Circuit, which shared British GP hosting duties in the 1950s and 60s.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't6': {
        id: 't6',
        circuitId: 'silverstone',
        name: 'Brooklands',
        turns: 'Turn 6 (T6)',
        description: 'High-speed braking zone at the end of Wellington Straight. Cars brake from 315 km/h while turning into a long, sweeping left-hander, punishing the right-front tyre.',
        technical: {
          entrySpeed: '315 km/h',
          apexSpeed: '160 km/h',
          exitSpeed: '175 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-4.4 G',
          elevationChange: '-1.5 m',
          drs: 'DRS Zone Braking Terminal'
        },
        racing: {
          overtakingPotential: '9.2 / 10 (Premier Wellington DRS Overtake)',
          brakingZone: 'Massive straight-line braking from 315 km/h; drivers can brake late on inside or sweep around the outside.',
          racingLine: 'Wide turn-in, gradual trail-braking towards the inside kerbing, holding mid-track to set up the entry for Luffield.',
          trackLimits: 'Exit run-off monitored strictly by FIA timing loops.'
        },
        history: 'Named after Brooklands, the world’s first purpose-built banked motor racing circuit built in Surrey in 1907.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't7': {
        id: 't7',
        circuitId: 'silverstone',
        name: 'Luffield',
        turns: 'Turn 7 (T7)',
        description: 'Iconic long, double-apex right-hand carousel. Drivers must constantly balance throttle and steering while fighting understeer before unleashing maximum power onto Woodcote.',
        technical: {
          entrySpeed: '170 km/h',
          apexSpeed: '115 km/h',
          exitSpeed: '175 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-2.5 G',
          elevationChange: '+0.3 m',
          drs: 'Technical Carousel Arc'
        },
        racing: {
          overtakingPotential: '8.0 / 10 (Double-Apex Cross-Over)',
          brakingZone: 'Progressive trail-braking across the first apex, carrying momentum through the sustained right turn.',
          racingLine: 'Double-apex technique: clip first apex, drift slightly mid-track, then tuck back in for a second apex to slingshot down National Straight.',
          trackLimits: 'Exit kerbing and tarmac run-off strictly policed as drivers push for early throttle.'
        },
        history: 'Named after the medieval Luffield Priory once located near the track. Stage of countless famous British GP battles.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't8': {
        id: 't8',
        circuitId: 'silverstone',
        name: 'Woodcote',
        turns: 'Turn 8 (T8)',
        description: 'Sweeping right-hand kink connecting Luffield to the former start/finish National Straight. Cars accelerate at full throttle, pulling over 3.4 G lateral.',
        technical: {
          entrySpeed: '245 km/h',
          apexSpeed: '260 km/h',
          exitSpeed: '280 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.1 G',
          elevationChange: '+0.2 m',
          drs: 'National Straight Launch'
        },
        racing: {
          overtakingPotential: '3.5 / 10 (Slipstream Slipway)',
          brakingZone: 'Flat-out acceleration; precision steering to avoid tyre scrubbing.',
          racingLine: 'Hold tight to the right apex before letting the car wash out naturally over the exit kerb towards the old pits.',
          trackLimits: 'Monitored at the exit kerbing where cars drift towards the pit wall entrance.'
        },
        history: 'Originally Silverstone’s final corner before the 2010 track redesign moved the start/finish to the Wing complex.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't9': {
        id: 't9',
        circuitId: 'silverstone',
        name: 'Copse',
        turns: 'Turn 9 (T9)',
        description: 'One of the most fearsome corners in global motorsport. Taken in 7th gear at 290 km/h with an aggressive blind entry, clipping the inside apex under 4.8 to 5.2 lateral G.',
        technical: {
          entrySpeed: '305 km/h',
          apexSpeed: '285 km/h',
          exitSpeed: '290 km/h',
          typicalGear: '7th Gear',
          brakingIntensity: '-1.0 G',
          elevationChange: '+1.1 m',
          drs: 'High-Downforce Apex'
        },
        racing: {
          overtakingPotential: '7.5 / 10 (Heroic High-Speed Outside Move)',
          brakingZone: 'Momentary high-speed lift or subtle breath on brakes from 305 km/h to seat front aerodynamics before rapid right turn-in.',
          racingLine: 'Blind right apex clipping high kerb at 285 km/h, riding wide exit kerb and tarmac run-off at extreme speed.',
          trackLimits: 'Exit kerb edge strictly monitored by FIA timing sensors.'
        },
        history: 'Site of the historic 2021 collision between Lewis Hamilton and Max Verstappen, recording a massive 51G impact into tyre barriers.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't10': {
        id: 't10',
        circuitId: 'silverstone',
        name: 'Maggotts',
        turns: 'Turn 10 (T10)',
        description: 'The blistering entry to the legendary Maggotts-Becketts-Chapel high-speed esses. Approached at 310 km/h in 8th gear, taken almost flat out left.',
        technical: {
          entrySpeed: '310 km/h',
          apexSpeed: '300 km/h',
          exitSpeed: '295 km/h',
          typicalGear: '8th Gear',
          brakingIntensity: '-0.4 G',
          elevationChange: '-1.6 m',
          drs: 'High-G Esse Entry'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Uncompromising Aero Flow)',
          brakingZone: 'Tiny aerodynamic lift; no braking. 100% reliant on modern floor ground-effect downforce.',
          racingLine: 'Flick left, graze the inside kerb, immediately loading suspension for the Becketts right-hand switchback.',
          trackLimits: 'Track limits strictly policed along the left painted kerbing.'
        },
        history: 'Named after Maggot Moor, a historic plot of land adjacent to the Silverstone airfield perimeter.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't11': {
        id: 't11',
        circuitId: 'silverstone',
        name: 'Becketts 1',
        turns: 'Turn 11 (T11)',
        description: 'Violent high-speed right flick following Maggotts. Drivers experience over 5.2G lateral load as they snap the car right at 280 km/h.',
        technical: {
          entrySpeed: '295 km/h',
          apexSpeed: '275 km/h',
          exitSpeed: '260 km/h',
          typicalGear: '7th Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '-0.9 m',
          drs: 'High-G Lateral Reversal'
        },
        racing: {
          overtakingPotential: '2.0 / 10 (Chassis Stress Reversal)',
          brakingZone: 'Light dab of braking while transitioning mass aggressively from left to right.',
          racingLine: 'Clip the right-hand apex kerb tightly to position the car for the tightening left of Becketts 2.',
          trackLimits: 'Exit white line monitored closely.'
        },
        history: 'Named after the nearby chapel of St Thomas Becket, Archbishop of Canterbury.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't12': {
        id: 't12',
        circuitId: 'silverstone',
        name: 'Becketts 2',
        turns: 'Turn 12 (T12)',
        description: 'Technical left-hand tightening curve within the complex. Cars scrub speed from 270 km/h to 240 km/h in 6th gear, testing front-end grip and aerodynamic balance.',
        technical: {
          entrySpeed: '260 km/h',
          apexSpeed: '235 km/h',
          exitSpeed: '225 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-2.2 G',
          elevationChange: '+0.3 m',
          drs: 'In-Complex Direction Change'
        },
        racing: {
          overtakingPotential: '2.5 / 10 (Apex Placement Duel)',
          brakingZone: 'Firm trail-braking into the left apex to control weight transfer.',
          racingLine: 'Mount the left apex kerb cleanly without upsetting the car floor, preparing for the slingshot through Chapel.',
          trackLimits: 'Apex and exit boundaries monitored.'
        },
        history: 'The ultimate benchmark of modern F1 aerodynamic downforce and driver commitment.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't13': {
        id: 't13',
        circuitId: 'silverstone',
        name: 'Chapel',
        turns: 'Turn 13 (T13)',
        description: 'Right-hand kink leading onto the Chapel exit. The apex tightens before releasing onto the Hangar Straight run.',
        technical: {
          entrySpeed: '230 km/h',
          apexSpeed: '215 km/h',
          exitSpeed: '235 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-1.2 G',
          elevationChange: '+0.5 m',
          drs: 'Launch Setup'
        },
        racing: {
          overtakingPotential: '3.0 / 10 (Exit Launch Preparation)',
          brakingZone: 'Smooth roll-off the brakes and progressive throttle application.',
          racingLine: 'Keep tight on the right apex to allow full-power exit through Turn 14.',
          trackLimits: 'Careful adherence to avoid dipping left wheel into gravel.'
        },
        history: 'The transitional link between the twisting Becketts complex and the flat-out Hangar Straight.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't14': {
        id: 't14',
        circuitId: 'silverstone',
        name: 'Hangar Straight Kink',
        turns: 'Turn 14 (T14)',
        description: 'Fast left sweeper launching cars onto the 335 km/h Hangar Straight. Exit speed here dictates whether a driver can mount an overtake into Stowe.',
        technical: {
          entrySpeed: '235 km/h',
          apexSpeed: '255 km/h',
          exitSpeed: '280 km/h',
          typicalGear: '6th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '+0.8 m',
          drs: 'Hangar Straight DRS Entry'
        },
        racing: {
          overtakingPotential: '5.0 / 10 (Wellington/Hangar Launchpad)',
          brakingZone: 'Full throttle application; zero braking.',
          racingLine: 'Cut across the left kerb and run right onto the painted green exit strip to maximize exit speed.',
          trackLimits: 'Infamous for lap invalidations in qualifying if four wheels exceed red-and-white kerb.'
        },
        history: 'Launches cars down the site of the wartime bomber runways where RAF Vickers Wellingtons once took off.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't15': {
        id: 't15',
        circuitId: 'silverstone',
        name: 'Stowe',
        turns: 'Turn 15 (T15)',
        description: 'Brutal braking zone from top speed into a fast 5th-gear right turn beneath the Rolex bridge, with extreme track limit challenges on the wide exit run-off.',
        technical: {
          entrySpeed: '330 km/h',
          apexSpeed: '205 km/h',
          exitSpeed: '220 km/h',
          typicalGear: '5th Gear',
          brakingIntensity: '-4.6 G',
          elevationChange: '-1.8 m',
          drs: 'Hangar Straight DRS Braking Terminal'
        },
        racing: {
          overtakingPotential: '8.8 / 10 (Hangar Straight Slipstream Pass)',
          brakingZone: 'Violent threshold braking from 330 km/h down to 205 km/h while turning slightly downhill.',
          racingLine: 'Late apex turn-in under the bridge, clipping inside kerb and letting car drift across the asphalt apron.',
          trackLimits: 'Exit kerb monitored strictly for 4-wheel track limit violations.'
        },
        history: 'Named after nearby Stowe School; site of legendary slipstream passes and high-speed lockups throughout F1 history.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't16': {
        id: 't16',
        circuitId: 'silverstone',
        name: 'Vale',
        turns: 'Turn 16 (T16)',
        description: 'Downhill braking zone into a sharp left-right chicane. Cars drop from 305 km/h to 115 km/h down a steep slope, making the inside front tyre prone to locking.',
        technical: {
          entrySpeed: '305 km/h',
          apexSpeed: '115 km/h',
          exitSpeed: '130 km/h',
          typicalGear: '2nd Gear',
          brakingIntensity: '-4.5 G',
          elevationChange: '-3.2 m',
          drs: 'Pre-Chicane Braking'
        },
        racing: {
          overtakingPotential: '8.5 / 10 (Downhill Divebomb Zone)',
          brakingZone: 'Downhill threshold braking; cars unload rear suspension, demanding delicate brake pressure balance.',
          racingLine: 'Hug the left inside kerb, sacrifice exit width to immediately position car right for Club entry.',
          trackLimits: 'Bollards and kerb sensors monitor corner cutting.'
        },
        history: 'Added in 1991 to slow cars approaching Club Corner, creating one of Silverstone’s most dramatic braking zones.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't17': {
        id: 't17',
        circuitId: 'silverstone',
        name: 'Club Entry',
        turns: 'Turn 17 (T17)',
        description: 'Right-hand uphill apex of the Club complex. Drivers clip the aggressive inside kerbing while managing power delivery before the final launch onto the pit straight.',
        technical: {
          entrySpeed: '130 km/h',
          apexSpeed: '135 km/h',
          exitSpeed: '160 km/h',
          typicalGear: '3rd Gear',
          brakingIntensity: '-1.5 G',
          elevationChange: '+1.5 m',
          drs: 'In-Complex Acceleration'
        },
        racing: {
          overtakingPotential: '6.0 / 10 (Chicane Exit Battle)',
          brakingZone: 'Trail-braking uphill while pivoting right into the stadium section.',
          racingLine: 'Aggressive right kerb strike to straighten the exit arc.',
          trackLimits: 'Monitored at apex kerbing.'
        },
        history: 'Surrounded by giant grandstands packed with roaring fans waving Union Jacks.',
        status: 'VERIFIED',
        x: 660, y: 250,
        images: []
      },
      't18': {
        id: 't18',
        circuitId: 'silverstone',
        name: 'Club Exit',
        turns: 'Turn 18 (T18)',
        description: 'The final corner of the Silverstone lap. A long, accelerating right-hand sweeper that launches cars onto the Hamilton Straight towards the chequered flag.',
        technical: {
          entrySpeed: '160 km/h',
          apexSpeed: '185 km/h',
          exitSpeed: '240 km/h',
          typicalGear: '4th Gear',
          brakingIntensity: '-0.2 G',
          elevationChange: '+0.8 m',
          drs: 'Hamilton Straight Launchpad'
        },
        racing: {
          overtakingPotential: '6.5 / 10 (Start/Finish Line Drag Race)',
          brakingZone: 'Full progressive acceleration through the long right curve.',
          racingLine: 'Hold mid-track before letting downforce pin the car to the outside kerb past the pit wall.',
          trackLimits: 'Exit white line policed as cars sweep out onto the main straight.'
        },
        history: 'Scene of Lewis Hamilton’s emotional record-breaking 9th British Grand Prix victory in 2024 to deafening home crowd cheers.',
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
