import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div style={{
      width: "220px",
      background: "#2563eb",
      color: "white",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <h2>Research Platform</h2>

      <p><Link to="/" style={{ color: "white", textDecoration: "none" }}>🏠 Dashboard</Link></p>
      <p><Link to="/researchers" style={{ color: "white", textDecoration: "none" }}>👨‍🔬 Researchers</Link></p>
      <p><Link to="/grants" style={{ color: "white", textDecoration: "none" }}>💰 Grants</Link></p>
      <p><Link to="/publications" style={{ color: "white", textDecoration: "none" }}>📚 Publications</Link></p>
      <p><Link to="/patents" style={{ color: "white", textDecoration: "none" }}>📄 Patents</Link></p>
      <p><Link to="/technology" style={{ color: "white", textDecoration: "none" }}>💻 Technology</Link></p>
      <p><Link to="/innovation" style={{ color: "white", textDecoration: "none" }}>⭐ Innovation</Link></p>
      <p><Link to="/commercialization" style={{ color: "white", textDecoration: "none" }}>🚀 Commercialization</Link></p>
    </div>
  );
}

export default Sidebar;