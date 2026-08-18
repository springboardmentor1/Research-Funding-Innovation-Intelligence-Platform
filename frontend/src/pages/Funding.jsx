import React, { useState } from "react";
import axios from "axios";
import "./Funding.css";

function Funding() {
  const [researchTopic, setResearchTopic] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const findFunding = async () => {
    if (researchTopic.trim() === "") {
      alert("Please enter a research topic.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://127.0.0.1:8000/recommend-funding",
        {
          research_topic: researchTopic,
        }
      );

      setRecommendations(
        response.data?.recommendations || []
      );

    } catch (error) {
      console.error(error);
      alert("Unable to fetch funding recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="funding-page">

      <main className="funding-container">

        {/* HERO */}

        <section className="funding-hero">

          <div className="funding-eyebrow">
            💰 FUNDING INTELLIGENCE
          </div>

          <h1>
            AI Funding Recommendation Engine
          </h1>

          <p>
            Discover funding opportunities matched to
            your research interests using intelligent
            topic matching.
          </p>

        </section>


        {/* SEARCH */}

        <section className="funding-search-section">

          <div className="funding-search-header">

            <div className="funding-icon">
              💰
            </div>

            <div>
              <h2>
                Find Funding for Your Research
              </h2>

              <p>
                Enter your research topic and discover
                relevant funding opportunities.
              </p>
            </div>

          </div>


          <div className="funding-search-row">

            <div className="funding-search-box">

              <span className="funding-search-symbol">
                🔎
              </span>

              <input
                type="text"
                placeholder="Example: Artificial Intelligence for Healthcare"
                value={researchTopic}
                onChange={(e) =>
                  setResearchTopic(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    findFunding();
                  }
                }}
              />

              {researchTopic && (
                <button
                  className="funding-clear"
                  onClick={() => setResearchTopic("")}
                >
                  ×
                </button>
              )}

            </div>


            <button
              className="funding-search-button"
              onClick={findFunding}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="funding-spinner"></span>
                  Searching...
                </>
              ) : (
                <>
                  Find Funding
                  <span>→</span>
                </>
              )}
            </button>

          </div>


          <div className="funding-tip">
            💡 Tip: Use a specific research area for more
            relevant funding matches.
          </div>

        </section>


        {/* LOADING */}

        {loading && (
          <div className="funding-loading">

            <div className="funding-loader"></div>

            <h3>
              Finding funding opportunities...
            </h3>

            <p>
              Matching your research topic with available
              funding programs.
            </p>

          </div>
        )}


        {/* RESULTS */}

        {!loading && recommendations.length > 0 && (

          <section className="funding-results">

            <div className="funding-results-header">

              <div>
                <span>
                  FUNDING DISCOVERY
                </span>

                <h2>
                  Recommended Opportunities
                </h2>

                <p>
                  Funding programs ranked according to
                  research relevance.
                </p>
              </div>

              <div className="funding-count">
                {recommendations.length} matches
              </div>

            </div>


            <div className="funding-grid">

              {recommendations.map((item, index) => (

                <article
                  className="funding-card"
                  key={index}
                >

                  <div className="funding-card-top">

                    <div className="funding-card-number">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="funding-match">
                      {Math.round(item.match_score || 0)}%
                      <small> MATCH</small>
                    </div>

                  </div>


                  <div className="funding-card-icon">
                    💰
                  </div>


                  <h3>
                    {item.title}
                  </h3>


                  <p className="funding-description">
                    {item.description}
                  </p>


                  <div className="funding-details">

                    <div className="funding-detail">

                      <span className="detail-icon">
                        🏛️
                      </span>

                      <div>
                        <small>
                          FUNDING AGENCY
                        </small>

                        <strong>
                          {item.agency}
                        </strong>
                      </div>

                    </div>


                    <div className="funding-detail">

                      <span className="detail-icon money">
                        $
                      </span>

                      <div>
                        <small>
                          FUNDING AMOUNT
                        </small>

                        <strong>
                          {item.amount}
                        </strong>
                      </div>

                    </div>

                  </div>


                  <div className="funding-score">

                    <div className="score-header">

                      <span>
                        🎯 Match Score
                      </span>

                      <strong>
                        {Math.round(
                          item.match_score || 0
                        )}%
                      </strong>

                    </div>

                    <div className="score-track">

                      <div
                        className="score-fill"
                        style={{
                          width: `${Math.min(
                            item.match_score || 0,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>


                  {item.matched_keywords &&
                    item.matched_keywords.length > 0 && (

                    <div className="matched-keywords">

                      <span>
                        🔑 Matched Keywords
                      </span>

                      <div>

                        {item.matched_keywords.map(
                          (keyword, keywordIndex) => (

                            <span
                              className="keyword"
                              key={keywordIndex}
                            >
                              {keyword}
                            </span>

                          )
                        )}

                      </div>

                    </div>

                  )}

                </article>

              ))}

            </div>

          </section>
        )}


        {/* EMPTY STATE */}

        {!loading &&
          recommendations.length === 0 && (

            <section className="funding-empty">

              <div>
                🔬
              </div>

              <h2>
                Discover Your Funding Opportunities
              </h2>

              <p>
                Enter a research topic above to find
                funding programs that match your work.
              </p>

            </section>

          )}

      </main>

    </div>
  );
}

export default Funding;