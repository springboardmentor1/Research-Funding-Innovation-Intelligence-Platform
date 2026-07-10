import React, { useState, useEffect } from 'react';
import { BookOpen, Award, FileText, Search, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function ResearchDataList() {
  const [activeTab, setActiveTab] = useState('publications'); // 'publications', 'grants', 'patents'
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab, query]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = `/research-data/${activeTab}`;
      const res = await api.get(endpoint, {
        params: query ? { query } : {}
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch research data. Make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/research-data/refresh');
      await fetchData();
    } catch (err) {
      console.error(err);
      setError('Failed to trigger database refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div style={{
      background: '#0B0E17',
      minHeight: 'calc(100vh - 70px)',
      color: '#F3F4F6',
      padding: '3rem 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.4rem', color: '#fff' }}>
              Innovation Data Intelligence
            </h1>
            <p style={{ color: '#9CA3AF', fontSize: '1rem' }}>
              Explore real live data harvested from public APIs: OpenAlex Publications, OpenAlex Grants, and USPTO Patents.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(31, 41, 55, 0.4)',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : '' }} />
            {refreshing ? 'Refreshing...' : 'Refresh Ingestion'}
          </button>
        </div>

        {/* Tab Selection & Search */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(17, 24, 39, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '0.85rem 1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(16px)',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '12px' }}>
            <button
              onClick={() => { setActiveTab('publications'); setQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'publications' ? '#6366F1' : 'transparent',
                color: activeTab === 'publications' ? '#fff' : '#9CA3AF',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <BookOpen size={16} />
              Publications ({activeTab === 'publications' ? data.length : '120+'})
            </button>

            <button
              onClick={() => { setActiveTab('grants'); setQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'grants' ? '#6366F1' : 'transparent',
                color: activeTab === 'grants' ? '#fff' : '#9CA3AF',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Award size={16} />
              Grants ({activeTab === 'grants' ? data.length : '120+'})
            </button>

            <button
              onClick={() => { setActiveTab('patents'); setQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'patents' ? '#6366F1' : 'transparent',
                color: activeTab === 'patents' ? '#fff' : '#9CA3AF',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={16} />
              Patents ({activeTab === 'patents' ? data.length : '15'})
            </button>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.8rem',
                borderRadius: '12px',
                background: 'rgba(31, 41, 55, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Content Table */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          backdropFilter: 'blur(16px)'
        }}>
          {loading ? (
            <div style={{ padding: '6rem', textAlign: 'center', color: '#9CA3AF' }}>
              Loading data...
            </div>
          ) : data.length === 0 ? (
            <div style={{ padding: '6rem', textAlign: 'center', color: '#9CA3AF' }}>
              No records found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {activeTab === 'publications' && (
                      <>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Title</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Authors</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Domain</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Year</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Citations</th>
                      </>
                    )}
                    {activeTab === 'grants' && (
                      <>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Grant Title</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Funder</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Award Amount</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Linked Output Papers</th>
                      </>
                    )}
                    {activeTab === 'patents' && (
                      <>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Patent ID</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Invention Title</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Assignee Organization</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>Filing Date</th>
                        <th style={{ padding: '1.2rem 1.5rem', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>CPC Class</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr
                      key={row.id || idx}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        transition: 'background 0.2s',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                    >
                      {activeTab === 'publications' && (
                        <>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', fontWeight: 600, color: '#fff' }}>
                            {row.title}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', color: '#D1D5DB', fontSize: '0.9rem', maxWidth: '300px' }}>
                            {row.authors}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top' }}>
                            <span style={{
                              display: 'inline-block',
                              background: 'rgba(99,102,241,0.12)',
                              color: '#A5B4FC',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {row.domain || 'Computer Science'}
                            </span>
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', color: '#D1D5DB', fontSize: '0.9rem' }}>
                            {row.year}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', color: '#34D399', fontSize: '0.9rem', fontWeight: 700 }}>
                            {row.cited_by_count}
                          </td>
                        </>
                      )}
                      {activeTab === 'grants' && (
                        <>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', fontWeight: 600, color: '#fff' }}>
                            {row.title}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', color: '#D1D5DB', fontSize: '0.9rem' }}>
                            {row.funder_name}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', color: '#FBBF24', fontSize: '0.9rem', fontWeight: 700 }}>
                            {row.award_amount ? `$${Number(row.award_amount).toLocaleString()}` : 'N/A'}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', color: '#D1D5DB', fontSize: '0.9rem', textAlign: 'center' }}>
                            <span style={{
                              background: 'rgba(255,255,255,0.08)',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontWeight: 600
                            }}>
                              {row.linked_works_count}
                            </span>
                          </td>
                        </>
                      )}
                      {activeTab === 'patents' && (
                        <>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', color: '#818CF8', fontSize: '0.9rem', fontWeight: 700 }}>
                            {row.patent_number}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', fontWeight: 600, color: '#fff' }}>
                            {row.title}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', color: '#D1D5DB', fontSize: '0.9rem' }}>
                            {row.assignee}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top', color: '#D1D5DB', fontSize: '0.9rem' }}>
                            {row.filing_date}
                          </td>
                          <td style={{ padding: '1.2rem 1.5rem', verticalAlign: 'top' }}>
                            <span style={{
                              display: 'inline-block',
                              background: 'rgba(6,182,212,0.12)',
                              color: '#22D3EE',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {row.technology_domain}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Dynamic spinning animation helper */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
