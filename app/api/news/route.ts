import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 45; // 45 seconds

interface CachedNews {
  timestamp: number;
  items: Array<{
    title: string;
    link: string;
    pubDate: string;
    description: string;
    image?: string;
    thumbnail?: string;
  }>;
}

let memoryCache: CachedNews | null = null;
const CACHE_TTL_MS = 45 * 1000; // 45 seconds cache

async function fetchOgImage(url: string): Promise<string | null> {
  if (!url || !url.startsWith('http')) return null;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch && ogMatch[1]) {
      let img = ogMatch[1].replace(/&amp;/g, '&').trim();
      if (img.startsWith('//')) {
        img = 'https:' + img;
      } else if (img.startsWith('/')) {
        img = 'https://racingnews365.com' + img;
      }
      return img;
    }
  } catch {
    // Timeout or network error
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const now = Date.now();

    if (!forceRefresh && memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
      return NextResponse.json(memoryCache.items, {
        headers: { 'Cache-Control': 'public, s-maxage=45, stale-while-revalidate=90' }
      });
    }

    let parsedItems: Array<{ title: string; link: string; pubDate: string; description: string }> = [];

    // Attempt 1: Direct Atom feed from RacingNews365
    try {
      const feedRes = await fetch('https://racingnews365.com/feed/news.xml', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(6000)
      });

      if (feedRes.ok) {
        const xml = await feedRes.text();
        const entries = xml.split('<entry').slice(1, 21); // Top 20 stories
        parsedItems = entries.map(e => {
          const titleMatch = e.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
          const linkMatch = e.match(/<link[^>]+href=["']([^"']+)["']/i);
          const pubDateMatch = e.match(/<published[^>]*>([\s\S]*?)<\/published>/i);
          const summaryMatch = e.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i);
          return {
            title: titleMatch ? titleMatch[1].trim() : '',
            link: linkMatch ? linkMatch[1].trim() : '',
            pubDate: pubDateMatch ? pubDateMatch[1].trim() : '',
            description: summaryMatch ? summaryMatch[1].trim() : ''
          };
        }).filter(item => item.title && item.link);
      }
    } catch (e) {
      console.warn('Direct feed fetch failed, attempting fallback...', e);
    }

    // Fallback: rss2json
    if (parsedItems.length === 0) {
      try {
        const feedUrl = encodeURIComponent('https://racingnews365.com/feed/news.xml');
        const fallbackRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`, {
          signal: AbortSignal.timeout(6000)
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.status === 'ok' && Array.isArray(fallbackData.items)) {
          parsedItems = fallbackData.items.map((it: any) => ({
            title: it.title || '',
            link: it.link || '',
            pubDate: it.pubDate || '',
            description: it.description || ''
          }));
        }
      } catch (err) {
        console.error('RSS fallback failed:', err);
      }
    }

    if (parsedItems.length === 0) {
      if (memoryCache && memoryCache.items.length > 0) {
        return NextResponse.json(memoryCache.items);
      }
      return NextResponse.json({ error: 'News feed is currently unavailable.' }, { status: 503 });
    }

    // Concurrently fetch the exact editorial photo for each article
    const enrichedItems = await Promise.all(
      parsedItems.map(async (item) => {
        const ogImage = await fetchOgImage(item.link);
        return {
          ...item,
          image: ogImage || undefined,
          thumbnail: ogImage || undefined
        };
      })
    );

    memoryCache = {
      timestamp: now,
      items: enrichedItems
    };

    return NextResponse.json(enrichedItems, {
      headers: { 'Cache-Control': 'public, s-maxage=45, stale-while-revalidate=90' }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
