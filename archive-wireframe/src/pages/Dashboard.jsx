import StatisticsSummary from "../components/StatisticsSummary";
import Layout from "../components/Layout";
import DashboardHeader from "../components/DashboardHeader";
import KPISection from "../components/KPISection";
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
          </strong>
          . Explore publications, funding opportunities, patents,
          research organizations, and researchers from one centralized
          dashboard.
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
          visualize trends, and generate downloadable reports.
        </p>
      </div>

      {/* Charts */}
      <ChartSection />

      {/* Analytics */}
      <AnalyticsSection />

      {/* NEW Dashboard Insights */}
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