import { useState, useEffect } from 'react';
import { Search, DollarSign, Building2, Calendar, Tag } from 'lucide-react';
import client from '../api/client';

export default function FundingSearch() {
  const [area, setArea]       = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [searched, setSearched] = useState(false);

  // Load all funding on mount
  useEffect(() => {
    setLoading(true);
    client.get('/funding/')
      .then(r => setResults(r.data.funding_opportunities || []))
      .catch(() => setError('Failed to load funding data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSearched(true);
    setLoading(true);
    try {
      const params = area.trim() ? { area: area.trim() } : {};
      const { data } = await client.get('/funding/', { params });
      setResults(data.funding_opportunities || []);
    } catch (err) {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const areaColors = {
    AI: 'badge-purple', Robotics: 'badge-cyan', Healthcare: 'badge-green',
    'Machine Learning': 'badge-purple', 'Quantum Computing': 'badge-cyan',
    NLP: 'badge-amber', Cybersecurity: 'badge-red', Energy: 'badge-green',
    Bioinformatics: 'badge-green', Blockchain: 'badge-amber',
    'Education Technology': 'badge-cyan', IoT: 'badge-purple'
  };

  const getBadgeClass = (area) => areaColors[area] || 'badge-purple';

  const quickAreas = ['AI', 'Machine Learning', 'Robotics', 'Healthcare', 'NLP', 'Energy'];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <h1>Funding Opportunities</h1>
        <p>Discover research grants and funding from government bodies and research organizations</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} id="funding-search-form">
        <div className="search-bar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              id="funding-area-input"
              type="text"
              placeholder="Search by research area (e.g., AI, Robotics, Healthcare)…"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
          <button
            id="funding-search-btn"
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
                setArea('');
                setSearched(false);
                setLoading(true);
                client.get('/funding/').then(r => setResults(r.data.funding_opportunities || [])).finally(() => setLoading(false));
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Quick filters */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {quickAreas.map((a) => (
          <button
            key={a}
            className="btn btn-ghost"
            style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}
            onClick={() => { setArea(a); }}
          >
            {a}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Loading funding opportunities…</p>
        </div>
      )}

      {!loading && (
        <>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{results.length}</strong> opportunities
            {area && <> for "<strong style={{ color: 'var(--accent-primary)' }}>{area}</strong>"</>}
          </p>

          {results.length === 0 && !error ? (
            <div className="empty-state">
              <div className="empty-state-icon">💸</div>
              <h3>No funding found</h3>
              <p>Try a broader search term</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
              {results.map((f, i) => (
                <div key={i} id={`funding-${i}`} className="result-card" style={{
                  borderLeft: '3px solid var(--accent-warning)',
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, var(--bg-card) 100%)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div className="result-title" style={{ flex: 1 }}>
                      <DollarSign size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-warning)' }} />
                      {f.Grant}
                    </div>
                    <span className="badge badge-green" style={{ marginLeft: '0.5rem', flexShrink: 0 }}>{f.Amount}</span>
                  </div>
                  <div className="result-meta">
                    <span className={`badge ${getBadgeClass(f.Area)}`}>
                      <Tag size={10} style={{ marginRight: '4px' }} />
                      {f.Area}
                    </span>
                    <span className="badge badge-cyan">
                      <Building2 size={10} style={{ marginRight: '4px' }} />
                      {f.Organization}
                    </span>
                    {f.Deadline && (
                      <span className="badge badge-amber">
                        <Calendar size={10} style={{ marginRight: '4px' }} />
                        {f.Deadline}
                      </span>
                    )}
                  </div>
                  {f.Description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '0.5rem' }}>
                      {f.Description}
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
