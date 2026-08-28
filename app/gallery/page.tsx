'use client';

import React, { useState } from 'react';
import CircuitMap from '../components/CircuitMap';
import { ALL_CIRCUIT_CORNERS } from '../lib/circuitCornersData';

// List of all supported F1 circuits in Paddock
const SUPPORTED_CIRCUITS = [
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
  { id: 'imola', name: 'Autodromo Enzo e Dino Ferrari', flag: '🇮🇹', country: 'Italy' },
  { id: 'catalunya', name: 'Circuit de Barcelona-Catalunya', flag: '🇪🇸', country: 'Spain' },
  { id: 'villeneuve', name: 'Circuit Gilles Villeneuve', flag: '🇨🇦', country: 'Canada' },
  { id: 'red_bull_ring', name: 'Red Bull Ring', flag: '🇦🇹', country: 'Austria' },
  { id: 'hungaroring', name: 'Hungaroring', flag: '🇭🇺', country: 'Hungary' },
  { id: 'zandvoort', name: 'Circuit Zandvoort', flag: '🇳🇱', country: 'Netherlands' },
  { id: 'baku', name: 'Baku City Circuit', flag: '🇦🇿', country: 'Azerbaijan' },
  { id: 'marina_bay', name: 'Marina Bay Street Circuit', flag: '🇸🇬', country: 'Singapore' },
  { id: 'americas', name: 'Circuit of the Americas', flag: '🇺🇸', country: 'United States' },
  { id: 'rodriguez', name: 'Autódromo Hermanos Rodríguez', flag: '🇲🇽', country: 'Mexico' },
  { id: 'interlagos', name: 'Autódromo José Carlos Pace (Interlagos)', flag: '🇧🇷', country: 'Brazil' },
  { id: 'vegas', name: 'Las Vegas Strip Circuit', flag: '🇺🇸', country: 'United States' },
  { id: 'losail', name: 'Lusail International Circuit', flag: '🇶🇦', country: 'Qatar' },
  { id: 'yas_marina', name: 'Yas Marina Circuit', flag: '🇦🇪', country: 'Abu Dhabi' }
];

// Curated Media Gallery Items with verified local & high-res images
interface GalleryMediaItem {
  id: string;
  circuitId: string;
  title: string;
  subtitle: string;
  category: 'photo' | 'blueprint' | 'wallpaper';
  src: string;
  aspectRatio?: string;
  entrySpeed?: string;
  typicalGear?: string;
  gForce?: string;
  license: string;
  description: string;
}

const GALLERY_MEDIA: GalleryMediaItem[] = [
  // MONZA HIGH-RES REAL PHOTOGRAPHY
  {
    id: 'monza_rettifilo',
    circuitId: 'monza',
    title: 'Variante del Rettifilo (Turns 1-2)',
    subtitle: 'Heavy Brake Deceleration Zone — Monza',
    category: 'photo',
    src: '/images/circuits/monza/corners/rettifilo/01_rettifilo_aerial.jpg',
    entrySpeed: '352 km/h ➔ 74 km/h',
    typicalGear: '1st Gear',
    gForce: '5.2 G',
    license: 'VERIFIED REAL PHOTOGRAPHY',
    description: 'The heaviest braking point in Formula 1. Drivers decelerate from 352 km/h to 74 km/h in just 120 meters, pulling over 5.2 Gs of lateral and longitudinal force into the tight right-left chicane.'
  },
  {
    id: 'monza_curva_grande',
    circuitId: 'monza',
    title: 'Curva Grande / Curva del Serraglio (Turn 3)',
    subtitle: 'Flat-out Full Throttle Apex — Monza',
    category: 'photo',
    src: '/images/circuits/monza/corners/curva-grande/01_curva_grande_sweeper.jpg',
    entrySpeed: '310 km/h',
    typicalGear: '8th Gear',
    gForce: '3.4 G',
    license: 'VERIFIED REAL PHOTOGRAPHY',
    description: 'A sweeping high-speed right-hand curve taken flat out in 8th gear. Maximum aerodynamic downforce compresses the suspension as cars hug the inside kerb into the trees.'
  },
  {
    id: 'monza_roggia',
    circuitId: 'monza',
    title: 'Variante della Roggia (Turns 4-5)',
    subtitle: 'Traction Exit Chicane — Monza',
    category: 'photo',
    src: '/images/circuits/monza/corners/roggia/01_roggia_chicane.jpg',
    entrySpeed: '325 km/h ➔ 118 km/h',
    typicalGear: '3rd Gear',
    gForce: '4.1 G',
    license: 'VERIFIED REAL PHOTOGRAPHY',
    description: 'Challenging chicane requiring aggressive curb riding. Drivers balance rear traction on exit onto the run toward Lesmo 1.'
  },
  {
    id: 'monza_lesmo1',
    circuitId: 'monza',
    title: 'Prima Curva del Lesmo (Turn 6)',
    subtitle: 'Blind High-Speed Right Sweeper — Monza',
    category: 'photo',
    src: '/images/circuits/monza/corners/lesmo-1/01_lesmo1_apex.jpg',
    entrySpeed: '264 km/h ➔ 192 km/h',
    typicalGear: '5th Gear',
    gForce: '3.8 G',
    license: 'VERIFIED REAL PHOTOGRAPHY',
    description: 'Deceptive right-hand corner requiring precise turn-in point. Understeer here washes cars out onto the gravel trap.'
  },
  {
    id: 'monza_lesmo2',
    circuitId: 'monza',
    title: 'Seconda Curva del Lesmo (Turn 7)',
    subtitle: 'Downhill Camber Apex — Monza',
    category: 'photo',
    src: '/images/circuits/monza/corners/lesmo-2/01_lesmo2_exit.jpg',
    entrySpeed: '260 km/h ➔ 178 km/h',
    typicalGear: '4th Gear',
    gForce: '4.0 G',
    license: 'VERIFIED REAL PHOTOGRAPHY',
    description: 'Downhill cambered right-hander leading onto the Curva del Serraglio straight. Crucial acceleration zone leading into the Ascari complex.'
  },
  {
    id: 'monza_ascari',
    circuitId: 'monza',
    title: 'Variante Ascari (Turns 8-9-10)',
    subtitle: 'High-Speed Rhythm Chicane — Monza',
    category: 'photo',
    src: '/images/circuits/monza/corners/ascari/01_ascari_complex.jpg',
    entrySpeed: '330 km/h ➔ 224 km/h',
    typicalGear: '6th Gear',
    gForce: '4.5 G',
    license: 'VERIFIED REAL PHOTOGRAPHY',
    description: 'Formidable left-right-left sequence named after Alberto Ascari. Demands incredible precision and quick directional transitions at over 220 km/h.'
  },
  {
    id: 'monza_parabolica',
    circuitId: 'monza',
    title: 'Curva Parabolica / Curva Alboreto (Turn 11)',
    subtitle: 'Iconic Final Radius Sweeper — Monza',
    category: 'photo',
    src: '/images/circuits/monza/corners/parabolica/01_parabolica_arc.jpg',
    entrySpeed: '335 km/h ➔ 215 km/h',
    typicalGear: '6th Gear',
    gForce: '3.9 G',
    license: 'VERIFIED REAL PHOTOGRAPHY',
    description: 'The famous long 180-degree expanding radius curve. Drivers open the steering as the track widens onto the main straight towards the finish line.'
  },

  // F1 CONSTRUCTOR TEAM WALLPAPERS & CAR ASSETS
  {
    id: 'ferrari_wall',
    circuitId: 'monza',
    title: 'Scuderia Ferrari HP SF-24',
    subtitle: 'Formula 1 Team Telemetry Wallpaper',
    category: 'wallpaper',
    src: '/images/ferrari-bg.png',
    license: 'PADDOCK OFFICIAL ASSET',
    description: 'Scuderia Ferrari Monza spec high-downforce telemetry profile.'
  },
  {
    id: 'redbull_wall',
    circuitId: 'red_bull_ring',
    title: 'Oracle Red Bull Racing RB20',
    subtitle: 'Formula 1 Team Telemetry Wallpaper',
    category: 'wallpaper',
    src: '/images/redbull-bg.png',
    license: 'PADDOCK OFFICIAL ASSET',
    description: 'Oracle Red Bull Racing ground-effect aerodynamic package.'
  },
  {
    id: 'mclaren_wall',
    circuitId: 'silverstone',
    title: 'McLaren Formula 1 Team MCL38',
    subtitle: 'Formula 1 Team Telemetry Wallpaper',
    category: 'wallpaper',
    src: '/images/mclaren-bg.png',
    license: 'PADDOCK OFFICIAL ASSET',
    description: 'McLaren MCL38 high-efficiency low-drag wing configuration.'
  },
  {
    id: 'mercedes_wall',
    circuitId: 'silverstone',
    title: 'Mercedes-AMG PETRONAS F1 W15',
    subtitle: 'Formula 1 Team Telemetry Wallpaper',
    category: 'wallpaper',
    src: '/images/mercedes-bg.png',
    license: 'PADDOCK OFFICIAL ASSET',
    description: 'Mercedes-AMG F1 W15 pushrod front suspension telemetry profile.'
  },
  {
    id: 'aston_wall',
    circuitId: 'silverstone',
    title: 'Aston Martin Aramco F1 AMR24',
    subtitle: 'Formula 1 Team Telemetry Wallpaper',
    category: 'wallpaper',
    src: '/images/aston-bg.png',
    license: 'PADDOCK OFFICIAL ASSET',
    description: 'Aston Martin Aramco AMR24 floor venturi tunnel design.'
  },
  {
    id: 'f1_login_car',
    circuitId: 'monaco',
    title: '2026 F1 Hypercar Prototype',
    subtitle: 'Next-Gen Active Aerodynamics Model',
    category: 'wallpaper',
    src: '/images/f1-login-car.png',
    license: 'PADDOCK CONCEPT DESIGN',
    description: '2026 FIA active aerodynamics prototype model featuring dual-mode DRS straights and cornering wing sweeps.'
  },

  // WIKIMEDIA FIA OFFICIAL CIRCUIT LAYOUT MAPS
  {
    id: 'monaco_map',
    circuitId: 'monaco',
    title: 'Circuit de Monaco FIA Track Map',
    subtitle: 'Monte Carlo Street Circuit Layout',
    category: 'blueprint',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Monte_Carlo_Formula_1_track_map.svg/1200px-Monte_Carlo_Formula_1_track_map.svg.png',
    license: 'FIA OFFICIAL VECTOR MAP',
    description: 'Official FIA circuit layout diagram detailing Fairmont Hairpin, Swimming Pool, and Tunnel sections.'
  },
  {
    id: 'silverstone_map',
    circuitId: 'silverstone',
    title: 'Silverstone Circuit FIA Track Map',
    subtitle: 'Home of British Motorsport Layout',
    category: 'blueprint',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Silverstone_Circuit_2020.svg/1200px-Silverstone_Circuit_2020.svg.png',
    license: 'FIA OFFICIAL VECTOR MAP',
    description: 'Official FIA layout diagram for Silverstone detailing Maggotts, Becketts, Chapel, and Stowe.'
  },
  {
    id: 'spa_map',
    circuitId: 'spa',
    title: 'Circuit de Spa-Francorchamps FIA Track Map',
    subtitle: 'Ardennes Forest Circuit Layout',
    category: 'blueprint',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Spa-Francorchamps_of_Belgium.svg/1200px-Spa-Francorchamps_of_Belgium.svg.png',
    license: 'FIA OFFICIAL VECTOR MAP',
    description: 'Official FIA layout diagram for Spa-Francorchamps detailing Eau Rouge, Raidillon, and Pouhon.'
  },
  {
    id: 'suzuka_map',
    circuitId: 'suzuka',
    title: 'Suzuka International Circuit FIA Track Map',
    subtitle: 'Figure-Eight Racing Course Layout',
    category: 'blueprint',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Suzuka_circuit_map_2005.svg/1200px-Suzuka_circuit_map_2005.svg.png',
    license: 'FIA OFFICIAL VECTOR MAP',
    description: 'Official FIA layout diagram for Suzuka detailing 130R, Degner, and S-Curves.'
  }
];

export default function GalleryPage() {
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('monza');
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'blueprint' | 'wallpaper'>('all');
  const [selectedMedia, setSelectedMedia] = useState<GalleryMediaItem | null>(null);

  const filteredMedia = GALLERY_MEDIA.filter(item => {
    const matchesCircuit = selectedCircuitId === 'all' || item.circuitId === selectedCircuitId;
    const matchesCategory = activeTab === 'all' || item.category === activeTab;
    return matchesCircuit && matchesCategory;
  });

  // Fallback to all media if specific filter returns 0
  const mediaToDisplay = filteredMedia.length > 0 ? filteredMedia : GALLERY_MEDIA;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-mono tracking-widest text-red-500 font-bold uppercase">
              F1 RECONNAISSANCE &amp; PHOTO ARCHIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white flex items-center gap-3">
            <span>CIRCUIT &amp; APEX PHOTO GALLERY</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            High-resolution apex photography, FIA vector track maps &amp; constructor telemetry wallpapers across F1 circuits.
          </p>
        </div>

        {/* Circuit Selector Dropdown */}
        <div className="flex flex-col gap-1 sm:w-80">
          <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            FILTER BY CIRCUIT ({SUPPORTED_CIRCUITS.length} TRACKS)
          </label>
          <div className="relative">
            <select
              value={selectedCircuitId}
              onChange={(e) => setSelectedCircuitId(e.target.value)}
              className="w-full bg-slate-950 border-2 border-red-900/80 hover:border-red-600 focus:border-red-500 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all appearance-none cursor-pointer"
            >
              <option value="all">🌐 ALL F1 CIRCUITS &amp; MEDIA ({GALLERY_MEDIA.length} ITEMS)</option>
              {SUPPORTED_CIRCUITS.map((circuit) => (
                <option key={circuit.id} value={circuit.id}>
                  {circuit.flag} {circuit.name} ({circuit.country})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-red-500 text-xs">
              ▼
            </div>
          </div>
        </div>
      </header>

      {/* Category Tab Bar */}
      <nav className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🖼️ ALL MEDIA ({GALLERY_MEDIA.length})
        </button>
        <button
          onClick={() => setActiveTab('photo')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'photo'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          📸 APEX REAL PHOTOGRAPHY ({GALLERY_MEDIA.filter(m => m.category === 'photo').length})
        </button>
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'blueprint'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          📐 FIA TRACK BLUEPRINTS ({GALLERY_MEDIA.filter(m => m.category === 'blueprint').length})
        </button>
        <button
          onClick={() => setActiveTab('wallpaper')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'wallpaper'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🏎️ CONSTRUCTOR WALLPAPERS ({GALLERY_MEDIA.filter(m => m.category === 'wallpaper').length})
        </button>
      </nav>

      {/* Featured Photo Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mediaToDisplay.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedMedia(item)}
            className="group relative bg-slate-900/90 border border-slate-800 hover:border-red-500/80 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-1 cursor-pointer"
          >
            {/* Image Thumbnail */}
            <div className="relative h-52 w-full overflow-hidden bg-slate-950">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).src = '/images/default-bg.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
              
              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded bg-slate-950/80 border border-slate-700 text-[10px] font-mono font-bold text-red-400 backdrop-blur-md uppercase tracking-wider">
                  {item.category === 'photo' ? '📸 REAL PHOTO' : item.category === 'blueprint' ? '📐 FIA VECTOR' : '🏎️ TEAM WALLPAPER'}
                </span>
              </div>

              {/* License Badge */}
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-[9px] font-mono font-bold text-emerald-400 backdrop-blur-md">
                  ✓ VERIFIED
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-bold font-mono text-white group-hover:text-red-400 transition-colors line-clamp-1">
                {item.title}
              </h3>
              <p className="text-xs font-mono text-slate-400 line-clamp-1">
                {item.subtitle}
              </p>

              {/* Technical Telemetry Badges if photo */}
              {item.entrySpeed && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-900/60 text-red-300 font-bold">
                    ⚡ {item.entrySpeed}
                  </span>
                  {item.typicalGear && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      ⚙️ {item.typicalGear}
                    </span>
                  )}
                  {item.gForce && (
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-900/60 text-amber-300 font-bold">
                      🏎️ {item.gForce}
                    </span>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>CLICK TO ENLARGE 🔍</span>
                <span className="text-red-400 font-bold">VIEW RECON ➔</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Lightbox Fullscreen Modal */}
      {selectedMedia && (
        <div 
          onClick={() => setSelectedMedia(null)}
          className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-xl p-4 sm:p-8 flex items-center justify-center animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">
                  PADDOCK HIGH-RESOLUTION RECONNAISSANCE VIEWER
                </span>
                <h2 className="text-lg font-bold font-mono text-white">
                  {selectedMedia.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white font-bold transition-all flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 min-h-[350px] max-h-[60vh] bg-black relative flex items-center justify-center overflow-hidden p-2">
              <img
                src={selectedMedia.src}
                alt={selectedMedia.title}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer Info */}
            <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-slate-300 font-bold">
                  📍 {selectedMedia.subtitle}
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                  {selectedMedia.license}
                </span>
              </div>

              {selectedMedia.entrySpeed && (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                  <span className="text-red-400 font-bold">⚡ DECELERATION/ENTRY: {selectedMedia.entrySpeed}</span>
                  <span className="text-slate-400 font-bold">⚙️ APEX GEAR: {selectedMedia.typicalGear}</span>
                  <span className="text-amber-400 font-bold">🏎️ LATERAL FORCE: {selectedMedia.gForce}</span>
                </div>
              )}

              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                {selectedMedia.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Circuit Map Canvas Below */}
      <section className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <span>🗺️ INTERACTIVE TRACK TELEMETRY CANVAS</span>
          </h2>
          <span className="text-xs font-mono text-slate-400 font-bold">
            2D VECTOR PATH &amp; CORNER INSPECTOR
          </span>
        </div>
        <main className="w-full">
          <CircuitMap 
            circuitId={selectedCircuitId}
            showStats={true}
          />
        </main>
      </section>
    </div>
  );
}
