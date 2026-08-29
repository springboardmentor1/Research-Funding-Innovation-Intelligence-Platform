// Patent thematic clusters (Module 5). Unsupervised KMeans over patent text,
// surfacing themes that emerge from language rather than pre-assigned CPC codes.

import { useState } from "react";
import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { Spinner, ErrorBox } from "../components/common";

export default function Clusters() {
  const [k, setK] = useState(8);
  const { data, loading, error, reload } = useApi(() => api.patents.clusters(k), [k]);

  return (
    <div>
      <h1 className="page-title">Patent Themes</h1>
      <p className="page-sub">
        Unsupervised clustering of patent text into discovered themes (KMeans over TF-IDF).
      </p>

      <div className="toolbar">
        <label>Clusters:</label>
        <select value={k} onChange={(e) => setK(Number(e.target.value))}>
          {[4, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {loading ? <Spinner label="Clustering patents..." /> :
       error ? <ErrorBox error={error} onRetry={reload} /> :
       data.error ? <div className="card"><p>{data.error}</p></div> :
       (
        <>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>
            {data.patents_clustered} patents grouped into {data.k} themes.
          </p>
          <div className="grid grid-2">
            {data.clusters.map((c) => (
              <div className="card" key={c.cluster_id}>
                <div className="card-title" style={{ textTransform: "capitalize" }}>
                  {c.label}
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>
                  <span>{c.size} patents</span>
                  {c.avg_year && <span>avg year {c.avg_year}</span>}
                </div>
                <div className="rec-terms" style={{ marginBottom: 12 }}>
                  {c.top_terms.map((t) => <span className="term-chip" key={t}>{t}</span>)}
                </div>
                <div style={{ fontSize: 13 }}>
                  {c.examples.map((e, i) => (
                    <div key={i} style={{ color: "#94a3b8", marginBottom: 4 }}>
                      • {e.title?.slice(0, 60)} <span style={{ color: "#22d3aa" }}>({e.cited_by_count} cites)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
       )}
    </div>
  );
}
