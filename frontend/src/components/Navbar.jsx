import "./../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        AI Research Platform
      </div>

      <ul className="nav-links">
        <li>Home</li>
        <li>Research</li>
        <li>Funding</li>
        <li>Patents</li>
        <li>Dashboard</li>
        <li>About</li>
      </ul>

      <button className="login-btn">
        Login
      </button>
    </nav>
  );
}

export default Navbar;