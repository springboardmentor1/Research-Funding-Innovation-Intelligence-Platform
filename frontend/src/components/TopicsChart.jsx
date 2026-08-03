import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#2563eb",
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#84cc16",
  "#14b8a6",
  "#f97316",
];

function TopicsChart({ data }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "25px",
        boxShadow: "0 8px 20px rgba(0,0,0,.08)",
        height: "550px",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          color: "#1e293b",
          textAlign: "center",
        }}
      >
        🥧 Top Research Topics
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="paper_count"
            nameKey="topic"
            cx="35%"
            cy="40%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={3}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            wrapperStyle={{
              fontSize: "14px",
              lineHeight: "22px",
              paddingLeft: "20px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopicsChart;