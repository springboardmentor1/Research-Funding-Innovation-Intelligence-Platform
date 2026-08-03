import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function PublicationChart({ data }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "25px",
        boxShadow: "0 8px 20px rgba(0,0,0,.08)",
        height: "420px",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          color: "#1e293b",
        }}
      >
        📈 Publication Trends
      </h2>

      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="5 5" />

          <XAxis dataKey="year" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="paper_count"
            stroke="#2563eb"
            strokeWidth={4}
            dot={{
              r: 5,
              fill: "#2563eb",
            }}
            activeDot={{
              r: 8,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PublicationChart;