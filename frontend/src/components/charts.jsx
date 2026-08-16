// Thin wrappers over recharts so pages stay readable.
// Each takes plain data arrays and renders one chart. All share the dark theme.

import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const AXIS = { stroke: "#94a3b8", fontSize: 12 };
const GRID = "#2d3a56";
const tooltipStyle = {
  contentStyle: { background: "#1a2338", border: "1px solid #2d3a56", borderRadius: 8, color: "#e8edf5" },
  labelStyle: { color: "#94a3b8" },
};

export function BarChartCard({ data, xKey, yKey, color = "#4f8cff", height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} />
        <YAxis tick={AXIS} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Horizontal bars for ranked lists (top applicants, top topics) - labels read
// better on the Y axis when they are long strings.
export function HBarChartCard({ data, yKey, xKey, color = "#22d3aa", height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} />
        <YAxis type="category" dataKey={yKey} tick={{ ...AXIS, fontSize: 11 }} width={140} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey={xKey} fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartCard({ data, xKey, yKey, color = "#4f8cff", height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey={xKey} tick={AXIS} />
        <YAxis tick={AXIS} />
        <Tooltip {...tooltipStyle} />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaChartCard({ data, xKey, yKey, color = "#22d3aa", height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey={xKey} tick={AXIS} />
        <YAxis tick={AXIS} domain={[0, 100]} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill="url(#areaFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
