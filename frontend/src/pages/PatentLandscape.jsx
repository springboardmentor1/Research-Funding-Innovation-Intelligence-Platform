import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Briefcase, Activity, Users, Map, Settings } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function PatentLandscape() {
  const [trends, setTrends] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clusteringLoading, setClusteringLoading] = useState(false);

  useEffect(() => {
    fetchLandscapeData();
  }, []);

  const fetchLandscapeData = async () => {
    try {
      setLoading(true);
      const [trendsRes, compRes, mapRes] = await Promise.all([
        api.get('/patents/trends?split_by=domain'),
        api.get('/patents/competitor-analysis'),
        api.get('/patents/innovation-mapping')
      ]);

      setTrends(trendsRes.data.trends || []);
      setCompetitors(compRes.data.competitor_data || []);
      setMapping(mapRes.data.mapping_data || []);
    } catch (err) {
      console.error('Failed to load patent landscape data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunClustering = async () => {
    try {
      setClusteringLoading(true);
      await api.post('/patents/cluster');
      alert('Clustering completed successfully! Refreshing data...');
      await fetchLandscapeData();
    } catch (err) {
      console.error('Failed to run clustering:', err);
      alert('Failed to run clustering.');
    } finally {
      setClusteringLoading(false);
    }
  };

  const processTrendChartData = () => {
    if (!trends || trends.length === 0) return { labels: [], datasets: [] };

    const years = [...new Set(trends.map(t => t.year))].sort();
    const domains = [...new Set(trends.map(t => t.category))];

    const generateColor = (index) => {
      const hue = (index * 137.508) % 360; 
      return `hsl(${hue}, 70%, 60%)`;
    };

    const datasets = domains.map((domain, i) => {
      const data = years.map(year => {
        const item = trends.find(t => t.category === domain && t.year === year);
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

  const processCompetitorChartData = () => {
    if (!competitors || competitors.length === 0) return { labels: [], datasets: [] };
    
    // Sort by patent count descending
    const sortedComps = [...competitors].sort((a, b) => b.patent_count - a.patent_count);
    
    return {
      labels: sortedComps.map(c => c.assignee),
      datasets: [
        {
          label: 'Patent Count',
          data: sortedComps.map(c => c.patent_count),
          backgroundColor: '#3B82F6',
        }
      ]
    };
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading patent landscape data...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#E5E7EB' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
          Patent Landscape Analysis
        </h1>
        <button 
          onClick={handleRunClustering}
          disabled={clusteringLoading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: clusteringLoading ? '#4B5563' : '#10B981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: clusteringLoading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'background 0.2s'
          }}
        >
          <Settings size={18} style={{ animation: clusteringLoading ? 'spin 2s linear infinite' : 'none' }} />
          {clusteringLoading ? 'Running AI Clustering...' : 'Run Patent Clustering'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Trend Chart */}
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} style={{ color: '#60A5FA' }} />
            Patent Filing Trends by Domain
          </h2>
          {trends.length > 0 ? (
            <div style={{ height: '300px' }}>
              <Line 
                data={processTrendChartData()} 
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

        {/* Competitor Analysis Chart */}
        <div style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: '#F87171' }} />
            Top Assignees (Competitor Analysis)
          </h2>
          {competitors.length > 0 ? (
            <div style={{ height: '300px' }}>
              <Bar 
                data={processCompetitorChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: '#9CA3AF', maxRotation: 45, minRotation: 45 }, grid: { display: false } },
                    y: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } }
                  }
                }} 
              />
            </div>
          ) : (
            <div style={{ color: '#9CA3AF' }}>No competitor data available.</div>
          )}
        </div>
      </div>

      {/* Innovation Mapping */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
          <Map size={24} style={{ color: '#FBBF24' }} />
          Innovation Mapping (AI Clusters)
        </h2>
        {mapping.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[...new Set(mapping.map(m => m.cluster_label))].filter(Boolean).map((clusterLabel, idx) => (
              <div key={idx} style={{ background: '#111827', padding: '1.5rem', borderRadius: '12px', border: '1px solid #1F2937' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 1rem 0', color: '#FBBF24' }}>
                  {clusterLabel}
                </h3>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {mapping.filter(m => m.cluster_label === clusterLabel).sort((a, b) => b.count - a.count).map((m, i) => (
                    <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #374151', color: '#E5E7EB' }}>
                      <span style={{ fontWeight: '500' }}>{m.assignee}</span>
                      <span style={{ color: '#9CA3AF' }}>{m.count} patents</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#9CA3AF', background: '#111827', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #1F2937' }}>
            No innovation mapping data available. Run Patent Clustering to generate clusters.
          </div>
        )}
      </div>
      
      {/* Add spin animation style block */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
