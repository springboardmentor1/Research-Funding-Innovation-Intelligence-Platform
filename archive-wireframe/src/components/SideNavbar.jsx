import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";

import {
  FiHome,
  FiFileText,
  FiDollarSign,
  FiAward,
  FiBriefcase,
  FiActivity,
  FiBarChart2,
  FiUser
} from "react-icons/fi";

function SideNavbar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-title">
        ResearchHub AI
      </div>

      <NavLink to="/">
        <FiHome />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/publications">
        <FiFileText />
        <span>Publications</span>
      </NavLink>

      <NavLink to="/funding">
        <FiDollarSign />
        <span>Funding</span>
      </NavLink>

      <NavLink to="/patents">
        <FiAward />
        <span>Patents</span>
      </NavLink>

      <NavLink to="/organizations">
        <FiBriefcase />
        <span>Organizations</span>
      </NavLink>

      <NavLink to="/researchers">
        <FiActivity />
        <span>Researchers</span>
      </NavLink>

      <NavLink to="/reports">
        <FiBarChart2 />
        <span>Reports</span>
      </NavLink>

      {/* PROFILE */}
      <div className="sidebar-divider"></div>

      <NavLink to="/profile">
        <FiUser />
        <span>My Profile</span>
      </NavLink>

    </aside>
  );
}

export default SideNavbar;