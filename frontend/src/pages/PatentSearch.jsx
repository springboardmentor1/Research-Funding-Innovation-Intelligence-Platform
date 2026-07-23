import { useState, useEffect } from 'react';
import { Search, Award, User, Calendar, Cpu } from 'lucide-react';
import client from '../api/client';

export default function PatentSearch() {
  const [tech, setTech]       = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [searched, setSearched] = useState(false);

  // Load all patents on mount
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
      <div className="page-header">
        <h1>Patent Search</h1>
        <p>Explore technology patents across AI, robotics, healthcare, and more</p>
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
            />
          </div>
          <button
            id="patent-search-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <span className="loading-spinner" /> : <Search size={16} />}
            {loading ? 'Searching…' : 'Search'}
          </button>
          {searched && (
            <button
              type="button"
              className="btn btn-secondary"
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
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {quickTechs.map((t) => (
          <button
            key={t}
            className="btn btn-ghost"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
            onClick={() => setTech(t)}
          >
            {t}
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
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
              {results.map((p, i) => (
                <div key={i} id={`patent-${i}`} className="result-card" style={{
                  borderLeft: '3px solid var(--accent-tertiary)',
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, var(--bg-card) 100%)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div className="result-title" style={{ flex: 1 }}>
                      <Award size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-tertiary)' }} />
                      {p.Title}
                    </div>
                    <span className="badge badge-purple" style={{ marginLeft: '0.5rem', flexShrink: 0 }}>{p['Patent ID']}</span>
                  </div>
                  <div className="result-meta">
                    <span className="badge badge-cyan">
                      <Cpu size={10} style={{ marginRight: '4px' }} />
                      {p.Technology}
                    </span>
                    <span className="badge badge-amber">
                      <User size={10} style={{ marginRight: '4px' }} />
                      {p.Inventor}
                    </span>
                    {p.Year && (
                      <span className="badge badge-green">
                        <Calendar size={10} style={{ marginRight: '4px' }} />
                        {p.Year}
                      </span>
                    )}
                  </div>
                  {p.Abstract && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '0.5rem' }}>
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
