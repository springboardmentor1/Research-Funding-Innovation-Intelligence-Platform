import { useEffect, useState } from "react";
import { getResearchInsights } from "../api/researchInsightsApi";

function ResearchInsights() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    async function loadInsights() {
      try {
        const data = await getResearchInsights();
        setInsights(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadInsights();
  }, []);

  if (!insights) {
    return <h3>Loading Research Intelligence...</h3>;
  }

  const cards = [
    {
      icon: "🏆",
      title: "Top Research Area",
      value: insights.top_area,
      color: "#2563eb",
    },
    {
      icon: "🌍",
      title: "Most Active Country",
      value: insights.top_country,
      color: "#16a34a",
    },
    {
      icon: "💰",
      title: "Top Funding Organization",
      value: insights.top_organization,
      color: "#f59e0b",
    },
    {
      icon: "👨‍🔬",
      title: "Top Researcher",
      value: insights.top_researcher,
      color: "#9333ea",
    },
    {
      icon: "📈",
      title: "Trending Technology",
      value: insights.trending,
      color: "#ef4444",
    },
    {
      icon: "📚",
      title: "Indexed Publications",
      value: Number(insights.total_publications).toLocaleString(),
      color: "#0ea5e9",
    },
  ];

  return (
    <div style={{ marginTop: "30px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        🧠 Research Intelligence
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,.08)",
              borderLeft: `6px solid ${card.color}`,
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "10px",
              }}
            >
              {card.icon}
            </div>

            <div
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              {card.title}
            </div>

            <div
              style={{
                marginTop: "8px",
                fontWeight: "bold",
                fontSize: "20px",
                color: "#1f2937",
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResearchInsights;