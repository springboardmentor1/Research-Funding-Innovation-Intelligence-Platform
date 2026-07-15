import { useEffect, useState } from "react";
import { getDashboardAnalytics } from "../../api/dashboardApi";

function AnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getDashboardAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadAnalytics();
  }, []);

  if (!analytics) {
    return <h3>Loading Analytics...</h3>;
  }

  const cards = [
    {
      title: "🌍 Top Country",
      value: analytics.top_country,
      color: "#2563eb",
    },
    {
      title: "📚 Top Research Type",
      value: analytics.top_type,
      color: "#16a34a",
    },
    {
      title: "🏢 Top Organization",
      value: analytics.top_org,
      color: "#9333ea",
    },
    {
      title: "⭐ Average Citations",
      value: analytics.avg_citations,
      color: "#f59e0b",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
        gap: "20px",
        marginTop: "35px",
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "25px",
            boxShadow: "0 4px 15px rgba(0,0,0,.08)",
            borderTop: `5px solid ${card.color}`,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "17px",
            }}
          >
            {card.title}
          </h3>

          <div
            style={{
              marginTop: "18px",
              fontSize: "28px",
              fontWeight: "bold",
              color: "#111827",
            }}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AnalyticsSection;