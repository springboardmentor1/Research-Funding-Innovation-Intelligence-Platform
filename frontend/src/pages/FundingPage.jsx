import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecommendationCard from "../components/RecommendationCard";
import { getFundingRecommendations } from "../services/api";
import { FaSearchDollar } from "react-icons/fa";
import "./FundingPage.css";

function FundingPage() {
  const [topic, setTopic] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!topic.trim()) {
      alert("Please enter a research topic.");
      return;
    }

    try {
      setLoading(true);

      const response = await getFundingRecommendations(topic);

      console.log(response.data);

      setRecommendations(
        response.data.recommendations || []
      );
    } catch (error) {
      console.error(error);
      alert("Unable to fetch funding recommendations.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="funding-page">

        <div className="funding-container">

          {/* HEADER */}
          <section className="funding-header">

            <div className="funding-eyebrow">
              FUNDING INTELLIGENCE
            </div>

            <h1>
              AI Funding Recommendation Engine
            </h1>

            <p>
              Discover funding opportunities that match your
              research interests and receive relevance-based
              recommendations.
            </p>

          </section>


          {/* SEARCH */}
          <section className="funding-search-card">

            <div className="funding-search-wrapper">

              <FaSearchDollar className="funding-search-icon" />

              <input
                type="text"
                placeholder="Enter your research topic..."
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              {topic && (
                <button
                  className="clear-topic"
                  onClick={() => setTopic("")}
                  type="button"
                >
                  ×
                </button>
              )}

            </div>

            <button
              className="funding-search-button"
              onClick={handleSearch}
              disabled={loading}
            >
              <FaSearchDollar />

              {loading
                ? "Searching..."
                : "Find Funding"}
            </button>

          </section>


          {/* TIP */}
          <p className="funding-tip">
            💡 Tip: Use a specific research area for more
            relevant funding matches.
          </p>


          {/* RESULTS */}
          <section className="funding-results">

            {loading && (
              <div className="funding-status">
                <div className="loading-spinner"></div>

                <h3>
                  Finding funding opportunities...
                </h3>

                <p>
                  Analyzing your research topic and matching
                  relevant programs.
                </p>
              </div>
            )}


            {!loading &&
              recommendations.length === 0 && (
                <div className="funding-empty">

                  <div className="empty-icon">
                    💰
                  </div>

                  <h2>
                    Find Funding for Your Research
                  </h2>

                  <p>
                    Enter a research topic above to discover
                    suitable funding opportunities.
                  </p>

                </div>
              )}


            {!loading &&
              recommendations.length > 0 && (
                <>
                  <div className="results-header">

                    <div>
                      <span className="results-label">
                        FUNDING DISCOVERY
                      </span>

                      <h2>
                        Recommended Opportunities
                      </h2>
                    </div>

                    <span className="results-count">
                      {recommendations.length} matches
                    </span>

                  </div>


                  <div className="funding-grid">

                    {recommendations.map(
                      (item, index) => (
                        <div
                          className="funding-card-wrapper"
                          key={index}
                        >
                          <RecommendationCard
                            recommendation={item}
                          />
                        </div>
                      )
                    )}

                  </div>
                </>
              )}

          </section>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default FundingPage;