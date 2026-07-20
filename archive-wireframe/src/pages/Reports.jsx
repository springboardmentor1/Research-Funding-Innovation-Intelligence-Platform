import Layout from "../components/Layout";

const API_URL = "http://127.0.0.1:5000";

function Reports() {

  const reports = [
    {
      title: "📚 Publications",
      csv: `${API_URL}/reports/publications/csv`,
      pdf: `${API_URL}/reports/publications/pdf`,
      description: "Download all publication records."
    },
    {
      title: "💰 Funding",
      csv: `${API_URL}/reports/funding/csv`,
      pdf: `${API_URL}/reports/funding/pdf`,
      description: "Download all funding projects."
    },
    {
      title: "📜 Patents",
      csv: `${API_URL}/reports/patents/csv`,
      pdf: `${API_URL}/reports/patents/pdf`,
      description: "Download all patent records."
    }
  ];

  return (
    <Layout>
      <div style={{ padding: "30px" }}>

        <h1>📄 Reports</h1>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "30px"
          }}
        >
          Export research datasets as CSV or PDF reports.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: "25px"
          }}
        >
          {reports.map((report, index) => (
            <div
              key={index}
              style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,.08)"
              }}
            >
              <h2>{report.title}</h2>

              <p
                style={{
                  color: "#6b7280",
                  marginBottom: "20px"
                }}
              >
                {report.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px"
                }}
              >
                <a
                  href={report.csv}
                  target="_blank"
                  rel="noreferrer"
                >
                  <button
                    style={{
                      padding: "10px 18px",
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    Export CSV
                  </button>
                </a>

                <a
                  href={report.pdf}
                  target="_blank"
                  rel="noreferrer"
                >
                  <button
                    style={{
                      padding: "10px 18px",
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                  >
                    Export PDF
                  </button>
                </a>

              </div>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}

export default Reports;