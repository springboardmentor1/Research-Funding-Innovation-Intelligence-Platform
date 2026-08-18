import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [publicationTrends, setPublicationTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [researchTopic, setResearchTopic] = useState("");
  const [searchedTopic, setSearchedTopic] = useState("");

  useEffect(() => {
    const fetchPublicationTrends = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/publication-trends"
        );

        setPublicationTrends(response.data.publication_trends || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load publication trend data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicationTrends();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const topic = researchTopic.trim();
    if (!topic) return;

    setSearchedTopic(topic);
  };

  const maxPapers = Math.max(
    ...publicationTrends.map((item) => Number(item.paper_count) || 0),
    1
  );

  return (
    <main className="dashboard-page">
      {/* HERO */}
      <section className="dashboard-header">
        <div className="hero-copy">
          <div className="dashboard-label">
            <span className="label-dot" />
            AI RESEARCH INTELLIGENCE
          </div>

          <h1>
            Research Intelligence
            <span> Dashboard</span>
          </h1>

          <p className="dashboard-description">
            Explore research trends, discover emerging topics, and identify
            the funding opportunities that matter most to your work.
          </p>

          <div className="system-status">
            <span className="status-dot" />
            Research intelligence system online
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-core">🧠</div>
          <span className="floating-icon icon-book">📚</span>
          <span className="floating-icon icon-money">💰</span>
          <span className="floating-icon icon-chart">📈</span>
        </div>
      </section>

      {/* MAIN SEARCH — PRIMARY FEATURE */}
      <section className="funding-search-panel">
        <div className="search-accent" />

        <div className="search-header">
          <div className="search-icon">🔎</div>

          <div>
            <div className="section-kicker">FUNDING INTELLIGENCE</div>
            <h2>Find Funding for Your Research</h2>
            <p>
              Enter a research topic and discover relevant funding
              opportunities ranked by relevance.
            </p>
          </div>
        </div>

        <form className="funding-search" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <span className="input-icon">⌕</span>
            <input
              type="text"
              value={researchTopic}
              onChange={(event) => setResearchTopic(event.target.value)}
              placeholder="Search a research topic — e.g. Artificial Intelligence"
              aria-label="Research topic"
            />
            {researchTopic && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setResearchTopic("");
                  setSearchedTopic("");
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button className="funding-search-button" type="submit">
            <span>Find Funding</span>
            <span className="button-arrow">→</span>
          </button>
        </form>

        <div className="search-helper">
          <span>💡 Use a specific research area for more relevant matches.</span>
          <span className="ai-powered">✦ AI-powered matching</span>
        </div>

        {searchedTopic && (
          <div className="search-result-banner">
            <span className="result-check">✓</span>
            <div>
              <strong>Research topic selected</strong>
              <p>
                Funding discovery is ready for <b>{searchedTopic}</b>.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* KPI CARDS */}
      <section className="dashboard-cards" aria-label="Dashboard summary">
        <article className="dashboard-card card-cyan">
          <div className="card-top">
            <div className="card-icon">📚</div>
            <span className="card-badge">RESEARCH</span>
          </div>
          <div>
            <p className="card-title">Research Papers</p>
            <p className="card-value">
              {loading ? "…" : publicationTrends.length || "0"}
            </p>
            <p className="card-description">Publication years available</p>
          </div>
          <div className="card-line" />
        </article>

        <article className="dashboard-card card-purple">
          <div className="card-top">
            <div className="card-icon">💰</div>
            <span className="card-badge">FUNDING</span>
          </div>
          <div>
            <p className="card-title">Funding Opportunities</p>
            <p className="card-value">4</p>
            <p className="card-description">Available opportunities</p>
          </div>
          <div className="card-line" />
        </article>

        <article className="dashboard-card card-orange">
          <div className="card-top">
            <div className="card-icon">🔥</div>
            <span className="card-badge">TRENDING</span>
          </div>
          <div>
            <p className="card-title">Top Research Topics</p>
            <p className="card-value">AI</p>
            <p className="card-description">Emerging research areas</p>
          </div>
          <div className="card-line" />
        </article>

        <article className="dashboard-card card-green">
          <div className="card-top">
            <div className="card-icon">📊</div>
            <span className="card-badge">LIVE</span>
          </div>
          <div>
            <p className="card-title">Analytics</p>
            <p className="card-value">Live</p>
            <p className="card-description">Research data intelligence</p>
          </div>
          <div className="card-line" />
        </article>
      </section>

      {/* ANALYTICS */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <div className="section-kicker">RESEARCH ANALYTICS</div>
            <h2>Research Activity & Trends</h2>
            <p>Publication activity across the available research years.</p>
          </div>

          <div className="live-pill">
            <span className="status-dot" />
            LIVE ANALYTICS
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-panel publication-panel">
            <div className="panel-header">
              <div className="panel-icon blue">📈</div>
              <div>
                <h3>Publication Trends</h3>
                <p>Research activity over time</p>
              </div>
            </div>

            <div className="trend-list">
              {loading && (
                <div className="empty-state">
                  <span>⏳</span>
                  Loading publication trends…
                </div>
              )}

              {error && <p className="error-message">{error}</p>}

              {!loading && !error && publicationTrends.length === 0 && (
                <div className="empty-state">
                  <span>📊</span>
                  No publication trend data available.
                </div>
              )}

              {!loading &&
                !error &&
                publicationTrends.map((trend) => {
                  const count = Number(trend.paper_count) || 0;
                  const width = Math.max((count / maxPapers) * 100, 5);

                  return (
                    <div className="trend-item" key={trend.year}>
                      <div className="trend-label">
                        <span>{trend.year}</span>
                        <strong>{count} papers</strong>
                      </div>

                      <div className="trend-bar-container">
                        <div
                          className="trend-bar"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="analytics-panel topics-panel">
            <div className="panel-header">
              <div className="panel-icon purple">🔥</div>
              <div>
                <h3>Top Research Topics</h3>
                <p>Frequently researched areas</p>
              </div>
            </div>

            <div className="topic-list">
              <div className="topic-item">
                <span className="topic-number">01</span>
                <span>Artificial Intelligence</span>
                <b>High</b>
              </div>
              <div className="topic-item">
                <span className="topic-number">02</span>
                <span>Machine Learning</span>
                <b>High</b>
              </div>
              <div className="topic-item">
                <span className="topic-number">03</span>
                <span>Data Science</span>
                <b>Growing</b>
              </div>
              <div className="topic-item">
                <span className="topic-number">04</span>
                <span>Computer Vision</span>
                <b>Growing</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTELLIGENCE */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <div className="section-kicker">INTELLIGENCE</div>
            <h2>Research Insights</h2>
            <p>Signals that help guide your next research decision.</p>
          </div>
        </div>

        <div className="insights-grid">
          <article className="insight-card insight-blue">
            <div className="insight-icon">🚀</div>
            <div>
              <span>RESEARCH ACTIVITY</span>
              <h3>Growing research momentum</h3>
              <p>
                Publication trends help identify areas receiving increasing
                research attention.
              </p>
            </div>
          </article>

          <article className="insight-card insight-purple">
            <div className="insight-icon">🤖</div>
            <div>
              <span>EMERGING TOPICS</span>
              <h3>AI remains a key research area</h3>
              <p>
                Explore high-interest topics and use them to refine funding
                searches.
              </p>
            </div>
          </article>

          <article className="ai-recommendation">
            <div className="ai-badge">✦ AI RECOMMENDATION</div>
            <h3>
              {searchedTopic
                ? `Focus your funding search on ${searchedTopic}`
                : "Start with a focused research topic"}
            </h3>
            <p>
              {searchedTopic
                ? `Your selected topic is ${searchedTopic}. Use the funding discovery workflow to identify matching opportunities.`
                : "Enter a specific research area above to receive more relevant funding recommendations and matching opportunities."}
            </p>
          </article>
        </div>
      </section>

      {/* FUNDING DISCOVERY */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <div className="section-kicker">FUNDING DISCOVERY</div>
            <h2>Recommended Opportunities</h2>
            <p>Move from research insight to funding discovery.</p>
          </div>
        </div>

        <div className="funding-discovery">
          <div className="discovery-icon">💡</div>
          <div className="discovery-content">
            <h3>Discover Research Funding</h3>
            <p>
              Search for a research topic above to identify relevant funding
              opportunities and matching scores.
            </p>
          </div>
          <button
            type="button"
            className="discovery-button"
            onClick={() =>
              document
                .querySelector(".funding-search-panel")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Start Funding Search →
          </button>
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>AI Research Funding & Innovation Intelligence Platform</span>
        <span>Powered by OpenAlex Research Data</span>
      </footer>
    </main>
  );
}

export default Dashboard;