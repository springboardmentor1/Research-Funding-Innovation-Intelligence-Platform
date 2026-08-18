import React, { useEffect, useState } from "react";
import "./Dashboard.css";

import {
  FaBookOpen,
  FaChartLine,
  FaMoneyBillWave,
  FaBrain,
  FaSearch,
  FaArrowRight,
  FaDatabase,
  FaLightbulb,
  FaClock,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

import StatCard from "./StatCard";
import PublicationChart from "./PublicationChart";
import TopicsChart from "./TopicsChart";
import RecommendationCard from "./RecommendationCard";
import ActivityTimeline from "./ActivityTimeline";
import AIInsightCard from "./AIInsightCard";

import {
  getPublicationTrends,
  getTopTopics,
  getFundingRecommendations,
} from "../services/api";


function ResearchDashboard() {
  const [publicationTrends, setPublicationTrends] = useState([]);
  const [topTopics, setTopTopics] = useState([]);

  const [researchTopic, setResearchTopic] = useState("");

  const [fundingRecommendations, setFundingRecommendations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [fundingLoading, setFundingLoading] = useState(false);

  const [analyticsError, setAnalyticsError] = useState(false);
  const [fundingError, setFundingError] = useState("");


  /* =====================================================
     LOAD ANALYTICS
  ====================================================== */

  useEffect(() => {
    loadDashboard();
  }, []);


  const loadDashboard = async () => {
    try {
      setAnalyticsError(false);

      const [trends, topics] = await Promise.all([
        getPublicationTrends(),
        getTopTopics(),
      ]);

      setPublicationTrends(
        trends?.data?.data || []
      );

      setTopTopics(
        topics?.data?.data || []
      );

    } catch (error) {
      console.error("Dashboard analytics error:", error);

      setAnalyticsError(true);

      setPublicationTrends([]);
      setTopTopics([]);

    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     FUNDING SEARCH
  ====================================================== */

  const fetchFunding = async () => {

    const topic = researchTopic.trim();

    if (!topic) {
      setFundingError(
        "Enter a research topic to discover relevant funding opportunities."
      );
      return;
    }

    try {
      setFundingError("");
      setFundingLoading(true);

      const response =
        await getFundingRecommendations(topic);

      setFundingRecommendations(
        response?.data?.recommendations || []
      );

    } catch (error) {

      console.error(
        "Funding recommendation error:",
        error
      );

      setFundingRecommendations([]);

      setFundingError(
        "Unable to fetch funding recommendations. Please make sure the backend server is running."
      );

    } finally {
      setFundingLoading(false);
    }
  };


  /* =====================================================
     ENTER KEY SEARCH
  ====================================================== */

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      fetchFunding();
    }
  };


  return (
    <main className="dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <div className="dashboard-eyebrow">
            <span className="eyebrow-dot"></span>
            AI RESEARCH INTELLIGENCE
          </div>

          <h1>
            Research Intelligence
            <span> Dashboard</span>
          </h1>

          <p>
            Analyze research activity, discover emerging topics,
            and identify funding opportunities through intelligent
            research analytics.
          </p>

          <div className="dashboard-status">

            <span className="status-indicator">
              <FaCheckCircle />
            </span>

            <span>Research intelligence system online</span>

          </div>

        </div>


        <div className="hero-metrics">

          <div className="hero-metric">
            <FaDatabase />

            <div>
              <strong>Research Data</strong>
              <span>Connected</span>
            </div>
          </div>


          <div className="hero-metric">
            <FaBrain />

            <div>
              <strong>AI Analysis</strong>
              <span>Active</span>
            </div>
          </div>

        </div>

      </section>


      {/* =================================================
          MAIN FUNDING SEARCH
      ================================================== */}

      <section className="funding-search-panel">

        <div className="funding-search-header">

          <div className="funding-search-icon">
            <FaMoneyBillWave />
          </div>

          <div>

            <div className="section-kicker">
              FUNDING INTELLIGENCE
            </div>

            <h2>
              Find Funding for Your Research
            </h2>

            <p>
              Enter your research topic and discover funding
              opportunities ranked according to relevance.
            </p>

          </div>

        </div>


        <div className="funding-search">

          <div className="search-input-wrapper">

            <FaSearch />

            <input
              type="text"
              value={researchTopic}
              onChange={(event) =>
                setResearchTopic(event.target.value)
              }
              onKeyDown={handleSearchKeyDown}
              placeholder="Search a research topic — e.g. Artificial Intelligence, Machine Learning..."
              aria-label="Research topic"
            />

            {researchTopic && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setResearchTopic("");
                  setFundingRecommendations([]);
                  setFundingError("");
                }}
              >
                ×
              </button>
            )}

          </div>


          <button
            type="button"
            className="funding-search-button"
            onClick={fetchFunding}
            disabled={fundingLoading}
          >

            {fundingLoading ? (
              <>
                <FaSpinner className="spin" />
                Searching...
              </>
            ) : (
              <>
                Find Funding
                <FaArrowRight />
              </>
            )}

          </button>

        </div>


        <div className="search-helper">

          <span>
            <FaLightbulb />
            Tip: Use a specific research area for more relevant matches.
          </span>

          <span className="search-powered">
            AI-powered matching
          </span>

        </div>


        {fundingError && (
          <div className="funding-error">
            {fundingError}
          </div>
        )}

      </section>


      {/* =================================================
          QUICK STATS
      ================================================== */}

      <section className="dashboard-stats">

        <StatCard
          title="Publication Years"
          value={publicationTrends.length}
          subtitle="Research timeline"
          icon={<FaBookOpen />}
        />

        <StatCard
          title="Research Topics"
          value={topTopics.length}
          subtitle="Trending research areas"
          icon={<FaBrain />}
        />

        <StatCard
          title="Funding Programs"
          value="4"
          subtitle="Available opportunities"
          icon={<FaMoneyBillWave />}
        />

        <StatCard
          title="Analytics"
          value="Live"
          subtitle="Data intelligence"
          icon={<FaChartLine />}
        />

      </section>


      {/* =================================================
          ANALYTICS ERROR
      ================================================== */}

      {analyticsError && (
        <div className="dashboard-warning">

          <FaDatabase />

          <div>
            <strong>Analytics temporarily unavailable</strong>

            <span>
              Please make sure the FastAPI backend server is running.
            </span>
          </div>

        </div>
      )}


      {/* =================================================
          ANALYTICS
      ================================================== */}

      {!loading && (

        <section className="analytics-section">

          <div className="section-heading">

            <div>

              <div className="section-kicker">
                RESEARCH ANALYTICS
              </div>

              <h2>
                Research Activity & Trends
              </h2>

            </div>

            <div className="section-heading-status">
              <span></span>
              Live analytics
            </div>

          </div>


          <div className="analytics-grid">

            <div className="analytics-card publication-card">

              <div className="analytics-card-header">

                <div className="analytics-icon blue">
                  <FaChartLine />
                </div>

                <div>
                  <h3>Publication Trends</h3>

                  <p>
                    Research activity across available publication years.
                  </p>
                </div>

              </div>

              <div className="chart-container">
                <PublicationChart
                  data={publicationTrends}
                />
              </div>

            </div>


            <div className="analytics-card topics-card">

              <div className="analytics-card-header">

                <div className="analytics-icon purple">
                  <FaBrain />
                </div>

                <div>
                  <h3>Top Research Topics</h3>

                  <p>
                    Most frequently occurring research concepts.
                  </p>
                </div>

              </div>

              <div className="chart-container">
                <TopicsChart
                  data={topTopics}
                />
              </div>

            </div>

          </div>

        </section>

      )}


      {/* =================================================
          INTELLIGENCE
      ================================================== */}

      {!loading && (

        <section className="intelligence-grid">

          <div className="intelligence-card">

            <AIInsightCard
              topics={topTopics}
              funding={fundingRecommendations}
            />

          </div>


          <div className="intelligence-card">

            <ActivityTimeline />

          </div>

        </section>

      )}


      {/* =================================================
          FUNDING RESULTS
      ================================================== */}

      <section className="recommendations-section">

        <div className="section-heading">

          <div>

            <div className="section-kicker">
              FUNDING DISCOVERY
            </div>

            <h2>
              Recommended Opportunities
            </h2>

          </div>

          {fundingRecommendations.length > 0 && (
            <span className="result-count">
              {fundingRecommendations.length} matches
            </span>
          )}

        </div>


        <div className="recommendation-grid">

          {fundingRecommendations.length === 0 ? (

            <div className="empty-recommendations">

              <div className="empty-icon">
                <FaMoneyBillWave />
              </div>

              <h3>
                Discover Research Funding
              </h3>

              <p>
                Search for a research topic above to receive
                relevant funding recommendations.
              </p>

              <button
                type="button"
                onClick={() => {
                  document
                    .querySelector(".funding-search input")
                    ?.focus();
                }}
              >
                Start Funding Search
                <FaArrowRight />
              </button>

            </div>

          ) : (

            fundingRecommendations.map(
              (item, index) => (
                <RecommendationCard
                  key={index}
                  recommendation={item}
                />
              )
            )

          )}

        </div>

      </section>


      {/* =================================================
          FOOTER
      ================================================== */}

      <footer className="dashboard-footer">

        <div>
          AI Research Funding & Innovation Intelligence Platform
        </div>

        <span>
          Powered by OpenAlex Research Data
        </span>

      </footer>

    </main>
  );
}

export default ResearchDashboard;