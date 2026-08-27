import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Users, TrendingUp, DollarSign, Layers, AlertCircle, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function InnovationManagerDashboard() {
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
      const res = await api.get('/v1/dashboards/innovation-manager');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load innovation manager dashboard:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const processPipelineChartData = () => {
    if (!dashboardData?.innovation_pipeline || dashboardData.innovation_pipeline.length === 0) {
      return { labels: [], datasets: [] };
    }

    const stages = dashboardData.innovation_pipeline.map(s => s.stage);
    const counts = dashboardData.innovation_pipeline.map(s => s.count);

    const colors = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E'];

    return {
      labels: stages,
      datasets: [{
        label: 'Projects',
        data: counts,
        backgroundColor: stages.map((_, i) => colors[i % colors.length] + '99'),
        borderColor: stages.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 48,
      }]
    };
  };

  if (loading) {
    return (
      <div style={{
        color: '#9CA3AF', padding: '3rem', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '0.75rem', fontSize: '1.05rem', fontWeight: 600,
        minHeight: '60vh'
      }}>
        <div style={{
          width: '24px', height: '24px', border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366F1', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        Loading innovation analytics...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
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

  const { portfolio_analytics, innovation_pipeline, technology_trend_monitoring, funding_analytics } = dashboardData;

  // Styles
  const cardStyle = {
    background: 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(17,24,39,0.85) 100%)',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const kpiValueStyle = {
    fontSize: '2.5rem',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  };

  const kpiLabelStyle = {
    color: '#9CA3AF',
    fontSize: '0.85rem',
    fontWeight: 500,
    marginTop: '0.35rem',
    letterSpacing: '0.02em',
  };

  const iconBadgeStyle = (color) => ({
    width: '44px', height: '44px', borderRadius: '12px',
    background: `${color}18`, display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  });

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1280px', margin: '0 auto', color: '#E5E7EB' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
          Innovation Manager Dashboard
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Portfolio performance, pipeline health, and market intelligence at a glance.
        </p>
      </div>

      {/* ─── KPI Cards Row ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>

        {/* Total Researchers */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={iconBadgeStyle('#6366F1')}><Users size={22} color="#818CF8" /></div>
          </div>
          <div style={{ ...kpiValueStyle, color: '#818CF8' }}>
            {portfolio_analytics?.total_researchers ?? 0}
          </div>
          <div style={kpiLabelStyle}>Total Researchers</div>
        </div>

        {/* Average Innovation Score */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={iconBadgeStyle('#10B981')}><Zap size={22} color="#34D399" /></div>
          </div>
          <div style={{ ...kpiValueStyle, color: '#34D399' }}>
            {portfolio_analytics?.avg_innovation_score ?? 0}
            <span style={{ fontSize: '1.1rem', fontWeight: 500, color: '#6B7280' }}>/100</span>
          </div>
          <div style={kpiLabelStyle}>Avg Innovation Score</div>
        </div>

        {/* Total Grant Opportunities */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={iconBadgeStyle('#F59E0B')}><DollarSign size={22} color="#FBBF24" /></div>
          </div>
          <div style={{ ...kpiValueStyle, color: '#FBBF24' }}>
            {funding_analytics?.total_grant_opportunities ?? 0}
          </div>
          <div style={kpiLabelStyle}>Grant Opportunities</div>
        </div>

        {/* Pipeline Projects */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={iconBadgeStyle('#F43F5E')}><Layers size={22} color="#FB7185" /></div>
          </div>
          <div style={{ ...kpiValueStyle, color: '#FB7185' }}>
            {innovation_pipeline ? innovation_pipeline.reduce((sum, s) => sum + s.count, 0) : 0}
          </div>
          <div style={kpiLabelStyle}>Pipeline Projects</div>
        </div>
      </div>

      {/* ─── Two-Column: Pipeline Chart + Trend Monitoring ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Innovation Pipeline Chart */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Layers size={20} style={{ color: '#818CF8' }} />
            Innovation Pipeline
          </h2>
          {innovation_pipeline && innovation_pipeline.length > 0 ? (
            <div style={{ height: '280px' }}>
              <Bar
                data={processPipelineChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    x: {
                      ticks: { color: '#9CA3AF', font: { weight: 600 } },
                      grid: { display: false },
                    },
                    y: {
                      ticks: { color: '#6B7280', stepSize: 5 },
                      grid: { color: 'rgba(255,255,255,0.04)' },
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div style={{ color: '#6B7280', textAlign: 'center', padding: '3rem 0' }}>
              No pipeline data available.
            </div>
          )}

          {/* Stage badges underneath */}
          {innovation_pipeline && innovation_pipeline.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
              {innovation_pipeline.map((stage, idx) => {
                const colors = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#F43F5E'];
                const c = colors[idx % colors.length];
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: `${c}12`, padding: '0.4rem 0.85rem', borderRadius: '20px',
                    border: `1px solid ${c}30`,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: c }}>{stage.stage}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>({stage.count})</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Technology Trend Monitoring */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <TrendingUp size={20} style={{ color: '#34D399' }} />
            Technology Trends
          </h2>
          {technology_trend_monitoring && technology_trend_monitoring.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {technology_trend_monitoring.map((trend, i) => {
                const growth = trend.growth_percent ?? 0;
                const isPositive = growth > 0;
                const barWidth = Math.min(Math.abs(growth) * 2, 100);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.85rem', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'background 0.2s',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#E5E7EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trend.domain}
                      </div>
                      <div style={{
                        height: '4px', borderRadius: '2px', marginTop: '0.4rem',
                        background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${barWidth}%`, height: '100%', borderRadius: '2px',
                          background: isPositive
                            ? 'linear-gradient(90deg, #10B981, #34D399)'
                            : 'linear-gradient(90deg, #EF4444, #F87171)',
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
                      color: isPositive ? '#34D399' : '#F87171',
                    }}>
                      {isPositive ? '+' : ''}{growth}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: '#6B7280', textAlign: 'center', padding: '3rem 0' }}>
              No trend data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
