import React from "react";

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "25px",
        boxShadow: "0 8px 20px rgba(0,0,0,.08)",
        transition: "0.3s",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-6px)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.transform = "translateY(0px)")
      }
    >
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "#2563eb15",
        }}
      />

      <div
        style={{
          fontSize: "32px",
          color: "#2563eb",
          marginBottom: "15px",
        }}
      >
        {icon}
      </div>

      <h4
        style={{
          color: "#64748b",
          marginBottom: "10px",
        }}
      >
        {title}
      </h4>

      <h2
        style={{
          margin: 0,
          color: "#0f172a",
          fontSize: "2rem",
        }}
      >
        {value}
      </h2>

      <p
        style={{
          marginTop: "10px",
          color: "#94a3b8",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}

export default StatCard;