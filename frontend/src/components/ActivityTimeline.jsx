import React from "react";
import {
  FaBook,
  FaChartLine,
  FaBrain,
  FaMoneyBillWave,
} from "react-icons/fa";

const activities = [
  {
    icon: <FaBook />,
    title: "Publication data loaded",
    time: "Just now",
    color: "#2563eb",
  },
  {
    icon: <FaBrain />,
    title: "Research topics analyzed",
    time: "2 min ago",
    color: "#8b5cf6",
  },
  {
    icon: <FaChartLine />,
    title: "Analytics dashboard updated",
    time: "5 min ago",
    color: "#10b981",
  },
  {
    icon: <FaMoneyBillWave />,
    title: "Funding recommendations generated",
    time: "10 min ago",
    color: "#f59e0b",
  },
];

function ActivityTimeline() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "25px",
        boxShadow: "0 8px 20px rgba(0,0,0,.08)",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        Recent Activity
      </h2>

      {activities.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              background: item.color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              marginRight: "15px",
            }}
          >
            {item.icon}
          </div>

          <div>
            <h4 style={{ margin: 0 }}>{item.title}</h4>
            <small style={{ color: "#64748b" }}>
              {item.time}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityTimeline;