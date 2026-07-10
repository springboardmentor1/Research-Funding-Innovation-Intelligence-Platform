import React, { useState, useEffect } from 'react';
import { User, Building, Award, Plus, X, Save, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function ProfileForm({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields state
  const [bio, setBio] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [hIndex, setHIndex] = useState(0);
  const [totalCitations, setTotalCitations] = useState(0);
  const [domains, setDomains] = useState([]);
  const [keywords, setKeywords] = useState([]);
  
  const [newDomain, setNewDomain] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile');
      const data = res.data;
      setProfile(data);
      setBio(data.bio || '');
      setOrganization(data.organization || '');
      setDepartment(data.department || '');
      setHIndex(data.h_index || 0);
      setTotalCitations(data.total_citations || 0);
      setDomains(data.research_domains || []);
      setKeywords(data.keywords || []);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await api.post('/profile', {
        bio,
        organization,
        department,
        h_index: Number(hIndex),
        total_citations: Number(totalCitations),
        research_domains: domains,
        keywords: keywords
      });
      setProfile(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const addDomain = () => {
    if (newDomain.trim() && !domains.includes(newDomain.trim())) {
      setDomains([...domains, newDomain.trim()]);
      setNewDomain('');
    }
  };

  const removeDomain = (idx) => {
    setDomains(domains.filter((_, i) => i !== idx));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (idx) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#9CA3AF', background: '#0B0E17', minHeight: 'calc(100vh - 70px)' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Research Profile...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#0B0E17',
      minHeight: 'calc(100vh - 70px)',
      color: '#F3F4F6',
      padding: '3rem 2rem'
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.4rem', color: '#fff' }}>
              Research Profile
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '1rem' }}>
              Keep your research details, organizational affiliation, and publication metrics updated.
            </p>
          </div>
          {saveSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              padding: '0.6rem 1.2rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}>
              <CheckCircle size={16} /> Profile Saved Successfully!
            </div>
          )}
        </div>

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Info Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              background: 'rgba(17, 24, 39, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '2.25rem',
              backdropFilter: 'blur(16px)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                Affiliation & Biography
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' }}>Organization</label>
                  <div style={{ position: 'relative' }}>
                    <Building style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Stanford University"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 2.8rem',
                        borderRadius: '12px',
                        background: 'rgba(31, 41, 55, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' }}>Department</label>
                  <div style={{ position: 'relative' }}>
                    <Building style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 2.8rem',
                        borderRadius: '12px',
                        background: 'rgba(31, 41, 55, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' }}>Biography / Research Abstract</label>
                <textarea
                  rows={4}
                  placeholder="Describe your primary research agenda, background, and academic interests..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    background: 'rgba(31, 41, 55, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{
              background: 'rgba(17, 24, 39, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '2.25rem',
              backdropFilter: 'blur(16px)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                Research Focus Areas & Keywords
              </h3>

              {/* Domains */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '0.5rem' }}>
                  Research Domains
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {domains.map((dom, idx) => (
                    <span key={idx} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      color: '#A5B4FC',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {dom}
                      <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeDomain(idx)} />
                    </span>
                  ))}
                  {domains.length === 0 && <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>No domains added.</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Add domain, e.g. Quantum Computing"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(31, 41, 55, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <button type="button" onClick={addDomain} style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#6366F1',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB', display: 'block', marginBottom: '0.5rem' }}>
                  Specific Technology Keywords
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {keywords.map((kw, idx) => (
                    <span key={idx} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(6, 182, 212, 0.15)',
                      border: '1px solid rgba(6, 182, 212, 0.25)',
                      color: '#22D3EE',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {kw}
                      <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeKeyword(idx)} />
                    </span>
                  ))}
                  {keywords.length === 0 && <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>No keywords added.</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Add keyword, e.g. NLP, Neural Networks"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.65rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(31, 41, 55, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  <button type="button" onClick={addKeyword} style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#06B6D4',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar metrics & Save */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              background: 'rgba(17, 24, 39, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '2.25rem',
              backdropFilter: 'blur(16px)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                Academic Metrics
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' }}>Google Scholar h-index</label>
                  <div style={{ position: 'relative' }}>
                    <Award style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} size={16} />
                    <input
                      type="number"
                      min={0}
                      value={hIndex}
                      onChange={(e) => setHIndex(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 2.8rem',
                        borderRadius: '12px',
                        background: 'rgba(31, 41, 55, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' }}>Total Citations</label>
                  <div style={{ position: 'relative' }}>
                    <Award style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} size={16} />
                    <input
                      type="number"
                      min={0}
                      value={totalCitations}
                      onChange={(e) => setTotalCitations(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem 0.8rem 2.8rem',
                        borderRadius: '12px',
                        background: 'rgba(31, 41, 55, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
                }}
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
