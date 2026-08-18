import React from "react";
import "./StatCard.css";

function StatCard({ title, value, subtitle, icon }) {
  return (
    <article className="stat-card">

      <div className="stat-card-top">

        <div className="stat-card-icon">
          {icon}
        </div>

        <span className="stat-card-arrow">
          ↗
        </span>

      </div>

      <div className="stat-card-content">

        <span className="stat-card-label">
          {title}
        </span>

        <strong className="stat-card-value">
          {value}
        </strong>

        <span className="stat-card-subtitle">
          {subtitle}
        </span>

      </div>

    </article>
  );
}

export default StatCard;