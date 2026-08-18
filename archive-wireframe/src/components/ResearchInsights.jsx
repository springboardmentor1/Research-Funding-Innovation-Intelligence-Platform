import { useEffect, useState } from "react";
import { getResearchInsights } from "../api/researchInsightsApi";

function ResearchInsights() {
  const [insights, setInsights] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

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
    return (
      <div className="insights-loading">
        Loading Research Intelligence...
      </div>
    );
  }

  const cards = [
    {
      icon: "🏆",
      title: "Top Research Area",
      value: insights.top_area,
      color: "#2563eb",
      glow: "rgba(37,99,235,.16)",
    },
    {
      icon: "🌍",
      title: "Most Active Country",
      value: insights.top_country,
      color: "#16a34a",
      glow: "rgba(22,163,74,.16)",
    },
    {
      icon: "💰",
      title: "Top Funding Organization",
      value: insights.top_organization,
      color: "#f59e0b",
      glow: "rgba(245,158,11,.16)",
    },
    {
      icon: "👨‍🔬",
      title: "Top Researcher",
      value: insights.top_researcher,
      color: "#9333ea",
      glow: "rgba(147,51,234,.16)",
    },
    {
      icon: "📈",
      title: "Trending Technology",
      value: insights.trending,
      color: "#ef4444",
      glow: "rgba(239,68,68,.16)",
    },
    {
      icon: "📚",
      title: "Indexed Publications",
      value: Number(insights.total_publications).toLocaleString(),
      color: "#0ea5e9",
      glow: "rgba(14,165,233,.16)",
    },
  ];

  return (
    <section className="research-insights-section">
      <div className="section-heading">
        <div>
          <span className="section-eyebrow">INTELLIGENCE LAYER</span>
          <h2>🧠 Research Intelligence</h2>
        </div>

        <span className="live-indicator">
          <span className="live-dot"></span>
          Live Insights
        </span>
      </div>

      <div className="research-insights-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`research-insight-card ${
              activeCard === index ? "is-active" : ""
            }`}
            style={{
              "--insight-accent": card.color,
              "--insight-glow": card.glow,
              "--card-delay": `${index * 70}ms`,
            }}
            onMouseEnter={() => setActiveCard(index)}
            onMouseLeave={() => setActiveCard(null)}
          >
            <div className="insight-shine"></div>

            <div className="insight-icon-wrap">
              <span className="insight-icon">{card.icon}</span>
            </div>

            <div className="insight-content">
              <span className="insight-title">{card.title}</span>

              <div className="insight-value" title={card.value}>
                {card.value}
              </div>
            </div>

            <div className="insight-accent-line"></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ResearchInsights;