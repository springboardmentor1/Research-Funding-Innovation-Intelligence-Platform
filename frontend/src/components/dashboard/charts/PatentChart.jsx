import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import { Card, CardContent, Typography, Box } from "@mui/material";

const COLORS = [
  "#7C3AED",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];

function PatentChart({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { name: "No Data", value: 1 }
  ];

  return (
    <Card
      sx={{
        background: "linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)",
        border: "1px solid rgba(124, 58, 237, 0.1)",
        color: "white",
        borderRadius: 3,
        height: 350,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(124, 58, 237, 0.15)",
          borderColor: "rgba(124, 58, 237, 0.3)"
        }
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          mb={2}
          sx={{
            fontWeight: 600,
            background: "linear-gradient(90deg, #FFFFFF 0%, #A78BFA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Patent Distribution
        </Typography>

        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                strokeWidth={2}
                stroke="rgba(30, 30, 63, 1)"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      transition: "all 0.3s ease-in-out",
                      cursor: "pointer"
                    }}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: "rgba(30, 30, 63, 0.95)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  borderRadius: 8,
                  color: "white"
                }}
                itemStyle={{ color: "#A78BFA" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              No patent distribution data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PatentChart;