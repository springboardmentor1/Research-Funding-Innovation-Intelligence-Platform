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
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          textAlign: "center",
          color: "#dc2626",
          fontWeight: "bold",
          marginTop: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        }}
      >
        {error}
      </div>
    );
  }

  const cards = [
    {
      title: "🌍 Top Patent Country",
      value: analytics.top_country || "N/A",
      color: "#2563eb",
    },
    {
      title: "📚 Top Publication Type",
      value: analytics.top_type || "N/A",
      color: "#16a34a",
    },
    {
      title: "🏢 Top Organization",
      value: analytics.top_org || "N/A",
      color: "#9333ea",
    },
    {
      title: "⭐ Average Citations",
      value: analytics.avg_citations ?? "0",
      color: "#f59e0b",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
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
            transition: "0.3s",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "17px",
              fontWeight: "600",
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
              wordBreak: "break-word",
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