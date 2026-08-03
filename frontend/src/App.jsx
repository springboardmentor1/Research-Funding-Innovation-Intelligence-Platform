import React, { useState, useEffect } from 'react';
import {
  Shield, Award, BarChart2, BookOpen, FileText, CheckCircle2,
  TrendingUp, Activity, PlusCircle, Compass, Cpu, LogOut, ArrowRight, User
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const API_BASE = 'http://127.0.0.1:8000';

function App() {
  // Authentication states
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', fullName: '', role: 'researcher' });
  const [authError, setAuthError] = useState('');

  // Navigation
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'funding', 'trends', 'innovation'

  // Input states for updating profile
  const [profileForm, setProfileForm] = useState({ research_domain: '', keywords: '', organization: '', biography: '' });
  const [pubForm, setPubForm] = useState({ title: '', authors: '', year: 2025, source: '' });
  const [patForm, setPatForm] = useState({ title: '', patent_number: '', filing_year: 2025, status: 'Filed' });

  // Recommendations & Trends lists
  const [recommendations, setRecommendations] = useState([]);
  const [trends, setTrends] = useState(null);

  // Innovation scoring state
  const [scoringForm, setScoringForm] = useState({
    novelty: 80,
    patent_strength: 75,
    maturity: 60,
    market_potential: 85,
    funding_relevance: 70
  });
  const [scoringResult, setScoringResult] = useState(null);

  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // Handle Login / Registration
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegisterMode) {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: authForm.fullName,
            email: authForm.email,
            password: authForm.password,
            role: authForm.role
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
        setIsRegisterMode(false);
        setAuthForm({ ...authForm, password: '' });
      } else {
        const formData = new URLSearchParams();
        formData.append('username', authForm.email);
        formData.append('password', authForm.password);

        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');

        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCurrentUser(null);
    setProfileData(null);
  };

  // Fetch full user profile & publications/patents
  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setProfileData(data.profile);
        if (data.profile) {
          setProfileForm({
            research_domain: data.profile.research_domain || '',
            keywords: data.profile.keywords || '',
            organization: data.profile.organization || '',
            biography: data.profile.biography || ''
          });
        }
      } else {
        handleLogout();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update profile details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/research-profile`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        alert("Profile details updated successfully!");
        fetchProfile();
        fetchRecommendations();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add a publication
  const handleAddPub = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/publication`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(pubForm)
      });
      if (res.ok) {
        setPubForm({ title: '', authors: '', year: 2025, source: '' });
        fetchProfile();
      } else {
        alert("Please update your base Profile Domain & Keywords first.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add a patent
  const handleAddPat = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/patent`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(patForm)
      });
      if (res.ok) {
        setPatForm({ title: '', patent_number: '', filing_year: 2025, status: 'Filed' });
        fetchProfile();
      } else {
        alert("Please update your base Profile Domain & Keywords first.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Recommended Grants
  const fetchRecommendations = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/funding/recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch hotspots & publication trends
  const fetchTrends = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/intelligence/trends`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrends(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate Weighted Innovation Score
  const handleScoreCalculate = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/intelligence/score`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(scoringForm)
      });
      if (res.ok) {
        const data = await res.json();
        setScoringResult(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchRecommendations();
      fetchTrends();
    }
  }, [token]);

  useEffect(() => {
    if (token && activeTab === 'innovation') {
      handleScoreCalculate();
    }
  }, [activeTab]);

  // Login view
  if (!token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top, #0f172a 0%, #030712 100%)', padding: '1rem' }}>
        <div className="card-glass fade-in" style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', marginBottom: '1rem' }}>
              <Cpu size={36} />
            </div>
            <h2 style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.025em' }}>Innovation Intelligence</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Research Funding & Trend Analytics Platform</p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {isRegisterMode && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Dr. Sarah Jenkins"
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
              <input
                type="email"
                placeholder="sarah.jenkins@university.edu"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>

            {isRegisterMode && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Platform Role</label>
                <select
                  value={authForm.role}
                  onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                  style={{
                    background: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    color: 'var(--color-text-primary)',
                    width: '100%'
                  }}
                >
                  <option value="researcher">Researcher / Academic</option>
                  <option value="startup_founder">Startup Founder / Entrepreneur</option>
                  <option value="innovation_manager">Innovation Hub Manager</option>
                </select>
              </div>
            )}

            {authError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 500 }}>{authError}</div>}

            <button type="submit" className="btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem' }}>
              {isRegisterMode ? 'Create Account' : 'Secure Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              {isRegisterMode ? 'Already registered?' : 'Need a new intelligence profile?'}
            </span>
            <button
              onClick={() => { setIsRegisterMode(!isRegisterMode); setAuthError(''); }}
              style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, fontSize: '0.85rem', marginLeft: '0.5rem', cursor: 'pointer' }}
            >
              {isRegisterMode ? 'Sign In Here' : 'Create Profile Here'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard layout
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header bar */}
      <header style={{ background: 'rgba(15, 22, 36, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border-glass)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <Cpu size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Innovation Intelligence</h1>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block' }}>Research & Funding Hub</span>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                background: activeTab === 'profile' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'profile' ? '#818cf8' : 'var(--color-text-secondary)',
                fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              <User size={16} /> {currentUser?.role === 'startup_founder' ? 'Business Profile' : currentUser?.role === 'innovation_manager' ? 'Portfolio Profile' : 'Academic Profile'}
            </button>
            <button
              onClick={() => setActiveTab('funding')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                background: activeTab === 'funding' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'funding' ? '#818cf8' : 'var(--color-text-secondary)',
                fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              <Award size={16} /> Funding Discovery
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                background: activeTab === 'trends' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'trends' ? '#818cf8' : 'var(--color-text-secondary)',
                fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              <TrendingUp size={16} /> Trend Analytics
            </button>
            <button
              onClick={() => setActiveTab('innovation')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
                background: activeTab === 'innovation' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: activeTab === 'innovation' ? '#818cf8' : 'var(--color-text-secondary)',
                fontWeight: 600, transition: 'all 0.2s'
              }}
            >
              <BarChart2 size={16} /> Innovation Score
            </button>
          </nav>

          {/* User details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser?.name}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                {currentUser?.role.replace('_', ' ')}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard view */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '1.5rem', boxSizing: 'border-box' }}>
        
        {/* TAB 1: Profile Management */}
        {activeTab === 'profile' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Edit details */}
            <div className="card-glass">
              <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="#818cf8" /> {currentUser?.role === 'startup_founder' ? 'Business Profile Management' : currentUser?.role === 'innovation_manager' ? 'Portfolio Hub Settings' : 'Research Profile Management'}
              </h3>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                    {currentUser?.role === 'startup_founder' ? 'Innovation Domain' : currentUser?.role === 'innovation_manager' ? 'Incubator Domain' : 'Research Domain'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Artificial Intelligence, Renewable Energy"
                    value={profileForm.research_domain}
                    onChange={(e) => setProfileForm({ ...profileForm, research_domain: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Match Keywords (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. AI, Robotics, Computer Vision, Deep Learning"
                    value={profileForm.keywords}
                    onChange={(e) => setProfileForm({ ...profileForm, keywords: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                    {currentUser?.role === 'startup_founder' ? 'Company Name' : currentUser?.role === 'innovation_manager' ? 'Incubation Center' : 'Affiliated Organization'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={profileForm.organization}
                    onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                    {currentUser?.role === 'startup_founder' ? 'Company pitch / Executive Bio' : currentUser?.role === 'innovation_manager' ? 'Incubator Bio' : 'Academic / Corporate Biography'}
                  </label>
                  <textarea
                    placeholder="Provide a short description of research experience..."
                    value={profileForm.biography}
                    onChange={(e) => setProfileForm({ ...profileForm, biography: e.target.value })}
                    rows={4}
                    style={{
                      background: 'rgba(17, 24, 39, 0.8)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      color: 'var(--color-text-primary)',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: 'fit-content' }}>Save Profile Details</button>
              </form>
            </div>

            {/* Lists of publications & patents */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Add publication */}
              <div className="card-glass">
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <FileText size={18} color="#818cf8" /> {currentUser?.role === 'startup_founder' ? 'Add Product / Tech Milestone' : 'Add Publication Record'}
                </h3>
                <form onSubmit={handleAddPub} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <input type="text" placeholder={currentUser?.role === 'startup_founder' ? 'Milestone Name' : 'Title'} value={pubForm.title} onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })} required />
                  </div>
                  <div>
                    <input type="text" placeholder={currentUser?.role === 'startup_founder' ? 'Lead Developers' : 'Authors'} value={pubForm.authors} onChange={(e) => setPubForm({ ...pubForm, authors: e.target.value })} required />
                  </div>
                  <div>
                    <input type="number" placeholder="Year" value={pubForm.year} onChange={(e) => setPubForm({ ...pubForm, year: parseInt(e.target.value) || 2025 })} required />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <input type="text" placeholder={currentUser?.role === 'startup_founder' ? 'Release Channel' : 'Source / Journal'} value={pubForm.source} onChange={(e) => setPubForm({ ...pubForm, source: e.target.value })} required />
                  </div>
                  <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '0.5rem' }}>
                    {currentUser?.role === 'startup_founder' ? 'Add Milestone' : 'Add Publication'}
                  </button>
                </form>

                {/* Publications List */}
                <div style={{ marginTop: '1rem', maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {profileData?.publications?.map((pub, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-glass)' }}>
                      <strong>{pub.title}</strong> - {pub.authors} ({pub.year})
                    </div>
                  ))}
                </div>
              </div>

              {/* Add patent */}
              <div className="card-glass">
                <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <Award size={18} color="#818cf8" /> Add Patent Record
                </h3>
                <form onSubmit={handleAddPat} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <input type="text" placeholder="Patent Title" value={patForm.title} onChange={(e) => setPatForm({ ...patForm, title: e.target.value })} required />
                  </div>
                  <div>
                    <input type="text" placeholder="Patent Number" value={patForm.patent_number} onChange={(e) => setPatForm({ ...patForm, patent_number: e.target.value })} required />
                  </div>
                  <div>
                    <input type="number" placeholder="Filing Year" value={patForm.filing_year} onChange={(e) => setPatForm({ ...patForm, filing_year: parseInt(e.target.value) || 2025 })} required />
                  </div>
                  <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '0.5rem' }}>Add Patent</button>
                </form>

                {/* Patents List */}
                <div style={{ marginTop: '1rem', maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {profileData?.patents?.map((pat, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-glass)' }}>
                      <strong>{pat.title}</strong> - No: {pat.patent_number} ({pat.filing_year})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Funding Discovery */}
        {activeTab === 'funding' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card-glass">
              <h3 style={{ margin: '0 0 0.5rem 0' }}>AI Funding Recommendations Engine</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                The algorithm automatically parses keywords from your research profile to calculate grant eligibility relevance scores.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {recommendations.length === 0 ? (
                <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                  No matched funding opportunities found. Set keywords in your Profile to check recommendations!
                </div>
              ) : (
                recommendations.map((opp) => (
                  <div key={opp.id} className="card-glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>{opp.provider}</span>
                        <span className="badge badge-pass" style={{ flexShrink: 0 }}>{opp.match_rate}% Match</span>
                      </div>
                      <h4 style={{ margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>{opp.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0 0 1rem 0' }}>
                        <strong>Targets:</strong> {opp.eligibility}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <div>Deadline: <strong>{opp.deadline}</strong></div>
                      <div>Fund Amount: <strong style={{ color: 'var(--color-pass)' }}>{opp.amount}</strong></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Research Trend Intelligence */}
        {activeTab === 'trends' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Hotspots metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {trends?.hotspots.slice(0, 3).map((hot, idx) => (
                <div key={idx} className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>Hotspot Technology</span>
                    <h4 style={{ margin: '0.25rem 0 0.25rem 0' }}>{hot.name}</h4>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{hot.publications.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Papers</span></div>
                  </div>
                  <span style={{ color: 'var(--color-pass)', fontWeight: 700, fontSize: '1.1rem' }}>{hot.growth}</span>
                </div>
              ))}
            </div>

            {/* Historical charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '1.6fr 1fr', gap: '1.5rem' }}>
              <div className="card-glass">
                <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} color="#818cf8" /> Publication Volume Over Time (Hotspots)
                </h3>
                <div style={{ width: '100%', height: '320px' }}>
                  {trends ? (
                    <ResponsiveContainer>
                      <AreaChart data={trends.historical_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorBattery" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="year" stroke="var(--color-text-secondary)" fontSize={12} />
                        <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                        <Tooltip contentStyle={{ background: '#0f1624', border: '1px solid var(--border-glass)' }} />
                        <Area type="monotone" dataKey="Generative AI" stroke="#818cf8" fillOpacity={1} fill="url(#colorAI)" />
                        <Area type="monotone" dataKey="Solid-State Batteries" stroke="#10b981" fillOpacity={1} fill="url(#colorBattery)" />
                        <Area type="monotone" dataKey="Quantum Computing" stroke="#fbbf24" fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>

              {/* Emerging hot topics list */}
              <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', justifycontent: 'space-between' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Hot Topic Growth Rankings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
                  {trends?.hotspots.map((hot, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <div>
                        <strong>{hot.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Status: {hot.status}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: 'var(--color-pass)', fontWeight: 600 }}>{hot.growth}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{hot.publications.toLocaleString()} papers</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Innovation Scoring Engine */}
        {activeTab === 'innovation' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '1fr 1.2fr', gap: '1.5rem' }}>
            {/* Input params */}
            <div className="card-glass">
              <h3 style={{ margin: '0 0 1rem 0' }}>Weighted Potential Grading</h3>
              <form onSubmit={handleScoreCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Research Novelty (30%)</span>
                    <strong>{scoringForm.novelty}%</strong>
                  </div>
                  <input type="range" min="0" max="100" value={scoringForm.novelty} onChange={(e) => setScoringForm({ ...scoringForm, novelty: parseFloat(e.target.value) || 0 })} style={{ width: '100%' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Patent Strength (20%)</span>
                    <strong>{scoringForm.patent_strength}%</strong>
                  </div>
                  <input type="range" min="0" max="100" value={scoringForm.patent_strength} onChange={(e) => setScoringForm({ ...scoringForm, patent_strength: parseFloat(e.target.value) || 0 })} style={{ width: '100%' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Technology Maturity (15%)</span>
                    <strong>{scoringForm.maturity}%</strong>
                  </div>
                  <input type="range" min="0" max="100" value={scoringForm.maturity} onChange={(e) => setScoringForm({ ...scoringForm, maturity: parseFloat(e.target.value) || 0 })} style={{ width: '100%' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Market Potential (20%)</span>
                    <strong>{scoringForm.market_potential}%</strong>
                  </div>
                  <input type="range" min="0" max="100" value={scoringForm.market_potential} onChange={(e) => setScoringForm({ ...scoringForm, market_potential: parseFloat(e.target.value) || 0 })} style={{ width: '100%' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    <span>Funding Relevance (15%)</span>
                    <strong>{scoringForm.funding_relevance}%</strong>
                  </div>
                  <input type="range" min="0" max="100" value={scoringForm.funding_relevance} onChange={(e) => setScoringForm({ ...scoringForm, funding_relevance: parseFloat(e.target.value) || 0 })} style={{ width: '100%' }} />
                </div>
                <button type="submit" className="btn-primary">Calculate Innovation Grade</button>
              </form>
            </div>

            {/* Calculations & Recommendation panel */}
            <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'center' }}>
              {scoringResult ? (
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Calculated Innovation Score</span>
                  <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#818cf8', margin: '0.5rem 0' }}>
                    {scoringResult.innovation_score} <span style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/ 100</span>
                  </div>

                  <div style={{ textAlign: 'left', marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={18} color="#818cf8" /> Strategy Recommendations
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {scoringResult.recommendations.map((rec, idx) => (
                        <div key={idx} style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.05)', borderLeft: '3px solid #818cf8', borderRadius: '4px', fontSize: '0.85rem', lineHeight: 1.4 }}>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Adjust parameters and click calculate to display recommendations.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#090d16', borderTop: '1px solid var(--border-glass)', padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        Research Funding & Innovation Intelligence Platform. Powered by Sentence Transformers.
      </footer>
    </div>
  );
}

export default App;
