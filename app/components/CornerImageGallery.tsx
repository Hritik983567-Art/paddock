'use client';

import React, { useState, useEffect } from 'react';
import { CircuitCorner, CornerImage } from '../lib/circuitCornersData';

interface CornerImageGalleryProps {
  corner: CircuitCorner;
}

export const CornerImageGallery: React.FC<CornerImageGalleryProps> = ({ corner }) => {
  const images = corner.images || [];
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
