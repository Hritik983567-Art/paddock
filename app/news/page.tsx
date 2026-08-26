'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  'Antonelli', 'Hadjar', 'Bortoleto', 'Colapinto', 'Doohan', 'Stroll'
];

const KNOWN_TEAMS = [
  'Red Bull', 'Ferrari', 'McLaren', 'Mercedes', 'Aston Martin', 'Alpine',
  'Williams', 'RB', 'Sauber', 'Haas', 'Cadillac', 'Audi'
];

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  TECHNICAL: '/images/mercedes-bg.png',
  TEAMS: '/images/redbull-bg.png',
  DRIVERS: '/images/ferrari-bg.png',
  FIA: '/images/aston-bg.png',
  'RACE WEEKEND': '/images/mclaren-bg.png',
  F1: '/images/default-bg.png',
  ALL: '/images/default-bg.png',
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const loadNews = async () => {
    setLoading(true);
    setError('');
    try {
      const items = await fetchF1News();
      setNews(items || []);
      setLastRefreshed(new Date());
    } catch (e: any) {
      setError(e.message || "We couldn't retrieve the latest paddock updates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const enrichedNews: EnrichedNewsItem[] = useMemo(() => {
    return news.map((item, idx) => {
      const title = item.title || '';
      const descRaw = item.description || '';
      const cleanSnippet = descRaw.replace(/<[^>]+>/g, '').trim().slice(0, 160);
      const textBlock = `${title} ${cleanSnippet}`.toLowerCase();

      let category: CategoryFilter = 'F1';
      if (/aerodynamic|engine|sidepod|wing|floor|chassis|power unit|suspension|telemetry|setup|gearbox|upgrade|package|spec|technical/.test(textBlock)) {
        category = 'TECHNICAL';
      } else if (/fia|steward|penalty|regulation|rule|investigation|disqualified|fine|directive|scrutineering/.test(textBlock)) {
        category = 'FIA';
      } else if (/grand prix|gp|qualifying|sprint|pole|practice|fp1|fp2|fp3|podium|race|grid|pit stop|undercut|safety car/.test(textBlock)) {
        category = 'RACE WEEKEND';
      } else if (/driver|contract|seat|rookie|hamilton|verstappen|leclerc|norris|piastri|lawson|perez|sainz|alonso|russell/.test(textBlock)) {
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

      const heroImage = item.thumbnail || item.enclosure?.link || CATEGORY_FALLBACK_IMAGES[category] || '/images/default-bg.png';

      return {
        ...item,
        id: item.link || `news-${idx}`,
        category,
        formattedTime,
        clockTime,
        cleanSnippet: cleanSnippet ? `${cleanSnippet}${cleanSnippet.length >= 160 ? '…' : ''}` : 'Read full coverage on RacingNews365.',
        contextTag,
        heroImage,
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
    <section className="view" id="view-news" style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
      
      {/* 1. Header Section */}
      <div style={{
        background: '#0D1017',
        border: '1px solid #232936',
        borderRadius: '12px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.75)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#34E4C8', fontWeight: '800', fontSize: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34E4C8', display: 'inline-block', boxShadow: '0 0 10px #34E4C8' }}></span>
            <span>PADDOCK // NEWS DESK</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: '800',
            letterSpacing: '1px',
            margin: '0 0 6px 0',
            color: '#FFFFFF',
            textTransform: 'uppercase'
          }}>
            PADDOCK NEWS
          </h1>
          <p style={{ margin: 0, color: '#E2E8F0', fontSize: '15px', maxWidth: '640px', lineHeight: '1.5', fontWeight: '500' }}>
            Latest F1 stories, driver updates, team developments &amp; race-weekend news
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastRefreshed && (
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#CBD5E1', fontWeight: '600' }}>
              UPDATED {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={loadNews}
            disabled={loading}
            style={{
              background: '#1A202C',
              border: '1px solid #333B4D',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}
          >
            <span>{loading ? '↻ REFRESHING…' : '↻ REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && !loading && (
        <div style={{
          background: '#1A080A',
          border: '1px solid #E8302A',
          borderRadius: '12px',
          padding: '32px 24px',
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#FFFFFF', margin: '0 0 8px 0', fontWeight: '800' }}>
            NEWS FEED UNAVAILABLE
          </h3>
          <p style={{ color: '#F1F5F9', fontSize: '14.5px', margin: '0 0 20px 0' }}>
            We couldn&apos;t retrieve the latest paddock updates.
          </p>
          <button
            onClick={loadNews}
            style={{
              background: '#E8302A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 24px',
              fontWeight: '800',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer'
            }}
          >
            RETRY
          </button>
        </div>
      )}

      {/* 3. Filter Categories & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
        
        {/* Search Input Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#34E4C8',
            fontSize: '16px',
            pointerEvents: 'none'
          }}>
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drivers, teams, races..."
            style={{
              width: '100%',
              height: '48px',
              background: '#0D1017',
              border: '1px solid #262C38',
              borderRadius: '8px',
              padding: '0 42px 0 46px',
              color: '#FFFFFF',
              fontSize: '14.5px',
              fontWeight: '500',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#CBD5E1',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Horizontal Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '6px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: isActive ? '#E8302A' : '#0D1017',
                  color: '#FFFFFF',
                  border: isActive ? '1px solid #FF4D47' : '1px solid #262C38',
                  borderRadius: '6px',
                  padding: '9px 18px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '800',
                  letterSpacing: '0.8px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isActive ? '0 0 16px rgba(232, 48, 42, 0.6)' : '0 2px 8px rgba(0,0,0,0.4)'
                }}
              >
                <span>{cat}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: isActive ? '#FFFFFF' : '#34E4C8',
                  background: isActive ? 'rgba(0,0,0,0.35)' : 'rgba(52, 228, 200, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: isActive ? 'none' : '1px solid rgba(52, 228, 200, 0.3)'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. LOADING SKELETON STATE */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{
            height: '320px',
            background: '#0D1017',
            borderRadius: '12px',
            border: '1px solid #262C38',
            opacity: 0.6,
            animation: 'pulse 1.5s infinite ease-in-out'
          }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} style={{
                height: '240px',
                background: '#0D1017',
                borderRadius: '10px',
                border: '1px solid #262C38',
                opacity: 0.5,
                animation: 'pulse 1.5s infinite ease-in-out'
              }}></div>
            ))}
          </div>
        </div>
      )}

      {/* 10. EMPTY SEARCH / NO STORIES STATE */}
      {!loading && !error && filteredNews.length === 0 && (
        <div style={{
          background: '#0D1017',
          border: '1px solid #262C38',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏎️</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#FFFFFF', margin: '0 0 8px 0', fontWeight: '800' }}>
            {searchQuery ? 'NO STORIES FOUND' : 'NO PADDOCK UPDATES'}
          </h3>
          <p style={{ color: '#E2E8F0', fontSize: '15px', margin: '0 0 20px 0' }}>
            {searchQuery
              ? 'Try another driver, team, race or keyword.'
              : 'There are currently no stories available in this category.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: '#1A202C',
                border: '1px solid #333B4D',
                color: '#FFFFFF',
                borderRadius: '6px',
                padding: '10px 22px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              CLEAR SEARCH
            </button>
          )}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {!loading && !error && filteredNews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* 2. FEATURED TOP STORY HERO BANNER */}
          {featuredStory && (
            <div style={{
              background: '#0D1017',
              border: '1px solid #262C38',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 25px rgba(232, 48, 42, 0.25)',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)',
              gap: 0
            }} className="news-hero-card">
              
              {/* Featured Cover Image */}
              <div style={{ position: 'relative', minHeight: '320px', overflow: 'hidden', background: '#05070a' }}>
                <img
                  src={featuredStory.heroImage}
                  alt={featuredStory.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    filter: 'brightness(0.95) contrast(1.1)'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-bg.png';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  background: '#E8302A',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                }}>
                  ⚡ FEATURED // {featuredStory.category}
                </div>
              </div>

              {/* Featured Details Content Container (Opaque Dark Background) */}
              <div style={{
                background: '#0D1017',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '1px solid #262C38'
              }}>
                <div>
                  {featuredStory.contextTag && (
                    <div style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: '#34E4C8',
                      letterSpacing: '1.5px',
                      marginBottom: '10px',
                      fontWeight: '800'
                    }}>
                      {featuredStory.contextTag}
                    </div>
                  )}

                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '28px',
                    fontWeight: '800',
                    lineHeight: '1.25',
                    color: '#FFFFFF',
                    margin: '0 0 14px 0'
                  }}>
                    <a
                      href={featuredStory.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#FFFFFF', textDecoration: 'none' }}
                    >
                      {featuredStory.title}
                    </a>
                  </h2>

                  <p style={{
                    color: '#E2E8F0',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    margin: '0 0 24px 0',
                    fontWeight: '500'
                  }}>
                    {featuredStory.cleanSnippet}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '18px',
                  borderTop: '1px dashed #262C38'
                }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#CBD5E1', fontWeight: '600' }}>
                    RacingNews365 · {featuredStory.formattedTime}
                  </span>

                  <a
                    href={featuredStory.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#E8302A',
                      color: '#FFFFFF',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: '800',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 14px rgba(232, 48, 42, 0.4)'
                    }}
                  >
                    <span>READ STORY</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* MAIN GRID & LATEST UPDATES SIDEBAR ROW */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: remainingNews.length > 0 ? 'minmax(0, 1fr) 340px' : '1fr',
            gap: '28px'
          }} className="news-content-layout">

            {/* 4. NEWS CARDS GRID */}
            <div>
              <div style={{ marginBottom: '14px', fontSize: '12px', color: '#34E4C8', fontWeight: '800', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                PADDOCK HEADLINES ({remainingNews.length})
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {remainingNews.map((item) => (
                  <article
                    key={item.id}
                    style={{
                      background: '#0D1017',
                      border: '1px solid #262C38',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    className="paddock-news-card"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div style={{ height: '170px', overflow: 'hidden', position: 'relative', background: '#05070a' }}>
                        <img
                          src={item.heroImage}
                          alt={item.title}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-bg.png';
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          background: '#080A0F',
                          border: '1px solid #262C38',
                          color: '#34E4C8',
                          padding: '3px 9px',
                          borderRadius: '4px',
                          fontSize: '10.5px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800'
                        }}>
                          {item.category}
                        </span>
                      </div>

                      {/* Content Details */}
                      <div style={{ padding: '18px 20px 14px', background: '#0D1017' }}>
                        {item.contextTag && (
                          <div style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            color: '#34E4C8',
                            marginBottom: '6px',
                            fontWeight: '800'
                          }}>
                            {item.contextTag}
                          </div>
                        )}

                        <h3 style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '18px',
                          fontWeight: '800',
                          lineHeight: '1.3',
                          color: '#FFFFFF',
                          margin: '0 0 10px 0'
                        }}>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#FFFFFF', textDecoration: 'none' }}
                          >
                            {item.title}
                          </a>
                        </h3>

                        <p style={{
                          color: '#CBD5E1',
                          fontSize: '13.5px',
                          lineHeight: '1.55',
                          margin: 0,
                          fontWeight: '500'
                        }}>
                          {item.cleanSnippet}
                        </p>
                      </div>
                    </div>

                    {/* Footer Source & Read Action */}
                    <div style={{
                      padding: '14px 20px',
                      borderTop: '1px solid #262C38',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#121620'
                    }}>
                      <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: '#CBD5E1', fontWeight: '600' }}>
                        RacingNews365 · {item.formattedTime}
                      </span>

                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800',
                          color: '#34E4C8',
                          textDecoration: 'none'
                        }}
                      >
                        OPEN →
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* 5. LATEST UPDATES TICKER SIDEBAR */}
            {remainingNews.length > 0 && (
              <div>
                <div style={{ marginBottom: '14px', fontSize: '12px', color: '#34E4C8', fontWeight: '800', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                  ⚡ LATEST UPDATES
                </div>

                <div style={{
                  background: '#0D1017',
                  border: '1px solid #262C38',
                  borderRadius: '10px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}>
                  {enrichedNews.slice(0, 10).map((item) => (
                    <div
                      key={`ticker-${item.id}`}
                      style={{
                        paddingBottom: '14px',
                        borderBottom: '1px dashed #262C38',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10.5px', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: '#FF4D47', fontWeight: '800' }}>{item.clockTime}</span>
                        <span style={{
                          background: 'rgba(52, 228, 200, 0.15)',
                          color: '#34E4C8',
                          padding: '2px 7px',
                          borderRadius: '3px',
                          fontWeight: '800',
                          border: '1px solid rgba(52, 228, 200, 0.3)'
                        }}>
                          {item.category}
                        </span>
                      </div>

                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '13.5px',
                          fontWeight: '700',
                          color: '#FFFFFF',
                          textDecoration: 'none',
                          lineHeight: '1.35',
                          transition: 'color 0.2s ease'
                        }}
                        className="ticker-headline"
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

      {/* Inline Responsive & Hover Styles */}
      <style jsx global>{`
        .paddock-news-card:hover {
          border-color: #34E4C8 !important;
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(52, 228, 200, 0.25) !important;
        }

        .ticker-headline:hover {
          color: #34E4C8 !important;
        }

        @media (max-width: 900px) {
          .news-hero-card {
            grid-template-columns: 1fr !important;
          }
          .news-content-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
