import { useEffect, useState } from "react";
import { getDashboardCounts } from "../api/dashboardApi";

function KPISection() {
  const [counts, setCounts] = useState({
    publications: 0,
    funding: 0,
    patents: 0,
    organizations: 0,
    researchers: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboardCounts();

        setCounts(data);

        setError(false);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    // Initial Load
    loadDashboard();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboard();
    }, 30000);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <h3>Loading Dashboard...</h3>;
  }

  if (error) {
    return (
      <div className="summary-card">
        <h2>Dashboard Unavailable</h2>
        <p>Unable to load dashboard statistics.</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Publications",
      value: counts.publications,
      className: "kpi-publications",
      icon: "📚",
      footer: "Research papers indexed",
    },
    {
      title: "Funding",
      value: counts.funding,
      className: "kpi-funding",
      icon: "💰",
      footer: "Active funded projects",
    },
    {
      title: "Patents",
      value: counts.patents,
      className: "kpi-patents",
      icon: "📜",
      footer: "Registered patents",
    },
    {
      title: "Organizations",
      value: counts.organizations,
      className: "kpi-organizations",
      icon: "🏢",
      footer: "Research institutions",
    },
    {
      title: "Researchers",
      value: counts.researchers,
      className: "kpi-researchers",
      icon: "👨‍🔬",
      footer: "Research profiles",
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`kpi-card ${card.className}`}
        >
          <div className="kpi-header">
            <span className="kpi-icon">{card.icon}</span>

            <span className="kpi-title">
              {card.title}
            </span>
          </div>

          <div className="kpi-value">
            {Number(card.value).toLocaleString()}
          </div>

          <div className="kpi-footer">
            ✔ {card.footer}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KPISection;