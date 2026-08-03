import React from "react";
import {
  FaUniversity,
  FaDollarSign,
  FaBullseye,
  FaTags,
} from "react-icons/fa";

function RecommendationCard({ recommendation }) {
  if (!recommendation) return null;

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "25px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        transition: "0.3s",
        height: "100%",
      }}
    >
      <h2
        style={{
          color: "#2563eb",
          marginBottom: "15px",
          fontSize: "22px",
        }}
      >
        {recommendation.title}
      </h2>

      <p
        style={{
          color: "#475569",
          lineHeight: "1.7",
          minHeight: "80px",
        }}
      >
        {recommendation.description}
      </p>

      <hr style={{ margin: "20px 0" }} />

      <p>
        <FaUniversity color="#2563eb" />{" "}
        <strong>Agency:</strong> {recommendation.agency}
      </p>

      <p>
        <FaDollarSign color="#16a34a" />{" "}
        <strong>Funding:</strong> {recommendation.amount}
      </p>

      <div style={{ marginTop: "20px" }}>
        <strong>
          <FaBullseye color="#dc2626" /> Match Score
        </strong>

        <div
          style={{
            width: "100%",
            background: "#e5e7eb",
            height: "14px",
            borderRadius: "30px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              width: `${recommendation.match_score}%`,
              background: "linear-gradient(90deg,#2563eb,#4f46e5)",
              height: "14px",
              borderRadius: "30px",
            }}
          />
        </div>

        <div
          style={{
            textAlign: "right",
            marginTop: "8px",
            color: "#2563eb",
            fontWeight: "700",
          }}
        >
          {recommendation.match_score}%
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <strong>
          <FaTags color="#f59e0b" /> Matched Keywords
        </strong>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "12px",
          }}
        >
          {recommendation.matched_keywords &&
          recommendation.matched_keywords.length > 0 ? (
            recommendation.matched_keywords.map((keyword, index) => (
              <span
                key={index}
                style={{
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {keyword}
              </span>
            ))
          ) : (
            <span
              style={{
                color: "#64748b",
              }}
            >
              No matching keywords
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecommendationCard;