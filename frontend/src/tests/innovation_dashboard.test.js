import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InnovationDashboard from '../pages/InnovationDashboard';
import innovationDashboardService from '../services/innovationDashboardService';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock recharts to prevent JSDOM layout sizing errors
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => React.createElement('div', { className: 'responsive-container' }, children),
  AreaChart: ({ children, data }) => 
    React.createElement('div', { 'data-testid': 'AreaChart', 'data-data': JSON.stringify(data) }, children),
  Area: () => React.createElement('div', { 'data-testid': 'Area' }),
  BarChart: ({ children, data }) => 
    React.createElement('div', { 'data-testid': 'BarChart', 'data-data': JSON.stringify(data) }, children),
  Bar: () => React.createElement('div', { 'data-testid': 'Bar' }),
  LineChart: ({ children, data }) => 
    React.createElement('div', { 'data-testid': 'LineChart', 'data-data': JSON.stringify(data) }, children),
  Line: () => React.createElement('div', { 'data-testid': 'Line' }),
  PieChart: ({ children }) => React.createElement('div', { 'data-testid': 'PieChart' }, children),
  Pie: ({ data }) => React.createElement('div', { 'data-testid': 'Pie', 'data-data': JSON.stringify(data) }),
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

// Mock Full Executive Dashboard API Payload
const mockInnovationDashboardData = {
  summary: {
    total_domains: 25,
    emerging: 1,
    growing: 0,
    mature: 2,
    declining: 22,
    high_momentum: 0,
    commercialization_ready: 2,
    immediate_investment: 0,
    strategic_monitoring: 2,
    average_innovation_score: 43.5,
    average_opportunity_score: 38.6,
    average_commercialization_readiness: 48.2,
    average_risk_score: 56.5,
    last_updated: '2026-08-05T20:38:00+05:30'
  },
  metadata: {
    dashboard_version: '1.0',
    generated_at: '2026-08-05T20:38:00+05:30',
    analytics_status: 'Healthy',
    modules_loaded: 4
  },
  patent_landscape: {
    summary_kpis: {
      total_patents: 5000,
      total_domains: 25,
      top_assignee: 'Institute of Technology',
      top_country: 'US',
      annual_filing_trend: 'Declining'
    },
    domain_distribution_chart: [
      { domain: 'Artificial Intelligence', count: 200, share: 4.0 }
    ],
    clusters_breakdown: [
      { cluster: 'Core AI & Algorithms', count: 1800 }
    ]
  },
  technology_intelligence: {
    summary_kpis: {
      total_technology_domains: 25,
      emerging_technologies_count: 1
    },
    maturity_distribution_chart: [
      { status: 'Emerging', count: 1 }
    ],
    emerging_technology_leaderboard: [
      { technology: 'Natural Language Processing', growth_percentage: 29.03, maturity_stage: 'Emerging', patent_volume: 200 }
    ]
  },
  innovation_scores: {
    summary_kpis: {
      total_domains_evaluated: 25,
      highest_scoring_domain: 'Natural Language Processing',
      highest_overall_score: 55.4
    },
    score_distribution_chart: [
      { classification: 'Weak', count: 22 }
    ]
  },
  commercialization: {
    summary_kpis: {
      top_commercialization_domain: 'Natural Language Processing',
      high_investment_priority_count: 1,
      ready_for_transfer_count: 2
    },
    strategy_distribution: [
      { strategy: 'Startup Incubation', count: 1 }
    ]
  }
};

describe('Innovation Dashboard Frontend Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('access_token', 'mock_jwt_token_string');
    localStorage.setItem('user', JSON.stringify({ full_name: 'Admin User', role: 'Administrator' }));
  });

  it('[OK] Dashboard Loaded', async () => {
    vi.spyOn(innovationDashboardService, 'getInnovationDashboard').mockResolvedValue(mockInnovationDashboardData);

    render(React.createElement(InnovationDashboard));

    expect(screen.getByTestId('LoadingSpinner')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('InnovationDashboard')).toBeInTheDocument();
      expect(screen.queryByTestId('LoadingSpinner')).not.toBeInTheDocument();
    });
  });

  it('[OK] KPI Cards Rendered', async () => {
    vi.spyOn(innovationDashboardService, 'getInnovationDashboard').mockResolvedValue(mockInnovationDashboardData);

    render(React.createElement(InnovationDashboard));

    await waitFor(() => {
      expect(screen.getByTestId('ExecutiveSummary')).toBeInTheDocument();
      const kpiCards = screen.getAllByTestId('KpiCard');
      expect(kpiCards.length).toBe(11);
    });
  });

  it('[OK] Dashboard Metadata Rendered', async () => {
    vi.spyOn(innovationDashboardService, 'getInnovationDashboard').mockResolvedValue(mockInnovationDashboardData);

    render(React.createElement(InnovationDashboard));

    await waitFor(() => {
      expect(screen.getByTestId('DashboardMetadata')).toBeInTheDocument();
      expect(screen.getByText('Healthy')).toBeInTheDocument();
      expect(screen.getByText('v1.0')).toBeInTheDocument();
      expect(screen.getByText('4 / 4')).toBeInTheDocument();
    });
  });

  it('[OK] Patent Charts Rendered', async () => {
    vi.spyOn(innovationDashboardService, 'getInnovationDashboard').mockResolvedValue(mockInnovationDashboardData);

    render(React.createElement(InnovationDashboard));

    await waitFor(() => {
      expect(screen.getByTestId('PatentLandscapeSection')).toBeInTheDocument();
    });
  });

  it('[OK] Technology Charts Rendered', async () => {
    vi.spyOn(innovationDashboardService, 'getInnovationDashboard').mockResolvedValue(mockInnovationDashboardData);

    render(React.createElement(InnovationDashboard));

    await waitFor(() => {
      expect(screen.getByTestId('TechnologyIntelligenceSection')).toBeInTheDocument();
    });
  });

  it('[OK] Innovation Charts Rendered', async () => {
    vi.spyOn(innovationDashboardService, 'getInnovationDashboard').mockResolvedValue(mockInnovationDashboardData);

    render(React.createElement(InnovationDashboard));

    await waitFor(() => {
      expect(screen.getByTestId('InnovationScoringSection')).toBeInTheDocument();
    });
  });

  it('[OK] Commercialization Charts Rendered', async () => {
    vi.spyOn(innovationDashboardService, 'getInnovationDashboard').mockResolvedValue(mockInnovationDashboardData);

    render(React.createElement(InnovationDashboard));

    await waitFor(() => {
      expect(screen.getByTestId('CommercializationSection')).toBeInTheDocument();
    });
  });

  it('[OK] Role Rendering Valid', async () => {
    const researcherData = {
      summary: mockInnovationDashboardData.summary,
      metadata: mockInnovationDashboardData.metadata,
      technology_intelligence: mockInnovationDashboardData.technology_intelligence,
      innovation_scores: mockInnovationDashboardData.innovation_scores
    };

    vi.spyOn(innovationDashboardService, 'getInnovationDashboard').mockResolvedValue(researcherData);

    render(React.createElement(InnovationDashboard));

    await waitFor(() => {
      expect(screen.getByTestId('ExecutiveSummary')).toBeInTheDocument();
      expect(screen.getByTestId('DashboardMetadata')).toBeInTheDocument();
      expect(screen.getByTestId('TechnologyIntelligenceSection')).toBeInTheDocument();
      expect(screen.getByTestId('InnovationScoringSection')).toBeInTheDocument();
      expect(screen.queryByTestId('PatentLandscapeSection')).not.toBeInTheDocument();
      expect(screen.queryByTestId('CommercializationSection')).not.toBeInTheDocument();
    });
  });

  it('[OK] JWT Handling Valid', async () => {
    const error401 = {
      response: { status: 401, data: { detail: 'Could not validate credentials' } }
    };
    vi.spyOn(innovationDashboardService, 'getInnovationDashboard').mockRejectedValue(error401);

    render(React.createElement(InnovationDashboard));

    await waitFor(() => {
      expect(screen.getByTestId('ErrorMessage')).toBeInTheDocument();
      expect(screen.getByText('Could not validate credentials')).toBeInTheDocument();
    });
  });
});
