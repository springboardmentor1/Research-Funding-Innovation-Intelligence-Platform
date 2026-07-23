import { useState, useEffect } from 'react';
import { User, Save, CheckCircle } from 'lucide-react';
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
    research_interests: '', keywords: '', research_area: ''
  });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  // Load existing profile
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
          research_area:      p.research_area || ''
        });
      })
      .catch(() => {}) // profile doesn't exist yet — fine
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

  if (fetching) return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p>Loading profile…</p>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '700px' }}>
      <div className="page-header">
        <h1>Research Profile</h1>
        <p>Your profile helps us personalize funding and paper recommendations</p>
      </div>

      {/* Avatar Card */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--gradient-main)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', fontWeight: 700, flexShrink: 0
        }}>
          {(user.username || 'U')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {user.username}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            User ID: #{user.id}
          </div>
        </div>
        {saved && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-success)' }}>
            <CheckCircle size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Saved</span>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error" id="profile-error">⚠️ {error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} id="profile-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="profile-name">Full Name *</label>
              <input
                id="profile-name"
                name="name"
                type="text"
                placeholder="Dr. Jane Smith"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-university">University / Institution *</label>
              <input
                id="profile-university"
                name="university"
                type="text"
                placeholder="IIT Bombay"
                value={form.university}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="profile-department">Department</label>
              <input
                id="profile-department"
                name="department"
                type="text"
                placeholder="Computer Science"
                value={form.department}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profile-area">Research Area *</label>
              <select
                id="profile-area"
                name="research_area"
                value={form.research_area}
                onChange={handleChange}
              >
                <option value="">Select your primary area</option>
                {RESEARCH_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-interests">Research Interests</label>
            <textarea
              id="profile-interests"
              name="research_interests"
              placeholder="Describe your research interests in detail…"
              value={form.research_interests}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-keywords">Keywords (comma-separated)</label>
            <input
              id="profile-keywords"
              name="keywords"
              type="text"
              placeholder="e.g., neural networks, medical imaging, federated learning"
              value={form.keywords}
              onChange={handleChange}
            />
            {form.keywords && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {form.keywords.split(',').map(k => k.trim()).filter(Boolean).map(k => (
                  <span key={k} className="badge badge-purple">{k}</span>
                ))}
              </div>
            )}
          </div>

          <button
            id="profile-save-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? <span className="loading-spinner" /> : <Save size={16} />}
            {loading ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
