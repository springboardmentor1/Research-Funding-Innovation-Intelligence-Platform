import { useState, useEffect } from 'react';
import { User, Save, CheckCircle, Sparkles, GraduationCap, MapPin, Building2, Hash, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../api/client';

const RESEARCH_AREAS = [
  'Artificial Intelligence', 'Machine Learning', 'Deep Learning',
  'Computer Vision', 'Natural Language Processing', 'Robotics',
  'Bioinformatics', 'Quantum Computing', 'Cybersecurity',
  'Data Science', 'IoT', 'Blockchain', 'Healthcare AI',
  'Energy AI', 'Education Technology'
];

export default function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm]       = useState({
    name: '', university: '', department: '',
    research_interests: '', keywords: '', research_area: '',
    academic_history: '', publications_json: '', patents_json: ''
  });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!user.id) { setFetching(false); return; }
    client.get(`/profile/${user.id}`)
      .then(r => {
        const p = r.data;
        setForm({
          name:               p.name || '',
          university:         p.university || '',
          department:         p.department || '',
          research_interests: p.research_interests || '',
          keywords:           p.keywords || '',
          research_area:      p.research_area || '',
          academic_history:   p.academic_history || '',
          publications_json:  p.publications_json || '',
          patents_json:       p.patents_json || ''
        });
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.university || !form.research_area) {
      setError('Name, University, and Research Area are required.');
      return;
    }
    setLoading(true);
    try {
      await client.post('/profile/', { ...form, user_id: user.id });
      setSaved(true);
      toast.success('Profile saved successfully! 🎓');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const completionPct = [form.name, form.university, form.department, form.research_area, form.research_interests, form.keywords]
    .filter(Boolean).length / 6 * 100;

  if (fetching) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Loading profile…</p>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '780px' }}>
      {/* Hero */}
      <div className="intel-hero" style={{ marginBottom: '1.5rem' }}>
        <div className="intel-hero-content">
          <div className="intel-badge">
            <GraduationCap size={12} />
            Research Profile
          </div>
          <h1 style={{ fontSize: '1.75rem' }}>Research Profile</h1>
          <p>Your profile powers AI-driven funding recommendations and personalized research insights.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--radius-md)',
          background: 'var(--gradient-main)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', fontWeight: 800, flexShrink: 0,
          fontFamily: 'Outfit, sans-serif', color: 'white',
          boxShadow: '0 0 25px rgba(99,102,241,0.3)',
        }}>
          {(user.username || 'U')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
            {user.username}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user.email}</div>
          {/* Completion Bar */}
          <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: 5, borderRadius: 100, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{
                width: `${completionPct}%`, height: '100%', borderRadius: 100,
                background: completionPct === 100 ? 'var(--gradient-success)' : 'var(--gradient-main)',
                transition: 'width 0.8s ease',
              }} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: completionPct === 100 ? '#34d399' : '#a5b4fc' }}>
              {Math.round(completionPct)}% complete
            </span>
          </div>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-success)', animation: 'fadeInUp 0.3s ease' }}>
            <CheckCircle size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Saved</span>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error" id="profile-error">⚠️ {error}</div>}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} id="profile-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="profile-name">
                <User size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
                Full Name *
              </label>
              <input id="profile-name" name="name" type="text" placeholder="Dr. Jane Smith" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-university">
                <Building2 size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
                University / Institution *
              </label>
              <input id="profile-university" name="university" type="text" placeholder="IIT Bombay" value={form.university} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="profile-department">
                <MapPin size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
                Department
              </label>
              <input id="profile-department" name="department" type="text" placeholder="Computer Science" value={form.department} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="profile-area">
                <Sparkles size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
                Research Area *
              </label>
              <select id="profile-area" name="research_area" value={form.research_area} onChange={handleChange}>
                <option value="">Select your primary area</option>
                {RESEARCH_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-interests">
              <FileText size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
              Research Interests
            </label>
            <textarea
              id="profile-interests" name="research_interests"
              placeholder="Describe your research interests in detail…"
              value={form.research_interests} onChange={handleChange} rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-keywords">
              <Hash size={13} style={{ display: 'inline', verticalAlign: -2, marginRight: 5 }} />
              Keywords (comma-separated)
            </label>
            <input
              id="profile-keywords" name="keywords" type="text"
              placeholder="e.g., neural networks, medical imaging, federated learning"
              value={form.keywords} onChange={handleChange}
            />
            {form.keywords && (
              <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {form.keywords.split(',').map(k => k.trim()).filter(Boolean).map(k => (
                  <span key={k} className="keyword-tag size-sm" style={{ animation: 'fadeInUp 0.2s ease' }}>{k}</span>
                ))}
              </div>
            )}
          </div>

          <button
            id="profile-save-btn" type="submit" className="btn btn-primary"
            disabled={loading} style={{ marginTop: '0.75rem', height: '46px', paddingInline: '2rem' }}
          >
            {loading ? <span className="loading-spinner" /> : <Save size={17} />}
            {loading ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
