import React from "react";
import { Link } from "react-router-dom";
import {
  FaBrain,
  FaChartLine,
  FaMoneyBillWave,
  FaArrowRight,
} from "react-icons/fa";

function Hero() {
  return (
    <section
      style={{
        background:
          "linear-gradient(135deg,#2563eb,#4f46e5)",
        color: "#fff",
        padding: "90px 40px",
        borderRadius: "20px",
        margin: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "50px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "3.2rem",
              lineHeight: "1.2",
            }}
          >
            AI Research Funding &
            <br />
            Innovation Intelligence Platform
          </h1>

          <p
            style={{
              marginTop: "20px",
              fontSize: "18px",
              lineHeight: "1.8",
              opacity: ".95",
            }}
          >
            Discover research trends, analyze publications,
            explore patents, and receive AI-powered funding
            recommendations through one intelligent platform.
          </p>

          <div
            style={{
              marginTop: "35px",
              display: "flex",
              gap: "20px",
            }}
          >
            <Link
              to="/dashboard"
              style={{
                textDecoration: "none",
                background: "#fff",
                color: "#2563eb",
                padding: "14px 30px",
                borderRadius: "10px",
                fontWeight: "bold",
              }}
            >
              Open Dashboard
            </Link>

            <Link
              to="/research"
              style={{
                textDecoration: "none",
                border: "2px solid white",
                color: "#fff",
                padding: "14px 30px",
                borderRadius: "10px",
                fontWeight: "bold",
              }}
            >
              Explore Research <FaArrowRight />
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,.15)",
              borderRadius: "15px",
              padding: "25px",
              textAlign: "center",
            }}
          >
            <FaBrain size={45} />
            <h2>AI Analytics</h2>
            <p>Smart Research Insights</p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.15)",
              borderRadius: "15px",
              padding: "25px",
              textAlign: "center",
            }}
          >
            <FaChartLine size={45} />
            <h2>Real-time Trends</h2>
            <p>Publication Analysis</p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.15)",
              borderRadius: "15px",
              padding: "25px",
              textAlign: "center",
            }}
          >
            <FaMoneyBillWave size={45} />
            <h2>Funding</h2>
            <p>Grant Recommendations</p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,.15)",
              borderRadius: "15px",
              padding: "25px",
              textAlign: "center",
            }}
          >
            <h1>24/7</h1>
            <p>AI Assistant</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;