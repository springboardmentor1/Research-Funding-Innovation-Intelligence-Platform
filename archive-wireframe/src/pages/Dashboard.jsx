import Layout from "../components/Layout";
import DashboardHeader from "../components/DashboardHeader";
import KPISection from "../components/KPISection";
import ResearchInsights from "../components/ResearchInsights";
import StatisticsSummary from "../components/StatisticsSummary";
import ChartSection from "../components/ChartSection";
import AnalyticsSection from "../components/AnalyticsSection";
import DashboardInsights from "../components/DashboardInsights";
import ResearchChatbot from "../components/ResearchChatbot";


function Dashboard() {

  /* =====================================================
     DYNAMIC GREETING
  ===================================================== */

  const currentHour = new Date().getHours();

  let greeting = "Good Evening";

  if (currentHour < 12) {

    greeting = "Good Morning";

  } else if (currentHour < 17) {

    greeting = "Good Afternoon";

  }


  return (

    <Layout>

      {/* =====================================================
          DASHBOARD HEADER
      ===================================================== */}

      <DashboardHeader />


      {/* =====================================================
          GREETING CARD
      ===================================================== */}

      <div className="summary-card dashboard-greeting">

        <h2>

          {greeting}

          <span className="greeting-icon">
            👋
          </span>

        </h2>


        <p>

          Welcome to{" "}

          <strong>
            the Research Funding & Innovation Intelligence Platform
          </strong>

          .

          Explore publications, funding opportunities, patents,
          research organizations, and researcher profiles from one
          centralized dashboard.

        </p>

      </div>


      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <KPISection />


      {/* =====================================================
          RESEARCH INTELLIGENCE
      ===================================================== */}

      <ResearchInsights />


      {/* =====================================================
          STATISTICS SUMMARY
      ===================================================== */}

      <StatisticsSummary />


      {/* =====================================================
          PLATFORM OVERVIEW
      ===================================================== */}

      <div className="summary-card platform-overview">

        <h2>
          Platform Overview
        </h2>


        <p>

          This platform integrates multiple research datasets into one
          intelligent dashboard. Users can search publications,
          discover funding opportunities, analyze patent activity,
          explore research organizations and researcher profiles,
          visualize trends, generate reports, and gain research
          intelligence through analytics.

        </p>

      </div>


      {/* =====================================================
          RESEARCH ANALYTICS CHARTS
      ===================================================== */}

      <ChartSection />


      {/* =====================================================
          ANALYTICS SECTION
      ===================================================== */}

      <AnalyticsSection />


      {/* =====================================================
          DASHBOARD INSIGHTS
      ===================================================== */}

      <DashboardInsights />


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="dashboard-footer">

        <strong>
          Research Funding & Innovation Intelligence Platform
        </strong>


        <br />


        <span>
          Powered by OpenAlex • NIH Funding • Google Patents
        </span>

      </footer>


      {/* =====================================================
          RESEARCHHUB AI CHATBOT
          Floating dashboard assistant
      ===================================================== */}

      <ResearchChatbot />


    </Layout>

  );

}


export default Dashboard;