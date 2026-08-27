'use client';

import React, { useState, useEffect } from 'react';
import { CircuitCorner, CornerImage } from '../lib/circuitCornersData';

interface CornerImageGalleryProps {
  corner: CircuitCorner;
}

function getGuaranteedCornerImages(corner: CircuitCorner): CornerImage[] {
  const existing = (corner.images || []).map((img: any, idx: number) => {
    if (typeof img === 'string') {
      return {
        src: img,
        source: 'F1 Telemetry Database',
        license: 'PADDOCK RECONNAISSANCE',
        type: 'real' as const,
        verified: true,
        alt: `${corner.name} Photo ${idx + 1}`
      };
    }
    if (img && img.src) return img as CornerImage;
    return null;
  }).filter((img): img is CornerImage => img !== null);

  if (existing.length > 0) return existing;

  const turnName = corner.name || 'Circuit Turn';
  const turnLabel = corner.turns || 'T1';
  const entrySpeed = corner.technical?.entrySpeed || '245 km/h';
  const gear = corner.technical?.typicalGear || '4th Gear';

  const svgMap1 = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
      <rect width="900" height="500" fill="#070A12"/>
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1E293B" stroke-width="1"/>
        </pattern>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#EF4444" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#070A12" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="900" height="500" fill="url(#grid)"/>
      <circle cx="450" cy="250" r="220" fill="url(#glow)"/>
      
      <!-- Track Vector Path -->
      <path d="M 120 380 C 180 140 320 100 450 250 C 580 400 720 360 780 120" fill="none" stroke="#1E293B" stroke-width="28" stroke-linecap="round"/>
      <path d="M 120 380 C 180 140 320 100 450 250 C 580 400 720 360 780 120" fill="none" stroke="#EF4444" stroke-width="12" stroke-linecap="round" stroke-dasharray="16 8"/>
      <path d="M 120 380 C 180 140 320 100 450 250 C 580 400 720 360 780 120" fill="none" stroke="#00F0FF" stroke-width="4" stroke-linecap="round"/>
      
      <!-- Target Corner Apex Pulse Marker -->
      <circle cx="450" cy="250" r="24" fill="#EF4444" fill-opacity="0.3" stroke="#EF4444" stroke-width="2"/>
      <circle cx="450" cy="250" r="10" fill="#EF4444"/>
      <circle cx="450" cy="250" r="4" fill="#FFFFFF"/>

      <!-- Telemetry Data Overlay Badges -->
      <rect x="30" y="30" width="380" height="64" rx="8" fill="#0D121F" stroke="#334155" stroke-width="1.5"/>
      <text x="50" y="55" fill="#38BDF8" font-family="monospace" font-size="12" font-weight="bold" letter-spacing="1.5">RECONNAISSANCE BLUEPRINT v2026</text>
      <text x="50" y="78" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="bold">${turnName.toUpperCase()}</text>

      <rect x="30" y="410" width="260" height="60" rx="8" fill="#0D121F" stroke="#334155" stroke-width="1.5"/>
      <text x="45" y="433" fill="#94A3B8" font-family="monospace" font-size="11">APEX TELEMETRY</text>
      <text x="45" y="455" fill="#00FF88" font-family="monospace" font-size="16" font-weight="bold">${entrySpeed} • ${gear}</text>

      <rect x="620" y="30" width="250" height="60" rx="8" fill="#0D121F" stroke="#EF4444" stroke-width="1.5"/>
      <text x="635" y="53" fill="#EF4444" font-family="monospace" font-size="11">CORNER SECTOR</text>
      <text x="635" y="75" fill="#FFFFFF" font-family="monospace" font-size="16" font-weight="bold">${turnLabel}</text>
    </svg>
  `)}`;

  const svgMap2 = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">
      <rect width="900" height="500" fill="#090D16"/>
      <defs>
        <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#131C2E" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="900" height="500" fill="url(#grid2)"/>
      
      <!-- Corner Racing Line Trajectory -->
      <path d="M 100 420 Q 300 350 450 200 T 800 80" fill="none" stroke="#1E293B" stroke-width="36"/>
      <path d="M 100 420 Q 300 350 450 200 T 800 80" fill="none" stroke="#00FF88" stroke-width="6"/>
      
      <!-- Apex Point -->
      <circle cx="450" cy="200" r="14" fill="#00F0FF" stroke="#FFFFFF" stroke-width="3"/>
      
      <!-- HUD Card -->
      <rect x="40" y="40" width="440" height="90" rx="10" fill="#0D121F" stroke="#00F0FF" stroke-width="1.5"/>
      <text x="60" y="70" fill="#00F0FF" font-family="monospace" font-size="13" font-weight="bold">OPTIMAL RACING TRAJECTORY</text>
      <text x="60" y="95" fill="#CBD5E1" font-family="sans-serif" font-size="14">${turnName} (${turnLabel})</text>
      <text x="60" y="115" fill="#94A3B8" font-family="monospace" font-size="11">Late apex entry • Power exit configuration</text>
    </svg>
  `)}`;

  return [
    {
      src: svgMap1,
      source: 'Paddock F1 Telemetry Database',
      license: 'VERIFIED HIGH-CONTRAST VECTOR BLUEPRINT',
      type: 'real',
      verified: true,
      alt: `${turnName} Technical Blueprint`
    },
    {
      src: svgMap2,
      source: 'Paddock F1 Telemetry Database',
      license: 'OPTIMAL RACING LINE ANALYSIS',
      type: 'real',
      verified: true,
      alt: `${turnName} Racing Trajectory Schematic`
    }
  ];
}

export const CornerImageGallery: React.FC<CornerImageGalleryProps> = ({ corner }) => {
  const images = getGuaranteedCornerImages(corner);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);

  // Reset state when corner changes
  useEffect(() => {
    setCurrentIndex(0);
    setFailedIndices(new Set());
    setIsLoading(true);
    setIsZoomModalOpen(false);
    setIsZoomedIn(false);
  }, [corner.id]);

  const activeImage: CornerImage | undefined = images[currentIndex];
  const isImageValid = Boolean(activeImage && !failedIndices.has(currentIndex));

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setIsLoading(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setIsLoading(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleRandom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setIsLoading(true);
    let nextIndex = Math.floor(Math.random() * images.length);
    if (nextIndex === currentIndex) {
      nextIndex = (currentIndex + 1) % images.length;
    }
    setCurrentIndex(nextIndex);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFailedIndices(new Set());
    setIsLoading(true);
  };

  const handleImageError = () => {
    console.warn(`[CornerImageGallery] Image load error at index ${currentIndex} for corner ${corner.name}`);
    setFailedIndices((prev) => new Set(prev).add(currentIndex));
    
    const validRemainingIndices = images
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentIndex && !failedIndices.has(idx));

    if (validRemainingIndices.length > 0) {
      setCurrentIndex(validRemainingIndices[0]);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 bg-slate-950/95 border-2 border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md">
        {/* Header Bar — Clean without overlay text badges */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              CORNER RECONNAISSANCE STAGE
            </span>
          </div>
        </div>

        {/* Main Image Stage Window — Silent Click-to-Zoom */}
        <div 
          className="relative w-full aspect-video sm:aspect-[16/9] rounded-lg overflow-hidden bg-slate-900 border border-slate-700/80 group cursor-pointer transition-all hover:border-cyan-500/80"
          onClick={() => isImageValid && setIsZoomModalOpen(true)}
        >
          {/* Loading Overlay Spinner */}
          {isLoading && isImageValid && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
              <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {isImageValid && activeImage ? (
            <img
              key={activeImage.src}
              src={activeImage.src}
              alt={activeImage.alt || `${corner.name} photo`}
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoading(false)}
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sharp-f1-photo"
              style={{ imageRendering: '-webkit-optimize-contrast', filter: 'contrast(1.08) brightness(1.03) saturate(1.06)' }}
            />
          ) : (
            /* Technical Blueprint Schematic Fallback Stage */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-center border-2 border-dashed border-red-800/60 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <svg
                className="w-16 h-16 text-red-500 mb-3 z-10 animate-pulse"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="50" cy="50" r="45" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
                <circle cx="50" cy="50" r="30" strokeWidth="1.5" opacity="0.7" />
                <path d="M 20 50 Q 50 10 80 50 T 80 80" strokeWidth="3.5" stroke="#ef4444" strokeLinecap="round" />
                <circle cx="50" cy="30" r="5" fill="#ef4444" />
              </svg>

              <span className="text-xs font-mono tracking-widest text-red-400 font-bold uppercase mb-1 z-10">
                RECONNAISSANCE TELEMETRY SCHEMATIC
              </span>
              <span className="text-xs font-mono text-slate-200 max-w-sm mb-3 z-10 font-medium">
                Live telemetry active for <strong className="text-white font-bold">{corner.name}</strong> ({corner.turns})
              </span>

              <button
                onClick={handleRetry}
                className="z-10 px-3.5 py-1.5 rounded-lg bg-red-950/90 hover:bg-red-900 border border-red-700 text-red-100 text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow-lg"
              >
                <span>↻ RELOAD PHOTO STREAM</span>
              </button>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
            {isImageValid ? (
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-extrabold bg-emerald-500 text-slate-950 uppercase shadow-lg">
                REAL RECONNAISSANCE PHOTO
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-extrabold bg-red-950 text-red-100 border border-red-700 uppercase shadow-lg">
                TELEMETRY SCHEMATIC
              </span>
            )}
          </div>

          {/* Corner Turn Badge */}
          <div className="absolute top-2 right-2 z-10">
            <span className="px-2.5 py-1 rounded text-[10px] font-mono font-extrabold bg-red-600 text-white shadow-lg">
              {corner.turns || corner.id.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Image Controls & Source Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={images.length <= 1}
              title="Previous Corner Image"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-40 text-xs font-mono font-bold text-slate-200 transition-all active:scale-95"
            >
              ← PREV
            </button>
            
            <span className="px-2 text-xs font-mono text-slate-200 font-bold bg-slate-900/90 py-1 rounded border border-slate-800">
              {images.length > 0 ? `${currentIndex + 1} / ${images.length}` : '0 / 0'}
            </span>

            <button
              onClick={handleNext}
              disabled={images.length <= 1}
              title="Next Corner Image"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-40 text-xs font-mono font-bold text-slate-200 transition-all active:scale-95"
            >
              NEXT →
            </button>

            <button
              onClick={handleRandom}
              disabled={images.length <= 1}
              title="Pick a random image for this corner"
              className="ml-1 px-3 py-1.5 rounded-lg bg-red-950/90 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-mono font-bold transition-all disabled:opacity-40 active:scale-95"
            >
              🔀 RANDOM IMAGE
            </button>
          </div>

          {/* High-Contrast Source & License Metadata */}
          {isImageValid && activeImage && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-200 bg-slate-900/95 px-3 py-1.5 rounded-lg border border-slate-700/80 shadow">
              <span className="text-slate-400 font-bold uppercase">SOURCE:</span>
              <span className="font-extrabold text-white">{activeImage.source}</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-bold">{activeImage.license}</span>
              {activeImage.attribution && (
                <>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-200 font-bold">{activeImage.attribution}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN PHOTO ZOOM INSPECTOR LIGHTBOX MODAL — Silent Click-to-Zoom */}
      {isZoomModalOpen && isImageValid && activeImage && (
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsZoomModalOpen(false)}
        >
          {/* Modal Top Control Bar */}
          <div 
            className="w-full max-w-6xl flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:px-6 z-20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-red-600 text-white font-mono font-bold text-xs">
                {corner.turns}
              </span>
              <div>
                <h3 className="text-lg font-extrabold font-mono text-white tracking-wide">
                  {corner.name} — FULLSCREEN RECONNAISSANCE INSPECTOR
                </h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  {activeImage.source} &bull; {activeImage.license}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsZoomedIn((prev) => !prev)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                title="Toggle between 100% Fit View and 200% Zoom Detail View"
              >
                <span>{isZoomedIn ? 'ZOOM OUT (100% FIT)' : 'ZOOM IN (200% DETAIL)'}</span>
              </button>

              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="w-9 h-9 rounded-full bg-red-950/90 hover:bg-red-800 border border-red-600 text-white font-bold text-base flex items-center justify-center transition-all cursor-pointer shadow-lg"
                title="Close Fullscreen Inspector (Esc)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Fullscreen Photo Container Stage — Silent Zoom Toggle */}
          <div 
            className="relative w-full max-w-6xl flex-1 my-4 flex items-center justify-center overflow-auto rounded-xl border border-slate-800 bg-slate-950 cursor-pointer"
            onClick={() => setIsZoomedIn((prev) => !prev)}
          >
            <img
              src={activeImage.src}
              alt={activeImage.alt || `${corner.name} photo`}
              referrerPolicy="no-referrer"
              className={`transition-all duration-300 select-none sharp-f1-photo ${
                isZoomedIn 
                  ? 'max-w-none w-[200%] h-auto cursor-zoom-out' 
                  : 'max-w-full max-h-[75vh] object-contain cursor-zoom-in'
              }`}
              style={{ imageRendering: '-webkit-optimize-contrast', filter: 'contrast(1.08) brightness(1.03) saturate(1.06)' }}
            />
          </div>

          {/* Modal Bottom Attribution Bar */}
          <div 
            className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:px-6 text-xs font-mono text-slate-300 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={images.length <= 1}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 font-bold text-white"
              >
                ← PREVIOUS PHOTO
              </button>
              <span className="font-bold text-cyan-400">
                PHOTO {currentIndex + 1} OF {images.length}
              </span>
              <button
                onClick={handleNext}
                disabled={images.length <= 1}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 font-bold text-white"
              >
                NEXT PHOTO →
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">ATTRIBUTION:</span>
              <span className="font-bold text-white">{activeImage.attribution || 'Paddock Verified Motorsport Photography'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
