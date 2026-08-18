import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { Card, CardContent, Typography, Box } from "@mui/material";

function PublicationTrendsChart({ data = [] }) {
  // Transform publication trends data to chart format
  const chartData = data.length > 0 ? data.map(item => ({
    month: typeof item.year === 'number' ? item.year.toString() : (item.month || 'Unknown'),
    funding: item.publication_count || item.funding || 0
  })) : [
    { month: "Jan", funding: 0 },
    { month: "Feb", funding: 0 },
    { month: "Mar", funding: 0 },
    { month: "Apr", funding: 0 },
    { month: "May", funding: 0 },
    { month: "Jun", funding: 0 },
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
          Publication Trends
        </Typography>

        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="fundingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="rgba(124, 58, 237, 0.1)"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
                stroke="rgba(255, 255, 255, 0.5)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="rgba(255, 255, 255, 0.5)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: "rgba(30, 30, 63, 0.95)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  borderRadius: 8,
                  color: "white"
                }}
                itemStyle={{ color: "#A78BFA" }}
              />

              <Line
                type="monotone"
                dataKey="funding"
                stroke="#7C3AED"
                strokeWidth={3}
                dot={{ fill: "#7C3AED", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#EC4899", strokeWidth: 2 }}
                fill="url(#fundingGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              No funding trend data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PublicationTrendsChart;