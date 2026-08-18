import { useState, useEffect } from 'react';
import { Search, Award, User, Calendar, Cpu, Sparkles, Hash, Filter, Shield } from 'lucide-react';
import client from '../api/client';

export default function PatentSearch() {
  const [tech, setTech]       = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setLoading(true);
    client.get('/patents/')
      .then(r => setResults(r.data.patents || []))
      .catch(() => setError('Failed to load patent data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSearched(true);
    setLoading(true);
    try {
      const params = tech.trim() ? { technology: tech.trim() } : {};
      const { data } = await client.get('/patents/', { params });
      setResults(data.patents || []);
    } catch (err) {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const quickTechs = ['Healthcare AI', 'Robotics', 'NLP', 'Computer Vision', 'Quantum Computing', 'Blockchain'];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="intel-hero-content">
          <div className="intel-badge">
            <Shield size={12} />
            Patent Database
          </div>
          <h1>Patent Search</h1>
          <p>Explore technology patents across AI, robotics, healthcare, and more — powered by our curated dataset.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} id="patent-search-form">
        <div className="search-bar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              id="patent-tech-input"
              type="text"
              placeholder="Search by technology, title, or keyword…"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
              style={{ height: '48px', fontSize: '0.9rem' }}
            />
          </div>
          <button id="patent-search-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ height: '48px', paddingInline: '1.5rem' }}>
            {loading ? <span className="loading-spinner" /> : <Search size={16} />}
            {loading ? 'Searching…' : 'Search'}
          </button>
          {searched && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ height: '48px' }}
              onClick={() => {
                setTech('');
                setSearched(false);
                setLoading(true);
                client.get('/patents/').then(r => setResults(r.data.patents || [])).finally(() => setLoading(false));
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Quick filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        {quickTechs.map((t) => (
          <button
            key={t}
            className="keyword-tag size-sm"
            style={{ cursor: 'pointer' }}
            onClick={() => setTech(t)}
          >
            <Cpu size={10} /> {t}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Loading patents…</p>
        </div>
      )}

      {!loading && (
        <>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{results.length}</strong> patents
            {tech && <> matching "<strong style={{ color: 'var(--accent-tertiary)' }}>{tech}</strong>"</>}
          </p>

          {results.length === 0 && !error ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏆</div>
              <h3>No patents found</h3>
              <p>Try searching for a different technology</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
              {results.map((p, i) => (
                <div key={i} id={`patent-${i}`} className="rec-card" style={{
                  animationDelay: `${i * 0.04}s`,
                  borderLeft: '3px solid var(--accent-tertiary)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div className="rec-title" style={{ paddingRight: '0.5rem' }}>
                      <Award size={15} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-tertiary)', verticalAlign: -3 }} />
                      {p.Title}
                    </div>
                    <span className="badge badge-purple" style={{ flexShrink: 0 }}>{p['Patent ID']}</span>
                  </div>
                  <div className="rec-details" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div className="rec-detail-item">
                      <span className="rec-detail-label">Technology</span>
                      <span className="rec-detail-value"><Cpu size={12} style={{ display: 'inline', verticalAlign: -2, marginRight: 3 }} />{p.Technology}</span>
                    </div>
                    <div className="rec-detail-item">
                      <span className="rec-detail-label">Inventor</span>
                      <span className="rec-detail-value"><User size={12} style={{ display: 'inline', verticalAlign: -2, marginRight: 3 }} />{p.Inventor}</span>
                    </div>
                    {p.Assignee && (
                      <div className="rec-detail-item">
                        <span className="rec-detail-label">Assignee</span>
                        <span className="rec-detail-value">{p.Assignee}</span>
                      </div>
                    )}
                    {p.Country && (
                      <div className="rec-detail-item">
                        <span className="rec-detail-label">Country</span>
                        <span className="rec-detail-value">{p.Country}</span>
                      </div>
                    )}
                    {p['Filing Date'] && (
                      <div className="rec-detail-item">
                        <span className="rec-detail-label">Filed</span>
                        <span className="rec-detail-value"><Calendar size={12} style={{ display: 'inline', verticalAlign: -2, marginRight: 3 }} />{p['Filing Date']}</span>
                      </div>
                    )}
                    {p.Citations !== undefined && p.Citations !== '' && (
                      <div className="rec-detail-item">
                        <span className="rec-detail-label">Citations</span>
                        <span className="rec-detail-value" style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{p.Citations}</span>
                      </div>
                    )}
                  </div>
                  {p.Abstract && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '0.75rem' }}>
                      {p.Abstract}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
