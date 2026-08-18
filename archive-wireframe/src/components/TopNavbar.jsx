import "../styles/dashboard.css";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../context/SearchContext";
import { Link, useNavigate } from "react-router-dom";
import { getNotifications } from "../api/notificationApi";

import {
  FiBell,
  FiUser,
  FiSearch,
  FiLogOut,
} from "react-icons/fi";


function TopNavbar() {

  const { search, setSearch } = useContext(SearchContext);

  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);


  /* =====================================================
     GET LOGGED-IN USER
  ===================================================== */

  const user = JSON.parse(
    localStorage.getItem("user")
  );


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  useEffect(() => {

    async function loadNotifications() {

      try {

        const data = await getNotifications();

        setNotifications(data);

      } catch (error) {

        console.error(
          "Notification Error:",
          error
        );

      }

    }

    loadNotifications();

  }, []);


  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = () => {

    if (!search.trim()) {
      return;
    }

    navigate("/search");

  };


  /* =====================================================
     PROFILE
  ===================================================== */

  const handleProfile = () => {

    navigate("/profile");

  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    localStorage.removeItem("user");

    localStorage.removeItem("access_token");

    navigate("/login");

  };


  return (

    <header className="top-navbar">


      {/* =====================================================
          LOGO
      ===================================================== */}

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

          <h2>
            ResearchHub AI
          </h2>

          <span>
            Research Intelligence Platform
          </span>

        </div>

      </Link>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="navbar-search">

        <input
          className="search-box"
          type="text"
          placeholder="Search Publications, Patents, Funding..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          onKeyDown={(e) => {

            if (e.key === "Enter") {

              handleSearch();

            }

          }}
        />


        <button
          className="search-btn"
          onClick={handleSearch}
          aria-label="Search"
        >

          <FiSearch />

          <span>
            Search
          </span>

        </button>

      </div>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="navbar-right">


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <div className="notification-wrapper">

          <button
            className="notification-btn"
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
            aria-label="Notifications"
          >

            <FiBell />

          </button>


          {/* Notification Count */}

          {notifications.length > 0 && (

            <span className="notification-count">

              {notifications.length}

            </span>

          )}

        </div>


        {/* =================================================
            USER / PROFILE
        ================================================= */}

        <button
          className="user-name"
          onClick={handleProfile}
          aria-label="Open profile"
          type="button"
        >

          <FiUser />

          <span>
            {user?.name || "User"}
          </span>

        </button>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          className="logout-btn"
          onClick={handleLogout}
          aria-label="Logout"
          type="button"
        >

          <FiLogOut />

          <span>
            Logout
          </span>

        </button>

      </div>


      {/* =====================================================
          NOTIFICATION DROPDOWN
      ===================================================== */}

      {showNotifications && (

        <div className="notification-panel">


          {/* Notification Header */}

          <h3>

            <FiBell />

            <span>
              Research Updates
            </span>

          </h3>


          {/* =================================================
              NO NOTIFICATIONS
          ================================================= */}

          {notifications.length === 0 ? (

            <div className="notification-item">

              <div className="notification-message">

                No new research updates

              </div>

            </div>

          ) : (


            /* =================================================
               NOTIFICATION LIST
            ================================================= */

            notifications.map(
              (item, index) => (

                <div
                  key={index}
                  className="notification-item"
                >

                  <div className="notification-message">


                    {/* Notification Icon */}

                    {item.icon && (

                      <span className="notification-item-icon">

                        {item.icon}

                      </span>

                    )}


                    {/* Notification Message */}

                    <span>

                      {item.message}

                    </span>

                  </div>


                  {/* Notification Time */}

                  <div className="notification-time">

                    {item.time}

                  </div>

                </div>

              )
            )

          )}

        </div>

      )}

    </header>

  );

}


export default TopNavbar;