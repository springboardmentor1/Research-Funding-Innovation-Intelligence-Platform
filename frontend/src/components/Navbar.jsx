import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBrain,
  FaRobot,
  FaBookmark,
} from "react-icons/fa";

function Navbar() {
  const location = useLocation();

  const username = localStorage.getItem("username");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    alert("Logged out successfully!");

    window.location.href = "/login";
  };

  const navStyle = (path) => ({
    color: location.pathname === path ? "#2563eb" : "#334155",
    textDecoration: "none",
    fontWeight: "600",
    padding: "8px 14px",
    borderRadius: "8px",
    transition: "0.3s",
  });

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "#ffffff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#1e293b",
            fontWeight: "700",
            fontSize: "1.3rem",
          }}
        >
          <FaBrain color="#2563eb" size={28} />
          AI Research Platform
        </Link>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Link to="/" style={navStyle("/")}>
            Home
          </Link>

          <Link to="/dashboard" style={navStyle("/dashboard")}>
            Dashboard
          </Link>

          <Link to="/research" style={navStyle("/research")}>
            Research
          </Link>

          <Link to="/funding" style={navStyle("/funding")}>
            Funding
          </Link>

          <Link to="/patents" style={navStyle("/patents")}>
            Patents
          </Link>

          <Link to="/assistant" style={navStyle("/assistant")}>
            <FaRobot style={{ marginRight: "5px" }} />
            AI Assistant
          </Link>

          <Link to="/bookmarks" style={navStyle("/bookmarks")}>
            <FaBookmark style={{ marginRight: "5px" }} />
            Bookmarks
          </Link>

          {username ? (
            <>
              <span
                style={{
                  color: "#2563eb",
                  fontWeight: "700",
                  marginLeft: "10px",
                }}
              >
                Welcome, {username}
              </span>

              <button
                onClick={logout}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={navStyle("/login")}>
                Login
              </Link>

              <Link to="/signup" style={navStyle("/signup")}>
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;