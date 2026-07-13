import Layout from "../components/Layout";
import DashboardHeader from "../components/DashboardHeader";
import KPISection from "../components/KPISection";
import ChartSection from "../components/ChartSection";
import RecentActivity from "../components/RecentActivity";

function Dashboard() {
  return (
    <Layout>
      <DashboardHeader />
      <KPISection />
      <ChartSection />
      <RecentActivity />
    </Layout>
  );
}

export default Dashboard;