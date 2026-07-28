import Layout from "../components/Layout";
import DashboardHeader from "../components/DashboardHeader";
import KPISection from "../components/KPISection";
import ResearchInsights from "../components/ResearchInsights";
import StatisticsSummary from "../components/StatisticsSummary";
import ChartSection from "../components/ChartSection";
import AnalyticsSection from "../components/AnalyticsSection";
import DashboardInsights from "../components/DashboardInsights";

function Dashboard() {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentHour = today.getHours();

  let greeting = "Good Evening";

  if (currentHour < 12) {
    greeting = "Good Morning";
  } else if (currentHour < 17) {
    greeting = "Good Afternoon";
  }

  return (
    <Layout>

      {/* Dashboard Banner */}
      <DashboardHeader />

      {/* Greeting Card */}
      <div className="summary-card">
        <h2>{greeting} 👋</h2>

        <p>
          Welcome to the{" "}
          <strong>
            Research Funding & Innovation Intelligence Platform
          </strong>.
          Explore publications, funding opportunities, patents,
          research organizations, and researcher profiles from one
          centralized dashboard.
        </p>

        <p
          style={{
            marginTop: "10px",
            color: "#6b7280",
          }}
        >
          📅 {formattedDate}
        </p>
      </div>

      {/* KPI Cards */}
      <KPISection />

      {/* NEW Research Intelligence */}
      <ResearchInsights />

      {/* Statistics Summary */}
      <StatisticsSummary />

      {/* Platform Overview */}
      <div className="summary-card">
        <h2>Platform Overview</h2>

        <p>
          This platform integrates multiple research datasets into one
          intelligent dashboard. Users can search publications,
          discover funding opportunities, analyze patent activity,
          explore research organizations and researcher profiles,
          visualize trends, generate reports, and gain research
          intelligence through analytics.
        </p>
      </div>

      {/* Charts */}
      <ChartSection />

      {/* Analytics */}
      <AnalyticsSection />

      {/* Latest Publications, Emerging Technologies & Alerts */}
      <DashboardInsights />

      {/* Footer */}
      <div className="dashboard-footer">
        <strong>
          Research Funding & Innovation Intelligence Platform
        </strong>

        <br />

        Powered by OpenAlex • NIH Funding • Google Patents
      </div>

    </Layout>
  );
}

export default Dashboard;