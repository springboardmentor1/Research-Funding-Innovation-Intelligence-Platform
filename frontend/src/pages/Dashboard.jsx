// Dashboard dispatcher: renders the view matching the user's role.
// One route ("/"), four possible dashboards. This is role-based UX - a startup
// founder and an innovation manager see different landing pages from the same
// URL, driven by the role in their token.

import { useAuth } from "../context/AuthContext";
import ResearcherDashboard from "./ResearcherDashboard";
import StartupDashboard from "./StartupDashboard";
import ManagerDashboard from "./ManagerDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  switch (user?.role) {
    case "startup_founder":     return <StartupDashboard />;
    case "innovation_manager":  return <ManagerDashboard />;
    // admin and researcher both get the researcher view as their default
    // landing page; admin also has the dedicated /admin page.
    default:                    return <ResearcherDashboard />;
  }
}
