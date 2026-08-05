import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "High", value: 45 },
  { name: "Medium", value: 35 },
  { name: "Low", value: 20 },
];

const COLORS = ["#2563eb", "#10b981", "#f59e0b"];

function InnovationChart() {
  return (
    <div style={{ width: "100%", height: 350, marginTop: "30px" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default InnovationChart;