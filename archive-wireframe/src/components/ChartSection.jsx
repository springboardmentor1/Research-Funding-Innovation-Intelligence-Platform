import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { getPublicationTrends } from "../api/dashboardApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ChartSection() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function loadChart() {
      try {
        const data = await getPublicationTrends();

        setChartData({
          labels: data.map((item) => item.publication_year),
          datasets: [
            {
              label: "Publications",
              data: data.map((item) => item.count),
              borderColor: "#2563eb",
              backgroundColor: "#93c5fd",
              tension: 0.3,
            },
          ],
        });
      } catch (error) {
        console.error(error);
      }
    }

    loadChart();
  }, []);

  if (!chartData) {
    return <h3>Loading Chart...</h3>;
  }

 return (
  <div className="chart-card">

    <h2 className="chart-title">
      📈 Publication Impact Trends
    </h2>

    <div className="chart-container">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: {
              position: "top",
            },
          },
        }}
      />
    </div>

  </div>
);
}

export default ChartSection;