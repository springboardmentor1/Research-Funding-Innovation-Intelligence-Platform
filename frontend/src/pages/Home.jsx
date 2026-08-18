import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./../styles/Home.css";

function Home() {
  const features = [
    {
      icon: "📊",
      label: "ANALYTICS",
      title: "Research Analytics",
      description:
        "Analyze publication trends and research activity across scientific domains.",
      path: "/dashboard",
    },
    {
      icon: "📈",
      label: "DISCOVERY",
      title: "Trend Intelligence",
      description:
        "Identify emerging research areas, topics, and fast-growing scientific fields.",
      path: "/research",
    },
    {
      icon: "💰",
      label: "FUNDING",
      title: "Funding Discovery",
      description:
        "Find funding opportunities intelligently matched to your research interests.",
      path: "/funding",
    },
    {
      icon: "🤖",
      label: "AI ASSISTANCE",
      title: "Research Assistant",
      description:
        "Get intelligent assistance for research exploration and discovery.",
      path: "/assistant",
    },
  ];

  return (
    <div className="home">
      <Navbar />

      <main className="hero">
        <div className="hero-content">

          {/* ================= LEFT ================= */}
          <div className="hero-left">

            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              AI-POWERED RESEARCH INTELLIGENCE
            </div>

            <h1>
              AI Research Funding &{" "}
              <span>Innovation Intelligence</span>
            </h1>

            <p>
              Discover research trends, analyze scientific publications,
              explore patents, identify funding opportunities, and gain
              actionable research insights through one intelligent platform.
            </p>

            <div className="hero-buttons">
              <Link
                to="/dashboard"
                className="primary"
              >
                Open Dashboard
                <span>→</span>
              </Link>

              <Link
                to="/research"
                className="secondary"
              >
                Explore Research
                <span>→</span>
              </Link>
            </div>

          </div>


          {/* ================= RIGHT ================= */}
          <div className="hero-features">

            {features.map((feature) => (
              <Link
                to={feature.path}
                className="feature-card"
                key={feature.title}
              >

                <div className="feature-card-top">

                  <div className="feature-icon">
                    {feature.icon}
                  </div>

                  <span className="feature-arrow">
                    ↗
                  </span>

                </div>

                <div className="feature-label">
                  {feature.label}
                </div>

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

                <div className="feature-explore">
                  Explore
                  <span>→</span>
                </div>

              </Link>
            ))}

          </div>

        </div>
      </main>
    </div>
  );
}

export default Home;