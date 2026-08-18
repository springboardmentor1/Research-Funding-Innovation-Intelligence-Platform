import { useEffect, useState } from "react";

function NotificationPopup({ alerts }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!alerts || alerts.length === 0) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [alerts]);

  if (!visible || !alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="research-notification">
      <div className="notification-glow"></div>

      <div className="notification-header">
        <div className="notification-title">
          <span className="notification-bell">🔔</span>

          <div>
            <strong>Research Updates</strong>
            <span>Latest platform activity</span>
          </div>
        </div>

        <button
          className="notification-close"
          onClick={() => setVisible(false)}
          aria-label="Close notifications"
        >
          ×
        </button>
      </div>

      <div className="notification-list">
        {alerts.map((alert, index) => (
          <div
            className="notification-item"
            key={index}
          >
            <span className="notification-marker"></span>

            <p>{alert}</p>

            <span className="notification-arrow">
              →
            </span>
          </div>
        ))}
      </div>

      <div className="notification-footer">
        <span className="notification-live-dot"></span>
        Live research intelligence
      </div>
    </div>
  );
}

export default NotificationPopup;