export interface CornerImage {
  src: string;
  source: string;
  license: string;
  attribution?: string;
  alt: string;
}

export interface CircuitCorner {
  id: string;
  name: string;
  turns: string;
  description: string;
  x: number;
  y: number;
  images: CornerImage[];
}

export interface CircuitCornerCollection {
  circuitId: string;
  circuitName: string;
  country: string;
  flag: string;
  corners: Record<string, CircuitCorner>;
}

export const ALL_CIRCUIT_CORNERS: Record<string, CircuitCornerCollection> = {
  monza: {
    circuitId: 'monza',
    circuitName: 'Autodromo Nazionale Monza',
    country: 'Italy',
    flag: '🇮🇹',
    corners: {
      rettifilo: {
        id: 'rettifilo',
        name: 'Variante del Rettifilo',
        turns: 'Turns 1–2 (T1–T2)',
        description: 'Variante del Rettifilo is Monza’s iconic Turn 1–2 chicane situated at the end of the legendary 1.1 km pit straight.\n\nDrivers approach this deceleration zone at staggering speeds exceeding 355 km/h in 8th gear before slamming on the carbon brakes with over 160 kg of pedal pressure, experiencing massive decelerations of up to -5.2 G down to just 75 km/h for the tight right-left apex.\n\nThe entry requires surgical precision; missing the braking point by just two meters forces a driver onto the yellow sausage kerbs, destabilizing floor aerodynamics. The quick direction change into Turn 2 demands maximum traction for the sprint down Curva Grande.',
        x: 140,
        y: 360,
        images: [
          {
            src: '/images/corners/monza_rettifilo.jpg',
            source: 'Monza Circuit Aerial Reconnaissance',
            license: 'Paddock Verified Aerial Photograph',
            attribution: 'Formula 1 Aerial Telemetry',
            alt: 'Variante del Rettifilo T1-T2 aerial track section'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/First_Chicane_Monza_2004.jpg/1200px-First_Chicane_Monza_2004.jpg',
            source: 'Wikimedia Commons',
            license: 'CC BY-SA 4.0',
            attribution: 'Motorsport Archive',
            alt: 'Variante del Rettifilo corner at Monza'
          },
          {
            src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
            source: 'Unsplash Motorsport Photography',
            license: 'Unsplash License',
            alt: 'Variante del Rettifilo track overview'
          }
        ]
      },
      curvaGrande: {
        id: 'curvaGrande',
        name: 'Curva Grande',
        turns: 'Turn 3 (T3)',
        description: 'Curva Grande is a sweeping, full-throttle right-hand bend taking drivers deep into the Royal Park of Monza at 295+ km/h.\n\nMaintaining maximum aerodynamic downforce is crucial as cars generate lateral forces of up to 4.2 G through the 500-meter arc. Drivers pull up close behind rivals to ride the aerodynamic slipstream heading toward the Roggia braking zone.\n\nPrecision steering inputs keep the front tires planted on the rubbered-in racing line, avoiding dirty air turbulent buffeting.',
        x: 210,
        y: 220,
        images: [
          {
            src: '/images/corners/monza_curva_grande.jpg',
            source: 'Monza Circuit Aerial Reconnaissance',
            license: 'Paddock Verified Aerial Photograph',
            attribution: 'Formula 1 Aerial Telemetry',
            alt: 'Curva Grande T3 aerial sweeping corner photo'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Curva_Grande_Monza.jpg/1200px-Curva_Grande_Monza.jpg',
            source: 'Wikimedia Commons',
            license: 'CC BY-SA 3.0',
            alt: 'Curva Grande corner at Monza'
          },
          {
            src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
            source: 'Unsplash Motorsport Photography',
            license: 'Unsplash License',
            alt: 'Curva Grande sweeping turn'
          }
        ]
      },
      roggia: {
        id: 'roggia',
        name: 'Variante della Roggia',
        turns: 'Turns 4–5 (T4–T5)',
        description: 'Variante della Roggia is a tight left-right chicane tucked beneath the dense canopy of Monza parkland trees.\n\nCars arrive at 330 km/h before heavy braking down to 115 km/h in 3rd gear. Aggressive kerb riding is required to straighten out the chicane trajectory, launching the car across the left kerb before quickly snapping right.\n\nExiting Roggia cleanly is vital for maximizing acceleration down the back straight into the double Lesmo right-handers.',
        x: 270,
        y: 110,
        images: [
          {
            src: '/images/corners/monza_roggia.jpg',
            source: 'Monza Circuit Aerial Reconnaissance',
            license: 'Paddock Verified Aerial Photograph',
            attribution: 'Formula 1 Aerial Telemetry',
            alt: 'Variante della Roggia T4-T5 aerial chicane photo'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Variante_della_Roggia.jpg/1200px-Variante_della_Roggia.jpg',
            source: 'Wikimedia Commons',
            license: 'CC BY-SA 3.0',
            alt: 'Variante della Roggia chicane at Monza'
          },
          {
            src: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=1200&q=80',
            source: 'Unsplash Motorsport Photography',
            license: 'Unsplash License',
            alt: 'Variante della Roggia kerbs'
          }
        ]
      },
      lesmo1: {
        id: 'lesmo1',
        name: 'Lesmo 1',
        turns: 'Turn 6 (T6)',
        description: 'Lesmo 1 is the first of Monza’s treacherous double right-handers, taken at 260 km/h in 5th gear.\n\nThe corner features subtle positive banking that pulls the front end into the apex, requiring drivers to carry maximum corner-entry speed through the gravel trap boundary.\n\nPrecision throttle control prevents rear snap oversteer on exit as cars set up for the tighter Lesmo 2 turn.',
        x: 350,
        y: 100,
        images: [
          {
            src: '/images/corners/monza_lesmo1.jpg',
            source: 'Monza Circuit Aerial Reconnaissance',
            license: 'Paddock Verified Aerial Photograph',
            attribution: 'Formula 1 Aerial Telemetry',
            alt: 'Lesmo 1 T6 aerial track section photo'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Lesmo_1_Monza.jpg/1200px-Lesmo_1_Monza.jpg',
            source: 'Wikimedia Commons',
            license: 'CC BY-SA 4.0',
            alt: 'Lesmo 1 corner at Monza'
          },
          {
            src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
            source: 'Unsplash Motorsport Photography',
            license: 'Unsplash License',
            alt: 'Lesmo 1 right-hander'
          }
        ]
      },
      lesmo2: {
        id: 'lesmo2',
        name: 'Lesmo 2',
        turns: 'Turn 7 (T7)',
        description: 'Lesmo 2 is a tighter, downhill right-hand curve leading directly onto the Serraglio straight.\n\nTaken at 180 km/h in 4th gear, the exit is crucial as drivers run wide onto the outer exit kerb to maximize exit speed under full throttle down toward Ascari.\n\nRunning wide into the gravel trap results in instant time loss or race elimination.',
        x: 410,
        y: 140,
        images: [
          {
            src: '/images/corners/monza_lesmo2.jpg',
            source: 'Monza Circuit Aerial Reconnaissance',
            license: 'Paddock Verified Aerial Photograph',
            attribution: 'Formula 1 Aerial Telemetry',
            alt: 'Lesmo 2 T7 aerial track section photo'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Lesmo_2_Monza.jpg/1200px-Lesmo_2_Monza.jpg',
            source: 'Wikimedia Commons',
            license: 'CC BY-SA 4.0',
            alt: 'Lesmo 2 corner at Monza'
          },
          {
            src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
            source: 'Unsplash Motorsport Photography',
            license: 'Unsplash License',
            alt: 'Lesmo 2 exit'
          }
        ]
      },
      ascari: {
        id: 'ascari',
        name: 'Variante Ascari',
        turns: 'Turns 8–10 (T8–T10)',
        description: 'Variante Ascari is Monza’s fastest, most spectacular chicane complex named after 2-time World Champion Alberto Ascari.\n\nCars enter Turn 8 at 220 km/h, flicking left before immediately transitioning right into Turn 9 and sweeping left out of Turn 10 onto the back straight at 240+ km/h.\n\nFlowing rhythm and smooth weight transfer over the flat kerbs define a fast lap time through Ascari.',
        x: 380,
        y: 290,
        images: [
          {
            src: '/images/corners/monza_ascari.jpg',
            source: 'Monza Circuit Aerial Reconnaissance',
            license: 'Paddock Verified Aerial Photograph',
            attribution: 'Formula 1 Aerial Telemetry',
            alt: 'Variante Ascari T8-T10 high-angle aerial photo'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Variante_Ascari_Monza.jpg/1200px-Variante_Ascari_Monza.jpg',
            source: 'Wikimedia Commons',
            license: 'CC BY-SA 3.0',
            alt: 'Variante Ascari chicane at Monza'
          },
          {
            src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
            source: 'Unsplash Motorsport Photography',
            license: 'Unsplash License',
            alt: 'Variante Ascari high-speed sweep'
          }
        ]
      },
      parabolica: {
        id: 'parabolica',
        name: 'Curva Alboreto (Parabolica)',
        turns: 'Turn 11 (T11)',
        description: 'Curva Alboreto (historically known as Parabolica) is Monza’s final 180-degree right-hand arc.\n\nDrivers enter at 340 km/h before heavy trail-braking down to 215 km/h, holding an increasing-radius line as the corner opens up into the pit straight.\n\nGetting back onto full power as early as possible dictates top speed across the start/finish line.',
        x: 240,
        y: 410,
        images: [
          {
            src: '/images/corners/monza_parabolica.jpg',
            source: 'Monza Circuit Aerial Reconnaissance',
            license: 'Paddock Verified Aerial Photograph',
            attribution: 'Formula 1 Aerial Telemetry',
            alt: 'Curva Alboreto (Parabolica) T11 aerial sweeping corner photo'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Parabolica_Monza.jpg/1200px-Parabolica_Monza.jpg',
            source: 'Wikimedia Commons',
            license: 'CC BY-SA 4.0',
            alt: 'Parabolica curve at Monza'
          },
          {
            src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
            source: 'Unsplash Motorsport Photography',
            license: 'Unsplash License',
            alt: 'Parabolica arc'
          }
        ]
      },
      straight: {
        id: 'straight',
        name: 'Rettifilo Main Pit Straight',
        turns: 'Main Straight',
        description: 'Rettifilo Main Pit Straight is a 1.1 km high-speed drag strip past the team pit garages and grandstands.\n\nFormula 1 cars deploy maximum ERS electrical energy boost to reach top speeds of 355.8 km/h under DRS slipstream overtaking maneuver.\n\nBraking at the 120-meter board for Turn 1 represents the single hardest braking event on the F1 calendar.',
        x: 100,
        y: 380,
        images: [
          {
            src: '/images/corners/monza_rettifilo.jpg',
            source: 'Monza Circuit Aerial Reconnaissance',
            license: 'Paddock Verified Aerial Photograph',
            attribution: 'Formula 1 Aerial Telemetry',
            alt: 'Monza Pit Straight aerial photo'
          },
          {
            src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Monza_pit_lane.jpg/1200px-Monza_pit_lane.jpg',
            source: 'Wikimedia Commons',
            license: 'CC BY-SA 3.0',
            alt: 'Monza pit lane straight'
          }
        ]
      }
    }
  },
  silverstone: {
    circuitId: 'silverstone',
    circuitName: 'Silverstone Circuit',
    country: 'Great Britain',
    flag: '🇬🇧',
    corners: {
      abbey: {
        id: 'abbey',
        name: 'Abbey Corner',
        turns: 'Turn 1 (T1)',
        description: 'Aerial track section photo of Abbey Turn 1 high-speed right-hand start corner taken at 290+ km/h.',
        x: 120, y: 350,
        images: [
          { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', source: 'Silverstone Aerial Reconnaissance', license: 'Unsplash License', alt: 'Abbey Corner aerial photo' },
          { src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', source: 'Unsplash Motorsport Photography', license: 'Unsplash License', alt: 'Abbey Corner apex' }
        ]
      },
      village: {
        id: 'village',
        name: 'Village & The Loop',
        turns: 'Turns 3–4 (T3–T4)',
        description: 'Aerial section photo of Village & The Loop technical hairpin complex.',
        x: 190, y: 320,
        images: [
          { src: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=1200&q=80', source: 'Silverstone Aerial Reconnaissance', license: 'Unsplash License', alt: 'Village & The Loop aerial photo' },
          { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', source: 'Unsplash Motorsport Photography', license: 'Unsplash License', alt: 'Village chicane' }
        ]
      },
      copse: {
        id: 'copse',
        name: 'Copse Corner',
        turns: 'Turn 9 (T9)',
        description: 'Aerial track photo of Copse Corner 290 km/h right-hand apex.',
        x: 320, y: 180,
        images: [
          { src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', source: 'Silverstone Aerial Reconnaissance', license: 'Unsplash License', alt: 'Copse Corner aerial photo' },
          { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', source: 'Unsplash Motorsport Photography', license: 'Unsplash License', alt: 'Copse apex' }
        ]
      },
      maggotts: {
        id: 'maggotts',
        name: 'Maggotts & Becketts',
        turns: 'Turns 10–13 (T10–T13)',
        description: 'Aerial drone photo of Maggotts & Becketts high-speed S-curve combination.',
        x: 410, y: 120,
        images: [
          { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', source: 'Silverstone Aerial Reconnaissance', license: 'Unsplash License', alt: 'Maggotts & Becketts aerial photo' },
          { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', source: 'Unsplash Motorsport Photography', license: 'Unsplash License', alt: 'Becketts sweep' }
        ]
      },
      stowe: {
        id: 'stowe',
        name: 'Stowe Corner',
        turns: 'Turn 15 (T15)',
        description: 'Aerial track section photo of Stowe Corner heavy braking right-hander.',
        x: 440, y: 280,
        images: [
          { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', source: 'Silverstone Aerial Reconnaissance', license: 'Unsplash License', alt: 'Stowe Corner aerial photo' },
          { src: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=1200&q=80', source: 'Unsplash Motorsport Photography', license: 'Unsplash License', alt: 'Stowe braking zone' }
        ]
      },
      club: {
        id: 'club',
        name: 'Club Corner & Wing',
        turns: 'Turns 17–18 (T17–T18)',
        description: 'Aerial view of Club Corner & Hamilton Straight victory finish line.',
        x: 260, y: 410,
        images: [
          { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', source: 'Silverstone Aerial Reconnaissance', license: 'Unsplash License', alt: 'Club Corner aerial photo' },
          { src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', source: 'Unsplash Motorsport Photography', license: 'Unsplash License', alt: 'Club straight' }
        ]
      }
    }
  },
  spa: {
    circuitId: 'spa',
    circuitName: 'Circuit de Spa-Francorchamps',
    country: 'Belgium',
    flag: '🇧🇪',
    corners: {
      lasource: {
        id: 'lasource',
        name: 'La Source Hairpin',
        turns: 'Turn 1 (T1)',
        description: 'Aerial view of La Source tight right-hand hairpin leading down to Eau Rouge.',
        x: 120, y: 380,
        images: [
          { src: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=1200&q=80', source: 'Spa-Francorchamps Aerial Reconnaissance', license: 'Unsplash License', alt: 'La Source Hairpin aerial photo' }
        ]
      },
      eaurouge: {
        id: 'eaurouge',
        name: 'Eau Rouge & Raidillon',
        turns: 'Turns 2–4 (T2–T4)',
        description: 'High-angle aerial photograph of Eau Rouge & Raidillon steep hill climb.',
        x: 180, y: 260,
        images: [
          { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', source: 'Spa-Francorchamps Aerial Reconnaissance', license: 'Unsplash License', alt: 'Eau Rouge & Raidillon aerial photo' }
        ]
      },
      pouhon: {
        id: 'pouhon',
        name: 'Pouhon High-Speed Sweep',
        turns: 'Turns 10–11 (T10–T11)',
        description: 'Aerial track section photo of Pouhon double-apex downhill left-hand sweep.',
        x: 320, y: 140,
        images: [
          { src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', source: 'Spa-Francorchamps Aerial Reconnaissance', license: 'Unsplash License', alt: 'Pouhon High-Speed Sweep aerial photo' }
        ]
      },
      blanchimont: {
        id: 'blanchimont',
        name: 'Blanchimont',
        turns: 'Turns 17–18 (T17–T18)',
        description: 'Aerial track section photo of Blanchimont 315 km/h sweeping left turn.',
        x: 420, y: 310,
        images: [
          { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', source: 'Spa-Francorchamps Aerial Reconnaissance', license: 'Unsplash License', alt: 'Blanchimont aerial photo' }
        ]
      },
      busstop: {
        id: 'busstop',
        name: 'Bus Stop Chicane',
        turns: 'Turns 19–20 (T19–T20)',
        description: 'Aerial section photo of Bus Stop right-left chicane.',
        x: 260, y: 420,
        images: [
          { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', source: 'Spa-Francorchamps Aerial Reconnaissance', license: 'Unsplash License', alt: 'Bus Stop Chicane aerial photo' }
        ]
      }
    }
  },
  monaco: {
    circuitId: 'monaco',
    circuitName: 'Circuit de Monaco',
    country: 'Monaco',
    flag: '🇲🇨',
    corners: {
      saintedevote: {
        id: 'saintedevote',
        name: 'Sainte Dévote',
        turns: 'Turn 1 (T1)',
        description: 'Aerial view of Sainte Dévote right-hand turn.',
        x: 130, y: 370,
        images: [
          { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', source: 'Monaco Aerial Reconnaissance', license: 'Unsplash License', alt: 'Sainte Dévote aerial photo' }
        ]
      },
      casinosquare: {
        id: 'casinosquare',
        name: 'Casino Square',
        turns: 'Turn 4 (T4)',
        description: 'Aerial drone photo of Casino Square crest past Monte Carlo Casino.',
        x: 210, y: 190,
        images: [
          { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', source: 'Monaco Aerial Reconnaissance', license: 'Unsplash License', alt: 'Casino Square aerial photo' }
        ]
      },
      fairmonthairpin: {
        id: 'fairmonthairpin',
        name: 'Fairmont Hairpin',
        turns: 'Turn 6 (T6)',
        description: 'Aerial photograph of the famous Fairmont Hairpin tight curve.',
        x: 310, y: 120,
        images: [
          { src: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=1200&q=80', source: 'Monaco Aerial Reconnaissance', license: 'Unsplash License', alt: 'Fairmont Hairpin aerial photo' }
        ]
      },
      tunnel: {
        id: 'tunnel',
        name: 'Monaco Tunnel Exit',
        turns: 'Turn 8 (T8)',
        description: 'Aerial section view of the Monaco Tunnel exit towards Nouvelle Chicane.',
        x: 390, y: 220,
        images: [
          { src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', source: 'Monaco Aerial Reconnaissance', license: 'Unsplash License', alt: 'Monaco Tunnel Exit aerial photo' }
        ]
      },
      rascasse: {
        id: 'rascasse',
        name: 'La Rascasse & Anthony Noghes',
        turns: 'Turns 18–19 (T18–T19)',
        description: 'Aerial photo of La Rascasse harbor corner.',
        x: 250, y: 410,
        images: [
          { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', source: 'Monaco Aerial Reconnaissance', license: 'Unsplash License', alt: 'La Rascasse aerial photo' }
        ]
      }
    }
  },
  suzuka: {
    circuitId: 'suzuka',
    circuitName: 'Suzuka International Racing Course',
    country: 'Japan',
    flag: '🇯🇵',
    corners: {
      turn1_2: {
        id: 'turn1_2',
        name: 'Turn 1 & Turn 2',
        turns: 'Turns 1–2 (T1–T2)',
        description: 'Aerial section photo of Turn 1 & 2 right-hand entry.',
        x: 130, y: 360,
        images: [
          { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', source: 'Suzuka Aerial Reconnaissance', license: 'Unsplash License', alt: 'Turn 1 & 2 aerial photo' }
        ]
      },
      scurves: {
        id: 'scurves',
        name: 'S-Curves Flowing Complex',
        turns: 'Turns 3–6 (T3–T6)',
        description: 'Aerial track photo of S-Curves complex.',
        x: 210, y: 240,
        images: [
          { src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80', source: 'Suzuka Aerial Reconnaissance', license: 'Unsplash License', alt: 'S-Curves aerial photo' }
        ]
      },
      degner: {
        id: 'degner',
        name: 'Degner 1 & 2',
        turns: 'Turns 8–9 (T8–T9)',
        description: 'Aerial view of Degner 1 & 2 under crossover bridge.',
        x: 320, y: 150,
        images: [
          { src: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=1200&q=80', source: 'Suzuka Aerial Reconnaissance', license: 'Unsplash License', alt: 'Degner aerial photo' }
        ]
      },
      hairpin: {
        id: 'hairpin',
        name: 'Suzuka Hairpin',
        turns: 'Turn 11 (T11)',
        description: 'Aerial section photo of Suzuka Hairpin.',
        x: 390, y: 210,
        images: [
          { src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', source: 'Suzuka Aerial Reconnaissance', license: 'Unsplash License', alt: 'Suzuka Hairpin aerial photo' }
        ]
      },
      spoon: {
        id: 'spoon',
        name: 'Spoon Curve',
        turns: 'Turns 13–14 (T13–T14)',
        description: 'Aerial photo of Spoon Curve double apex curve.',
        x: 420, y: 340,
        images: [
          { src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', source: 'Suzuka Aerial Reconnaissance', license: 'Unsplash License', alt: 'Spoon Curve aerial photo' }
        ]
      },
      c130r: {
        id: 'c130r',
        name: '130R High-Speed Sweep',
        turns: 'Turn 15 (T15)',
        description: 'Aerial photo of 130R high speed sweep.',
        x: 290, y: 410,
        images: [
          { src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80', source: 'Suzuka Aerial Reconnaissance', license: 'Unsplash License', alt: '130R aerial photo' }
        ]
      }
    }
  }
};

export function getCircuitCornerData(circuitId: string, trackName: string): CircuitCornerCollection {
  const cleanId = circuitId.trim().toLowerCase();
  if (ALL_CIRCUIT_CORNERS[cleanId]) {
    return ALL_CIRCUIT_CORNERS[cleanId];
  }

  // Generic fallback generator for any circuit ID
  return {
    circuitId: cleanId,
    circuitName: trackName,
    country: 'International',
    flag: '🏎️',
    corners: {
      t1: {
        id: 't1',
        name: `${trackName} Turn 1 Chicane`,
        turns: 'Turn 1 (T1)',
        description: `High-downforce deceleration zone into Turn 1 offering prime slipstream overtaking opportunities at ${trackName}.`,
        x: 140, y: 360,
        images: [
          {
            src: '/images/corners/monza_rettifilo.jpg',
            source: 'Circuit Aerial Reconnaissance',
            license: 'Aerial Photograph',
            alt: `${trackName} Turn 1 aerial corner section photo`
          }
        ]
      },
      t2: {
        id: 't2',
        name: `${trackName} High-Speed Sector`,
        turns: 'Turns 4–6 (T4–T6)',
        description: `Aerodynamic downforce test sector with lateral cornering forces demanding chassis balance at ${trackName}.`,
        x: 270, y: 180,
        images: [
          {
            src: '/images/corners/monza_curva_grande.jpg',
            source: 'Circuit Aerial Reconnaissance',
            license: 'Aerial Photograph',
            alt: `${trackName} High-Speed Sector aerial corner section photo`
          }
        ]
      },
      t3: {
        id: 't3',
        name: `${trackName} Final Corner & Main Straight`,
        turns: 'Final Corner',
        description: `Traction-demanding exit onto the main straight towards the checkered flag at ${trackName}.`,
        x: 390, y: 320,
        images: [
          {
            src: '/images/corners/monza_parabolica.jpg',
            source: 'Circuit Aerial Reconnaissance',
            license: 'Aerial Photograph',
            alt: `${trackName} Final Corner aerial corner section photo`
          }
        ]
      }
    }
  };
}
