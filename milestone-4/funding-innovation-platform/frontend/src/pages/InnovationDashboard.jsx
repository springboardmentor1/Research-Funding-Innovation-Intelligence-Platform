import { useState } from "react";
import Layout from "../components/Layout";
import CommercializationTab from "../components/innovation/CommercializationTab";
import InnovationScoreTab from "../components/innovation/InnovationScoreTab";
import PatentIntelligenceTab from "../components/innovation/PatentIntelligenceTab";
import ResearchTrendsTab from "../components/innovation/ResearchTrendsTab";
import TechnologyIntelligenceTab from "../components/innovation/TechnologyIntelligenceTab";
import { useAuth } from "../context/AuthContext";

// Innovation Score and Commercialization Insights are computed from a
// Research Profile (publications, patents, technology areas, applications).
// Administrators don't have a research profile, so those two tabs are
// hidden for that role specifically. Any other role (Researcher, Startup
// Founder, Innovation Manager) can create a profile and sees all tabs.
// Patent/Technology/Research Trend Intelligence are platform-wide
// analytics with no profile dependency, so every role sees them.
const ALL_TABS = [
  { key: "patents", label: "Patent Intelligence", requiresProfile: false },
  { key: "technology", label: "Technology Intelligence", requiresProfile: false },
  { key: "trends", label: "Research Trends", requiresProfile: false },
  { key: "score", label: "Innovation Score", requiresProfile: true },
  { key: "commercialization", label: "Commercialization Insights", requiresProfile: true },
];

export default function InnovationDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("patents");

  const isAdministrator = user?.role === "administrator";
  const tabs = ALL_TABS.filter((t) => !t.requiresProfile || !isAdministrator);
  const activeTab = tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key;

  return (
    <Layout>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-signal-emeraldDark">Milestone 3</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Innovation Analytics</h1>
        <p className="mt-1 text-sm text-ink-900/60">
          {isAdministrator
            ? "Patent landscapes and technology trends across the platform."
            : "Patent landscapes, technology trends, your innovation score, and commercialization pathways — all in one place."}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-ink-900/8">
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

      {activeTab === "patents" && <PatentIntelligenceTab />}
      {activeTab === "technology" && <TechnologyIntelligenceTab />}
      {activeTab === "trends" && <ResearchTrendsTab />}
      {activeTab === "score" && !isAdministrator && <InnovationScoreTab />}
      {activeTab === "commercialization" && !isAdministrator && <CommercializationTab />}
    </Layout>
  );
}
