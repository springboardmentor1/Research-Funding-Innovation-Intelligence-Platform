function DashboardInsights() {
  return (
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
              <th style={{ padding: "10px", textAlign: "left" }}>
                Title
              </th>

              <th>Year</th>

              <th>Type</th>

              <th>Citations</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={{ padding: "12px" }}>
                Loading latest publications...
              </td>

              <td>-</td>

              <td>-</td>

              <td>-</td>
            </tr>
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
            <li>Loading...</li>
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
            <li>Loading...</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DashboardInsights;