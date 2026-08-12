import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2>🔬 Research Funding Platform</h2>
      </div>

      <div className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/research">Research</Link>
        <Link to="/funding">Funding</Link>
        <Link to="/patents">Patents</Link>
        <Link to="/bookmarks">Bookmarks</Link>

        <Link to="/" className="logout-btn">
          Logout
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;