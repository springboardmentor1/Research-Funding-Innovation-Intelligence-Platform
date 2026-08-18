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

const COLORS = {
  publications: {
    primary: "#2563EB",
    background: "rgba(37,99,235,0.12)",
    point: "#1D4ED8",
  },

  publicationTypes: {
    primary: "#7C3AED",
    background: "rgba(124,58,237,0.78)",
  },

  funding: {
    primary: "#16A34A",
    background: "rgba(22,163,74,0.78)",
  },

  patents: {
    primary: "#F97316",
    background: "rgba(249,115,22,0.82)",
  },

  grid: "rgba(148,163,184,0.14)",
  text: "#6B7280",
};

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    mode: "index",
    intersect: false,
  },

  animation: {
    duration: 900,
    easing: "easeOutQuart",
  },

  plugins: {
    legend: {
      position: "top",

      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        boxWidth: 8,
        padding: 18,
        color: COLORS.text,

        font: {
          size: 11,
          weight: "600",
        },
      },
    },

    tooltip: {
      enabled: true,

      backgroundColor: "rgba(17,17,17,0.94)",

      titleColor: "#DFFF00",
      bodyColor: "#FFFFFF",

      padding: 13,

      cornerRadius: 10,

      displayColors: true,

      titleFont: {
        size: 12,
        weight: "700",
      },

      bodyFont: {
        size: 12,
      },

      boxPadding: 5,

      caretPadding: 8,
    },
  },

  scales: {
    x: {
      grid: {
        display: false,
      },

      ticks: {
        color: COLORS.text,
        font: {
          size: 10,
        },
      },

      border: {
        display: false,
      },
    },

    y: {
      beginAtZero: true,

      grid: {
        color: COLORS.grid,
      },

      ticks: {
        color: COLORS.text,
        font: {
          size: 10,
        },
      },

      border: {
        display: false,
      },
    },
  },
};

function ChartSection() {
  const [trendData, setTrendData] = useState(null);
  const [typeData, setTypeData] = useState(null);
  const [fundingData, setFundingData] = useState(null);
  const [patentData, setPatentData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCharts() {
      try {
        const [
          trends,
          types,
          funding,
          patents,
        ] = await Promise.all([
          getPublicationTrends(),
          getPublicationTypes(),
          getFundingTrends(),
          getPatentCountries(),
        ]);

        if (!isMounted) return;

        setTrendData({
          labels: trends.map(
            (item) => item.publication_year
          ),

          datasets: [
            {
              label: "Publications",

              data: trends.map(
                (item) => item.count
              ),

              borderColor:
                COLORS.publications.primary,

              backgroundColor:
                COLORS.publications.background,

              pointBackgroundColor: "#FFFFFF",

              pointBorderColor:
                COLORS.publications.point,

              pointBorderWidth: 2,

              pointRadius: 3,

              pointHoverRadius: 7,

              pointHoverBackgroundColor:
                COLORS.publications.primary,

              pointHoverBorderColor:
                "#FFFFFF",

              pointHoverBorderWidth: 3,

              borderWidth: 3,

              tension: 0.4,

              fill: true,
            },
          ],
        });

        setTypeData({
          labels: types.map(
            (item) => item.type
          ),

          datasets: [
            {
              label: "Publication Types",

              data: types.map(
                (item) => item.count
              ),

              backgroundColor:
                COLORS.publicationTypes.background,

              borderColor:
                COLORS.publicationTypes.primary,

              borderWidth: 1,

              borderRadius: 8,

              hoverBackgroundColor:
                COLORS.publicationTypes.primary,

              hoverBorderColor:
                "#111111",

              hoverBorderWidth: 2,

              maxBarThickness: 80,
            },
          ],
        });

        setFundingData({
          labels: funding.map(
            (item) => item.fiscal_year
          ),

          datasets: [
            {
              label: "Funding Projects",

              data: funding.map(
                (item) => item.count
              ),

              backgroundColor:
                COLORS.funding.background,

              borderColor:
                COLORS.funding.primary,

              borderWidth: 1,

              borderRadius: 7,

              hoverBackgroundColor:
                COLORS.funding.primary,

              hoverBorderColor:
                "#111111",

              hoverBorderWidth: 2,

              maxBarThickness: 24,
            },
          ],
        });

        setPatentData({
          labels: patents.map(
            (item) => item.country
          ),

          datasets: [
            {
              label: "Patents",

              data: patents.map(
                (item) => item.count
              ),

              backgroundColor:
                COLORS.patents.background,

              borderColor:
                COLORS.patents.primary,

              borderWidth: 1,

              borderRadius: 7,

              hoverBackgroundColor:
                COLORS.patents.primary,

              hoverBorderColor:
                "#111111",

              hoverBorderWidth: 2,

              maxBarThickness: 65,
            },
          ],
        });

        setError(false);
      } catch (err) {
        console.error(
          "Error loading chart data:",
          err
        );

        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCharts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="chart-loading">
        <LoadingSpinner />
        <p>Loading research analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card chart-error">
        <h2>Unable to Load Charts</h2>
        <p>
          Something went wrong while loading
          dashboard analytics. Please try again.
        </p>
      </div>
    );
  }

  const lineOptions = {
    ...baseOptions,

    plugins: {
      ...baseOptions.plugins,

      tooltip: {
        ...baseOptions.plugins.tooltip,

        callbacks: {
          label: (context) =>
            ` Publications: ${Number(
              context.raw
            ).toLocaleString()}`,
        },
      },
    },
  };

  const barOptions = {
    ...baseOptions,

    plugins: {
      ...baseOptions.plugins,

      tooltip: {
        ...baseOptions.plugins.tooltip,

        callbacks: {
          label: (context) =>
            ` ${context.dataset.label}: ${Number(
              context.raw
            ).toLocaleString()}`,
        },
      },
    },
  };

  return (
    <section className="charts-section">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">
            VISUAL ANALYTICS
          </span>

          <h2>Research Trends</h2>
        </div>

        <span className="chart-status">
          ● Live Dataset
        </span>
      </div>

      <div className="chart-grid">

        <div className="chart-card chart-publications">
          <div className="chart-accent"></div>

          <h2 className="chart-title">
            Publications by Year
          </h2>

          <div className="chart-container">
            {trendData && (
              <Line
                data={trendData}
                options={lineOptions}
              />
            )}
          </div>
        </div>

        <div className="chart-card chart-types">
          <div className="chart-accent"></div>

          <h2 className="chart-title">
            Publications by Type
          </h2>

          <div className="chart-container">
            {typeData && (
              <Bar
                data={typeData}
                options={barOptions}
              />
            )}
          </div>
        </div>

        <div className="chart-card chart-funding">
          <div className="chart-accent"></div>

          <h2 className="chart-title">
            Funding by Fiscal Year
          </h2>

          <div className="chart-container">
            {fundingData && (
              <Bar
                data={fundingData}
                options={barOptions}
              />
            )}
          </div>
        </div>

        <div className="chart-card chart-patents">
          <div className="chart-accent"></div>

          <h2 className="chart-title">
            Patents by Country
          </h2>

          <div className="chart-container">
            {patentData && (
              <Bar
                data={patentData}
                options={barOptions}
              />
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

export default ChartSection;