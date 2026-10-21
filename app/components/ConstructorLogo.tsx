'use client';

import React from 'react';
import { F1Theme } from '../contexts/ThemeContext';

interface ConstructorLogoProps {
  themeId: F1Theme;
  className?: string;
  size?: number;
}

export default function ConstructorLogo({ themeId, className = '', size = 32 }: ConstructorLogoProps) {
  const normId = themeId === 'default' ? 'checkered' : themeId;

  switch (normId) {
    case 'ferrari':
      // Scuderia Ferrari: Iconic Giallo Modena Shield with Italian Tricolore and Prancing Horse
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="Scuderia Ferrari Emblem"
        >
          {/* Outer Shield Border */}
          <path 
            d="M50 115 C20 95 6 70 6 22 L50 6 L94 22 C94 70 80 95 50 115 Z" 
            fill="#FFDE00" 
            stroke="#111111" 
            strokeWidth="3"
          />
          {/* Italian Flag Header */}
          <path d="M12 23 L37 14 L37 25 L12 28 Z" fill="#009246" />
          <path d="M37 14 L63 14 L63 25 L37 25 Z" fill="#FFFFFF" />
          <path d="M63 14 L88 23 L88 28 L63 25 Z" fill="#CE2B37" />
          {/* SF Letters */}
          <text x="22" y="105" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="#000000">S</text>
          <text x="64" y="105" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="#000000">F</text>
          {/* Prancing Horse Silhouette */}
          <path 
            d="M52 35 C52 35 55 31 52 28 C49 25 45 27 45 29 C45 31 48 33 46 38 C44 43 38 45 35 44 C33 43 32 46 34 48 C37 51 40 49 42 47 C43 51 41 57 37 62 C34 66 31 68 33 71 C35 73 37 70 40 67 C42 71 39 80 34 86 C32 88 35 90 37 88 C41 84 43 78 45 74 C46 80 47 88 45 94 C44 96 48 96 49 93 C51 86 51 77 49 71 C51 68 56 65 59 60 C62 55 61 47 57 44 C59 42 63 43 65 41 C67 39 63 36 60 38 C58 35 55 35 52 35 Z" 
            fill="#000000"
          />
        </svg>
      );

    case 'redbull':
      // Red Bull Racing: Dynamic Charging Bull with Golden Sun
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 120 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="Red Bull Racing Emblem"
        >
          {/* Golden Yellow Sun */}
          <circle cx="60" cy="50" r="32" fill="#FFC700" />
          <circle cx="60" cy="50" r="30" stroke="#E51D3A" strokeWidth="2" fill="#FFC700" />
          {/* Left Charging Bull */}
          <path 
            d="M15 54 C20 48 28 46 36 48 C42 44 49 43 56 46 C52 49 49 53 47 58 C44 56 38 56 34 60 C30 63 26 69 20 68 C16 67 14 62 15 54 Z" 
            fill="#C3142D"
          />
          {/* Right Charging Bull */}
          <path 
            d="M105 54 C100 48 92 46 84 48 C78 44 71 43 64 46 C68 49 71 53 73 58 C76 56 82 56 86 60 C90 63 94 69 100 68 C104 67 106 62 105 54 Z" 
            fill="#C3142D"
          />
          {/* Racing Speed Flash */}
          <path d="M48 50 L72 50 L64 56 L40 56 Z" fill="#FF1E3C" />
          <text x="60" y="85" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="900" fill="#001A30" letterSpacing="1">RACING</text>
        </svg>
      );

    case 'mercedes':
      // Mercedes-AMG Petronas: Precision 3-Pointed Silver Star in Ring with Emerald Accent
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="Mercedes-AMG Petronas Emblem"
        >
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="44" stroke="#E0E6ED" strokeWidth="5" fill="#0A1015" />
          <circle cx="50" cy="50" r="46" stroke="#00A19B" strokeWidth="1.5" strokeDasharray="6 3" />
          {/* Three-Pointed Star */}
          <path 
            d="M50 14 L53 47 L82 66 L50 53 L18 66 L47 47 Z" 
            fill="url(#merc-grad)" 
          />
          <path 
            d="M50 14 L50 53 L82 66 Z" 
            fill="#C5D0D9" 
          />
          <path 
            d="M50 14 L47 47 L18 66 Z" 
            fill="#FFFFFF" 
          />
          <defs>
            <linearGradient id="merc-grad" x1="18" y1="14" x2="82" y2="66" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor="#D2DBE2" />
              <stop offset="1" stopColor="#8A9CA8" />
            </linearGradient>
          </defs>
        </svg>
      );

    case 'mclaren':
      // McLaren: Aerodynamic Papaya Speedmark Crescent
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 110 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="McLaren F1 Emblem"
        >
          {/* McLaren Speedmark Chevron */}
          <path 
            d="M15 65 C45 65 78 55 95 18 C85 40 55 52 28 54 C20 54 16 57 15 65 Z" 
            fill="#FF8000" 
          />
          <path 
            d="M28 54 C55 52 85 40 95 18 C98 12 102 15 99 22 C82 58 48 70 15 70 C14 66 18 55 28 54 Z" 
            fill="#FF5500" 
          />
          <text x="55" y="76" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="900" fill="#FFFFFF" letterSpacing="2">MCLAREN</text>
        </svg>
      );

    case 'aston':
      // Aston Martin: Iconic British Racing Green Wings Emblem
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 120 70" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="Aston Martin Aramco Emblem"
        >
          {/* Wing Feathers Left */}
          <path d="M10 32 C25 25 45 28 58 35 L58 42 C42 36 24 35 10 42 Z" fill="#CED6DE" stroke="#00352F" strokeWidth="1" />
          <path d="M18 42 C32 37 46 39 58 44 L58 50 C44 46 30 46 18 52 Z" fill="#B0BDC9" stroke="#00352F" strokeWidth="1" />
          {/* Wing Feathers Right */}
          <path d="M110 32 C95 25 75 28 62 35 L62 42 C78 36 96 35 110 42 Z" fill="#CED6DE" stroke="#00352F" strokeWidth="1" />
          <path d="M102 42 C88 37 74 39 62 44 L62 50 C76 46 90 46 102 52 Z" fill="#B0BDC9" stroke="#00352F" strokeWidth="1" />
          {/* Central Green Nameplate Banner */}
          <rect x="26" y="24" width="68" height="18" rx="4" fill="#00594F" stroke="#CED6DE" strokeWidth="1.5" />
          <text x="60" y="36" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fontWeight="900" fill="#FFFFFF" letterSpacing="1">ASTON MARTIN</text>
        </svg>
      );

    case 'alpine':
      // BWT Alpine: Dynamic Stylized A Monogram with French Flag
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="BWT Alpine Emblem"
        >
          {/* Stylized Slanted A Left Leg */}
          <path d="M48 15 L22 85 L38 85 L48 58 L62 58 L54 38 Z" fill="#0078D0" />
          {/* Slanted A Right Wing */}
          <path d="M54 38 L62 58 L82 85 L66 85 L56 68 Z" fill="#FD4BC7" />
          {/* Crossbar & French Tricolor Touch */}
          <rect x="42" y="58" width="8" height="6" fill="#002395" />
          <rect x="50" y="58" width="8" height="6" fill="#FFFFFF" />
          <rect x="58" y="58" width="8" height="6" fill="#ED2939" />
          <text x="50" y="98" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="900" fill="#FFFFFF" letterSpacing="1">ALPINE</text>
        </svg>
      );

    case 'haas':
      // Haas F1: Concentric Circular H Badge
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="Haas F1 Emblem"
        >
          {/* White Outer Ring with Red Accent */}
          <circle cx="50" cy="50" r="42" stroke="#E10600" strokeWidth="6" fill="#151719" />
          <circle cx="50" cy="50" r="34" stroke="#FFFFFF" strokeWidth="3" />
          {/* Bold H Centerpiece */}
          <path d="M35 28 L43 28 L43 45 L57 45 L57 28 L65 28 L65 72 L57 72 L57 53 L43 53 L43 72 L35 72 Z" fill="#E10600" />
          <path d="M43 46 L57 46 L57 52 L43 52 Z" fill="#FFFFFF" />
        </svg>
      );

    case 'racingbulls':
      // Visa Cash App RB: Charging Bull Emblem in Royal Electric Blue & Silver
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="Racing Bulls Emblem"
        >
          {/* Dynamic Shield */}
          <path d="M50 10 L88 28 L76 80 L50 94 L24 80 L12 28 Z" fill="#0A1A3A" stroke="#2B63FF" strokeWidth="3" />
          {/* Stylized Silver Charging Bull */}
          <path 
            d="M32 40 C38 35 46 36 54 40 C60 36 68 37 72 44 C68 47 64 48 60 54 C56 50 48 50 42 54 C38 48 34 45 32 40 Z" 
            fill="#FFFFFF" 
          />
          <circle cx="50" cy="62" r="12" fill="#E51D3A" />
          <text x="50" y="86" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="900" fill="#2B63FF" letterSpacing="1">VCARB</text>
        </svg>
      );

    case 'sauber':
      // Stake F1 Team Kick Sauber: Neon Green S Badge
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="Stake Sauber Emblem"
        >
          {/* Hexagonal Dark Base */}
          <path d="M50 8 L86 28 L86 72 L50 92 L14 72 L14 28 Z" fill="#000000" stroke="#00E700" strokeWidth="4" />
          {/* Electric Neon S / K Monogram */}
          <path 
            d="M68 28 L36 28 C28 28 26 36 32 42 L58 48 C68 50 68 62 60 66 L30 66 L30 56 L58 56 C62 56 62 52 56 50 L34 46 C22 43 24 28 36 24 L68 24 Z" 
            fill="#00E700" 
          />
          <text x="50" y="85" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fontWeight="900" fill="#FFFFFF" letterSpacing="1">SAUBER</text>
        </svg>
      );

    case 'williams':
      // Williams Racing: Speed Chevron W Monogram in Cobalt & Cyan
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 110 90" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="Williams Racing Emblem"
        >
          {/* Williams Geometric W Chevron Wings */}
          <path d="M12 25 L32 75 L46 75 L30 35 L48 35 L55 52 L62 35 L80 35 L64 75 L78 75 L98 25 L84 25 L71 60 L62 38 L55 22 L48 38 L39 60 L26 25 Z" fill="#00A0DE" />
          <path d="M30 35 L48 35 L55 52 L62 35 L80 35 L68 62 L55 35 L42 62 Z" fill="#041E42" />
          <text x="55" y="86" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fontWeight="900" fill="#FFFFFF" letterSpacing="2">WILLIAMS</text>
        </svg>
      );

    case 'checkered':
    default:
      // Signature F1 Checkered Racing Flag & Carbon Apex
      return (
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 drop-shadow-md ${className}`}
          aria-label="Checkered Flag Race Emblem"
        >
          {/* Carbon Roundel Border */}
          <circle cx="50" cy="50" r="42" fill="#0D121B" stroke="#00FFE0" strokeWidth="3" />
          <circle cx="50" cy="50" r="38" stroke="#2E3746" strokeWidth="1.5" strokeDasharray="4 2" />
          {/* Checkered Flag Grid Waving */}
          <g transform="translate(24, 25) scale(0.55)">
            <rect x="0" y="0" width="20" height="20" fill="#FFFFFF" />
            <rect x="20" y="0" width="20" height="20" fill="#05070A" />
            <rect x="40" y="0" width="20" height="20" fill="#FFFFFF" />
            <rect x="60" y="0" width="20" height="20" fill="#05070A" />
            
            <rect x="0" y="20" width="20" height="20" fill="#05070A" />
            <rect x="20" y="20" width="20" height="20" fill="#FFFFFF" />
            <rect x="40" y="20" width="20" height="20" fill="#05070A" />
            <rect x="60" y="20" width="20" height="20" fill="#FFFFFF" />
            
            <rect x="0" y="40" width="20" height="20" fill="#FFFFFF" />
            <rect x="20" y="40" width="20" height="20" fill="#05070A" />
            <rect x="40" y="40" width="20" height="20" fill="#FFFFFF" />
            <rect x="60" y="40" width="20" height="20" fill="#05070A" />

            <rect x="0" y="60" width="20" height="20" fill="#05070A" />
            <rect x="20" y="60" width="20" height="20" fill="#FFFFFF" />
            <rect x="40" y="60" width="20" height="20" fill="#05070A" />
            <rect x="60" y="60" width="20" height="20" fill="#FFFFFF" />
          </g>
          {/* Flagpole */}
          <line x1="22" y1="22" x2="22" y2="78" stroke="#CED6DE" strokeWidth="4" strokeLinecap="round" />
          <circle cx="22" cy="20" r="3" fill="#FFC700" />
        </svg>
      );
  }
}
