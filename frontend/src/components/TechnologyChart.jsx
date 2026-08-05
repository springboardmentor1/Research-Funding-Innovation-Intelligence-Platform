import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "AI", score: 95 },
  { name: "IoT", score: 80 },
  { name: "Robotics", score: 75 },
  { name: "Blockchain", score: 65 },
];

function TechnologyChart() {
  return (
    <div style={{ width: "100%", height: 350, marginTop: "30px" }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TechnologyChart;