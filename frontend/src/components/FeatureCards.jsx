import React from "react";
import {
  FaBrain,
  FaChartLine,
  FaMoneyBillWave,
  FaSearch,
} from "react-icons/fa";

const features = [
  {
    icon: <FaBrain size={35} />,
    title: "AI Research Intelligence",
    description:
      "Analyze research trends using AI-powered insights and analytics.",
  },
  {
    icon: <FaChartLine size={35} />,
    title: "Publication Analytics",
    description:
      "Visualize publication growth and identify emerging research topics.",
  },
  {
    icon: <FaMoneyBillWave size={35} />,
    title: "Funding Recommendations",
    description:
      "Receive intelligent grant recommendations based on your research area.",
  },
  {
    icon: <FaSearch size={35} />,
    title: "Patent Discovery",
    description:
      "Explore innovation and patents across multiple technology domains.",
  },
];

function FeatureCards() {
  return (
    <section
      style={{
        padding: "60px 40px",
        background: "#f8fafc",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "40px",
          fontSize: "2.3rem",
        }}
      >
        Platform Features
      </h2>

      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: "25px",
        }}
      >
        {features.map((feature, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "18px",
              padding: "30px",
              textAlign: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,.08)",
              transition: ".3s",
            }}
          >
            <div
              style={{
                color: "#2563eb",
                marginBottom: "20px",
              }}
            >
              {feature.icon}
            </div>

            <h3>{feature.title}</h3>

            <p
              style={{
                color: "#64748b",
                lineHeight: "1.7",
              }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeatureCards;