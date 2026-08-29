// Commercialization pathways + report export.
// Shows the rule-engine recommendations and the PDF/Excel download buttons.

import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { Spinner, ErrorBox } from "../components/common";

function ConfidenceBadge({ level }) {
  const cls = level === "high" ? "confidence-high"
    : level === "moderate" ? "confidence-moderate" : "confidence-low";
  return <span className={`confidence-badge ${cls}`}>{level}</span>;
}

export default function Commercialization() {
  const { data, loading, error, reload } = useApi(() => api.commercialization.me(), []);
  const [downloading, setDownloading] = useState(null);

  async function download(kind) {
    setDownloading(kind);
    try {
      if (kind === "pdf") await api.reports.pdf();
      else await api.reports.excel();
    } catch (err) {
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <h1 className="page-title">Commercialization</h1>
      <p className="page-sub">
        Suggested pathways based on your innovation score, plus full report export.
      </p>

      <div className="card">
        <div className="card-title">Export Full Report</div>
        <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>
          Analytics across patents, publications, and your innovation score.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={() => download("pdf")} disabled={downloading}>
            {downloading === "pdf" ? "Preparing..." : "Download PDF"}
          </button>
          <button className="btn" onClick={() => download("excel")} disabled={downloading}>
            {downloading === "excel" ? "Preparing..." : "Download Excel"}
          </button>
        </div>
      </div>

      {error && error.status === 404 ? (
        <div className="card">
          <p>Create a research profile first to see commercialization pathways.</p>
          <Link className="btn btn-primary" to="/profile">Create profile</Link>
        </div>
      ) : loading ? (
        <Spinner label="Analysing pathways..." />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : (
        <div className="card">
          <div className="card-title">
            Recommended Pathways
            <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              (innovation score: {data.innovation_score})
            </span>
          </div>
          {data.pathways.map((p, i) => (
            <div className="pathway" key={i}>
              <div className="pathway-head">
                <span className="pathway-name">{p.pathway}</span>
                {p.confidence !== "n/a" && <ConfidenceBadge level={p.confidence} />}
              </div>
              <p className="pathway-rationale">{p.rationale}</p>
              <ol className="pathway-steps">
                {p.next_steps.map((s, j) => <li key={j}>{s}</li>)}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
