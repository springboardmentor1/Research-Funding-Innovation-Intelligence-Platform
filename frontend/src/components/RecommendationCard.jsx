import React from "react";
import {
  FaUniversity,
  FaDollarSign,
  FaBullseye,
  FaTags,
} from "react-icons/fa";

function RecommendationCard({ recommendation }) {
  if (!recommendation) return null;

  const score = Number(recommendation.match_score) || 0;

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #111923, #0c141d)",
        border: "1px solid #263744",
        borderRadius: "14px",
        padding: "26px",
        boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
        transition: "0.25s ease",
        height: "100%",
        color: "#dbe4ec",
      }}
    >
      {/* TITLE */}
      <h2
        style={{
          color: "#f1f5f9",
          marginBottom: "15px",
          fontSize: "22px",
          lineHeight: "1.35",
          fontWeight: "700",
        }}
      >
        {recommendation.title}
      </h2>

      {/* DESCRIPTION */}
      <p
        style={{
          color: "#a7b4c3",
          lineHeight: "1.7",
          minHeight: "80px",
          margin: 0,
        }}
      >
        {recommendation.description}
      </p>

      <hr
        style={{
          margin: "22px 0",
          border: "none",
          borderTop: "1px solid #263440",
        }}
      />

      {/* AGENCY */}
      <p
        style={{
          color: "#cbd5e1",
          marginBottom: "15px",
        }}
      >
        <FaUniversity
          color="#38bdf8"
          style={{ marginRight: "8px" }}
        />

        <strong style={{ color: "#e2e8f0" }}>
          Agency:
        </strong>{" "}

        {recommendation.agency || "Not specified"}
      </p>

      {/* FUNDING */}
      <p
        style={{
          color: "#cbd5e1",
          marginBottom: "15px",
        }}
      >
        <FaDollarSign
          color="#22c55e"
          style={{ marginRight: "8px" }}
        />

        <strong style={{ color: "#e2e8f0" }}>
          Funding:
        </strong>{" "}

        {recommendation.amount || "Not specified"}
      </p>

      {/* MATCH SCORE */}
      <div style={{ marginTop: "25px" }}>
        <strong
          style={{
            color: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaBullseye color="#f87171" />

          Match Score
        </strong>

        <div
          style={{
            width: "100%",
            background: "#26313d",
            height: "12px",
            borderRadius: "30px",
            marginTop: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.min(score, 100)}%`,
              background:
                "linear-gradient(90deg, #14b8a6, #2dd4bf)",
              height: "12px",
              borderRadius: "30px",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <div
          style={{
            textAlign: "right",
            marginTop: "8px",
            color: "#2dd4bf",
            fontWeight: "800",
            fontSize: "16px",
          }}
        >
          {score}%
        </div>
      </div>

      {/* MATCHED KEYWORDS */}
      <div style={{ marginTop: "24px" }}>
        <strong
          style={{
            color: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaTags color="#f59e0b" />

          Matched Keywords
        </strong>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "13px",
          }}
        >
          {recommendation.matched_keywords &&
          recommendation.matched_keywords.length > 0 ? (
            recommendation.matched_keywords.map(
              (keyword, index) => (
                <span
                  key={index}
                  style={{
                    background: "rgba(45, 212, 191, 0.10)",
                    border:
                      "1px solid rgba(45, 212, 191, 0.22)",
                    color: "#5eead4",
                    padding: "6px 13px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {keyword}
                </span>
              )
            )
          ) : (
            <span
              style={{
                color: "#8995a5",
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