import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { useEffect, useState } from "react";
import { getReports } from "../api/reportApi";

function Reports() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getReports();
        setReport(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadReport();
  }, []);

  const downloadCSV = () => {
    window.open("http://127.0.0.1:5000/reports/export", "_blank");
  };

  const downloadPDF = () => {
    window.open("http://127.0.0.1:5000/reports/pdf", "_blank");
  };

  if (!report) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
  <Layout>
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        background: "#fff",
        padding: "40px",
        borderRadius: "15px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      {/* Report Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "18px",
          marginBottom: "10px",
        }}
      >
        <span style={{ fontSize: "54px" }}>📊</span>

        <h1
          style={{
            margin: 0,
            fontSize: "48px",
            fontWeight: "700",
            color: "#111827",
            lineHeight: "1.2",
          }}
        >
          Research Intelligence Report
        </h1>
      </div>

      <p
        style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: "18px",
          marginBottom: "35px",
        }}
      >
        Summary of Publications, Funding, Patents, Organizations and Researchers
      </p>

      <hr />

      <h2
        style={{
          textAlign: "center",
          marginTop: "35px",
          marginBottom: "30px",
          color: "#111827",
        }}
      >
        Database Summary
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "18px",
        }}
      >
        <tbody>
          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
            <td style={{ padding: "14px 0" }}>
              📚 <strong>Publications</strong>
            </td>
            <td
              style={{
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              {report.publications}
            </td>
          </tr>

          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
            <td style={{ padding: "14px 0" }}>
              💰 <strong>Funding Projects</strong>
            </td>
            <td
              style={{
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              {report.funding}
            </td>
          </tr>

          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
            <td style={{ padding: "14px 0" }}>
              📜 <strong>Patents</strong>
            </td>
            <td
              style={{
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              {report.patents}
            </td>
          </tr>

          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
            <td style={{ padding: "14px 0" }}>
              🏢 <strong>Organizations</strong>
            </td>
            <td
              style={{
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              {report.organizations}
            </td>
          </tr>

          <tr>
            <td style={{ padding: "14px 0" }}>
              👨‍🔬 <strong>Researchers</strong>
            </td>
            <td
              style={{
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              {report.researchers}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "40px",
        }}
      >
        <button
          onClick={downloadCSV}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px 28px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          📄 Download CSV
        </button>

        <button
          onClick={downloadPDF}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px 28px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          📑 Download PDF
        </button>
      </div>
    </div>
  </Layout>
);
}

export default Reports;