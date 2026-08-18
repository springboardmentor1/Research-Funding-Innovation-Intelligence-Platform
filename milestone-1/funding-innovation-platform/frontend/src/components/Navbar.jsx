import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "./RoleBadge";

const navLinkClasses = ({ isActive }) =>
  `rounded-lg px-3.5 py-2 text-sm font-medium transition ${
    isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-ink-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-emerald font-display text-sm font-bold text-white">
              I²
            </div>
            <span className="font-display text-lg font-semibold text-white">Innovation Intelligence</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/dashboard" className={navLinkClasses}>
              Dashboard
            </NavLink>
            <NavLink to="/profile" className={navLinkClasses}>
              Research Profile
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && <RoleBadge role={user.role} />}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">{user?.full_name}</p>
            <p className="text-xs text-white/50">@{user?.username}</p>
          </div>
          <button onClick={handleLogout} className="rounded-lg border border-white/15 px-3.5 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
