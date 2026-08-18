import { useState } from "react";
import { Navigate } from "react-router-dom";
import AnalyticsOverview from "../components/admin/AnalyticsOverview";
import ApplicationReviewTable from "../components/admin/ApplicationReviewTable";
import OpportunityManager from "../components/admin/OpportunityManager";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const ALL_TABS = [
  { key: "overview", label: "Overview", adminOnly: true },
  { key: "opportunities", label: "Funding Opportunities", adminOnly: false },
  { key: "applications", label: "Applications", adminOnly: false },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");

  if (user && user.role !== "administrator" && user.role !== "innovation_manager") {
    return <Navigate to="/dashboard" replace />;
  }

  const tabs = ALL_TABS.filter((t) => !t.adminOnly || user?.role === "administrator");
  const activeTab = tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key;

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-signal-emeraldDark">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Platform dashboard</h1>
        </div>

        <div className="mb-6 flex gap-1 border-b border-ink-900/8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === t.key
                  ? "border-signal-emerald text-signal-emeraldDark"
                  : "border-transparent text-ink-900/50 hover:text-ink-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <AnalyticsOverview />}
        {activeTab === "opportunities" && <OpportunityManager />}
        {activeTab === "applications" && <ApplicationReviewTable />}
      </main>
    </div>
  );
}
