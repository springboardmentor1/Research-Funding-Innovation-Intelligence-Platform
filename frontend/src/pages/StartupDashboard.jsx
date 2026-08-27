import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, Lightbulb, Briefcase, Award, AlertCircle } from 'lucide-react';

export default function StartupDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await api.get('/v1/dashboards/startup');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load startup dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackGrant = async (id) => {
    try {
      await api.post(`/v1/funding/${id}/track`, { status: 'interested', notes: 'Tracked from Startup Dashboard' });
      alert('Successfully tracked grant!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert('You are already tracking this grant.');
      } else {
        alert('Failed to track grant.');
      }
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading startup intelligence data...</div>;
  }

  if (error) {
    return (
      <div style={{ color: '#F87171', padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#E5E7EB' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white' }}>
        Startup Intelligence Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Technology Opportunities */}
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} style={{ color: '#34D399' }} />
            Emerging Tech Opportunities
          </h2>
          {dashboardData.technology_opportunities && dashboardData.technology_opportunities.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {dashboardData.technology_opportunities.map((item, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    background: 'rgba(52, 211, 153, 0.1)', 
                    color: '#34D399', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '16px',
                    fontSize: '0.9rem',
                    border: '1px solid rgba(52, 211, 153, 0.2)'
                  }}
                  title={`Growth Score: ${item.growth_score}`}
                >
                  {item.keyword}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ color: '#9CA3AF' }}>No emerging technologies detected yet.</div>
          )}
        </div>

        {/* Commercialization Insights */}
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={20} style={{ color: '#FBBF24' }} />
            Commercialization Insights
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#E5E7EB' }}>Productization Ideas:</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, color: '#9CA3AF' }}>
                {dashboardData.commercialization_insights?.productization?.map((item, i) => <li key={i}>{item}</li>)}
                {(!dashboardData.commercialization_insights?.productization || dashboardData.commercialization_insights.productization.length === 0) && <li>None available</li>}
              </ul>
            </div>
            <div>
              <strong style={{ color: '#E5E7EB' }}>Partnerships:</strong>
              <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, color: '#9CA3AF' }}>
                {dashboardData.commercialization_insights?.partnerships?.map((item, i) => <li key={i}>{item}</li>)}
                {(!dashboardData.commercialization_insights?.partnerships || dashboardData.commercialization_insights.partnerships.length === 0) && <li>None available</li>}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Patent Intelligence */}
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={20} style={{ color: '#60A5FA' }} />
            Patent Intelligence
          </h2>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
            {dashboardData.patent_intelligence?.competitor_patents_tracked || 0}
          </div>
          <div style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>Competitor Patents Tracked</div>
        </div>
      </div>

      {/* Funding Opportunities */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
          <Award size={24} style={{ color: '#F472B6' }} />
          Top Startup Funding Opportunities
        </h2>
        {dashboardData.funding_opportunities && dashboardData.funding_opportunities.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {dashboardData.funding_opportunities.map((rec) => (
              <div key={rec.id} style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: 'white', flex: 1, paddingRight: '1rem' }}>
                    {rec.title}
                  </h3>
                  <span style={{ background: 'rgba(244, 114, 182, 0.1)', color: '#F472B6', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {(rec.match_score * 100).toFixed(0)}% Match
                  </span>
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <strong>Source:</strong> {rec.source}
                </div>
                {rec.deadline_date && (
                  <div style={{ color: '#9CA3AF', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    <strong>Deadline:</strong> {new Date(rec.deadline_date).toLocaleDateString()}
                  </div>
                )}
                <div style={{ marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleTrackGrant(rec.id)}
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem', 
                      background: '#3B82F6', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#2563EB'}
                    onMouseOut={(e) => e.target.style.background = '#3B82F6'}
                  >
                    Track this Opportunity
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#9CA3AF', background: '#111827', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #1F2937' }}>
            No funding opportunities available. Make sure your profile is set up.
          </div>
        )}
      </div>
    </div>
  );
}
