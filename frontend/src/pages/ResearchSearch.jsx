import { useState } from 'react';
import { Search, BookOpen, ExternalLink, Users, Calendar, Sparkles, Hash, Eye } from 'lucide-react';
import client from '../api/client';

export default function ResearchSearch() {
  const [topic, setTopic]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError]     = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setError('');
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await client.get('/research/search', {
        params: { topic: topic.trim(), limit: 15 }
      });
      setResults(data.papers || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Search failed. Check if the backend is running.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const quickSearches = ['Machine Learning', 'Computer Vision', 'NLP', 'Quantum Computing', 'Bioinformatics', 'Cybersecurity'];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="intel-hero-content">
          <div className="intel-badge">
            <BookOpen size={12} />
            OpenAlex Integration
          </div>
          <h1>Research Papers</h1>
          <p>Search 250M+ academic papers via the OpenAlex API — discover groundbreaking research instantly.</p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} id="research-search-form">
        <div className="search-bar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              id="research-topic-input"
              type="text"
              placeholder="Search by topic, keyword, or author…"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ height: '48px', fontSize: '0.9rem' }}
            />
          </div>
          <button
            id="research-search-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading || !topic.trim()}
            style={{ height: '48px', paddingInline: '1.5rem' }}
          >
            {loading ? <span className="loading-spinner" /> : <Search size={16} />}
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {/* Quick Searches */}
      {!searched && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={12} /> Popular topics:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {quickSearches.map((q) => (
              <button
                key={q}
                className="keyword-tag size-md"
                onClick={() => { setTopic(q); }}
                style={{ cursor: 'pointer' }}
              >
                <Hash size={11} /> {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Fetching papers from OpenAlex…</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No papers found</h3>
          <p>Try a different keyword or broader topic</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <p style={{ fontSize: '0.85rem' }}>
              Found <strong style={{ color: 'var(--text-primary)' }}>{results.length}</strong> papers for "
              <strong style={{ color: 'var(--accent-primary)' }}>{topic}</strong>"
            </p>
            <span className="badge badge-green" style={{ padding: '0.3rem 0.7rem' }}>✓ Saved to DB</span>
          </div>

          <div className="results-grid">
            {results.map((paper, i) => (
              <div
                key={paper.id || i}
                className="result-card"
                id={`paper-${i}`}
                style={{
                  borderLeft: '3px solid var(--accent-primary)',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, var(--bg-card) 100%)',
                  animationDelay: `${i * 0.04}s`,
                  animation: 'fadeInUp 0.4s ease backwards',
                }}
              >
                <div className="result-title">
                  <BookOpen size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-primary)', opacity: 0.8 }} />
                  {paper.title}
                </div>
                <div className="result-meta">
                  {paper.publication_year && (
                    <span className="badge badge-purple">
                      <Calendar size={10} style={{ marginRight: '4px' }} />
                      {paper.publication_year}
                    </span>
                  )}
                  {paper.authors?.length > 0 && (
                    <span className="badge badge-cyan">
                      <Users size={10} style={{ marginRight: '4px' }} />
                      {(Array.isArray(paper.authors) ? paper.authors.slice(0,2).join(', ') : paper.authors?.split(',').slice(0,2).join(', '))}
                      {(Array.isArray(paper.authors) ? paper.authors.length : paper.authors?.split(',').length) > 2 ? ' +more' : ''}
                    </span>
                  )}
                  {paper.doi && (
                    <a
                      href={`https://doi.org/${paper.doi.replace('https://doi.org/', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="badge badge-green"
                      style={{ cursor: 'pointer' }}
                    >
                      <ExternalLink size={10} style={{ marginRight: '4px' }} />
                      DOI
                    </a>
                  )}
                </div>
                {paper.abstract && paper.abstract !== 'Abstract not available' && (
                  <p className="result-abstract">{paper.abstract}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
