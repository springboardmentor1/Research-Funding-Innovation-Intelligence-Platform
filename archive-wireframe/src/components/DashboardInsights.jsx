import { useEffect, useState } from "react";
import { getDashboardInsights } from "../api/dashboardInsightsApi";
import NotificationPopup from "./NotificationPopup";

function DashboardInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) {
    return (
      <div
        style={{
          marginTop: "30px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Loading Dashboard Insights...
      </div>
    );
  }

  return (
    <>
      {/* Popup Notification */}
      <NotificationPopup alerts={insights.alerts} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >
        {/* Latest Publications */}

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>
            📄 Latest Publications
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#2563eb",
                  color: "#fff",
                }}
              >
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                  }}
                >
                  Title
                </th>

                <th>Year</th>

                <th>Type</th>

                <th>Citations</th>
              </tr>
            </thead>

            <tbody>
              {insights.latest_publications.map((pub, index) => (
                <tr key={index}>
                  <td style={{ padding: "10px" }}>
                    {pub.title.length > 60
                      ? pub.title.substring(0, 60) + "..."
                      : pub.title}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {pub.publication_year}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {pub.type}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {Number(pub.cited_by_count).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Side */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Emerging Technologies */}

          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,.08)",
            }}
          >
            <h2>🚀 Emerging Technologies</h2>

            <ul
              style={{
                marginTop: "15px",
                lineHeight: "2",
                paddingLeft: "20px",
              }}
            >
              {insights.emerging_technologies.map((tech, index) => (
                <li key={index}>
                  <strong>{tech.name}</strong> ({tech.count} publications)
                </li>
              ))}
            </ul>
          </div>

          {/* Research Alerts */}

          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,.08)",
            }}
          >
            <h2>🔔 Research Alerts</h2>

            <ul
              style={{
                marginTop: "15px",
                lineHeight: "2",
                paddingLeft: "20px",
              }}
            >
              {insights.alerts.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default DashboardInsights;