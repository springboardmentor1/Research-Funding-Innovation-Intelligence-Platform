import { useEffect, useState } from "react";

function NotificationPopup({ alerts }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible || !alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "25px",
        right: "25px",
        width: "360px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        padding: "20px",
        zIndex: 9999,
        animation: "slideIn 0.4s ease"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px"
        }}
      >
        <h3 style={{ margin: 0 }}>
          🔔 Research Updates
        </h3>

        <button
          onClick={() => setVisible(false)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: "18px",
            cursor: "pointer"
          }}
        >
          ✖
        </button>
      </div>

      {alerts.map((alert, index) => (
        <p
          key={index}
          style={{
            margin: "10px 0",
            color: "#374151",
            fontSize: "15px"
          }}
        >
          {alert}
        </p>
      ))}

      <style>
        {`
          @keyframes slideIn{
            from{
              transform:translateX(120%);
              opacity:0;
            }
            to{
              transform:translateX(0);
              opacity:1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default NotificationPopup;