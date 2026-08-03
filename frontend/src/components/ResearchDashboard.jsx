import React, { useEffect, useState } from "react";
import "./Dashboard.css";

import {
  FaBook,
  FaChartLine,
  FaMoneyBillWave,
  FaBrain,
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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [trends, topics] = await Promise.all([
        getPublicationTrends(),
        getTopTopics(),
      ]);

      setPublicationTrends(trends.data.data || []);
      setTopTopics(topics.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFunding = async () => {
    if (!researchTopic.trim()) {
      alert("Please enter a research topic.");
      return;
    }

    try {
      const res = await getFundingRecommendations(researchTopic);
      setFundingRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch recommendations.");
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🤖 AI Research Intelligence Dashboard</h1>

        <p>
          Analyze publication trends, discover emerging research topics and
          receive AI-powered funding recommendations.
        </p>
      </div>

      <div className="summary-cards">
        <StatCard
          title="Publication Years"
          value={publicationTrends.length}
          subtitle="Research Timeline"
          icon={<FaBook />}
        />

        <StatCard
          title="Research Topics"
          value={topTopics.length}
          subtitle="Trending Areas"
          icon={<FaBrain />}
        />

        <StatCard
          title="Funding Programs"
          value="4"
          subtitle="Available Grants"
          icon={<FaMoneyBillWave />}
        />

        <StatCard
          title="Analytics"
          value="100%"
          subtitle="Dashboard Ready"
          icon={<FaChartLine />}
        />
      </div>

      {!loading && (
        <>
          <div className="charts-grid">
            <PublicationChart data={publicationTrends} />
            <TopicsChart data={topTopics} />
          </div>

          <div className="charts-grid">
            <AIInsightCard
              topics={topTopics}
              funding={fundingRecommendations}
            />

            <ActivityTimeline />
          </div>
        </>
      )}

      <div className="dashboard-section">
        <h2>💰 AI Funding Recommendation Engine</h2>

        <div className="search-box">
          <input
            type="text"
            placeholder="Example: Artificial Intelligence"
            value={researchTopic}
            onChange={(e) => setResearchTopic(e.target.value)}
          />

          <button onClick={fetchFunding}>
            Get Recommendations
          </button>
        </div>

        <div className="recommendation-grid">
          {fundingRecommendations.length === 0 ? (
            <p>
              Search for a research topic to receive funding recommendations.
            </p>
          ) : (
            fundingRecommendations.map((item, index) => (
              <RecommendationCard
                key={index}
                recommendation={item}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ResearchDashboard;