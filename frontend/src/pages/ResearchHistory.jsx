import React, { useState, useEffect } from 'react';
import { Clock, Building, GraduationCap, MapPin, Award, BookOpen, FileText, ChevronDown, ChevronUp, Search, Filter, RefreshCw } from 'lucide-react';
import api from '../services/api';

/* ── Styles ─────────────────────────────────────────── */
const cardStyle = {
  background: 'rgba(17, 24, 39, 0.65)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: '2rem',
  backdropFilter: 'blur(16px)',
};

export default function ResearchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'publications', 'patents', 'domains', 'metrics'

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load profile history:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Filtering logic ──────────────────────────────── */
  const filteredHistory = history.filter((entry) => {
    const summary = (entry.change_summary || '').toLowerCase();
    const matchesSearch = !searchTerm || summary.includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'publications') return summary.includes('publication');
    if (filterType === 'patents') return summary.includes('patent');
    if (filterType === 'domains') return summary.includes('domain') || summary.includes('keyword');
    if (filterType === 'metrics') return summary.includes('h-index') || summary.includes('citation');
    return true;
  });

  /* ── Relative time helper ─────────────────────────── */
  const timeAgo = (dateStr) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /* ── Change type badge colors ─────────────────────── */
  const getChangeBadges = (summary) => {
    if (!summary) return [];
    const badges = [];
    if (summary.toLowerCase().includes('biography')) badges.push({ label: 'Bio', color: '#818CF8', bg: 'rgba(99,102,241,0.15)' });
    if (summary.toLowerCase().includes('organization') || summary.toLowerCase().includes('department')) badges.push({ label: 'Affiliation', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' });
    if (summary.toLowerCase().includes('career stage')) badges.push({ label: 'Career', color: '#A78BFA', bg: 'rgba(167,139,250,0.15)' });
    if (summary.toLowerCase().includes('domain')) badges.push({ label: 'Domains', color: '#818CF8', bg: 'rgba(99,102,241,0.15)' });
    if (summary.toLowerCase().includes('keyword')) badges.push({ label: 'Keywords', color: '#22D3EE', bg: 'rgba(6,182,212,0.15)' });
    if (summary.toLowerCase().includes('publication')) badges.push({ label: 'Publications', color: '#FBBF24', bg: 'rgba(245,158,11,0.15)' });
    if (summary.toLowerCase().includes('patent')) badges.push({ label: 'Patents', color: '#34D399', bg: 'rgba(16,185,129,0.15)' });
    if (summary.toLowerCase().includes('h-index') || summary.toLowerCase().includes('citation')) badges.push({ label: 'Metrics', color: '#F472B6', bg: 'rgba(244,114,182,0.15)' });
    if (summary.toLowerCase().includes('region')) badges.push({ label: 'Region', color: '#FB923C', bg: 'rgba(251,146,60,0.15)' });
    if (summary.toLowerCase().includes('institution')) badges.push({ label: 'Institution', color: '#38BDF8', bg: 'rgba(56,189,248,0.15)' });
    if (badges.length === 0) badges.push({ label: 'General', color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' });
    return badges;
  };

  /* ── Loading ──────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', color: '#9CA3AF', background: '#0B0E17', minHeight: 'calc(100vh - 70px)' }}>
        <div style={{
          width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366F1', borderRadius: '50%', margin: '0 auto 1.5rem',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Research History...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>

      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* ── Header ────────────────────────────────── */}
        <div style={{ marginBottom: '2rem', animation: 'slideIn 0.4s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.4rem', color: '#fff' }}>
                Research Profile History
              </h1>
              <p style={{ color: '#9CA3AF', fontSize: '1rem' }}>
                Timeline of all profile changes and saved research snapshots.
              </p>
            </div>
            <button onClick={fetchHistory} style={{
              padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.3)',
              background: 'rgba(99,102,241,0.1)', color: '#818CF8', cursor: 'pointer', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem',
              transition: 'all 0.2s'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Search + Filter Bar ───────────────────── */}
        <div style={{
          ...cardStyle, marginBottom: '2rem', padding: '1.25rem 1.5rem',
          display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
          animation: 'slideIn 0.4s ease 0.05s both'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} size={16} />
            <input
              type="text" placeholder="Search changes..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: '10px',
                background: 'rgba(31,41,55,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'domains', label: 'Domains' },
              { key: 'publications', label: 'Publications' },
              { key: 'patents', label: 'Patents' },
              { key: 'metrics', label: 'Metrics' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilterType(f.key)} style={{
                padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                border: filterType === f.key ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background: filterType === f.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: filterType === f.key ? '#818CF8' : '#9CA3AF',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats Bar ─────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
          marginBottom: '2rem', animation: 'slideIn 0.4s ease 0.1s both'
        }}>
          {[
            { label: 'Total Saves', value: history.length, icon: <Clock size={18} />, color: '#818CF8' },
            { label: 'Publication Changes', value: history.filter(h => (h.change_summary || '').toLowerCase().includes('publication')).length, icon: <BookOpen size={18} />, color: '#FBBF24' },
            { label: 'Patent Changes', value: history.filter(h => (h.change_summary || '').toLowerCase().includes('patent')).length, icon: <FileText size={18} />, color: '#34D399' },
            { label: 'Domain Changes', value: history.filter(h => (h.change_summary || '').toLowerCase().includes('domain')).length, icon: <Award size={18} />, color: '#06B6D4' },
          ].map((stat, idx) => (
            <div key={idx} style={{
              ...cardStyle, padding: '1.25rem', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
            }}>
              <div style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Empty State ───────────────────────────── */}
        {filteredHistory.length === 0 && (
          <div style={{
            ...cardStyle, textAlign: 'center', padding: '4rem 2rem',
            animation: 'fadeIn 0.4s ease'
          }}>
            <Clock size={48} style={{ color: '#4B5563', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#9CA3AF', marginBottom: '0.5rem' }}>
              {searchTerm || filterType !== 'all' ? 'No matching history found' : 'No Profile History Yet'}
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.92rem', maxWidth: '400px', margin: '0 auto' }}>
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Your research profile history will appear here after you save your profile. Each save creates a snapshot for tracking.'}
            </p>
          </div>
        )}

        {/* ── Timeline ──────────────────────────────── */}
        {filteredHistory.length > 0 && (
          <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: '14px', top: '8px', bottom: '8px', width: '2px',
              background: 'linear-gradient(180deg, rgba(99,102,241,0.4) 0%, rgba(99,102,241,0.05) 100%)',
              borderRadius: '1px'
            }} />

            {filteredHistory.map((entry, idx) => {
              const isExpanded = expandedId === entry.id;
              const badges = getChangeBadges(entry.change_summary);
              const changeParts = (entry.change_summary || '').split('; ').filter(Boolean);

              return (
                <div key={entry.id} style={{
                  marginBottom: '1.25rem',
                  animation: `slideIn 0.3s ease ${Math.min(idx * 0.05, 0.5)}s both`
                }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute', left: '8px', width: '14px', height: '14px',
                    borderRadius: '50%', background: idx === 0 ? '#6366F1' : 'rgba(99,102,241,0.3)',
                    border: `2px solid ${idx === 0 ? '#818CF8' : 'rgba(99,102,241,0.2)'}`,
                    marginTop: '1.5rem',
                    boxShadow: idx === 0 ? '0 0 10px rgba(99,102,241,0.4)' : 'none',
                    animation: idx === 0 ? 'pulse 2s ease infinite' : 'none'
                  }} />

                  <div style={{
                    ...cardStyle,
                    padding: '1.5rem 1.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderColor: isExpanded ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)'
                  }}
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} />
                            {timeAgo(entry.saved_at)}
                          </span>
                          <span style={{ color: '#374151' }}>·</span>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            {new Date(entry.saved_at).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          {idx === 0 && (
                            <span style={{
                              fontSize: '0.7rem', fontWeight: 700, color: '#6366F1',
                              background: 'rgba(99,102,241,0.12)', padding: '0.15rem 0.5rem',
                              borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em'
                            }}>
                              Latest
                            </span>
                          )}
                        </div>

                        {/* Change summary text */}
                        <div style={{ fontSize: '0.92rem', color: '#E5E7EB', lineHeight: 1.5, marginBottom: '0.6rem' }}>
                          {changeParts.length > 0 ? (
                            changeParts.length <= 2 ? changeParts.join(' · ')
                              : `${changeParts.slice(0, 2).join(' · ')} +${changeParts.length - 2} more`
                          ) : 'Profile saved'}
                        </div>

                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {badges.map((b, bi) => (
                            <span key={bi} style={{
                              fontSize: '0.72rem', fontWeight: 600, padding: '0.18rem 0.55rem',
                              borderRadius: '6px', background: b.bg, color: b.color,
                              border: `1px solid ${b.color}22`
                            }}>
                              {b.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ color: '#6B7280', flexShrink: 0, marginLeft: '1rem', marginTop: '0.25rem' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {/* ── Expanded Detail ─────────────── */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '1.25rem', paddingTop: '1.25rem',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        animation: 'fadeIn 0.25s ease'
                      }}>
                        {/* All changes list */}
                        {changeParts.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
                              Changes Made
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              {changeParts.map((change, ci) => (
                                <div key={ci} style={{
                                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                                  fontSize: '0.88rem', color: '#D1D5DB'
                                }}>
                                  <span style={{ color: '#6366F1', fontWeight: 700, flexShrink: 0 }}>→</span>
                                  {change}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Snapshot details grid */}
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                          Profile Snapshot
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          {/* Info fields */}
                          {[
                            { icon: <Building size={14} />, label: 'Organization', value: entry.organization, color: '#06B6D4' },
                            { icon: <Building size={14} />, label: 'Department', value: entry.department, color: '#06B6D4' },
                            { icon: <GraduationCap size={14} />, label: 'Career Stage', value: entry.career_stage, color: '#A78BFA' },
                            { icon: <MapPin size={14} />, label: 'Region', value: entry.region, color: '#FB923C' },
                          ].map((field, fi) => (
                            <div key={fi} style={{
                              padding: '0.65rem 0.85rem', borderRadius: '10px',
                              background: 'rgba(31,41,55,0.3)', border: '1px solid rgba(255,255,255,0.04)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                                <span style={{ color: field.color }}>{field.icon}</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280' }}>{field.label}</span>
                              </div>
                              <div style={{ fontSize: '0.88rem', color: field.value ? '#E5E7EB' : '#4B5563', fontWeight: 500 }}>
                                {field.value || '—'}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Metrics row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                          <div style={{
                            padding: '0.65rem 0.85rem', borderRadius: '10px',
                            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)'
                          }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.2rem' }}>h-index</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#818CF8' }}>{entry.h_index}</div>
                          </div>
                          <div style={{
                            padding: '0.65rem 0.85rem', borderRadius: '10px',
                            background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.1)'
                          }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.2rem' }}>Citations</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F472B6' }}>{entry.total_citations}</div>
                          </div>
                        </div>

                        {/* Tags: domains, keywords, pubs, patents */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                          {[
                            { label: 'Domains', items: entry.research_domains, color: '#A5B4FC', bg: 'rgba(99,102,241,0.12)' },
                            { label: 'Keywords', items: entry.keywords, color: '#22D3EE', bg: 'rgba(6,182,212,0.12)' },
                            { label: 'Publications', items: entry.linked_publications, color: '#FBBF24', bg: 'rgba(245,158,11,0.12)' },
                            { label: 'Patents', items: entry.linked_patents, color: '#34D399', bg: 'rgba(16,185,129,0.12)' },
                          ].filter(g => g.items && g.items.length > 0).map((group, gi) => (
                            <div key={gi}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.35rem' }}>
                                {group.label} ({group.items.length})
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                {group.items.map((item, ii) => (
                                  <span key={ii} style={{
                                    fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                                    borderRadius: '6px', background: group.bg, color: group.color,
                                    maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                  }}>
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
