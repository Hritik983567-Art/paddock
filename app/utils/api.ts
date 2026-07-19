export const API_BASE = 'https://api.jolpi.ca/ergast/f1';

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

export async function getJSON(url: string, attempt: number = 1): Promise<any> {
    try {
        const res = await fetch(url);
        if (res.status === 429) {
            if (attempt < 3) {
                await pauseMs(800 * attempt);
                return getJSON(url, attempt + 1);
            }
            throw new Error('Rate limited (429) — the public API allows ~200 requests/hour without a key. Wait a few minutes and try again.');
        }
        if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
        }
        return res.json();
    } catch (e: any) {
        if (attempt < 3) {
            await pauseMs(500 * attempt);
            return getJSON(url, attempt + 1);
        }
        throw new Error(e.message || "Network request failed after 3 tries.");
    }
}

export async function fetchAllPaged(url: string, tableKey: string, listKey: string): Promise<any[]> {
    let offset = 0;
    const pageSize = 100;
    let all: any[] = [];
    let total = Infinity;
    let first = true;
    while (offset < total) {
        if (!first) await pauseMs(350);
        first = false;
        const sep = url.includes('?') ? '&' : '?';
        const data = await getJSON(`${url}${sep}limit=${pageSize}&offset=${offset}`);
        total = parseInt(data.MRData.total) || 0;
        const items = data.MRData[tableKey][listKey] || [];
        all = all.concat(items);
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
    const data = await getJSON(url);
    if (data.status !== 'ok' || !data.items) {
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
  temp: number;
  humidity: number;
  windSpeed: number;
  rain: number;
  description: string;
  trackStatus: string;
  tyreRecommendation: string;
}

export async function fetchCircuitWeather(lat: string, lon: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather feed currently offline');
  const data = await res.json();
  const c = data.current;

  const code = c.weather_code;
  let desc = 'Clear sky';
  if (code >= 1 && code <= 3) desc = 'Mainly clear / partly cloudy';
  else if (code === 45 || code === 48) desc = 'Foggy conditions';
  else if (code >= 51 && code <= 55) desc = 'Light / dense drizzle';
  else if (code >= 61 && code <= 65) desc = 'Slight / heavy rain';
  else if (code >= 71 && code <= 77) desc = 'Snow fall / ice pellets';
  else if (code >= 80 && code <= 82) desc = 'Slight / violent rain showers';
  else if (code >= 95) desc = 'Thunderstorm';

  let track = 'Dry';
  let tyre = 'Slicks (Soft / Medium / Hard)';
  if (c.precipitation > 1.5) {
    track = 'Wet';
    tyre = 'Full Wets (Blue 🌧️)';
  } else if (c.precipitation > 0.1) {
    track = 'Damp';
    tyre = 'Intermediates (Green 🌦️)';
  } else {
    track = 'Dry';
    tyre = 'Slick compound (Red/Yellow/White ☀️)';
  }

  return {
    temp: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    rain: c.precipitation,
    description: desc,
    trackStatus: track,
    tyreRecommendation: tyre
  };
}
