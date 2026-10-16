'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchF1News, NewsItem } from '../utils/api';

type CategoryFilter = 'ALL' | 'F1' | 'DRIVERS' | 'TEAMS' | 'TECHNICAL' | 'FIA' | 'RACE WEEKEND';

interface EnrichedNewsItem extends NewsItem {
  id: string;
  category: CategoryFilter;
  formattedTime: string;
  clockTime: string;
  cleanSnippet: string;
  contextTag?: string;
  heroImage: string;
}

const CATEGORIES: CategoryFilter[] = ['ALL', 'F1', 'DRIVERS', 'TEAMS', 'TECHNICAL', 'FIA', 'RACE WEEKEND'];

const KNOWN_DRIVERS = [
  'Verstappen', 'Leclerc', 'Hamilton', 'Norris', 'Piastri', 'Lawson', 'Perez', 'Sainz',
  'Alonso', 'Russell', 'Gasly', 'Ocon', 'Albon', 'Tsunoda', 'Hulkenberg', 'Bearman',
  'Antonelli', 'Hadjar', 'Bortoleto', 'Colapinto', 'Doohan', 'Stroll', 'Herta'
];

const KNOWN_TEAMS = [
  'Red Bull', 'Ferrari', 'McLaren', 'Mercedes', 'Aston Martin', 'Alpine',
  'Williams', 'RB', 'Sauber', 'Haas', 'Cadillac', 'Audi'
];

function resolveNewsFallbackImage(title: string, description: string = '', category: CategoryFilter = 'ALL'): string {
  const text = `${title} ${description}`.toLowerCase();

  // 1. Feeder series / Juniors / F2
  if (/\b(colton|herta|f2|formula 2|junior|feeder|f3|indycar)\b/.test(text)) {
    return '/images/f2-bg.png';
  }

  // 2. Specific Drivers
  if (/\b(lawson|tsunoda|hadjar)\b/.test(text)) return '/images/racingbulls-bg.png';
  if (/\b(alonso|stroll|newey)\b/.test(text)) return '/images/aston-bg.png';
  if (/\b(albon|colapinto|vowles)\b/.test(text)) return '/images/williams-bg.png';
  if (/\b(hulkenberg|bortoleto|binotto)\b/.test(text)) return '/images/sauber-bg.png';
  if (/\b(gasly|doohan|briatore)\b/.test(text)) return '/images/alpine-bg.png';
  if (/\b(bearman|komatsu|ocon)\b/.test(text)) return '/images/haas-bg.png';
  if (/\b(norris|piastri|zak brown)\b/.test(text)) return '/images/mclaren-bg.png';
  if (/\b(russell|antonelli|toto wolff)\b/.test(text)) return '/images/mercedes-bg.png';
  if (/\b(hamilton|leclerc|vasseur|sainz)\b/.test(text)) return '/images/ferrari-bg.png';
  if (/\b(verstappen|horner|marko|perez)\b/.test(text)) return '/images/redbull-bg.png';

  // 3. Specific Teams
  if (/\b(racing bulls|vcarb|rb|toro rosso|alphatauri)\b/.test(text)) return '/images/racingbulls-bg.png';
  if (/\b(aston martin|aston)\b/.test(text)) return '/images/aston-bg.png';
  if (/\b(williams|grove)\b/.test(text)) return '/images/williams-bg.png';
  if (/\b(sauber|audi|stake|hinwil)\b/.test(text)) return '/images/sauber-bg.png';
  if (/\b(alpine|enstone)\b/.test(text)) return '/images/alpine-bg.png';
  if (/\b(haas|kannapolis)\b/.test(text)) return '/images/haas-bg.png';
  if (/\b(mclaren|papaya|woking)\b/.test(text)) return '/images/mclaren-bg.png';
  if (/\b(mercedes|silver arrows|brackley)\b/.test(text)) return '/images/mercedes-bg.png';
  if (/\b(ferrari|scuderia|maranello)\b/.test(text)) return '/images/ferrari-bg.png';
  if (/\b(red bull|redbull|milton keynes)\b/.test(text)) return '/images/redbull-bg.png';
  if (/\b(cadillac|andretti)\b/.test(text)) return '/images/f1-login-car.png';

  // 4. Specific Circuits
  if (/\b(monaco|monte carlo)\b/.test(text)) return '/images/mclaren-bg.png';
  if (/\b(monza|italian gp)\b/.test(text)) return '/images/circuits/monza/corners/curva-grande/01_curva_grande_sweeper.jpg';
  if (/\b(spa|francorchamps|belgian gp)\b/.test(text)) return '/images/mclaren-bg.png';
  if (/\b(silverstone|british gp)\b/.test(text)) return '/images/mclaren-bg.png';
  if (/\b(suzuka|japanese gp)\b/.test(text)) return '/images/mclaren-bg.png';
  if (/\b(albert park|melbourne|australian gp)\b/.test(text)) return '/images/mclaren-bg.png';
  if (/\b(bahrain|sakhir)\b/.test(text)) return '/images/mclaren-bg.png';
  if (/\b(jeddah|saudi)\b/.test(text)) return '/images/mclaren-bg.png';
  if (/\b(austin|cota|united states gp)\b/.test(text)) return '/images/mclaren-bg.png';

  // 5. Category-Specific Fallbacks
  if (category === 'TECHNICAL' || /\b(upgrade|sidepod|wing|aerodynamic|floor|suspension|power unit|engine|telemetry|setup)\b/.test(text)) {
    return '/images/checkered-bg.png';
  }
  if (category === 'FIA' || /\b(penalty|investigation|regulation|rule|stewards|budget cap|disqualified|scrutineering)\b/.test(text)) {
    return '/images/checkered-bg.png';
  }
  if (category === 'RACE WEEKEND' || /\b(grand prix|pole|sprint|grid|race weekend|calendar|schedule)\b/.test(text)) {
    return '/images/mclaren-bg.png';
  }

  return '/images/default-bg.png';
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [_lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [mobileTab, setMobileTab] = useState<'feed' | 'ticker'>('feed');

  // Live Auto-Sync interval (default 45s)
  const [autoSyncSecs, setAutoSyncSecs] = useState<number>(45);
  const [isAutoSyncActive, setIsAutoSyncActive] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(45);

  const loadNews = useCallback(async (forceRefresh = false, isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    } else {
      setIsSyncing(true);
    }
    setError('');
    try {
      const items = await fetchF1News(forceRefresh);
      setNews(items || []);
      setLastRefreshed(new Date());
    } catch (e: unknown) {
      if (!isBackground) {
        const err = e as Error;
        setError(err.message || "We couldn't retrieve the latest paddock updates.");
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadNews(false, false);
  }, [loadNews]);

  // Live Auto-Sync: regularly updates news and pictures in the background
  useEffect(() => {
    if (!isAutoSyncActive || autoSyncSecs <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadNews(true, true);
          return autoSyncSecs;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoSyncActive, autoSyncSecs, loadNews]);

  const enrichedNews: EnrichedNewsItem[] = useMemo(() => {
    return news.map((item, idx) => {
      const title = decodeHtmlEntities(item.title || '');
      const descRaw = item.description || '';
      const cleanSnippet = decodeHtmlEntities(descRaw.replace(/<[^>]+>/g, '').trim().slice(0, 160));
      const textBlock = `${title} ${cleanSnippet}`.toLowerCase();

      let category: CategoryFilter = 'F1';
      if (/aerodynamic|engine|sidepod|wing|floor|chassis|power unit|suspension|telemetry|setup|gearbox|upgrade|package|spec|technical/.test(textBlock)) {
        category = 'TECHNICAL';
      } else if (/fia|steward|penalty|regulation|rule|investigation|disqualified|fine|directive|scrutineering/.test(textBlock)) {
        category = 'FIA';
      } else if (/grand prix|gp|qualifying|sprint|pole|practice|fp1|fp2|fp3|podium|race|grid|pit stop|undercut|safety car/.test(textBlock)) {
        category = 'RACE WEEKEND';
      } else if (/driver|contract|seat|rookie|hamilton|verstappen|leclerc|norris|piastri|lawson|perez|sainz|alonso|russell|herta/.test(textBlock)) {
        category = 'DRIVERS';
      } else if (/team|constructor|pit wall|red bull|ferrari|mclaren|mercedes|aston martin|alpine|williams|haas|sauber|cadillac/.test(textBlock)) {
        category = 'TEAMS';
      }

      const matchedDriver = KNOWN_DRIVERS.find(d => new RegExp(`\\b${d}\\b`, 'i').test(title));
      const matchedTeam = KNOWN_TEAMS.find(t => new RegExp(`\\b${t}\\b`, 'i').test(title));
      let contextTag: string | undefined = undefined;
      if (matchedDriver && matchedTeam) {
        contextTag = `${matchedDriver.toUpperCase()} · ${matchedTeam.toUpperCase()}`;
      } else if (matchedDriver) {
        contextTag = `${matchedDriver.toUpperCase()}`;
      } else if (matchedTeam) {
        contextTag = `${matchedTeam.toUpperCase()}`;
      }

      const d = new Date(item.pubDate);
      const isValidDate = !isNaN(d.getTime());
      
      let formattedTime = 'Recently';
      let clockTime = '--:--';

      if (isValidDate) {
        clockTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) {
          formattedTime = `${Math.max(1, diffMins)}m ago`;
        } else if (diffHours < 24) {
          formattedTime = `${diffHours}h ago`;
        } else {
          formattedTime = `${diffDays}d ago`;
        }
      }

      // Always choose the most relatable high-res image
      const fallbackImage = resolveNewsFallbackImage(title, descRaw, category);
      const heroImage = item.image || item.thumbnail || item.enclosure?.link || fallbackImage;

      return {
        ...item,
        id: item.link || `news-${idx}`,
        category,
        formattedTime,
        clockTime,
        cleanSnippet: cleanSnippet ? `${cleanSnippet}${cleanSnippet.length >= 160 ? '…' : ''}` : 'Read full coverage on RacingNews365.',
        contextTag,
        heroImage
      };
    });
  }, [news]);

  const filteredNews = useMemo(() => {
    return enrichedNews.filter((item) => {
      const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.title.toLowerCase().includes(query) || 
        item.cleanSnippet.toLowerCase().includes(query) ||
        (item.contextTag && item.contextTag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [enrichedNews, activeCategory, searchQuery]);

  const featuredStory = filteredNews.length > 0 ? filteredNews[0] : null;
  const remainingNews = filteredNews.length > 0 ? filteredNews.slice(1) : [];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: enrichedNews.length };
    CATEGORIES.forEach(cat => {
      if (cat !== 'ALL') {
        counts[cat] = enrichedNews.filter(n => n.category === cat).length;
      }
    });
    return counts;
  }, [enrichedNews]);

  return (
    <section className="view w-full max-w-[1240px] mx-auto relative z-10 px-2 sm:px-4 lg:px-0" id="view-news">
      {/* 1. Header Section */}
      <div className="bg-[#0D1017] border border-[#232936] rounded-xl p-3.5 sm:p-5 lg:p-6 mb-4 sm:mb-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1">
              <span className="text-[#E10600] font-black tracking-tighter text-xs select-none">///</span>
              <span className="text-[10px] sm:text-[11px] font-display tracking-widest text-[#E10600] font-black uppercase">
                PADDOCK NEWS DESK
              </span>
            </span>
            <span className="text-slate-700 font-sans text-xs">•</span>
            <span className="text-[10px] sm:text-[11px] font-display text-slate-400 font-semibold uppercase tracking-wider">
              24/7 F1 INTELLIGENCE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight f1-text-gradient uppercase mb-0.5 sm:mb-1">
            PADDOCK NEWS
          </h1>
          <p className="text-xs sm:text-sm font-sans text-slate-400 max-w-xl leading-relaxed">
            Latest F1 stories, driver updates, technical developments &amp; race-weekend intelligence.
          </p>
        </div>

        {/* Live Auto-Sync Status & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Live Auto-Sync Status Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#34E4C8]/10 border border-[#34E4C8]/25 rounded-md px-2.5 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-mono text-[#34E4C8]">
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                isSyncing
                  ? 'bg-[#E8302A] shadow-[0_0_8px_#E8302A] animate-pulse'
                  : isAutoSyncActive
                  ? 'bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="font-bold tracking-wider">
              {isSyncing ? 'SYNCING…' : isAutoSyncActive ? `LIVE: ${countdown}s` : 'PAUSED'}
            </span>
          </div>

          {/* Sync Frequency Dropdown */}
          <select
            value={autoSyncSecs}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setAutoSyncSecs(val);
              setCountdown(val);
              setIsAutoSyncActive(val > 0);
            }}
            aria-label="Auto-update interval"
            className="bg-[#121620] border border-[#262C38] text-slate-300 text-[11px] sm:text-xs font-mono font-bold rounded-md px-2 py-1.5 sm:px-3 sm:py-2 outline-none cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option value={30}>30s</option>
            <option value={45}>45s (Fast)</option>
            <option value={60}>60s</option>
            <option value={90}>90s</option>
            <option value={0}>Manual</option>
          </select>

          {/* Manual Refresh Button */}
          <button
            onClick={() => {
              loadNews(true, false);
              setCountdown(autoSyncSecs);
            }}
            disabled={loading || isSyncing}
            aria-label="Refresh news feed"
            className="bg-[#1A202C] hover:bg-[#252D3D] border border-[#333B4D] text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={loading || isSyncing ? 'animate-spin' : ''}>↻</span>
            <span className="hidden sm:inline">{loading || isSyncing ? 'SYNCING' : 'REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="bg-[#1A080A] border border-[#E8302A] rounded-xl p-6 sm:p-8 text-center mb-6">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="font-display text-lg sm:text-xl text-white font-extrabold mb-1">
            NEWS FEED UNAVAILABLE
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm mb-4">
            We couldn&apos;t retrieve the latest paddock updates.
          </p>
          <button
            onClick={() => loadNews(true)}
            className="bg-[#E8302A] hover:bg-[#ff3b35] text-white px-5 py-2 rounded-md text-xs font-mono font-bold tracking-wider transition-all"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Filter Categories, Search Bar & Mobile Controls */}
      <div className="flex flex-col gap-3 mb-5 sm:mb-6">
        {/* Search Input Bar + View Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#34E4C8] text-sm pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search drivers, teams, upgrades, technical..."
              className="w-full h-10 sm:h-11 bg-[#0D1017] border border-[#262C38] focus:border-[#34E4C8]/50 rounded-lg pl-9 pr-9 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Switcher (Cards vs Compact) */}
          <div className="flex items-center bg-[#0D1017] border border-[#262C38] rounded-lg p-1 gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Magazine Cards"
              aria-label="Magazine Cards View"
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-[#E8302A] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⊞ <span className="hidden sm:inline ml-1">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              title="Compact Headlines"
              aria-label="Compact Headlines View"
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                viewMode === 'compact'
                  ? 'bg-[#E8302A] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ☰ <span className="hidden sm:inline ml-1">Compact</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono font-bold tracking-wider whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-[#E8302A] text-white border border-[#FF4D47] shadow-[0_0_12px_rgba(232,48,42,0.4)]'
                    : 'bg-[#0D1017] text-slate-300 border border-[#262C38] hover:border-slate-600'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-black/40 text-white' : 'bg-[#34E4C8]/10 text-[#34E4C8]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Tab Segment Selector (Only on mobile/tablet < lg to eliminate duplicate feed clutter) */}
        <div className="flex lg:hidden items-center bg-[#0D1017] border border-[#262C38] rounded-lg p-1 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setMobileTab('feed')}
            className={`flex-1 py-1.5 text-center rounded-md transition-all ${
              mobileTab === 'feed'
                ? 'bg-[#1A202C] text-white border border-[#333B4D]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📰 HEADLINES ({filteredNews.length})
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('ticker')}
            className={`flex-1 py-1.5 text-center rounded-md transition-all ${
              mobileTab === 'ticker'
                ? 'bg-[#1A202C] text-white border border-[#333B4D]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ LIVE TICKER ({Math.min(10, enrichedNews.length)})
          </button>
        </div>
      </div>

      {/* LOADING SKELETON STATE */}
      {loading && (
        <div className="flex flex-col gap-6">
          <div className="h-48 sm:h-72 bg-[#0D1017] rounded-xl border border-[#262C38] opacity-60 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-48 bg-[#0D1017] rounded-xl border border-[#262C38] opacity-50 animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {/* EMPTY SEARCH / NO STORIES STATE */}
      {!loading && !error && filteredNews.length === 0 && (
        <div className="bg-[#0D1017] border border-[#262C38] rounded-xl p-8 sm:p-12 text-center mb-6">
          <div className="text-3xl sm:text-4xl mb-3">🏎️</div>
          <h3 className="font-display text-lg sm:text-xl text-white font-extrabold mb-1">
            {searchQuery ? 'NO STORIES FOUND' : 'NO PADDOCK UPDATES'}
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm mb-4">
            {searchQuery
              ? 'Try another driver, team, race or keyword.'
              : 'There are currently no stories available in this category.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="bg-[#1A202C] hover:bg-[#252D3D] border border-[#333B4D] text-white px-4 py-2 rounded-md text-xs font-mono font-bold tracking-wider"
            >
              CLEAR SEARCH
            </button>
          )}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {!loading && !error && filteredNews.length > 0 && (
        <div className="flex flex-col gap-5 sm:gap-7">
          {/* FEATURED TOP STORY HERO BANNER (Shown in Feed mode) */}
          {featuredStory && mobileTab === 'feed' && (
            <div className="bg-[#0D1017] border border-[#262C38] rounded-xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 mb-2 sm:mb-3">
              {/* Featured Cover Image */}
              <div className="lg:col-span-7 relative h-48 sm:h-64 lg:h-auto min-h-[200px] lg:min-h-[340px] overflow-hidden bg-[#05070a]">
                <img
                  src={featuredStory.heroImage}
                  alt={featuredStory.title}
                  className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallback = resolveNewsFallbackImage(
                      featuredStory.title,
                      featuredStory.cleanSnippet,
                      featuredStory.category
                    );
                    if (!target.src.includes(fallback) && fallback !== '/images/default-bg.png') {
                      target.src = fallback;
                    } else {
                      target.onerror = null;
                      target.src = '/images/default-bg.png';
                    }
                  }}
                />

                {/* Category Pill */}
                <div className="absolute top-3 left-3 bg-[#E8302A] text-white px-2.5 py-1 rounded text-[10px] sm:text-xs font-mono font-black tracking-wider shadow-lg">
                  ⚡ FEATURED // {featuredStory.category}
                </div>
              </div>

              {/* Featured Details Content */}
              <div className="lg:col-span-5 p-4 sm:p-6 lg:p-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#262C38] bg-[#0D1017]">
                <div>
                  {featuredStory.contextTag && (
                    <div className="text-[10px] sm:text-[11px] font-mono text-[#34E4C8] font-bold tracking-wider mb-1.5">
                      {featuredStory.contextTag}
                    </div>
                  )}

                  <h2 className="font-display text-base sm:text-xl lg:text-2xl font-extrabold leading-snug text-white mb-2 line-clamp-3">
                    <a
                      href={featuredStory.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#34E4C8] transition-colors"
                    >
                      {featuredStory.title}
                    </a>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed mb-4 font-normal">
                    {featuredStory.cleanSnippet}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <span className="font-mono text-slate-400 text-[11px] sm:text-xs">
                    RacingNews365 · {featuredStory.formattedTime}
                  </span>

                  <a
                    href={featuredStory.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#E8302A] hover:bg-[#ff3b35] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-xs font-mono font-bold tracking-wider transition-all shadow-md"
                  >
                    <span>READ STORY</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* MAIN GRID & LATEST UPDATES SIDEBAR ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 sm:gap-7 items-start">
            {/* NEWS CARDS OR COMPACT LIST FEED */}
            <div className={mobileTab === 'ticker' ? 'hidden lg:block' : 'block'}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-xs sm:text-[13px] text-[#34E4C8] font-bold font-mono tracking-wider flex items-center gap-2">
                  <span>PADDOCK HEADLINES</span>
                  <span className="text-slate-500 font-normal">({remainingNews.length})</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Mode: <span className="text-white font-bold capitalize">{viewMode}</span>
                </div>
              </div>

              {viewMode === 'cards' ? (
                /* MAGAZINE CARDS VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {remainingNews.map((item) => (
                    <article
                      key={item.id}
                      className="bg-[#0D1017] border border-[#262C38] hover:border-slate-600 rounded-xl overflow-hidden flex flex-col justify-between shadow-lg transition-all hover:-translate-y-0.5 group"
                    >
                      <div>
                        {/* Cover Image Thumbnail */}
                        <div className="h-36 sm:h-44 overflow-hidden relative bg-[#05070a]">
                          <img
                            src={item.heroImage}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const fallback = resolveNewsFallbackImage(
                                item.title,
                                item.cleanSnippet,
                                item.category
                              );
                              if (
                                !target.src.includes(fallback) &&
                                fallback !== '/images/default-bg.png'
                              ) {
                                target.src = fallback;
                              } else {
                                target.onerror = null;
                                target.src = '/images/default-bg.png';
                              }
                            }}
                          />

                          {/* Category Badge */}
                          <span className="absolute bottom-2 left-2 bg-[#080A0F]/90 border border-[#262C38] text-[#34E4C8] px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider backdrop-blur-sm">
                            {item.category}
                          </span>
                        </div>

                        {/* Content Details */}
                        <div className="p-3 sm:p-4 bg-[#0D1017]">
                          {item.contextTag && (
                            <div className="text-[10px] sm:text-[11px] font-mono text-[#34E4C8] font-bold tracking-wider mb-1 truncate">
                              {item.contextTag}
                            </div>
                          )}

                          <h3 className="font-display text-xs sm:text-base font-bold text-white line-clamp-2 leading-snug mb-1.5 group-hover:text-[#34E4C8] transition-colors">
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                              {item.title}
                            </a>
                          </h3>

                          <p className="text-slate-300 text-xs sm:text-[13px] line-clamp-2 leading-relaxed font-normal">
                            {item.cleanSnippet}
                          </p>
                        </div>
                      </div>

                      {/* Footer Source & Read Action */}
                      <div className="px-3 py-2 sm:px-4 sm:py-2.5 border-t border-[#262C38] flex items-center justify-between bg-[#121620] text-[11px] sm:text-xs">
                        <span className="font-mono text-slate-400">
                          RacingNews365 · {item.formattedTime}
                        </span>

                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono font-bold text-[#34E4C8] hover:underline flex items-center gap-1"
                        >
                          <span>OPEN</span>
                          <span>→</span>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                /* COMPACT LIST VIEW - ULTRA CRISP & FAST ON MOBILE */
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  {remainingNews.map((item) => (
                    <article
                      key={item.id}
                      className="bg-[#0D1017] border border-[#262C38] hover:border-slate-600 rounded-xl p-2.5 sm:p-3.5 flex items-start gap-3 transition-all hover:bg-[#121620] shadow-md group"
                    >
                      <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#05070a] relative">
                        <img
                          src={item.heroImage}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallback = resolveNewsFallbackImage(
                              item.title,
                              item.cleanSnippet,
                              item.category
                            );
                            if (
                              !target.src.includes(fallback) &&
                              fallback !== '/images/default-bg.png'
                            ) {
                              target.src = fallback;
                            } else {
                              target.onerror = null;
                              target.src = '/images/default-bg.png';
                            }
                          }}
                        />
                        <span className="absolute bottom-1 left-1 bg-black/85 text-[#34E4C8] text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                          {item.category}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                        <div>
                          {item.contextTag && (
                            <div className="text-[10px] font-mono text-[#34E4C8] font-bold tracking-wider mb-0.5 truncate">
                              {item.contextTag}
                            </div>
                          )}

                          <h3 className="font-display text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#34E4C8] transition-colors">
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                              {item.title}
                            </a>
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 text-[10px] sm:text-[11px] font-mono text-slate-400">
                          <span>RacingNews365 · {item.formattedTime}</span>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#34E4C8] font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>READ</span>
                            <span>→</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* LATEST UPDATES TICKER SIDEBAR */}
            {remainingNews.length > 0 && (
              <div className={`lg:sticky lg:top-4 ${mobileTab === 'feed' ? 'hidden lg:block' : 'block'}`}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-xs sm:text-[13px] text-[#34E4C8] font-bold font-mono tracking-wider flex items-center gap-1.5">
                    <span>⚡ LATEST UPDATES</span>
                    <span className="text-slate-500 font-normal">
                      ({Math.min(10, enrichedNews.length)})
                    </span>
                  </div>

                  {/* On mobile, allow quick jump back to headlines */}
                  <button
                    type="button"
                    onClick={() => setMobileTab('feed')}
                    className="lg:hidden text-xs font-mono text-[#34E4C8] hover:underline"
                  >
                    ← Back to Headlines
                  </button>
                </div>

                <div className="bg-[#0D1017] border border-[#262C38] rounded-xl p-3 sm:p-4 flex flex-col gap-2.5 sm:gap-3 shadow-xl">
                  {enrichedNews.slice(0, 10).map((item) => (
                    <div
                      key={`ticker-${item.id}`}
                      className="pb-2.5 border-b border-[#1C222E] last:border-b-0 last:pb-0 flex flex-col gap-1 group"
                    >
                      <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                        <span className="text-slate-500 font-semibold">{item.clockTime}</span>
                        <span className="text-[#34E4C8] bg-[#34E4C8]/10 px-1.5 py-0.2 rounded font-bold">
                          {item.category}
                        </span>
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white group-hover:text-[#34E4C8] transition-colors text-xs sm:text-[13px] font-bold leading-snug font-display line-clamp-2"
                      >
                        {item.title}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
