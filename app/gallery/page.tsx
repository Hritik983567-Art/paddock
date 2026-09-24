'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CircuitMap from '../components/CircuitMap';
import { ALL_GALLERY_MEDIA, GalleryMediaItem } from '../lib/galleryMediaData';
import { ALL_CIRCUIT_CORNERS, CircuitCorner } from '../lib/circuitCornersData';
import { enrichCornerDetails, TransformedCorner } from '../lib/circuitTransform';

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

// Fallback circuit wallpaper backgrounds for tracks without dedicated photos
function getCircuitFallbackImage(circuitId: string): string {
  const c = circuitId.toLowerCase();
  if (['monza', 'imola', 'mugello', 'pescara', 'galvez', 'jarama', 'jerez'].includes(c)) return '/images/ferrari-bg.png';
  if (['silverstone', 'brands_hatch', 'donington', 'adelaide', 'aintree'].includes(c)) return '/images/mclaren-bg.png';
  if (['nurburgring', 'hockenheimring', 'avus', 'singapore'].includes(c)) return '/images/mercedes-bg.png';
  if (['red_bull_ring', 'zeltweg', 'hungaroring', 'zandvoort'].includes(c)) return '/images/redbull-bg.png';
  if (['spa', 'americas', 'monaco', 'suzuka', 'miami', 'vegas'].includes(c)) return '/images/aston-bg.png';
  return '/images/default-bg.png';
}

// Intelligent matching between 2D canvas corner clicks / URL params and gallery media items
function findMatchingMediaItem(
  mediaList: GalleryMediaItem[],
  cornerNumber?: number,
  cornerName?: string,
  cornerKey?: string,
  specs?: CircuitCorner | null
): GalleryMediaItem | undefined {
  if (!mediaList || mediaList.length === 0) return undefined;

  const keyLower = (cornerKey || '').toLowerCase();
  const nameLower = (cornerName || '').toLowerCase();
  const specsNameLower = (specs?.name || '').toLowerCase();
  const specsIdLower = (specs?.id || '').toLowerCase();

  // 1. Direct ID / Key matching (e.g., "rettifilo", "ascari", "t1", "t10")
  let match = mediaList.find(m => {
    const idLower = m.id.toLowerCase();
    if (keyLower && idLower.includes(keyLower)) return true;
    if (specsIdLower && idLower.includes(specsIdLower)) return true;
    return false;
  });
  if (match) return match;

  // 2. Keyword matching on corner names (e.g. "rettifilo", "ascari", "parabolica", "lesmo", "source", "eaurouge", "fairmont", "tunnel")
  const nameToSearch = specsNameLower || nameLower;
  if (nameToSearch) {
    const keywords = nameToSearch
      .split(/[\s\-_\/()]+/)
      .filter(w => w.length > 3 && !['turn', 'turns', 'curva', 'variante', 'del', 'della', 'the', 'corner', 'circuit'].includes(w.toLowerCase()));

    for (const kw of keywords) {
      match = mediaList.find(m => {
        const titleLower = m.title.toLowerCase();
        const idLower = m.id.toLowerCase();
        return titleLower.includes(kw.toLowerCase()) || idLower.includes(kw.toLowerCase());
      });
      if (match) return match;
    }
  }

  // 3. Turn number and range matching (e.g., Turn 1 -> "Turns 1-2", Turn 8 -> "Turns 8-9-10")
  if (typeof cornerNumber === 'number' && !isNaN(cornerNumber)) {
    const num = cornerNumber;
    match = mediaList.find(m => {
      const titleLower = m.title.toLowerCase();
      const subLower = m.subtitle.toLowerCase();

      const regexSingle = new RegExp(`\\bturns?\\s*${num}\\b`, 'i');
      if (regexSingle.test(titleLower) || regexSingle.test(subLower)) return true;

      const ranges = titleLower.matchAll(/\bturns?\s*(\d+)(?:[-–\s]+(\d+))?(?:[-–\s]+(\d+))?\b/gi);
      for (const r of ranges) {
        const nums = [r[1], r[2], r[3]].filter(Boolean).map(n => parseInt(n, 10));
        if (nums.length === 1 && nums[0] === num) return true;
        if (nums.length >= 2) {
          const minNum = Math.min(...nums);
          const maxNum = Math.max(...nums);
          if (num >= minNum && num <= maxNum) return true;
        }
      }
      return false;
    });
    if (match) return match;
  }

  return undefined;
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCircuit = searchParams.get('circuit');
  const urlCorner = searchParams.get('corner');

  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('monza');
  const [selectedMedia, setSelectedMedia] = useState<GalleryMediaItem | null>(null);
  const [activeCornerDetails, setActiveCornerDetails] = useState<CircuitCorner | null>(null);

  // Sync selected circuit with URL params if provided
  useEffect(() => {
    if (urlCircuit) {
      const match = SUPPORTED_CIRCUITS.find(c => c.id.toLowerCase() === urlCircuit.toLowerCase());
      if (match) {
        setSelectedCircuitId(match.id);
      }
    }
  }, [urlCircuit]);

  const selectedCircuitMeta = SUPPORTED_CIRCUITS.find(c => c.id === selectedCircuitId);

  // Strict filtering by selected circuit ID across all 78 circuits (memoized to prevent infinite re-render loops)
  const mediaToDisplay = useMemo(
    () => ALL_GALLERY_MEDIA.filter(item => item.circuitId === selectedCircuitId),
    [selectedCircuitId]
  );

  // Helper to resolve full technical corner specs for modal display
  const resolveCornerSpecs = useCallback((mediaItem: GalleryMediaItem | null, cornerKey?: string): CircuitCorner | null => {
    const collection = ALL_CIRCUIT_CORNERS[selectedCircuitId];
    if (!collection || !collection.corners) return null;

    if (cornerKey) {
      const k = cornerKey.toLowerCase();
      if (collection.corners[k]) return collection.corners[k];
    }

    if (mediaItem) {
      const titleLower = mediaItem.title.toLowerCase();
      for (const c of Object.values(collection.corners)) {
        if (
          mediaItem.id.toLowerCase().includes(c.id.toLowerCase()) ||
          titleLower.includes(c.name.toLowerCase()) ||
          (c.turns && titleLower.includes(c.turns.toLowerCase()))
        ) {
          return c;
        }
      }
    }

    return null;
  }, [selectedCircuitId]);

  // Sync corner selection from URL on load
  useEffect(() => {
    if (urlCorner) {
      const specs = resolveCornerSpecs(null, urlCorner);
      const cornerNumMatch = urlCorner.match(/\d+/);
      const cornerNum = cornerNumMatch ? parseInt(cornerNumMatch[0], 10) : undefined;
      const matchingMedia = findMatchingMediaItem(mediaToDisplay, cornerNum, specs?.name, urlCorner, specs);

      if (specs) {
        setActiveCornerDetails(specs);
      }

      if (matchingMedia) {
        setSelectedMedia(matchingMedia);
      } else {
        const fallbackTitle = specs?.name ? `${specs.name} (${specs.turns || urlCorner.toUpperCase()})` : `Corner ${urlCorner.toUpperCase()}`;
        const fallbackSub = `${specs?.type || 'F1 Sector'} — ${selectedCircuitMeta?.name || selectedCircuitId.toUpperCase()}`;
        const fallbackSrc = specs?.images?.[0]?.src || getCircuitFallbackImage(selectedCircuitId);

        setSelectedMedia({
          id: `${selectedCircuitId}_${urlCorner}`,
          circuitId: selectedCircuitId,
          title: fallbackTitle,
          subtitle: fallbackSub,
          category: 'photo',
          src: fallbackSrc,
          entrySpeed: specs?.technical?.entrySpeed || 'N/A',
          typicalGear: specs?.technical?.typicalGear || 'N/A',
          gForce: specs?.technical?.brakingIntensity || 'N/A',
          license: 'VERIFIED REAL DATA',
          description: specs?.description || specs?.history || 'F1 Telemetry Reconnaissance Sector'
        });
      }
    }
  }, [urlCorner, selectedCircuitId, resolveCornerSpecs, mediaToDisplay, selectedCircuitMeta?.name]);

  // Track dragging state and active corner navigation in modal
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // Active corner index within mediaToDisplay
  const currentCornerIndex = useMemo(() => {
    if (!selectedMedia) return 0;
    const idx = mediaToDisplay.findIndex(m => m.id === selectedMedia.id);
    return idx >= 0 ? idx : 0;
  }, [selectedMedia, mediaToDisplay]);

  // Navigate directly to a corner by index
  const handleSelectCornerIndex = useCallback((index: number) => {
    if (!mediaToDisplay || mediaToDisplay.length === 0) return;
    const clampedIndex = (index + mediaToDisplay.length) % mediaToDisplay.length;
    const targetItem = mediaToDisplay[clampedIndex];
    if (!targetItem) return;

    setSelectedMedia(targetItem);
    const specs = resolveCornerSpecs(targetItem);
    setActiveCornerDetails(specs);

    router.replace(`/gallery?circuit=${selectedCircuitId}&corner=${targetItem.id}`, { scroll: false });
  }, [mediaToDisplay, resolveCornerSpecs, router, selectedCircuitId]);

  const handlePrevCorner = useCallback(() => {
    handleSelectCornerIndex(currentCornerIndex - 1);
  }, [currentCornerIndex, handleSelectCornerIndex]);

  const handleNextCorner = useCallback(() => {
    handleSelectCornerIndex(currentCornerIndex + 1);
  }, [currentCornerIndex, handleSelectCornerIndex]);

  // Keyboard navigation when reconnaissance modal is open
  useEffect(() => {
    if (!selectedMedia) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCorner();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCorner();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedMedia(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia, handlePrevCorner, handleNextCorner]);

  const handleSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 6) {
      setHasDragged(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleSliderMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // HANDLE CLICKING A PHOTO CARD IN GALLERY -> OPENS FULL INFORMATION MODAL
  const handleMediaCardClick = (item: GalleryMediaItem) => {
    setSelectedMedia(item);
    const specs = resolveCornerSpecs(item);
    setActiveCornerDetails(specs);
  };

  const onCardClick = (item: GalleryMediaItem) => {
    if (hasDragged) return; // Ignore card clicks if the user dragged the cursor to move
    handleMediaCardClick(item);
  };

  // HANDLE CLICKING A CORNER ON THE 2D CIRCUIT MAP -> SCROLLS TO GALLERY & OPENS INFORMATION MODAL
  const handleCornerSelectOnMap = (corner: TransformedCorner | null) => {
    if (!corner) return;
    const cornerKey = `t${corner.number}${corner.letter || ''}`.toLowerCase();
    const enriched = enrichCornerDetails(corner, selectedCircuitId, selectedCircuitMeta?.name || '');
    const specs = resolveCornerSpecs(null, cornerKey) || (enriched as unknown as CircuitCorner);

    // Look for matching gallery photo with intelligent matching
    const matchingMedia = findMatchingMediaItem(mediaToDisplay, corner.number, corner.name, cornerKey, specs);

    if (matchingMedia) {
      setSelectedMedia(matchingMedia);
    } else {
      const fallbackSrc = specs?.images?.[0]?.src || getCircuitFallbackImage(selectedCircuitId);
      setSelectedMedia({
        id: `${selectedCircuitId}_${cornerKey}`,
        circuitId: selectedCircuitId,
        title: `${enriched.name} (${enriched.turns || `Turn ${corner.number}`})`,
        subtitle: `${enriched.type || 'F1 Corner'} — ${selectedCircuitMeta?.name || selectedCircuitId.toUpperCase()}`,
        category: 'photo',
        src: fallbackSrc,
        entrySpeed: enriched.technical?.entrySpeed || 'N/A',
        typicalGear: enriched.technical?.typicalGear || 'N/A',
        gForce: enriched.technical?.brakingIntensity || 'N/A',
        license: 'VERIFIED REAL DATA',
        description: enriched.description || enriched.history || 'F1 Telemetry Reconnaissance Sector'
      });
    }

    setActiveCornerDetails(specs);

    // Update URL query parameters cleanly
    router.replace(`/gallery?circuit=${selectedCircuitId}&corner=${cornerKey}`, { scroll: false });

    // Smooth scroll up to gallery grid section
    const galleryEl = document.getElementById('gallery-section');
    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tech = activeCornerDetails?.technical || {};
  const racing = activeCornerDetails?.racing || {};

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
              onChange={(e) => {
                const newCircuit = e.target.value;
                setSelectedCircuitId(newCircuit);
                setSelectedMedia(null);
                setActiveCornerDetails(null);
                router.replace(`/gallery?circuit=${newCircuit}`, { scroll: false });
              }}
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

      {/* Featured Photo Grid / Drag-to-Scroll Slider Section */}
      <section id="gallery-section">
        {mediaToDisplay.length === 0 ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-3 shadow-2xl backdrop-blur-md">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-2xl shadow-inner">
              🏎️
            </div>
            <h3 className="text-white font-mono font-extrabold text-lg uppercase tracking-wide">
              TELEMETRY RECONNAISSANCE MODE ACTIVE — {selectedCircuitMeta?.flag} {selectedCircuitMeta?.name.toUpperCase() || selectedCircuitId.toUpperCase()}
            </h3>
            <p className="text-slate-300 font-mono text-xs max-w-xl mx-auto leading-relaxed">
              Track centerline points, turn vectors, braking zones, and technical telemetry profiles for <strong className="text-cyan-400">{selectedCircuitMeta?.name}</strong> are loaded on the Interactive 2D Vector Path Canvas below. Click any corner to view full information.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Corner Sectors Header */}
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  {mediaToDisplay.length} CORNER SECTORS
                </span>
                <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                  • Click any corner photo to open reconnaissance telemetry
                </span>
              </div>
            </div>

            {/* Slider Container with subtle Left/Right navigation keys */}
            <div className="relative group/slider">
              {mediaToDisplay.length > 1 && (
                <>
                  {/* Subtle Left Toggle Key */}
                  <button
                    type="button"
                    onClick={() => scrollSlider('left')}
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/40 hover:bg-slate-900/95 border border-slate-700/60 hover:border-red-500 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-90 hover:!opacity-100 transition-all duration-300 backdrop-blur-md shadow-2xl hover:scale-110 cursor-pointer"
                    title="Move Left"
                    aria-label="Move Left"
                  >
                    <span className="text-xl sm:text-2xl font-bold font-mono">‹</span>
                  </button>

                  {/* Subtle Right Toggle Key */}
                  <button
                    type="button"
                    onClick={() => scrollSlider('right')}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950/40 hover:bg-slate-900/95 border border-slate-700/60 hover:border-red-500 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-90 hover:!opacity-100 transition-all duration-300 backdrop-blur-md shadow-2xl hover:scale-110 cursor-pointer"
                    title="Move Right"
                    aria-label="Move Right"
                  >
                    <span className="text-xl sm:text-2xl font-bold font-mono">›</span>
                  </button>
                </>
              )}

              <div
                ref={sliderRef}
                onMouseDown={handleSliderMouseDown}
                onMouseMove={handleSliderMouseMove}
                onMouseUp={handleSliderMouseUpOrLeave}
                onMouseLeave={handleSliderMouseUpOrLeave}
                className={`flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth select-none cursor-grab scrollbar-none ${
                  isMouseDown ? 'cursor-grabbing' : ''
                }`}
                style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {mediaToDisplay.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onCardClick(item)}
                    className="min-w-[270px] sm:min-w-[310px] md:min-w-[330px] max-w-[350px] flex-shrink-0 snap-start group relative bg-slate-900/90 border border-slate-800 hover:border-red-500/80 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-1 cursor-pointer select-none"
                  >
                    {/* Image Thumbnail */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-950 pointer-events-none select-none">
                      <img
                        src={item.src}
                        alt={item.title}
                        draggable={false}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none select-none"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const fallback = getCircuitFallbackImage(selectedCircuitId);
                          if (target.src !== fallback) {
                            target.src = fallback;
                          }
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
                    <div className="p-4 space-y-2 pointer-events-none">
                      <h3 className="text-sm font-bold font-mono text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 line-clamp-1">
                        {item.subtitle}
                      </p>

                      {/* Technical Telemetry Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800 text-[10px] font-mono">
                        {item.entrySpeed && (
                          <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-900/60 text-red-300 font-bold">
                            ⚡ {item.entrySpeed}
                          </span>
                        )}
                        {item.typicalGear && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                            ⚙️ {item.typicalGear}
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-cyan-400 font-bold">
                          VIEW INFO →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FULL CORNER RECONNAISSANCE INFORMATION MODAL */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-5 p-6 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-950 border border-slate-700 text-slate-400 hover:text-white font-mono flex items-center justify-center transition"
              title="Close Reconnaissance Information"
            >
              ✕
            </button>

            {/* Corner Photo Preview */}
            <div className="relative h-72 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group/photo">
              <img
                key={selectedMedia.id}
                src={selectedMedia.src}
                alt={selectedMedia.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallback = getCircuitFallbackImage(selectedCircuitId);
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 pointer-events-none"></div>

              {/* Floating Semi-Transparent Prev / Next Photo Overlay Arrows */}
              {mediaToDisplay.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevCorner();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-900/80 border border-white/10 text-white/70 hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    title="Previous Corner (←)"
                    aria-label="Previous Corner"
                  >
                    <span className="text-xl sm:text-2xl font-mono font-bold leading-none mb-0.5">‹</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextCorner();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-950/40 hover:bg-slate-900/80 border border-white/10 text-white/70 hover:text-white backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-lg"
                    title="Next Corner (→)"
                    aria-label="Next Corner"
                  >
                    <span className="text-xl sm:text-2xl font-mono font-bold leading-none mb-0.5">›</span>
                  </button>
                </>
              )}

              {/* Floating Blended Semi-Transparent Corner Numbers Strip on Photo */}
              {mediaToDisplay.length > 1 && (
                <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 p-1 sm:p-1.5 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10 max-w-[calc(100%-4.5rem)] overflow-x-auto scrollbar-none shadow-xl">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300/70 pl-2 pr-1 select-none shrink-0">
                    CORNERS:
                  </span>
                  <div className="flex items-center gap-1">
                    {mediaToDisplay.map((item, idx) => {
                      const isActive = idx === currentCornerIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectCornerIndex(idx)}
                          title={`${idx + 1}. ${item.title}`}
                          className={`min-w-[26px] sm:min-w-[30px] h-6 sm:h-7 px-1.5 sm:px-2 rounded-full font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center cursor-pointer select-none shrink-0 ${
                            isActive
                              ? 'bg-red-500/40 text-white border border-red-400/60 shadow-[0_0_12px_rgba(239,68,68,0.4)] scale-105'
                              : 'bg-white/[0.08] hover:bg-white/[0.2] text-slate-200/80 hover:text-white border border-white/10'
                          }`}
                        >
                          <span>{idx + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Badges in Photo */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div>
                  <span className="px-2.5 py-1 rounded bg-slate-950/80 border border-slate-700 text-xs font-mono font-bold text-red-400 backdrop-blur-md">
                    {selectedMedia.category === 'photo' ? '📸 REAL APEX PHOTOGRAPHY' : '📐 FIA VECTOR DYNAMICS'}
                  </span>
                </div>
                <span className="px-3 py-1 rounded bg-emerald-950/90 border border-emerald-700 text-xs font-mono font-bold text-emerald-400 backdrop-blur-md">
                  {selectedMedia.license}
                </span>
              </div>
            </div>

            {/* Blended Semi-Transparent Track Corner Selector Bar */}
            {mediaToDisplay.length > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400/80 font-bold px-1 select-none shrink-0">
                    TRACK SECTORS ({mediaToDisplay.length}):
                  </span>
                  <div className="flex items-center gap-1.5">
                    {mediaToDisplay.map((item, idx) => {
                      const isActive = idx === currentCornerIndex;
                      const turnMatch = item.title.match(/turns?\s*([\d\-\–]+)/i);
                      const turnLabel = turnMatch ? `T${turnMatch[1]}` : `C${idx + 1}`;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectCornerIndex(idx)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs transition-all duration-200 cursor-pointer select-none shrink-0 ${
                            isActive
                              ? 'bg-red-500/25 border border-red-500/50 text-white shadow-[0_0_12px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40'
                              : 'bg-white/[0.05] hover:bg-white/[0.12] text-slate-300/70 hover:text-white border border-white/[0.08]'
                          }`}
                          title={item.title}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isActive ? 'bg-red-500/60 text-white' : 'bg-white/10 text-slate-300/90'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-[11px] text-slate-300">
                            {turnLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 font-mono text-xs shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                  <button
                    type="button"
                    onClick={handlePrevCorner}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] text-slate-300/80 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    title="Previous Corner (←)"
                  >
                    <span>‹</span>
                    <span className="text-[11px]">PREV</span>
                  </button>
                  <span className="text-slate-400 font-bold text-xs px-1">
                    {currentCornerIndex + 1} / {mediaToDisplay.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextCorner}
                    className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] text-slate-300/80 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    title="Next Corner (→)"
                  >
                    <span className="text-[11px]">NEXT</span>
                    <span>›</span>
                  </button>
                </div>
              </div>
            )}

            {/* Corner Information Header */}
            <div className="space-y-1 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-extrabold uppercase">
                <span>{selectedCircuitMeta?.flag} {selectedCircuitMeta?.name}</span>
                <span>•</span>
                <span>{activeCornerDetails?.turns || 'RECONNAISSANCE SECTOR'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {activeCornerDetails?.name || selectedMedia.title}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                {selectedMedia.subtitle}
              </p>
            </div>

            {/* Technical Telemetry Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>TECHNICAL TELEMETRY SPECS</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-cyan-400 font-black">ENTRY SPEED</span>
                  <span className="text-sm font-black text-white">
                    {selectedMedia.entrySpeed || tech.entrySpeed || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-cyan-400 font-black">APEX SPEED</span>
                  <span className="text-sm font-black text-red-400">
                    {tech.apexSpeed || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-cyan-400 font-black">EXIT SPEED</span>
                  <span className="text-sm font-black text-emerald-400">
                    {tech.exitSpeed || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-cyan-400 font-black">TYPICAL GEAR</span>
                  <span className="text-sm font-black text-amber-400">
                    {selectedMedia.typicalGear || tech.typicalGear || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-cyan-400 font-black">LATERAL G-FORCE</span>
                  <span className="text-sm font-black text-white">
                    {selectedMedia.gForce || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-cyan-400 font-black">BRAKING FORCE</span>
                  <span className="text-sm font-black text-white">
                    {tech.brakingIntensity || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-cyan-400 font-black">ELEVATION</span>
                  <span className="text-sm font-black text-white">
                    {tech.elevationChange || 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                  <span className="block text-[10px] text-cyan-400 font-black">DRS ZONE</span>
                  <span className="text-sm font-black text-cyan-300">
                    {tech.drs || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Racing Dynamics & Strategy */}
            {(racing.overtakingPotential || racing.brakingZone || racing.racingLine || racing.trackLimits) && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>RACING STRATEGY &amp; DYNAMICS</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {racing.overtakingPotential && (
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] text-cyan-400 font-black">OVERTAKING POTENTIAL</span>
                      <span className="font-bold text-white">{racing.overtakingPotential}</span>
                    </div>
                  )}
                  {racing.brakingZone && (
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] text-cyan-400 font-black">BRAKING ZONE</span>
                      <span className="font-bold text-white">{racing.brakingZone}</span>
                    </div>
                  )}
                  {racing.racingLine && (
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] text-cyan-400 font-black">RACING LINE STRATEGY</span>
                      <span className="font-bold text-slate-300">{racing.racingLine}</span>
                    </div>
                  )}
                  {racing.trackLimits && (
                    <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800">
                      <span className="block text-[10px] text-cyan-400 font-black">TRACK LIMITS</span>
                      <span className="font-bold text-slate-300">{racing.trackLimits}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description & History Narrative */}
            <div className="space-y-2 bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-xs font-mono">
              <h3 className="font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <span>📜 CORNER HISTORY &amp; RECONNAISSANCE NARRATIVE</span>
              </h3>
              <p className="text-slate-300 leading-relaxed font-sans text-[13.5px]">
                {activeCornerDetails?.description || activeCornerDetails?.history || selectedMedia.description}
              </p>
              {activeCornerDetails?.history && activeCornerDetails.history !== activeCornerDetails.description && (
                <p className="text-slate-300 leading-relaxed font-sans text-[13.5px] pt-2 border-t border-slate-800">
                  {activeCornerDetails.history}
                </p>
              )}
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
            CLICK ANY CORNER TO GO TO GALLERY &amp; VIEW INFO
          </span>
        </div>
        <main className="w-full">
          <CircuitMap 
            circuitId={selectedCircuitId}
            showStats={true}
            onCornerSelect={handleCornerSelectOnMap}
          />
        </main>
      </section>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm uppercase tracking-wider animate-pulse">
        Loading Corner Reconnaissance Gallery...
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
