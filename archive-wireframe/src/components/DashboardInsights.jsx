import { useEffect, useState } from "react";
import { getDashboardInsights } from "../api/dashboardInsightsApi";
import NotificationPopup from "./NotificationPopup";

function DashboardInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePublication, setActivePublication] = useState(null);
  const [activeTechnology, setActiveTechnology] = useState(null);

  useEffect(() => {
    async function loadInsights() {
      try {
        const data = await getDashboardInsights();
        setInsights(data);
      } catch (error) {
        console.error("Dashboard Insights Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();

    const interval = setInterval(loadInsights, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-insights-loading">
        Loading Dashboard Insights...
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <>
      <NotificationPopup alerts={insights.alerts} />

      <section className="dashboard-insights-section">
        <div className="insights-main-grid">

          {/* PUBLICATIONS */}

          <div className="table-card publication-card">
            <div className="table-header">
              <div>
                <span className="section-eyebrow">
                  RESEARCH FEED
                </span>

                <h2 className="table-title">
                  Latest Publications
                </h2>
              </div>

              <span className="table-badge">
                {insights.latest_publications.length} Latest
              </span>
            </div>

            <div className="publication-table-wrapper">
              <table className="activity-table publication-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Year</th>
                    <th>Type</th>
                    <th>Citations</th>
                  </tr>
                </thead>

                <tbody>
                  {insights.latest_publications.map(
                    (pub, index) => (
                      <tr
                        key={index}
                        className={
                          activePublication === index
                            ? "publication-active"
                            : ""
                        }
                        onMouseEnter={() =>
                          setActivePublication(index)
                        }
                        onMouseLeave={() =>
                          setActivePublication(null)
                        }
                      >
                        <td>
                          <div className="publication-title">
                            {pub.title.length > 60
                              ? `${pub.title.substring(0, 60)}...`
                              : pub.title}
                          </div>
                        </td>

                        <td>
                          <span className="year-badge">
                            {pub.publication_year}
                          </span>
                        </td>

                        <td>
                          <span className="type-badge">
                            {pub.type}
                          </span>
                        </td>

                        <td>
                          <span className="citation-count">
                            {Number(
                              pub.cited_by_count
                            ).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>


          {/* RIGHT COLUMN */}

          <div className="insights-side-column">

            {/* TECHNOLOGIES */}

            <div className="insight-panel technology-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-eyebrow">
                    TREND SIGNAL
                  </span>

                  <h2>🚀 Emerging Technologies</h2>
                </div>

                <span className="panel-live">
                  LIVE
                </span>
              </div>

              <div className="technology-list">
                {insights.emerging_technologies.map(
                  (tech, index) => (
                    <div
                      key={index}
                      className={`technology-item ${
                        activeTechnology === index
                          ? "technology-active"
                          : ""
                      }`}
                      onMouseEnter={() =>
                        setActiveTechnology(index)
                      }
                      onMouseLeave={() =>
                        setActiveTechnology(null)
                      }
                    >
                      <div className="technology-rank">
                        0{index + 1}
                      </div>

                      <div className="technology-info">
                        <strong>{tech.name}</strong>

                        <span>
                          {tech.count.toLocaleString()}{" "}
                          publications
                        </span>
                      </div>

                      <div className="technology-count">
                        {tech.count.toLocaleString()}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>


            {/* ALERTS */}

            <div className="insight-panel alerts-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-eyebrow">
                    SYSTEM SIGNALS
                  </span>

                  <h2>🔔 Research Alerts</h2>
                </div>

                <span className="alert-count">
                  {insights.alerts.length}
                </span>
              </div>

              <div className="alerts-list">
                {insights.alerts.map(
                  (alert, index) => (
                    <div
                      className="dashboard-alert"
                      key={index}
                    >
                      <span className="alert-dot"></span>

                      <span>{alert}</span>

                      <span className="alert-arrow">
                        →
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default DashboardInsights;