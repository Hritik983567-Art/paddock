export interface AvatarPreset {
  id: string;
  name: string;
  badgeText?: string;
  photoUrl?: string;
  bgGradient: string;
  borderColor: string;
  glowShadow: string;
  team: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'hamilton_ferrari',
    name: 'Lewis Hamilton',
    badgeText: 'LH44',
    photoUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png',
    bgGradient: 'bg-gradient-to-br from-red-600 to-amber-600',
    borderColor: 'border-red-400',
    glowShadow: 'shadow-[0_0_25px_rgba(232,0,45,0.5)]',
    team: 'Scuderia Ferrari (2025+)'
  },
  {
    id: 'verstappen_rb',
    name: 'Max Verstappen',
    badgeText: 'MV1',
    photoUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png',
    bgGradient: 'bg-gradient-to-br from-blue-700 to-indigo-900',
    borderColor: 'border-blue-400',
    glowShadow: 'shadow-[0_0_25px_rgba(54,113,198,0.5)]',
    team: 'Red Bull Racing'
  },
  {
    id: 'leclerc_ferrari',
    name: 'Charles Leclerc',
    badgeText: 'CL16',
    photoUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png',
    bgGradient: 'bg-gradient-to-br from-red-700 to-red-950',
    borderColor: 'border-red-500',
    glowShadow: 'shadow-[0_0_25px_rgba(225,6,0,0.5)]',
    team: 'Scuderia Ferrari'
  },
  {
    id: 'norris_mclaren',
    name: 'Lando Norris',
    badgeText: 'LN4',
    photoUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png',
    bgGradient: 'bg-gradient-to-br from-orange-500 to-amber-600',
    borderColor: 'border-orange-400',
    glowShadow: 'shadow-[0_0_25px_rgba(255,128,0,0.5)]',
    team: 'McLaren Papaya'
  },
  {
    id: 'piastri_mclaren',
    name: 'Oscar Piastri',
    badgeText: 'OP81',
    photoUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png',
    bgGradient: 'bg-gradient-to-br from-amber-500 to-orange-700',
    borderColor: 'border-amber-400',
    glowShadow: 'shadow-[0_0_25px_rgba(255,160,0,0.5)]',
    team: 'McLaren Papaya'
  },
  {
    id: 'russell_mercedes',
    name: 'George Russell',
    badgeText: 'GR63',
    photoUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png',
    bgGradient: 'bg-gradient-to-br from-teal-600 to-emerald-900',
    borderColor: 'border-teal-400',
    glowShadow: 'shadow-[0_0_25px_rgba(39,244,210,0.5)]',
    team: 'Mercedes-AMG'
  },
  {
    id: 'alonso_aston',
    name: 'Fernando Alonso',
    badgeText: 'FA14',
    photoUrl: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png',
    bgGradient: 'bg-gradient-to-br from-emerald-700 to-teal-950',
    borderColor: 'border-emerald-400',
    glowShadow: 'shadow-[0_0_25px_rgba(34,153,113,0.5)]',
    team: 'Aston Martin'
  },
  {
    id: 'paddock_engineer',
    name: 'Chief Race Engineer',
    badgeText: '🛠️',
    bgGradient: 'bg-gradient-to-br from-purple-600 to-indigo-900',
    borderColor: 'border-purple-400',
    glowShadow: 'shadow-[0_0_25px_rgba(147,51,234,0.5)]',
    team: 'Paddock Pit-Wall'
  },
  {
    id: 'telemetry_hud',
    name: 'Telemetry Cyber HUD',
    badgeText: '⚡',
    bgGradient: 'bg-gradient-to-br from-cyan-600 to-blue-900',
    borderColor: 'border-cyan-400',
    glowShadow: 'shadow-[0_0_25px_rgba(6,182,212,0.5)]',
    team: 'Live Telemetry Grid'
  },
  {
    id: 'world_champion',
    name: 'World Champion Crown',
    badgeText: '🏆',
    bgGradient: 'bg-gradient-to-br from-amber-500 to-yellow-700',
    borderColor: 'border-amber-400',
    glowShadow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]',
    team: 'FIA World Championship'
  }
];

export function getAvatarPreset(presetId: string): AvatarPreset {
  return AVATAR_PRESETS.find(p => p.id === presetId) || AVATAR_PRESETS[7];
}
