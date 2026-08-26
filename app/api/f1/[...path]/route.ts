import { NextResponse } from 'next/server';

const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in-memory server cache

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path ? path.join('/') : '';
    const cleanPath = pathString.endsWith('.json') ? pathString : `${pathString}.json`;

    // Preserve query parameters (e.g., ?limit=100&offset=0)
    const { search } = new URL(request.url);
    
    // Primary API: api.jolpi.ca (fastest & reliable F1 Ergast proxy)
    const targetUrl = `https://api.jolpi.ca/ergast/f1/${cleanPath}${search}`;

    // Check Cache
    const cached = cache.get(targetUrl);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json(cached.data, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=300' }
      });
    }

    let res: Response | null = null;
    try {
      res = await fetch(targetUrl, {
        headers: { 'User-Agent': 'PaddockAnalytics/2.0' },
        next: { revalidate: 300 }
      });
    } catch {
      // Fallback API: ergast.com
      const fallbackUrl = `https://ergast.com/api/f1/${cleanPath}${search}`;
      res = await fetch(fallbackUrl, {
        headers: { 'User-Agent': 'PaddockAnalytics/2.0' },
        next: { revalidate: 300 }
      });
    }

    if (!res || !res.ok) {
      if (cached) {
        return NextResponse.json(cached.data, { headers: { 'X-Cache': 'STALE' } });
      }
      return NextResponse.json({
        MRData: {
          StandingsTable: { StandingsLists: [] },
          RaceTable: { Races: [] },
          DriverTable: { Drivers: [] },
          total: '0'
        },
        error: 'Upstream API unavailable'
      }, { status: 200 });
    }

    const data = await res.json();
    cache.set(targetUrl, { timestamp: Date.now(), data });

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=300' }
    });
  } catch (error: any) {
    return NextResponse.json({
      MRData: {
        StandingsTable: { StandingsLists: [] },
        RaceTable: { Races: [] },
        DriverTable: { Drivers: [] },
        total: '0'
      },
      error: error?.message || 'Server proxy processing failure'
    }, { status: 200 });
  }
}
