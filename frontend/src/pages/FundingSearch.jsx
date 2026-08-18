import { useState, useEffect } from 'react';
import { Search, DollarSign, Building2, Calendar, Tag, Sparkles, MapPin, Hash, Filter } from 'lucide-react';
import client from '../api/client';

export default function FundingSearch() {
  const [area, setArea]       = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [searched, setSearched] = useState(false);

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

  const quickAreas = ['AI', 'Machine Learning', 'Robotics', 'Healthcare', 'NLP', 'Blockchain'];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero */}
      <div className="intel-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="intel-hero-content">
          <div className="intel-badge">
            <DollarSign size={12} />
            Funding Discovery
          </div>
          <h1>Funding Opportunities</h1>
          <p>Discover research grants and funding from government bodies and research organizations worldwide.</p>
        </div>
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
              style={{ height: '48px', fontSize: '0.9rem' }}
            />
          </div>
          <button id="funding-search-btn" type="submit" className="btn btn-primary" disabled={loading} style={{ height: '48px', paddingInline: '1.5rem' }}>
            {loading ? <span className="loading-spinner" /> : <Search size={16} />}
            {loading ? 'Searching…' : 'Search'}
          </button>
          {searched && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ height: '48px' }}
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
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        {quickAreas.map((a) => (
          <button
            key={a}
            className="keyword-tag size-sm"
            style={{ cursor: 'pointer' }}
            onClick={() => { setArea(a); }}
          >
            <Hash size={10} /> {a}
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
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))' }}>
              {results.map((f, i) => (
                <div key={i} id={`funding-${i}`} className="rec-card" style={{
                  animationDelay: `${i * 0.04}s`,
                  borderLeft: '3px solid var(--accent-warning)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div className="rec-title" style={{ paddingRight: '0.5rem' }}>
                      <DollarSign size={15} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-warning)', verticalAlign: -3 }} />
                      {f.Grant}
                    </div>
                    <span className="badge badge-green" style={{ flexShrink: 0, padding: '0.25rem 0.6rem', fontWeight: 700 }}>{f.Amount}</span>
                  </div>
                  <div className="rec-details" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div className="rec-detail-item">
                      <span className="rec-detail-label">Area</span>
                      <span className="rec-detail-value"><Tag size={12} style={{ display: 'inline', verticalAlign: -2, marginRight: 3 }} />{f.Area}</span>
                    </div>
                    <div className="rec-detail-item">
                      <span className="rec-detail-label">Agency</span>
                      <span className="rec-detail-value"><Building2 size={12} style={{ display: 'inline', verticalAlign: -2, marginRight: 3 }} />{f.Organization}</span>
                    </div>
                    {f.Deadline && (
                      <div className="rec-detail-item">
                        <span className="rec-detail-label">Deadline</span>
                        <span className="rec-detail-value"><Calendar size={12} style={{ display: 'inline', verticalAlign: -2, marginRight: 3 }} />{f.Deadline}</span>
                      </div>
                    )}
                    {f.Country && (
                      <div className="rec-detail-item">
                        <span className="rec-detail-label">Country</span>
                        <span className="rec-detail-value"><MapPin size={12} style={{ display: 'inline', verticalAlign: -2, marginRight: 3 }} />{f.Country}</span>
                      </div>
                    )}
                  </div>
                  {f.Description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '0.75rem' }}>
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
