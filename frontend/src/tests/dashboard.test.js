import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../pages/Dashboard';
import dashboardService from '../services/dashboardService';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock recharts to prevent JSDOM layout sizing errors without using JSX
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

// Dummy API response payload
const mockDashboardData = {
  summary: {
    total_publications: 5000,
    total_patents: 3000,
    total_funding_opportunities: 1500,
    total_research_domains: 12,
    total_funding_agencies: 8,
    total_countries: 5,
    last_analytics_update: '2026-07-20 20:00:00',
  },
  publications: {
    publications_per_year: [
      { year: 2020, count: 120 },
      { year: 2021, count: 150 },
    ],
    publications_by_domain: [
      { domain: 'Computer Science', count: 800 },
      { domain: 'Mathematics', count: 400 },
    ],
    open_access_distribution: [
      { status: 'Open Access', count: 400, percentage: 50.0 },
      { status: 'Closed Access', count: 400, percentage: 50.0 },
    ],
  },
  patents: {
    patent_activity_timeline: {
      timeline: [
        { year: 2020, patents: 45 },
        { year: 2021, patents: 60 },
      ],
    },
    patent_status_distribution: [
      { status: 'GRANTED', count: 30, percentage: 50.0 },
      { status: 'FILED', count: 30, percentage: 50.0 },
    ],
    country_distribution: [{ country: 'US', count: 60 }],
    top_assignees: [{ assignee: 'Cyberdyne Research Labs', count: 20 }],
  },
  funding: {
    application_deadline_timeline: {
      timeline: [{ year: 2026, opportunities: 80 }],
    },
    funding_type_distribution: [{ funding_type: 'Grant', count: 50 }],
    top_funding_agencies: [{ agency: 'National Science Foundation', count: 25 }],
    funding_amount_statistics: {
      total_funding_amount: 50000000.0,
      average_funding_amount: 100000.0,
      max_funding_amount: 500000.0,
      min_funding_amount: 5000.0,
    },
  },
};

describe('Research Intelligence Dashboard Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loading state initially', async () => {
    const mockPromise = new Promise(() => {});
    vi.spyOn(dashboardService, 'getDashboardAnalytics').mockImplementation(() => mockPromise);

    render(React.createElement(Dashboard));
    expect(screen.getByText(/Assembling Intelligence Analytics.../i)).toBeInTheDocument();
  });

  it('renders the error state on API failure', async () => {
    const errorDetails = 'Connection refused. API server offline.';
    vi.spyOn(dashboardService, 'getDashboardAnalytics').mockRejectedValue({
      response: { data: { detail: errorDetails } },
    });

    render(React.createElement(Dashboard));

    await waitFor(() => {
      expect(screen.getByText(errorDetails)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
    });
  });

  it('renders dashboard KPI cards and Recharts widgets on successful API call', async () => {
    vi.spyOn(dashboardService, 'getDashboardAnalytics').mockResolvedValue(mockDashboardData);

    render(React.createElement(Dashboard));

    await waitFor(() => {
      expect(screen.getByText('Innovation & Funding Intelligence')).toBeInTheDocument();
    });

    expect(screen.getByText('Updated: 2026-07-20 20:00:00')).toBeInTheDocument();

    expect(screen.getByText('Total Publications')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();

    expect(screen.getByText('Total Patents')).toBeInTheDocument();
    expect(screen.getByText('3,000')).toBeInTheDocument();

    expect(screen.getByText('Funding Opportunities')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();

    expect(screen.getByText('Publications Portfolio Analytics')).toBeInTheDocument();
    expect(screen.getByText('Intellectual Property & Patents')).toBeInTheDocument();
    expect(screen.getByText('Capital Grants & Funding Landscapes')).toBeInTheDocument();

    expect(screen.getAllByTestId('AreaChart').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('BarChart').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('LineChart').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('PieChart').length).toBeGreaterThan(0);
  });

  it('clears credentials and redirects to login on 401 unauthenticated errors', async () => {
    vi.spyOn(dashboardService, 'getDashboardAnalytics').mockRejectedValue({
      response: { status: 401 },
    });

    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    render(React.createElement(Dashboard));

    await waitFor(() => {
      expect(screen.getByText(/Session expired. Redirecting to login page.../i)).toBeInTheDocument();
    });

    expect(removeItemSpy).toHaveBeenCalledWith('access_token');
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });
});
