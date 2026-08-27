import React, { useState, useEffect } from 'react';
import { User, Building, Award, Plus, X, Save, CheckCircle, BookOpen, FileText, MapPin, GraduationCap, Landmark, Clock, ChevronDown } from 'lucide-react';
import api from '../services/api';

const CAREER_STAGES = [
  'Undergraduate Student',
  'Graduate Student (Masters)',
  'PhD Candidate',
  'Postdoctoral Researcher',
  'Assistant Professor',
  'Associate Professor',
  'Full Professor',
  'Distinguished Professor',
  'Research Scientist',
  'Senior Research Scientist',
  'Principal Investigator',
  'Industry Researcher',
  'Emeritus Professor'
];

const INSTITUTION_TYPES = [
  'Research University (R1)',
  'Research University (R2)',
  'Liberal Arts College',
  'Community College',
  'National Laboratory',
  'Government Research Institute',
  'Private Research Institute',
  'Corporate R&D Lab',
  'Non-Profit Research Org',
  'Hospital / Medical Center',
  'Startup / Small Enterprise',
  'International Organization'
];

/* ── Reusable Styles ────────────────────────────────── */
const cardStyle = {
  background: 'rgba(17, 24, 39, 0.65)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: '2.25rem',
  backdropFilter: 'blur(16px)'
};

const sectionTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: 700,
  marginBottom: '1.5rem',
  color: '#fff',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  paddingBottom: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem'
};

const labelStyle = { fontSize: '0.88rem', fontWeight: 600, color: '#D1D5DB' };

const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem 0.8rem 2.8rem',
  borderRadius: '12px',
  background: 'rgba(31, 41, 55, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#fff',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const selectStyle = {
  width: '100%',
  padding: '0.8rem 1rem 0.8rem 2.8rem',
  borderRadius: '12px',
  background: 'rgba(31, 41, 55, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#fff',
  fontSize: '0.95rem',
  outline: 'none',
  appearance: 'none',
  cursor: 'pointer',
  transition: 'border-color 0.2s'
};

const iconWrapStyle = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#6B7280',
  pointerEvents: 'none'
};

/* ── Component ──────────────────────────────────────── */
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

  // New fields for full feature completion
  const [careerStage, setCareerStage] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [region, setRegion] = useState('');
  const [linkedPublications, setLinkedPublications] = useState([]);
  const [linkedPatents, setLinkedPatents] = useState([]);
  
  const [newDomain, setNewDomain] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newPublication, setNewPublication] = useState('');
  const [newPatent, setNewPatent] = useState('');

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
      setCareerStage(data.career_stage || '');
      setInstitutionType(data.institution_type || '');
      setRegion(data.region || '');
      setLinkedPublications(data.linked_publications || []);
      setLinkedPatents(data.linked_patents || []);
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
        keywords: keywords,
        career_stage: careerStage || null,
        institution_type: institutionType || null,
        region: region || null,
        linked_publications: linkedPublications,
        linked_patents: linkedPatents
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

  /* ── Tag helpers ───────────────────────────────────── */
  const addDomain = () => {
    if (newDomain.trim() && !domains.includes(newDomain.trim())) {
      setDomains([...domains, newDomain.trim()]);
      setNewDomain('');
    }
  };
  const removeDomain = (idx) => setDomains(domains.filter((_, i) => i !== idx));

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };
  const removeKeyword = (idx) => setKeywords(keywords.filter((_, i) => i !== idx));

  const addPublication = () => {
    if (newPublication.trim() && !linkedPublications.includes(newPublication.trim())) {
      setLinkedPublications([...linkedPublications, newPublication.trim()]);
      setNewPublication('');
    }
  };
  const removePublication = (idx) => setLinkedPublications(linkedPublications.filter((_, i) => i !== idx));

  const addPatent = () => {
    if (newPatent.trim() && !linkedPatents.includes(newPatent.trim())) {
      setLinkedPatents([...linkedPatents, newPatent.trim()]);
      setNewPatent('');
    }
  };
  const removePatent = (idx) => setLinkedPatents(linkedPatents.filter((_, i) => i !== idx));

  /* ── Enter-key support ────────────────────────────── */
  const handleKeyDown = (e, addFn) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFn();
    }
  };

  /* ── Tag chip renderer ────────────────────────────── */
  const TagChip = ({ label, onRemove, color = 'indigo' }) => {
    const palette = {
      indigo: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.25)', text: '#A5B4FC' },
      cyan: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.25)', text: '#22D3EE' },
      amber: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.25)', text: '#FBBF24' },
      emerald: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.25)', text: '#34D399' },
    };
    const c = palette[color] || palette.indigo;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        padding: '0.3rem 0.75rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: 600,
        animation: 'fadeIn 0.2s ease'
      }}>
        {label}
        <X size={14} style={{ cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.15s' }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.7}
          onClick={onRemove} />
      </span>
    );
  };

  /* ── Add-tag row renderer ─────────────────────────── */
  const TagInput = ({ value, onChange, onAdd, placeholder, buttonColor = '#6366F1' }) => (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => handleKeyDown(e, onAdd)}
        style={{
          flex: 1,
          padding: '0.65rem 1rem',
          borderRadius: '10px',
          background: 'rgba(31, 41, 55, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#fff',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
      />
      <button type="button" onClick={onAdd} style={{
        padding: '0.65rem 1rem',
        borderRadius: '10px',
        border: 'none',
        background: buttonColor,
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        transition: 'transform 0.15s, box-shadow 0.2s',
        boxShadow: `0 2px 8px ${buttonColor}44`
      }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Plus size={16} /> Add
      </button>
    </div>
  );

  /* ── Loading state ────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#9CA3AF', background: '#0B0E17', minHeight: 'calc(100vh - 70px)' }}>
        <div style={{
          width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366F1', borderRadius: '50%', margin: '0 auto 1.5rem',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Research Profile...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Main render ──────────────────────────────────── */
  return (
    <div style={{
      background: '#0B0E17',
      minHeight: 'calc(100vh - 70px)',
      color: '#F3F4F6',
      padding: '3rem 2rem'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, textarea:focus, select:focus { border-color: rgba(99, 102, 241, 0.5) !important; }
      `}</style>

      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* ── Header ──────────────────────────────────── */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'slideIn 0.4s ease' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.4rem', color: '#fff' }}>
              Research Profile
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '1rem' }}>
              Keep your research details, organizational affiliation, publications, and academic metrics updated.
            </p>
          </div>
          {saveSuccess && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#34D399', padding: '0.6rem 1.2rem', borderRadius: '12px',
              fontWeight: 600, fontSize: '0.9rem', animation: 'fadeIn 0.3s ease'
            }}>
              <CheckCircle size={16} /> Profile Saved Successfully!
            </div>
          )}
        </div>

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* ═══════════════ LEFT COLUMN ═══════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Card 1: Affiliation & Biography ───── */}
            <div style={{ ...cardStyle, animation: 'slideIn 0.4s ease 0.05s both' }}>
              <h3 style={sectionTitleStyle}>
                <Building size={20} style={{ color: '#818CF8' }} />
                Affiliation & Biography
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Organization</label>
                  <div style={{ position: 'relative' }}>
                    <Building style={iconWrapStyle} size={16} />
                    <input type="text" placeholder="e.g. Stanford University" value={organization}
                      onChange={(e) => setOrganization(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Department</label>
                  <div style={{ position: 'relative' }}>
                    <Building style={iconWrapStyle} size={16} />
                    <input type="text" placeholder="e.g. Computer Science" value={department}
                      onChange={(e) => setDepartment(e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Career Stage + Institution Type + Region */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Career Stage</label>
                  <div style={{ position: 'relative' }}>
                    <GraduationCap style={iconWrapStyle} size={16} />
                    <ChevronDown style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} size={14} />
                    <select value={careerStage} onChange={(e) => setCareerStage(e.target.value)} style={selectStyle}>
                      <option value="" style={{ background: '#1F2937' }}>Select stage…</option>
                      {CAREER_STAGES.map(s => (
                        <option key={s} value={s} style={{ background: '#1F2937' }}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Institution Type</label>
                  <div style={{ position: 'relative' }}>
                    <Landmark style={iconWrapStyle} size={16} />
                    <ChevronDown style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} size={14} />
                    <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value)} style={selectStyle}>
                      <option value="" style={{ background: '#1F2937' }}>Select type…</option>
                      {INSTITUTION_TYPES.map(t => (
                        <option key={t} value={t} style={{ background: '#1F2937' }}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Region</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={iconWrapStyle} size={16} />
                    <input type="text" placeholder="e.g. North America" value={region}
                      onChange={(e) => setRegion(e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Biography / Research Abstract</label>
                <textarea rows={4}
                  placeholder="Describe your primary research agenda, background, and academic interests..."
                  value={bio} onChange={(e) => setBio(e.target.value)}
                  style={{
                    width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
                    background: 'rgba(31, 41, 55, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#fff', fontSize: '0.95rem', lineHeight: '1.5', outline: 'none',
                    resize: 'vertical', transition: 'border-color 0.2s'
                  }}
                />
              </div>
            </div>

            {/* ── Card 2: Research Focus & Keywords ── */}
            <div style={{ ...cardStyle, animation: 'slideIn 0.4s ease 0.1s both' }}>
              <h3 style={sectionTitleStyle}>
                <Award size={20} style={{ color: '#06B6D4' }} />
                Research Focus Areas & Keywords
              </h3>

              {/* Domains */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: '0.5rem' }}>
                  Research Domains
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {domains.map((dom, idx) => (
                    <TagChip key={idx} label={dom} onRemove={() => removeDomain(idx)} color="indigo" />
                  ))}
                  {domains.length === 0 && <span style={{ color: '#6B7280', fontSize: '0.85rem', fontStyle: 'italic' }}>No domains added yet.</span>}
                </div>
                <TagInput value={newDomain} onChange={(e) => setNewDomain(e.target.value)}
                  onAdd={addDomain} placeholder="Add domain, e.g. Quantum Computing" buttonColor="#6366F1" />
              </div>

              {/* Keywords */}
              <div>
                <label style={{ ...labelStyle, display: 'block', marginBottom: '0.5rem' }}>
                  Specific Technology Keywords
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {keywords.map((kw, idx) => (
                    <TagChip key={idx} label={kw} onRemove={() => removeKeyword(idx)} color="cyan" />
                  ))}
                  {keywords.length === 0 && <span style={{ color: '#6B7280', fontSize: '0.85rem', fontStyle: 'italic' }}>No keywords added yet.</span>}
                </div>
                <TagInput value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)}
                  onAdd={addKeyword} placeholder="Add keyword, e.g. NLP, Neural Networks" buttonColor="#06B6D4" />
              </div>
            </div>

            {/* ── Card 3: Publication Management ───── */}
            <div style={{ ...cardStyle, animation: 'slideIn 0.4s ease 0.15s both' }}>
              <h3 style={sectionTitleStyle}>
                <BookOpen size={20} style={{ color: '#F59E0B' }} />
                Publication Management
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.88rem', marginBottom: '1.25rem', marginTop: '-0.75rem' }}>
                Link your key publications by title, DOI, or reference ID. These are used for grant matching and impact tracking.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {linkedPublications.map((pub, idx) => (
                  <TagChip key={idx} label={pub} onRemove={() => removePublication(idx)} color="amber" />
                ))}
                {linkedPublications.length === 0 && (
                  <div style={{
                    width: '100%', padding: '1.5rem', borderRadius: '12px', textAlign: 'center',
                    background: 'rgba(245, 158, 11, 0.05)', border: '1px dashed rgba(245, 158, 11, 0.2)',
                    color: '#92704A', fontSize: '0.88rem'
                  }}>
                    <BookOpen size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <div>No publications linked yet. Add your first one below.</div>
                  </div>
                )}
              </div>
              <TagInput value={newPublication} onChange={(e) => setNewPublication(e.target.value)}
                onAdd={addPublication} placeholder="e.g. Deep Learning for Drug Discovery (DOI: 10.1234/...)" buttonColor="#F59E0B" />

              {linkedPublications.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={14} style={{ color: '#FBBF24', flexShrink: 0 }} />
                  <span style={{ color: '#D4A94D', fontSize: '0.82rem' }}>
                    <strong>{linkedPublications.length}</strong> publication{linkedPublications.length !== 1 ? 's' : ''} linked to your profile
                  </span>
                </div>
              )}
            </div>

            {/* ── Card 4: Research History / Patents ─ */}
            <div style={{ ...cardStyle, animation: 'slideIn 0.4s ease 0.2s both' }}>
              <h3 style={sectionTitleStyle}>
                <FileText size={20} style={{ color: '#10B981' }} />
                Research History & Patents
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '0.88rem', marginBottom: '1.25rem', marginTop: '-0.75rem' }}>
                Record patents, invention disclosures, or IP references associated with your research.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {linkedPatents.map((pat, idx) => (
                  <TagChip key={idx} label={pat} onRemove={() => removePatent(idx)} color="emerald" />
                ))}
                {linkedPatents.length === 0 && (
                  <div style={{
                    width: '100%', padding: '1.5rem', borderRadius: '12px', textAlign: 'center',
                    background: 'rgba(16, 185, 129, 0.05)', border: '1px dashed rgba(16, 185, 129, 0.2)',
                    color: '#4A8C72', fontSize: '0.88rem'
                  }}>
                    <FileText size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                    <div>No patents linked yet. Add your first one below.</div>
                  </div>
                )}
              </div>
              <TagInput value={newPatent} onChange={(e) => setNewPatent(e.target.value)}
                onAdd={addPatent} placeholder="e.g. US-2024-0123456 — AI-Based Protein Folding" buttonColor="#10B981" />

              {linkedPatents.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={14} style={{ color: '#34D399', flexShrink: 0 }} />
                  <span style={{ color: '#4DA882', fontSize: '0.82rem' }}>
                    <strong>{linkedPatents.length}</strong> patent{linkedPatents.length !== 1 ? 's' : ''} linked to your profile
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════ RIGHT COLUMN ══════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* ── Academic Metrics Card ──────────────── */}
            <div style={{ ...cardStyle, animation: 'slideIn 0.4s ease 0.1s both', position: 'sticky', top: '2rem' }}>
              <h3 style={sectionTitleStyle}>
                <Award size={20} style={{ color: '#818CF8' }} />
                Academic Metrics
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Google Scholar h-index</label>
                  <div style={{ position: 'relative' }}>
                    <Award style={iconWrapStyle} size={16} />
                    <input type="number" min={0} value={hIndex}
                      onChange={(e) => setHIndex(Number(e.target.value))} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={labelStyle}>Total Citations</label>
                  <div style={{ position: 'relative' }}>
                    <Award style={iconWrapStyle} size={16} />
                    <input type="number" min={0} value={totalCitations}
                      onChange={(e) => setTotalCitations(Number(e.target.value))} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Profile Completeness */}
              {(() => {
                const fields = [bio, organization, department, careerStage, institutionType, region];
                const lists = [domains, keywords, linkedPublications, linkedPatents];
                const filledFields = fields.filter(f => f && f.trim()).length;
                const filledLists = lists.filter(l => l.length > 0).length;
                const hasMetrics = hIndex > 0 || totalCitations > 0;
                const total = fields.length + lists.length + 1;
                const filled = filledFields + filledLists + (hasMetrics ? 1 : 0);
                const pct = Math.round((filled / total) * 100);
                const barColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
                return (
                  <div style={{ marginBottom: '2rem', padding: '1.25rem', borderRadius: '14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#D1D5DB' }}>Profile Completeness</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: barColor }}>{pct}%</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', background: barColor, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#6B7280' }}>
                      {filled} of {total} sections complete
                    </div>
                  </div>
                );
              })()}

              {/* Profile Summary */}
              <div style={{ marginBottom: '2rem', padding: '1rem', borderRadius: '12px', background: 'rgba(31, 41, 55, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                  Quick Summary
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Domains</span>
                    <span style={{ color: '#A5B4FC', fontWeight: 600 }}>{domains.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Keywords</span>
                    <span style={{ color: '#22D3EE', fontWeight: 600 }}>{keywords.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Publications</span>
                    <span style={{ color: '#FBBF24', fontWeight: 600 }}>{linkedPublications.length}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Patents</span>
                    <span style={{ color: '#34D399', fontWeight: 600 }}>{linkedPatents.length}</span>
                  </div>
                  {profile?.updated_at && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> Last saved</span>
                      <span style={{ color: '#9CA3AF', fontWeight: 500 }}>{new Date(profile.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={saving}
                style={{
                  width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
                  background: saving ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                  transition: 'transform 0.15s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)'; }}}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.3)'; }}
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
