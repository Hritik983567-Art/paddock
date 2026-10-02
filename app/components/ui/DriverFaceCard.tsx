'use client';

import React, { useState } from 'react';
import { getDriverMediaProfile, DriverMediaProfile } from '../../lib/driverMediaService';
import { Badge } from './Badge';

export interface DriverFaceCardProps {
  driverId: string;
  season?: string;
  apiConstructor?: { constructorId: string; name: string } | null;
  customProfile?: Partial<DriverMediaProfile>;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  wins?: number;
  podiums?: number;
  points?: number;
  className?: string;
  artisticMode?: boolean;
  onClick?: () => void;
}

export const DriverFaceCard: React.FC<DriverFaceCardProps> = ({
  driverId,
  season = '2026',
  apiConstructor,
  customProfile,
  size = 'md',
  showStats = false,
  wins = 0,
  podiums = 0,
  points = 0,
  className = '',
  artisticMode = false,
  onClick,
}) => {
  const profile = getDriverMediaProfile(driverId, season, apiConstructor);
  const finalProfile = { ...profile, ...customProfile };

  const [imgSrc, setImgSrc] = useState<string>(finalProfile.headshotUrl);
  const [fallbackStage, setFallbackStage] = useState<number>(0);
  const [isArtistic, setIsArtistic] = useState<boolean>(artisticMode);

  React.useEffect(() => {
    setImgSrc(finalProfile.headshotUrl);
    setFallbackStage(0);
  }, [driverId, season, finalProfile.headshotUrl]);

  const handleImgError = () => {
    if (fallbackStage === 0 && finalProfile.officialHeadshotUrl && imgSrc !== finalProfile.officialHeadshotUrl) {
      setFallbackStage(1);
      setImgSrc(finalProfile.officialHeadshotUrl);
    } else if (fallbackStage <= 1) {
      setFallbackStage(2);
      setImgSrc(finalProfile.fallbackHeadshotUrl || '/images/holograms/default.jpg');
    } else if (fallbackStage === 2) {
      setFallbackStage(3);
      setImgSrc('/images/holograms/default.jpg');
    } else {
      setFallbackStage(4);
    }
  };

  const containerSizes = {
    sm: 'w-48 h-64',
    md: 'w-64 h-80',
    lg: 'w-72 h-96',
  };

  const nameSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      onClick={onClick}
      style={{ borderColor: finalProfile.teamColor }}
      className={`relative ${containerSizes[size]} rounded-2xl overflow-hidden border-2 bg-zinc-950 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl cursor-pointer group shadow-xl ${className}`}
    >
      {/* SVG Texture Filter for Watercolor / Oil Painting Effect */}
      <svg className="hidden">
        <filter id={`watercolor-brush-${driverId}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Background Team Color Glow & Watercolor Splatter Effect */}
      <div
        className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity"
        style={{
          background: isArtistic
            ? `radial-gradient(circle at 50% 30%, ${finalProfile.teamColor} 0%, rgba(10,12,20,0.95) 75%),
               radial-gradient(circle at 20% 80%, ${finalProfile.teamColor}40 0%, transparent 50%)`
            : `radial-gradient(circle at 50% 20%, ${finalProfile.teamColor} 0%, transparent 75%)`
        }}
      />

      {/* Driver Face Photo or Watercolor Digital Oil Painting Avatar */}
      <div className="relative w-full h-full flex items-center justify-center p-2">
        {fallbackStage < 3 ? (
          <div className="relative w-full h-full overflow-hidden rounded-xl">
            <img
              src={imgSrc}
              alt={finalProfile.name}
              onError={handleImgError}
              className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
                isArtistic
                  ? 'contrast-[1.22] saturate-[1.3] brightness-[1.05]'
                  : 'contrast-[1.12] brightness-[1.03]'
              }`}
              style={{
                imageRendering: '-webkit-optimize-contrast',
                filter: isArtistic
                  ? `url(#watercolor-brush-${driverId}) drop-shadow(0 4px 10px rgba(0,0,0,0.6))`
                  : undefined
              }}
            />
            {/* Painterly Texture Wash Overlay */}
            {isArtistic && (
              <div 
                className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-20"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${finalProfile.teamColor}, transparent 80%)`
                }}
              />
            )}
          </div>
        ) : (
          /* Vibrant Watercolor Digital Oil Painting Avatar Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center pb-16 pt-8 gap-3">
            <div
              style={{ 
                borderColor: finalProfile.teamColor, 
                backgroundColor: `${finalProfile.teamColor}25`,
                boxShadow: `0 0 25px ${finalProfile.teamColor}40`
              }}
              className="w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform shadow-2xl"
            >
              <div 
                style={{ backgroundColor: finalProfile.teamColor }} 
                className="absolute inset-0 opacity-20 blur-md" 
              />
              <span className="text-4xl font-black font-display text-white tracking-tighter drop-shadow-lg z-10">
                {finalProfile.code}
              </span>
              <span className="text-[10px] font-mono font-black text-amber-300 uppercase z-10 tracking-widest mt-0.5">
                ARTIST CANVAS
              </span>
            </div>
            <span className="text-xs font-mono font-black text-zinc-300 tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800">
              🎨 {finalProfile.name}
            </span>
          </div>
        )}
      </div>

      {/* Top Left: Permanent Number Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
        <div
          style={{ backgroundColor: finalProfile.teamColor }}
          className="px-2.5 py-1 rounded-lg text-white font-mono font-black text-xs shadow-md shadow-black/60"
        >
          #{finalProfile.number}
        </div>
        <span className="text-base drop-shadow-md">{finalProfile.flag}</span>
      </div>

      {/* Top Right: Style Toggle & Transfer Alert Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsArtistic(!isArtistic);
          }}
          title={isArtistic ? "Switch to Photo Mode" : "Switch to Oil Painting / Watercolor Mode"}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-black border shadow-lg transition-all ${
            isArtistic
              ? 'bg-amber-500/90 border-amber-300 text-slate-950 font-extrabold shadow-amber-500/30'
              : 'bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500'
          }`}
        >
          {isArtistic ? '🎨 OIL PAINTING' : '🖼️ ART STYLE'}
        </button>
        {finalProfile.isTransferred && (
          <Badge variant="red" size="sm" className="shadow-lg animate-pulse">
            NEW TEAM
          </Badge>
        )}
      </div>

      {/* Bottom Info Overlay */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent p-4 flex flex-col justify-end z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
            {finalProfile.code}
          </span>
          <span
            style={{ color: finalProfile.teamColor }}
            className="text-xs font-mono font-bold uppercase truncate max-w-[140px]"
          >
            {finalProfile.teamName}
          </span>
        </div>

        <h3 className={`${nameSizes[size]} font-black font-display text-white uppercase tracking-tight truncate drop-shadow-md`}>
          {finalProfile.name}
        </h3>

        {/* Optional Career/Season Stats Bar */}
        {showStats && (
          <div className="grid grid-cols-3 gap-1 pt-2 mt-2 border-t border-zinc-800/80 text-center font-mono">
            <div>
              <div className="text-[10px] text-zinc-400">WINS</div>
              <div className="text-xs font-bold text-zinc-100">{wins}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">PODIUMS</div>
              <div className="text-xs font-bold text-zinc-100">{podiums}</div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-400">PTS</div>
              <div className="text-xs font-bold text-amber-400">{points}</div>
            </div>
          </div>
        )}
      </div>

      {/* Corner Tech Accents */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-zinc-500/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-zinc-500/60 pointer-events-none" />
    </div>
  );
};
