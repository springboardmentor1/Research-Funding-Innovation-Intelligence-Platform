import "../styles/dashboard.css";
import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";

import LoadingSpinner from "../components/LoadingSpinner";

import {
  getPublicationTrends,
  getPublicationTypes,
  getFundingTrends,
  getPatentCountries,
} from "../api/dashboardApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ChartSection() {
  const [trendData, setTrendData] = useState(null);
  const [typeData, setTypeData] = useState(null);
  const [fundingData, setFundingData] = useState(null);
  const [patentData, setPatentData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadCharts() {
      try {
        // Publications by Year
        const trends = await getPublicationTrends();

        setTrendData({
          labels: trends.map((item) => item.publication_year),
          datasets: [
            {
              label: "Publications",
              data: trends.map((item) => item.count),
              borderColor: "#2563eb",
              backgroundColor: "rgba(37,99,235,0.2)",
              fill: true,
              tension: 0.4,
            },
          ],
        });

        // Publications by Type
        const types = await getPublicationTypes();

        setTypeData({
          labels: types.map((item) => item.type),
          datasets: [
            {
              label: "Publication Types",
              data: types.map((item) => item.count),
              backgroundColor: "#16a34a",
              borderRadius: 8,
            },
          ],
        });

        // Funding
        const funding = await getFundingTrends();

        setFundingData({
          labels: funding.map((item) => item.fiscal_year),
          datasets: [
            {
              label: "Funding Projects",
              data: funding.map((item) => item.count),
              backgroundColor: "#f59e0b",
              borderRadius: 8,
            },
          ],
        });

        // Patents
        const patents = await getPatentCountries();

        setPatentData({
          labels: patents.map((item) => item.country),
          datasets: [
            {
              label: "Patents",
              data: patents.map((item) => item.count),
              backgroundColor: "#9333ea",
              borderRadius: 8,
            },
          ],
        });
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadCharts();
  }, []);

  // Loading
  if (loading) {
    return <LoadingSpinner />;
  }

  // Error
  if (error) {
    return (
      <div className="chart-card">
        <h2>⚠ Unable to Load Charts</h2>

        <p>
          Something went wrong while loading dashboard analytics.
          Please refresh the page and try again.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
        gap: "25px",
        marginTop: "30px",
      }}
    >
      {/* Publications by Year */}
      <div className="chart-card">
        <h2 className="chart-title">
          📈 Publications by Year
        </h2>

        <div className="chart-container">
          <Line
            data={trendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      {/* Publications by Type */}
      <div className="chart-card">
        <h2 className="chart-title">
          📊 Publications by Type
        </h2>

        <div className="chart-container">
          <Bar
            data={typeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      {/* Funding by Fiscal Year */}
      <div className="chart-card">
        <h2 className="chart-title">
          💰 Funding by Fiscal Year
        </h2>

        <div className="chart-container">
          <Bar
            data={fundingData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      {/* Patents by Country */}
      <div className="chart-card">
        <h2 className="chart-title">
          📜 Patents by Country
        </h2>

        <div className="chart-container">
          <Bar
            data={patentData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ChartSection;