import { Link } from "react-router-dom";

function SideNavbar() {
  return (
    <aside
      style={{
        width: "220px",
        borderRight: "1px solid #ddd",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <p><Link to="/">Dashboard</Link></p>
      <p><Link to="/publications">Publications</Link></p>
      <p><Link to="/funding">Funding</Link></p>
      <p><Link to="/patents">Patents</Link></p>
      <p><Link to="/organizations">Organizations</Link></p>
      <p><Link to="/researchers">Researchers</Link></p>
      <p><Link to="/reports">Reports</Link></p>
    </aside>
  );
}

export default SideNavbar;