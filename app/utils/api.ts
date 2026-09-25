/* eslint-disable @typescript-eslint/no-explicit-any */
export const API_BASE = 'https://api.jolpi.ca/ergast/f1';

export const ALL_F1_SEASONS: string[] = Array.from(
  { length: 2026 - 1950 + 1 },
  (_, i) => String(2026 - i)
);

export const TEAM_COLORS: Record<string, string> = {
    red_bull: '#3671C6', ferrari: '#E8002D', mercedes: '#27F4D2', mclaren: '#FF8000',
    aston_martin: '#229971', alpine: '#00A1E8', williams: '#1868DB', rb: '#6C98FF',
    sauber: '#01C00E', haas: '#B6BABD', cadillac: '#8B5CF6', audi: '#01C00E', alphatauri: '#2B4562',
    alfa: '#B12039', renault: '#FFF200', racing_point: '#F596C8'
};

export function getTeamColor(id: string): string {
    return TEAM_COLORS[id] || '#8791A3';
}

export function pauseMs(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getJSON<T = any>(url: string, attempt: number = 1): Promise<T> {
    try {
        const targetUrl = url;
        const res = await fetch(targetUrl);
        if (res.status === 429) {
            if (attempt < 3) {
                await pauseMs(800 * attempt);
                return getJSON<T>(url, attempt + 1);
            }
            throw new Error('Rate limited — cached data mode active. Please wait a moment and try again.');
        }
        if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
        }
        return res.json() as Promise<T>;
    } catch (e: unknown) {
        const err = e as Error;
        if (attempt < 3) {
            await pauseMs(500 * attempt);
            return getJSON<T>(url, attempt + 1);
        }
        throw new Error(err.message || "Network request failed after 3 tries.");
    }
}

export async function fetchAllPaged<T = unknown>(url: string, tableKey: string, listKey: string): Promise<T[]> {
    let offset = 0;
    const pageSize = 100;
    let all: T[] = [];
    let total = Infinity;
    let first = true;
    while (offset < total) {
        if (!first) await pauseMs(350);
        first = false;
        const sep = url.includes('?') ? '&' : '?';
        const data = await getJSON<Record<string, unknown>>(`${url}${sep}limit=${pageSize}&offset=${offset}`);
        const mrData = data?.MRData as { total?: string; [key: string]: unknown } | undefined;
        if (!mrData) break;
        total = parseInt(mrData.total || '0') || 0;
        const table = mrData[tableKey] as Record<string, T[]> | undefined;
        const items = table ? (table[listKey] || []) : [];
        all = all.concat(items as T[]);
        if (items.length === 0) break;
        offset += items.length;
    }
    return all;
}

export function parseLapTime(t: string | undefined | null): number | null {
    if (!t) return null;
    const m = String(t).match(/^(\d+):(\d+(?:\.\d+)?)$/);
    if (!m) return null;
    return parseInt(m[1]) * 60 + parseFloat(m[2]);
}

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    thumbnail?: string;
    enclosure?: { link: string };
    description: string;
}

export async function fetchF1News(): Promise<NewsItem[]> {
    const feedUrl = encodeURIComponent('https://racingnews365.com/feed/news.xml');
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`;
    const data = await getJSON(url) as { status?: string; items?: NewsItem[] } | null;
    if (!data || data.status !== 'ok' || !data.items) {
        throw new Error('News feed is currently unavailable.');
    }
    return data.items;
}

export const NATIONALITY_FLAGS: Record<string, string> = {
    British: '🇬🇧', Dutch: '🇳🇱', Spanish: '🇪🇸', Monegasque: '🇲🇨', German: '🇩🇪', Finnish: '🇫🇮',
    Australian: '🇦🇺', French: '🇫🇷', Canadian: '🇨🇦', Mexican: '🇲🇽', Japanese: '🇯🇵', Italian: '🇮🇹',
    Brazilian: '🇧🇷', American: '🇺🇸', Danish: '🇩🇰', Thai: '🇹🇭', Chinese: '🇨🇳', 'New Zealander': '🇳🇿',
    Austrian: '🇦🇹', Belgian: '🇧🇪', Swedish: '🇸🇪', Swiss: '🇨🇭', Polish: '🇵🇱', Argentine: '🇦🇷',
    'South African': '🇿🇦', Indian: '🇮🇳', Russian: '🇷🇺', Indonesian: '🇮🇩', Colombian: '🇨🇴'
};

export interface WeatherData {
  airTemp: number;
  trackTemp: number;
  apparentTemp: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windCompass: string;
  windArrow: string;
  windGusts: number;
  rain: number;
  rainProbability: number;
  cloudCover: number;
  isDay: boolean;
  description: string;
  trackStatus: string;
  tyreRecommendation: string;
  weatherCode: number;
  uvIndex?: number;
  dewPoint?: number;
  solarIrradiance?: number;
  visibility?: number;
  updatedAt: string;
  // Backward compatibility alias for existing consumers
  temp: number;
}

export function getWindCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return directions[idx];
}

export function getWindArrow(deg: number): string {
  const arrows = ['↓', '↙', '↙', '←', '←', '↖', '↖', '↑', '↑', '↗', '↗', '→', '→', '↘', '↘', '↓'];
  const idx = Math.round(deg / 22.5) % 16;
  return arrows[idx];
}

export async function fetchCircuitWeather(lat: string, lon: string): Promise<WeatherData> {
  // 1. Try local server-side cached API route first
  try {
    const isBrowser = typeof window !== 'undefined';
    const baseUrl = isBrowser ? '' : 'http://localhost:3000';
    const localRes = await fetch(`${baseUrl}/api/weather?lat=${lat}&lon=${lon}`);
    if (localRes.ok) {
      const localData = await localRes.json();
      if (localData && localData.airTemp !== undefined) {
        return localData as WeatherData;
      }
    }
  } catch {
    // Proceed to direct Open-Meteo API fallback
  }

  // 2. Direct Open-Meteo Fallback
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,surface_pressure,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,is_day&hourly=soil_temperature_0cm,precipitation_probability,direct_normal_irradiance,uv_index,dew_point_2m,visibility&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather feed currently offline');
  const data = await res.json();
  const c = data.current;

  // Accurately locate current hour index in hourly array
  let hourIdx = 0;
  if (data.hourly?.time && c?.time) {
    const targetHour = c.time.slice(0, 13);
    const foundIdx = data.hourly.time.findIndex((t: string) => t.startsWith(targetHour));
    if (foundIdx !== -1) {
      hourIdx = foundIdx;
    }
  }

  const code = c.weather_code ?? 0;
  let desc = 'Clear sky';
  if (code === 1) desc = 'Mainly clear';
  else if (code === 2) desc = 'Partly cloudy';
  else if (code === 3) desc = 'Overcast';
  else if (code === 45 || code === 48) desc = 'Foggy conditions';
  else if (code >= 51 && code <= 55) desc = 'Light drizzle';
  else if (code >= 61 && code <= 63) desc = 'Moderate rain';
  else if (code >= 65) desc = 'Heavy torrential rain';
  else if (code >= 71 && code <= 77) desc = 'Snow / sleet';
  else if (code >= 80 && code <= 82) desc = 'Rain showers';
  else if (code >= 95) desc = 'Thunderstorm';

  const airTemp = Math.round((c.temperature_2m ?? 20) * 10) / 10;
  const groundTemp = data.hourly?.soil_temperature_0cm?.[hourIdx] ?? airTemp;
  const rainProb = data.hourly?.precipitation_probability?.[hourIdx] ?? (c.precipitation > 0 ? 100 : 0);
  const solarDni = data.hourly?.direct_normal_irradiance?.[hourIdx] ?? 0;
  const uv = data.hourly?.uv_index?.[hourIdx] ?? 0;
  const dewPoint = data.hourly?.dew_point_2m?.[hourIdx];
  const visibility = data.hourly?.visibility?.[hourIdx];
  const cloudCover = c.cloud_cover ?? 15;
  const isDay = c.is_day === 1;
  const windSpeed = Math.round((c.wind_speed_10m ?? 0) * 10) / 10;
  const windGusts = Math.round((c.wind_gusts_10m ?? c.wind_speed_10m ?? 0) * 10) / 10;
  const rainVol = Math.round(((c.rain ?? 0) + (c.showers ?? 0) || c.precipitation || 0) * 10) / 10;

  // Authentic F1 Asphalt Thermodynamic Model
  let calculatedTrackTemp: number;
  if (rainVol > 0.5) {
    calculatedTrackTemp = airTemp - 1.0;
  } else if (isDay) {
    let solarGain = 0;
    if (solarDni > 0) {
      solarGain = (solarDni / 100) * 3.4;
    } else {
      solarGain = ((100 - cloudCover) / 100) * 15.0;
    }
    const windCooling = Math.min(4.0, windSpeed * 0.06);
    const baseTemp = Math.max(airTemp + 3, groundTemp + 3);
    calculatedTrackTemp = baseTemp + solarGain - windCooling;
  } else {
    calculatedTrackTemp = Math.max(airTemp - 2.5, groundTemp - 0.5);
  }

  const trackTemp = Math.round(calculatedTrackTemp * 10) / 10;

  // Track status & tyre compound recommendation
  let track = 'Dry (100% Grip)';
  let tyre = 'Slick compound (Soft / Medium / Hard ☀️)';
  if (rainVol > 1.2 || code >= 65 || code >= 82) {
    track = 'Wet (Aquaplaning Risk)';
    tyre = 'Full Wets (Blue 🌧️)';
  } else if (rainVol > 0.05 || code >= 51 || rainProb > 55) {
    track = 'Damp (Greasy Surface)';
    tyre = 'Intermediates (Green 🌦️)';
  } else if (rainProb > 30) {
    track = 'Dry (Rain Threatening)';
    tyre = 'Slick compound (Soft / Medium / Hard ☀️)';
  }

  const windDir = Math.round(c.wind_direction_10m ?? 0);

  return {
    airTemp,
    trackTemp,
    apparentTemp: Math.round((c.apparent_temperature ?? airTemp) * 10) / 10,
    humidity: Math.round(c.relative_humidity_2m ?? 50),
    pressure: Math.round((c.surface_pressure ?? 1013) * 10) / 10,
    windSpeed,
    windDirection: windDir,
    windCompass: getWindCompass(windDir),
    windArrow: getWindArrow(windDir),
    windGusts,
    rain: rainVol,
    rainProbability: rainProb,
    cloudCover,
    isDay,
    description: desc,
    trackStatus: track,
    tyreRecommendation: tyre,
    weatherCode: code,
    uvIndex: Math.round(uv * 10) / 10,
    dewPoint: dewPoint !== undefined ? Math.round(dewPoint * 10) / 10 : undefined,
    solarIrradiance: Math.round(solarDni),
    visibility: visibility !== undefined ? Math.round(visibility / 1000) : undefined,
    updatedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temp: airTemp
  };
}
