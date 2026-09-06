'use client';

import React, { useState } from 'react';
import CircuitMap from '../components/CircuitMap';
import { ALL_GALLERY_MEDIA, GalleryMediaItem } from '../lib/galleryMediaData';

// List of all supported 78 F1 circuits in Paddock Gallery
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

export default function GalleryPage() {
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('monza');
  const [selectedMedia, setSelectedMedia] = useState<GalleryMediaItem | null>(null);

  const selectedCircuitMeta = SUPPORTED_CIRCUITS.find(c => c.id === selectedCircuitId);

  // Strict filtering by selected circuit ID across all 78 circuits
  const mediaToDisplay = ALL_GALLERY_MEDIA.filter(item => item.circuitId === selectedCircuitId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-mono tracking-widest text-red-500 font-bold uppercase">
              F1 TRACK CORNER RECONNAISSANCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white flex items-center gap-3">
            <span>CIRCUIT CORNER GALLERY</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            High-resolution apex photography, telemetry deceleration stats &amp; cornering specs across F1 circuits.
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

      {/* Featured Photo Grid or Reconnaissance Banner */}
      {mediaToDisplay.length === 0 ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-3 shadow-2xl backdrop-blur-md">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-2xl shadow-inner">
            🏎️
          </div>
          <h3 className="text-white font-mono font-extrabold text-lg uppercase tracking-wide">
            FASTF1 TELEMETRY RECONNAISSANCE MODE ACTIVE — {selectedCircuitMeta?.flag} {selectedCircuitMeta?.name.toUpperCase() || selectedCircuitId.toUpperCase()}
          </h3>
          <p className="text-slate-300 font-mono text-xs max-w-xl mx-auto leading-relaxed">
            FastF1 position centerline points, turn vectors, braking zones, and technical telemetry profiles for <strong className="text-cyan-400">{selectedCircuitMeta?.name}</strong> are loaded on the Interactive 2D Vector Path Canvas below.
          </p>
        </div>
      ) : (
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Modal for Expanded Media Detail */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-950 border border-slate-700 text-slate-400 hover:text-white font-mono flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-950">
              <img
                src={selectedMedia.src}
                alt={selectedMedia.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-bg.png';
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-mono text-white">
                  {selectedMedia.title}
                </h3>
                <span className="px-3 py-1 rounded bg-emerald-950 border border-emerald-700 text-xs font-mono font-bold text-emerald-400">
                  {selectedMedia.license}
                </span>
              </div>
              <p className="text-sm font-mono text-cyan-400">
                {selectedMedia.subtitle}
              </p>

              {selectedMedia.gForce && (
                <div className="inline-block px-3 py-1 bg-amber-950/60 border border-amber-800 rounded text-xs font-mono">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md">
          <h2 className="text-lg sm:text-xl font-extrabold font-mono text-white flex items-center gap-2 drop-shadow-sm">
            <span>🗺️ INTERACTIVE TRACK TELEMETRY CANVAS — {selectedCircuitMeta?.flag} {selectedCircuitMeta?.name.toUpperCase() || selectedCircuitId.toUpperCase()}</span>
          </h2>
          <span className="text-xs font-mono text-cyan-300 font-bold bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-700/80 w-fit">
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
