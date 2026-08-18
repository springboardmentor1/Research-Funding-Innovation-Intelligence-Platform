/**
 * Page Component Smoke Tests
 *
 * Verifies all 18 page components render without crashing.
 * Each test renders the component in isolation with mocked dependencies
 * (API client, router, recharts, ThemeContext) and asserts no errors.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mock API client for all page smoke tests
vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// ── Page Imports ────────────────────────────────────────────────────────────
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import ResearchSearch from '../pages/ResearchSearch';
import FundingSearch from '../pages/FundingSearch';
import PatentSearch from '../pages/PatentSearch';
import ResearchDashboard from '../pages/ResearchDashboard';
import FundingRecommendation from '../pages/FundingRecommendation';
import PublicationTrends from '../pages/PublicationTrends';
import ResearchIntelligence from '../pages/ResearchIntelligence';
import FundingAnalytics from '../pages/FundingAnalytics';
import PatentAnalytics from '../pages/PatentAnalytics';
import TechnologyIntelligence from '../pages/TechnologyIntelligence';
import InnovationScoring from '../pages/InnovationScoring';
import InnovationDashboard from '../pages/InnovationDashboard';
import ExecutiveDashboard from '../pages/ExecutiveDashboard';
import Reports from '../pages/Reports';

// ── Helpers ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'mock-jwt-token');
  localStorage.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }));
  vi.clearAllMocks();
});

/**
 * Renders a component and asserts no error was thrown.
 * Returns the container for optional further assertions.
 */
function smokeRender(Component, name) {
  const { container } = render(<Component />);
  expect(container).toBeTruthy();
  return container;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Page Smoke Tests — Authentication Pages', () => {
  it('Login renders without crashing', () => {
    smokeRender(Login, 'Login');
  });

  it('Register renders without crashing', () => {
    smokeRender(Register, 'Register');
  });
});

describe('Page Smoke Tests — Core Pages', () => {
  it('Dashboard renders without crashing', () => {
    smokeRender(Dashboard, 'Dashboard');
  });

  it('Profile renders without crashing', () => {
    smokeRender(Profile, 'Profile');
  });

  it('ResearchSearch renders without crashing', () => {
    smokeRender(ResearchSearch, 'ResearchSearch');
  });

  it('FundingSearch renders without crashing', () => {
    smokeRender(FundingSearch, 'FundingSearch');
  });

  it('PatentSearch renders without crashing', () => {
    smokeRender(PatentSearch, 'PatentSearch');
  });
});

describe('Page Smoke Tests — Intelligence Pages', () => {
  it('ResearchDashboard renders without crashing', () => {
    smokeRender(ResearchDashboard, 'ResearchDashboard');
  });

  it('FundingRecommendation renders without crashing', () => {
    smokeRender(FundingRecommendation, 'FundingRecommendation');
  });

  it('PublicationTrends renders without crashing', () => {
    smokeRender(PublicationTrends, 'PublicationTrends');
  });

  it('ResearchIntelligence renders without crashing', () => {
    smokeRender(ResearchIntelligence, 'ResearchIntelligence');
  });

  it('FundingAnalytics renders without crashing', () => {
    smokeRender(FundingAnalytics, 'FundingAnalytics');
  });
});

describe('Page Smoke Tests — Innovation Pages', () => {
  it('PatentAnalytics renders without crashing', () => {
    smokeRender(PatentAnalytics, 'PatentAnalytics');
  });

  it('TechnologyIntelligence renders without crashing', () => {
    smokeRender(TechnologyIntelligence, 'TechnologyIntelligence');
  });

  it('InnovationScoring renders without crashing', () => {
    smokeRender(InnovationScoring, 'InnovationScoring');
  });

  it('InnovationDashboard renders without crashing', () => {
    smokeRender(InnovationDashboard, 'InnovationDashboard');
  });
});

describe('Page Smoke Tests — Milestone 4 Pages', () => {
  it('ExecutiveDashboard renders without crashing', () => {
    smokeRender(ExecutiveDashboard, 'ExecutiveDashboard');
  });

  it('Reports renders without crashing', () => {
    smokeRender(Reports, 'Reports');
  });
});
