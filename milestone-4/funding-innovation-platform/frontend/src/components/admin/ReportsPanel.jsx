import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Card from "../Card";
import Loading from "../Loading";

function filenameFromDisposition(disposition, fallback) {
  const match = /filename="?([^"]+)"?/.exec(disposition || "");
  return match ? match[1] : fallback;
}

export default function ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null); // `${type}:${fmt}` while in flight
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/reports")
      .then(({ data }) => setReports(data))
      .catch(() => setError("Could not load the report catalog."))
      .finally(() => setLoading(false));
  }, []);

  const download = async (reportType, fmt) => {
    const key = `${reportType}:${fmt}`;
    setDownloading(key);
    setError("");
    try {
      const response = await axiosClient.get(`/reports/${reportType}/${fmt}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameFromDisposition(
        response.headers["content-disposition"],
        `${reportType}-report.${fmt === "excel" ? "xlsx" : "pdf"}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Could not generate that report. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <Loading message="Loading report catalog…" />;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-signal-red/30 bg-signal-red/5 px-4 py-2.5 text-sm text-signal-red">
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.report_type}>
            <h3 className="font-display text-base font-semibold text-ink-900">{report.title}</h3>
            <p className="mt-1 text-sm text-ink-900/60">{report.description}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => download(report.report_type, "pdf")}
                disabled={downloading === `${report.report_type}:pdf`}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                {downloading === `${report.report_type}:pdf` ? "Generating…" : "Download PDF"}
              </button>
              <button
                onClick={() => download(report.report_type, "excel")}
                disabled={downloading === `${report.report_type}:excel`}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                {downloading === `${report.report_type}:excel` ? "Generating…" : "Download Excel"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
