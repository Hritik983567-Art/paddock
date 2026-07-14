'use client';

import React, { useState, useEffect } from 'react';
import { fetchF1News, NewsItem } from '../utils/api';

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNews = async () => {
    setLoading(true);
    setError('');
    try {
      const items = await fetchF1News();
      setNews(items);
    } catch (e: any) {
      setError(e.message || 'Couldn\'t load headlines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <section className="view" id="view-news">
      <div className="panel">
        <h2>F1 news</h2>
        <p className="sub">Pulled fresh each time you open or refresh this tab from a public F1 news feed.</p>
        
        <button 
          className="btn primary" 
          onClick={loadNews} 
          disabled={loading}
          style={{ marginBottom: '16px' }}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>

        {loading ? (
          <div className="loading">Fetching headlines…</div>
        ) : error ? (
          <div className="err">{error}</div>
        ) : (
          <div id="newsBody">
            {news.slice(0, 12).map((item, index) => {
              const date = new Date(item.pubDate);
              const img = item.thumbnail || item.enclosure?.link || '';
              const desc = (item.description || '').replace(/<[^>]+>/g, '').slice(0, 140);
              
              return (
                <div key={index} className="news-item">
                  {img && (
                    <img 
                      className="news-thumb" 
                      src={img} 
                      loading="lazy" 
                      alt="Thumbnail"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <div className="news-title">
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </div>
                    <div className="news-meta">
                      {isNaN(date.getTime()) ? '' : date.toLocaleDateString()} · RacingNews365
                    </div>
                    <div className="news-desc">
                      {desc}
                      {desc.length >= 140 ? '…' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
