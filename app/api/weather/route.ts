import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60 seconds cache

interface CachedEntry {
  timestamp: number;
  data: any;
}

const memoryCache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getWindCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return directions[idx];
}

function getWindArrow(deg: number): string {
  const arrows = ['↓', '↙', '↙', '←', '←', '↖', '↖', '↑', '↑', '↗', '↗', '→', '→', '↘', '↘', '↓'];
  const idx = Math.round(deg / 22.5) % 16;
  return arrows[idx];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || '40.3725';
    const lon = searchParams.get('lon') || '49.8533';

    const cacheKey = `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}`;
    const now = Date.now();
    const cached = memoryCache.get(cacheKey);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
      });
    }

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,surface_pressure,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,is_day&hourly=soil_temperature_0cm,precipitation_probability,direct_normal_irradiance,uv_index,dew_point_2m,visibility&timezone=auto`;

    const res = await fetch(openMeteoUrl);
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

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

    const payload = {
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

    memoryCache.set(cacheKey, { timestamp: now, data: payload });

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Weather radar telemetry offline', details: error.message },
      { status: 502 }
    );
  }
}
