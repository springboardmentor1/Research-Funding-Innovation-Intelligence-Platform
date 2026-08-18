import { useEffect, useState } from "react";
import { getDashboardCounts } from "../api/dashboardApi";

function StatisticsSummary() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardCounts();
        setCounts(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, []);

  if (!counts) return null;

  const total =
    Number(counts.publications) +
    Number(counts.funding) +
    Number(counts.patents) +
    Number(counts.organizations) +
    Number(counts.researchers);

  const stats = [
    {
      value: total,
      label: "Total Records",
      icon: "◈",
      color: "#111111",
    },
    {
      value: counts.publications,
      label: "Research Papers",
      icon: "▣",
      color: "#2563eb",
    },
    {
      value: counts.patents,
      label: "Patents",
      icon: "◇",
      color: "#f97316",
    },
    {
      value: counts.funding,
      label: "Funding Projects",
      icon: "◉",
      color: "#16a34a",
    },
  ];

  return (
    <section className="statistics-section">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">PLATFORM SCALE</span>
          <h2>Statistics Overview</h2>
        </div>
      </div>

      <div className="summary-stats">
        {stats.map((stat, index) => (
          <div
            className="summary-item"
            key={index}
            style={{
              "--stat-accent": stat.color,
              "--stat-delay": `${index * 70}ms`,
            }}
          >
            <div className="stat-icon">
              {stat.icon}
            </div>

            <h3>
              {Number(stat.value).toLocaleString()}
            </h3>

            <p>{stat.label}</p>

            <div className="stat-progress"></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatisticsSummary;