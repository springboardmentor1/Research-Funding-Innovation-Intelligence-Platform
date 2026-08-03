import React from "react";
import { FaRobot, FaArrowTrendUp, FaLightbulb } from "react-icons/fa6";

function AIInsightCard({ topics = [], funding = [] }) {
  const topTopic =
    topics.length > 0 ? topics[0].topic : "Artificial Intelligence";

  const topFunding =
    funding.length > 0 ? funding[0].title : "No Funding Selected";

  return (
    <div
      style={{
        background: "linear-gradient(135deg,#2563eb,#4f46e5)",
        color: "#fff",
        borderRadius: "18px",
        padding: "25px",
        boxShadow: "0 10px 25px rgba(0,0,0,.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <FaRobot size={32} />
        <h2 style={{ marginLeft: "15px" }}>
          AI Insights
        </h2>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <FaArrowTrendUp />

        <strong style={{ marginLeft: "10px" }}>
          Trending Topic
        </strong>

        <p>{topTopic}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <FaLightbulb />

        <strong style={{ marginLeft: "10px" }}>
          Best Funding Match
        </strong>

        <p>{topFunding}</p>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,.15)",
          padding: "15px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <strong>AI Recommendation</strong>

        <p style={{ marginTop: "10px" }}>
          Focus on <b>{topTopic}</b>. This research area is
          currently showing strong publication growth and has
          promising funding opportunities.
        </p>
      </div>
    </div>
  );
}

export default AIInsightCard;