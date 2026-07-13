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
  return <LoadingSpinner />;
}

  return (
    <div style={{ padding: "30px" }}>
      <h1>Research Intelligence Report</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div className="card">
          <h2>{report.publications}</h2>
          <p>📄 Publications</p>
        </div>

        <div className="card">
          <h2>{report.funding}</h2>
          <p>💰 Funding Projects</p>
        </div>

        <div className="card">
          <h2>{report.patents}</h2>
          <p>📜 Patents</p>
        </div>

        <div className="card">
          <h2>{report.organizations}</h2>
          <p>🏢 Organizations</p>
        </div>

        <div className="card">
          <h2>{report.researchers}</h2>
          <p>👨‍🔬 Researchers</p>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <button
          onClick={downloadCSV}
          style={{ marginRight: "15px" }}
        >
          Download CSV
        </button>

        <button onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
    </div>
  );
}

export default Reports;