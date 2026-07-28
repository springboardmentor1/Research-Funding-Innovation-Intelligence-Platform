import "../styles/dashboard.css";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../context/SearchContext";
import { useNavigate } from "react-router-dom";
import { getNotifications } from "../api/notificationApi";

function TopNavbar() {
  const { search, setSearch } = useContext(SearchContext);

  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadNotifications();
  }, []);

  const handleSearch = () => {
    if (!search.trim()) return;

    navigate("/search");
  };

  return (
    <>
      <header
        className="top-navbar"
        style={{
          position: "relative",
        }}
      >
        <div className="logo">
          📚 ARCHIVE
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            className="search-box"
            type="text"
            placeholder="Search Publications, Patents, Funding..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button
            onClick={handleSearch}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Search
          </button>

          {/* Notification Bell */}

          <div
            style={{
              position: "relative",
            }}
          >
            <button
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              🔔
            </button>

            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                background: "#ef4444",
                color: "#fff",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              {notifications.length}
            </span>
          </div>
        </div>

        {/* Notification Panel */}

        {showNotifications && (
          <div
            style={{
              position: "absolute",
              top: "70px",
              right: "20px",
              width: "360px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 8px 25px rgba(0,0,0,.18)",
              padding: "20px",
              zIndex: 9999,
            }}
          >
            <h3
              style={{
                marginBottom: "15px",
              }}
            >
              🔔 Research Updates
            </h3>

            {notifications.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: "10px 0",
                  borderBottom:
                    index === notifications.length - 1
                      ? "none"
                      : "1px solid #eee",
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                  }}
                >
                  {item.icon} {item.message}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "4px",
                  }}
                >
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

export default TopNavbar;