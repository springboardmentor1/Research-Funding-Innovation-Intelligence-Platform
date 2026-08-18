import { vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';

// Make React global in test environment
globalThis.React = React;

// ── Mock window.matchMedia (jsdom doesn't support it) ───────────────────────
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── Mock react-router-dom ───────────────────────────────────────────────────
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => React.createElement('div', null, children),
  Routes: ({ children }) => React.createElement('div', null, children),
  Route: () => null,
  Navigate: ({ to }) => React.createElement('div', null, `Navigating to ${to}`),
  Link: ({ children, to }) => React.createElement('a', { href: to }, children),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  Outlet: () => React.createElement('div', null, 'Outlet'),
}));

// ── Mock react-hot-toast ────────────────────────────────────────────────────
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}));

// ── Mock ThemeContext ────────────────────────────────────────────────────────
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
  ThemeProvider: ({ children }) => React.createElement('div', null, children),
}));

// ── Mock recharts (renders nothing instead of real SVG) ─────────────────────
vi.mock('recharts', () => {
  const MockContainer = ({ children }) => React.createElement('div', { 'data-testid': 'recharts-mock' }, children);
  const MockComponent = () => React.createElement('div', null);

  return {
    ResponsiveContainer: MockContainer,
    LineChart: MockContainer,
    BarChart: MockContainer,
    PieChart: MockContainer,
    AreaChart: MockContainer,
    RadarChart: MockContainer,
    RadialBarChart: MockContainer,
    ComposedChart: MockContainer,
    Line: MockComponent,
    Bar: MockComponent,
    Pie: MockComponent,
    Area: MockComponent,
    Radar: MockComponent,
    RadialBar: MockComponent,
    XAxis: MockComponent,
    YAxis: MockComponent,
    ZAxis: MockComponent,
    CartesianGrid: MockComponent,
    Tooltip: MockComponent,
    Legend: MockComponent,
    Cell: MockComponent,
    PolarGrid: MockComponent,
    PolarAngleAxis: MockComponent,
    PolarRadiusAxis: MockComponent,
    Brush: MockComponent,
    ReferenceLine: MockComponent,
    ReferenceArea: MockComponent,
    Label: MockComponent,
    LabelList: MockComponent,
    Scatter: MockComponent,
    Treemap: MockComponent,
  };
});
