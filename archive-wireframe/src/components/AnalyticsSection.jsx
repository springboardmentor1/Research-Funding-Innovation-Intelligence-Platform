import { useEffect, useState } from "react";
import { getDashboardAnalytics } from "../api/dashboardApi";
import LoadingSpinner from "./LoadingSpinner";

function AnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const data = await getDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard analytics.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="analytics-error">
        {error}
      </div>
    );
  }

  const cards = [
    {
      title: "Top Patent Country",
      value: analytics.top_country || "N/A",
      icon: "🌍",
      color: "#2563eb",
    },
    {
      title: "Top Publication Type",
      value: analytics.top_type || "N/A",
      icon: "📚",
      color: "#16a34a",
    },
    {
      title: "Top Organization",
      value: analytics.top_org || "N/A",
      icon: "🏢",
      color: "#9333ea",
    },
    {
      title: "Average Citations",
      value: analytics.avg_citations ?? "0",
      icon: "⭐",
      color: "#f59e0b",
    },
  ];

  return (
    <section className="analytics-section">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">DATA ANALYTICS</span>
          <h2>Platform Analytics</h2>
        </div>
      </div>

      <div className="analytics-grid">
        {cards.map((card, index) => (
          <div
            className="analytics-card"
            key={index}
            style={{
              "--analytics-accent": card.color,
              "--analytics-delay": `${index * 80}ms`,
            }}
          >
            <div className="analytics-top-line"></div>

            <div className="analytics-icon">
              {card.icon}
            </div>

            <div className="analytics-title">
              {card.title}
            </div>

            <div className="analytics-value">
              {card.value}
            </div>

            <div className="analytics-orb"></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AnalyticsSection;