import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {

  // Store publication trend data
  const [publicationTrends, setPublicationTrends] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error state
  const [error, setError] = useState("");

  // Fetch publication trends when page loads
  useEffect(() => {

    const fetchPublicationTrends = async () => {

      try {

        const response = await axios.get(
          "http://127.0.0.1:8000/publication-trends"
        );

        setPublicationTrends(
          response.data.publication_trends
        );

      } catch (err) {

        console.error(err);

        setError(
          "Unable to load publication trend data."
        );

      } finally {

        setLoading(false);

      }
    };

    fetchPublicationTrends();

  }, []);


  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">

        <div>

          <p className="dashboard-label">
            RESEARCH INTELLIGENCE
          </p>

          <h1>
            Research Intelligence Dashboard
          </h1>

          <p className="dashboard-description">
            Explore research trends, discover emerging topics,
            and find relevant funding opportunities.
          </p>

        </div>

      </div>


      {/* Summary Cards */}
      <div className="dashboard-cards">

        <div className="dashboard-card">

          <div className="card-icon">
            📚
          </div>

          <div>

            <h3>
              Research Papers
            </h3>

            <p className="card-value">
              --
            </p>

            <span>
              Available research papers
            </span>

          </div>

        </div>


        <div className="dashboard-card">

          <div className="card-icon">
            💰
          </div>

          <div>

            <h3>
              Funding Opportunities
            </h3>

            <p className="card-value">
              --
            </p>

            <span>
              Available funding opportunities
            </span>

          </div>

        </div>


        <div className="dashboard-card">

          <div className="card-icon">
            🔥
          </div>

          <div>

            <h3>
              Top Research Topics
            </h3>

            <p className="card-value">
              --
            </p>

            <span>
              Trending research areas
            </span>

          </div>

        </div>

      </div>


      {/* Publication Trends */}
      <section className="dashboard-section">

        <div className="section-header">

          <div>

            <h2>
              📈 Publication Trends
            </h2>

            <p>
              Research publication growth over the years
            </p>

          </div>

        </div>


        <div className="trend-list">

          {loading && (
            <p>
              Loading publication trends...
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            publicationTrends.length === 0 && (

              <p>
                No publication trend data available.
              </p>

            )
          }


          {!loading &&
            !error &&
            publicationTrends.map((trend) => (

              <div
                className="trend-item"
                key={trend.year}
              >

                <span>
                  {trend.year}
                </span>

                <div className="trend-bar-container">

                  <div
                    className="trend-bar"
                    style={{
                      width: `${Math.min(
                        trend.paper_count * 10,
                        100
                      )}%`
                    }}
                  ></div>

                </div>

                <strong>
                  {trend.paper_count} papers
                </strong>

              </div>

            ))
          }

        </div>

      </section>


      {/* Top Research Topics */}
      <section className="dashboard-section">

        <div className="section-header">

          <h2>
            🔥 Top Research Topics
          </h2>

          <p>
            Most frequently researched areas
          </p>

        </div>

        <div className="topics-grid">

          <div className="topic-placeholder">
            <span>🔬</span>
            <p>
              Topics will be loaded from the backend
            </p>
          </div>

        </div>

      </section>


      {/* Funding Recommendations */}
      <section className="dashboard-section">

        <div className="section-header">

          <h2>
            🎯 Recommended Funding Opportunities
          </h2>

          <p>
            Funding opportunities matched with research interests
          </p>

        </div>

        <div className="funding-placeholder">

          <span>
            💡
          </span>

          <div>

            <h3>
              Funding recommendations
            </h3>

            <p>
              Enter a research topic to discover relevant
              funding opportunities and matching scores.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;