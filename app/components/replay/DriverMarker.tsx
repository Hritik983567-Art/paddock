import React, { useState } from 'react';
import { getTeamColor } from '../../utils/api';

interface DriverMarkerProps {
  driverId: string;
  code: string;
  name: string;
  team: string;
  position: number;
  x: number;
  y: number;
  isSelected: boolean;
  isHovered: boolean;
  isDriverA: boolean;
  isDriverB: boolean;
  gap?: string;
  lapTime?: number;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

export const DriverMarker: React.FC<DriverMarkerProps> = ({
  driverId,
  code,
  name,
  team,
  position,
  x,
  y,
  isSelected,
  isHovered,
  isDriverA,
  isDriverB,
  gap,
  lapTime,
  onSelect,
  onHover
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const teamColor = getTeamColor(team);

  const markerBorder = isDriverA
    ? '#38BDF8' // Driver A Cyan
    : isDriverB
    ? '#F59E0B' // Driver B Gold
    : isSelected
    ? '#34D399'
    : teamColor;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="cursor-pointer transition-transform duration-300 ease-out"
      onClick={() => onSelect(driverId)}
      onMouseEnter={() => {
        setShowTooltip(true);
        onHover(driverId);
      }}
      onMouseLeave={() => {
        setShowTooltip(false);
        onHover(null);
      }}
    >
      {/* Selection Halo */}
      {(isSelected || isDriverA || isDriverB || isHovered) && (
        <circle
          cx="0"
          cy="0"
          r="16"
          fill="none"
          stroke={markerBorder}
          strokeWidth="2.5"
          className="animate-ping opacity-75"
        />
      )}

      {/* Primary Driver Pill Circle */}
      <circle
        cx="0"
        cy="0"
        r="11"
        fill="#050810"
        stroke={markerBorder}
        strokeWidth={isSelected || isDriverA || isDriverB ? '3' : '2'}
        className="shadow-lg"
      />

      {/* Position indicator dot */}
      <circle cx="-7" cy="-7" r="4.5" fill={teamColor} />
      <text
        x="-7"
        y="-5.5"
        fontSize="6"
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
      >
        {position}
      </text>

      {/* Driver Short Code */}
      <text
        x="0"
        y="3.5"
        fontSize="8.5"
        fontWeight="900"
        fill="#FFFFFF"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
      >
        {code}
      </text>

      {/* Hover Popover Tooltip */}
      {(showTooltip || isHovered) && (
        <g transform="translate(0, -22)" className="pointer-events-none z-50">
          <rect
            x="-60"
            y="-40"
            width="120"
            height="38"
            rx="6"
            fill="#080C14"
            stroke="#334155"
            strokeWidth="1.5"
            className="shadow-2xl"
          />
          <text x="0" y="-26" fontSize="9" fontWeight="900" fill="#FFFFFF" textAnchor="middle" fontFamily="var(--font-mono)">
            P{position} &bull; {code} ({name.split(' ')[1] || name})
          </text>
          <text x="0" y="-14" fontSize="8" fontWeight="bold" fill="#38BDF8" textAnchor="middle" fontFamily="var(--font-mono)">
            {team.toUpperCase().replace('_', ' ')}
          </text>
          <text x="0" y="-4" fontSize="7.5" fontWeight="semibold" fill="#94A3B8" textAnchor="middle" fontFamily="var(--font-mono)">
            Gap: {gap || 'LEADER'} &bull; {lapTime ? `${lapTime.toFixed(3)}s` : 'S1: OK'}
          </text>
        </g>
      )}
    </g>
  );
};
