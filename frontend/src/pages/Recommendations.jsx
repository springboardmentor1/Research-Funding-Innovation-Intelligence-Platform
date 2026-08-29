// Funding recommendations page. Shows ranked opportunities with the matched
// terms that explain each match, and lets the user switch retrieval method to
// see the hybrid engine's behaviour.

import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { Spinner, ErrorBox } from "../components/common";

export default function Recommendations() {
  const [method, setMethod] = useState("hybrid");
  const [topK, setTopK] = useState(10);

  // Re-runs whenever method or topK change, because they are in the deps array.
  const { data, loading, error, reload } = useApi(
    () => api.recommendations.list(topK, method),
    [method, topK]
  );

  return (
    <div>
      <h1 className="page-title">Funding Recommendations</h1>
      <p className="page-sub">
        Ranked by a hybrid of TF-IDF and semantic similarity against your profile.
      </p>

      <div className="toolbar">
        <label>Method:</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="hybrid">Hybrid (recommended)</option>
          <option value="lexical">Lexical (TF-IDF)</option>
          <option value="dense">Dense (embeddings)</option>
        </select>
        <label>Show:</label>
        <select value={topK} onChange={(e) => setTopK(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {error && error.status === 404 ? (
        <div className="card">
          <p>Create a research profile first to get recommendations.</p>
          <Link className="btn btn-primary" to="/profile">Create profile</Link>
        </div>
      ) : loading ? (
        <Spinner label="Ranking opportunities..." />
      ) : error ? (
        <ErrorBox error={error} onRetry={reload} />
      ) : data.length === 0 ? (
        <div className="card"><p>No matching opportunities found.</p></div>
      ) : (
        data.map((r, i) => (
          <div className="rec-item" key={i}>
            <div className="rec-header">
              <div>
                <div className="rec-title">
                  {r.opportunity.url ? (
                    <a href={r.opportunity.url} target="_blank" rel="noreferrer"
                       style={{ color: "inherit" }}>
                      {r.opportunity.title}
                    </a>
                  ) : r.opportunity.title}
                </div>
                <div className="rec-agency">{r.opportunity.agency}</div>
              </div>
              <div className="rec-score">#{i + 1}</div>
            </div>

            <div className="rec-meta">
              {r.opportunity.close_date && <span>Closes: {r.opportunity.close_date}</span>}
              {r.opportunity.award_ceiling && (
                <span>Up to ${Number(r.opportunity.award_ceiling).toLocaleString()}</span>
              )}
              {r.opportunity.category && <span>{r.opportunity.category}</span>}
            </div>

            {r.matched_terms?.length > 0 && (
              <div className="rec-terms">
                <span style={{ color: "#94a3b8", fontSize: 12 }}>Matched:</span>
                {r.matched_terms.map((t) => <span className="term-chip" key={t}>{t}</span>)}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
