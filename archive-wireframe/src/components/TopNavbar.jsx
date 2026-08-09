import "../styles/dashboard.css";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../context/SearchContext";
import { Link, useNavigate } from "react-router-dom";
import { getNotifications } from "../api/notificationApi";

function TopNavbar() {
  const { search, setSearch } = useContext(SearchContext);
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <header className="top-navbar">

        {/* ---------------- Logo ---------------- */}

        <Link
  to="/"
  className="logo"
  aria-label="ResearchHub AI Home"
>
  <img
    src="/logo.png"
    alt="ResearchHub AI logo"
    className="logo-image"
  />

  <div className="logo-text">
    <h2>ResearchHub AI</h2>
    <span>Research Intelligence Platform</span>
  </div>
</Link>

        {/* ---------------- Search ---------------- */}

        <div className="navbar-right">

          <input
            className="search-box"
            type="text"
            placeholder="Search Publications, Patents, Funding..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          <button
            className="search-btn"
            onClick={handleSearch}
          >
            Search
          </button>

        </div>

        {/* ---------------- Right ---------------- */}

        <div className="navbar-right">

          {/* Notification */}

          <div className="notification-wrapper">

            <button
              className="notification-btn"
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
            >
              🔔
            </button>

            <span className="notification-count">
              {notifications.length}
            </span>

          </div>

          {/* User */}

          <div className="user-name">
            👋 {user?.name}
          </div>

          {/* Logout */}

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

        {/* Notification Dropdown */}

        {showNotifications && (

          <div className="notification-panel">

            <h3>🔔 Research Updates</h3>

            {notifications.map((item, index) => (

              <div
                key={index}
                className="notification-item"
              >

                <div className="notification-message">
                  {item.icon} {item.message}
                </div>

                <div className="notification-time">
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