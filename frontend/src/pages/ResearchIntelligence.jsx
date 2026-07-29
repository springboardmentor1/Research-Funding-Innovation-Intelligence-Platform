import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, FileText, Target, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ResearchIntelligence() {
  const [trends, setTrends] = useState([]);
  const [hotspots, setHotspots] = useState({ hotspots: [], emerging_keywords: [] });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [trendsRes, hotspotsRes, recsRes] = await Promise.all([
        api.get('/v1/research/trends'),
        api.get('/v1/research/hotspots'),
        api.get('/v1/funding/recommendations?limit=5')
      ]);

      setTrends(trendsRes.data);
      setHotspots(hotspotsRes.data);
      setRecommendations(recsRes.data);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackGrant = async (id) => {
    try {
      await api.post(`/v1/funding/${id}/track`, { status: 'interested', notes: 'Tracked from Intelligence Dashboard' });
      alert('Successfully tracked grant!');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert('You are already tracking this grant.');
      } else {
        alert('Failed to track grant.');
      }
    }
  };

  const processChartData = () => {
    if (!trends || trends.length === 0) return { labels: [], datasets: [] };

    const years = [...new Set(trends.map(t => t.year))].sort();
    const domains = [...new Set(trends.map(t => t.domain))];

    const generateColor = (index) => {
      const hue = (index * 137.508) % 360; // Golden angle to ensure distinct hues
      return `hsl(${hue}, 70%, 60%)`;
    };

    const datasets = domains.map((domain, i) => {
      const data = years.map(year => {
        const item = trends.find(t => t.domain === domain && t.year === year);
        return item ? item.count : 0;
      });

      const color = generateColor(i);

      return {
        label: domain,
        data,
        borderColor: color,
        backgroundColor: color,
        tension: 0.3
      };
    });

    return { labels: years, datasets };
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading intelligence data...</div>;
  }

  if (error) {
    return (
      <div style={{ color: '#F87171', padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={20} />
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#E5E7EB' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white' }}>
        Research Intelligence Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Trend Chart */}
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} style={{ color: '#60A5FA' }} />
            Publication Trends by Domain
          </h2>
          {trends.length > 0 ? (
            <div style={{ height: '300px' }}>
              <Line 
                data={processChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top', labels: { color: '#9CA3AF' } } },
                  scales: {
                    x: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } },
                    y: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } }
                  }
                }} 
              />
            </div>
          ) : (
            <div style={{ color: '#9CA3AF' }}>No trend data available.</div>
          )}
        </div>

        {/* Emerging Keywords */}
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} style={{ color: '#34D399' }} />
            Emerging Topics
          </h2>
          {hotspots.emerging_keywords && hotspots.emerging_keywords.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {hotspots.emerging_keywords.map((item, idx) => (
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
            <div style={{ color: '#9CA3AF' }}>No emerging topics detected yet.</div>
          )}
          
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <TrendingUp size={20} style={{ color: '#F472B6' }} />
             Hotspot Domains
          </h2>
          {hotspots.hotspots && hotspots.hotspots.length > 0 ? (
             <ul style={{ listStyleType: 'none', padding: 0 }}>
               {hotspots.hotspots.slice(0, 5).map((h, i) => (
                 <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1F2937', paddingBottom: '0.5rem' }}>
                   <span>{h.domain}</span>
                   <span style={{ color: h.growth_percent > 0 ? '#34D399' : '#9CA3AF' }}>
                     {h.growth_percent > 0 ? '+' : ''}{h.growth_percent}%
                   </span>
                 </li>
               ))}
             </ul>
          ) : (
            <div style={{ color: '#9CA3AF' }}>No domain hotspots available.</div>
          )}
        </div>
      </div>

      {/* Funding Recommendations */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
          <FileText size={24} style={{ color: '#FBBF24' }} />
          Top Funding Recommendations
        </h2>
        {recommendations.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {recommendations.map((rec) => (
              <div key={rec.id} style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: 'white', flex: 1, paddingRight: '1rem' }}>
                    {rec.title}
                  </h3>
                  <span style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#FBBF24', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
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
                    Track this Grant
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#9CA3AF', background: '#111827', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #1F2937' }}>
            No funding recommendations available. Make sure your profile is set up.
          </div>
        )}
      </div>
    </div>
  );
}
