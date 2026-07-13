import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";

function SideNavbar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-title">
        Dashboard
      </div>
<NavLink to="/">🏠 Dashboard</NavLink>

<NavLink to="/publications">
  📄 Publications
</NavLink>

<NavLink to="/funding">
  💰 Funding
</NavLink>

<NavLink to="/patents">
  📜 Patents
</NavLink>

<NavLink to="/organizations">
  🏢 Organizations
</NavLink>

<NavLink to="/researchers">
  👨‍🔬 Researchers
</NavLink>

<NavLink to="/reports">
  📊 Reports
</NavLink>

    </aside>
  );
}

export default SideNavbar;