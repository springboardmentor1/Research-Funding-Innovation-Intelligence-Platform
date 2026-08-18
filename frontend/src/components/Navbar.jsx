import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  FaBrain,
  FaHome,
  FaChartLine,
  FaBookOpen,
  FaMoneyBillWave,
  FaLightbulb,
  FaRobot,
  FaBookmark,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  /* =====================================================
     LOAD LOGGED-IN USER
  ====================================================== */

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("researchUser");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  /* =====================================================
     LOGOUT
  ====================================================== */

  const handleLogout = () => {
    localStorage.removeItem("researchUser");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/");
  };

  /* =====================================================
     GET USERNAME
  ====================================================== */

  const getUsername = () => {
    if (!user) return "";

    return (
      user.username ||
      user.name ||
      user.full_name ||
      user.email?.split("@")[0] ||
      "Researcher"
    );
  };

  const username = getUsername();

  return (
    <header className="navbar">

      {/* =================================================
          LEFT — BRAND
      ================================================== */}

      <Link to="/" className="navbar-brand">

        <div className="navbar-brand-icon">
          <FaBrain />
        </div>

        <div className="navbar-brand-text">
          <span>AI Research</span>
          <strong>Platform</strong>
        </div>

      </Link>


      {/* =================================================
          CENTER — NAVIGATION
      ================================================== */}

      <nav className="navbar-links">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <FaHome />
          <span>Home</span>
        </NavLink>


        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <FaChartLine />
          <span>Dashboard</span>
        </NavLink>


        <NavLink
          to="/research"
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <FaBookOpen />
          <span>Research</span>
        </NavLink>


        <NavLink
          to="/funding"
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <FaMoneyBillWave />
          <span>Funding</span>
        </NavLink>


        <NavLink
          to="/patents"
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <FaLightbulb />
          <span>Patents</span>
        </NavLink>


        <NavLink
          to="/assistant"
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <FaRobot />
          <span>AI Assistant</span>
        </NavLink>


        <NavLink
          to="/bookmarks"
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <FaBookmark />
          <span>Bookmarks</span>
        </NavLink>

      </nav>


      {/* =================================================
          RIGHT — AUTH
      ================================================== */}

      <div className="navbar-auth">

        {user ? (
          <>
            {/* USER PROFILE */}

            <div className="navbar-user">

              <div className="navbar-user-avatar">
                <FaUserCircle />
              </div>

              <div className="navbar-user-details">

                <span className="navbar-user-label">
                  RESEARCHER
                </span>

                <span className="navbar-username">
                  {username}
                </span>

              </div>

            </div>


            {/* LOGOUT */}

            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="navbar-login"
            >
              <FaSignInAlt />
              <span>Login</span>
            </Link>

            <Link
              to="/signup"
              className="navbar-signup"
            >
              <FaUserPlus />
              <span>Sign Up</span>
            </Link>
          </>
        )}

      </div>

    </header>
  );
}

export default Navbar;