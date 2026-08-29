// Grant search page (Module 3). Explicit filtering, distinct from the ML
// recommendations page. Users search by keyword, agency, deadline, award size.

import { useState } from "react";
import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { Spinner, ErrorBox } from "../components/common";

export default function GrantSearch() {
  // draft = what's in the inputs; query = what we've actually submitted.
  // Separating them means typing doesn't fire a request on every keystroke;
  // the search only runs when the user clicks Search.
  const [draft, setDraft] = useState({ q: "", agency: "", open_only: true, min_award: "" });
  const [query, setQuery] = useState({ ...draft });
  const [page, setPage] = useState(1);

  const agencies = useApi(() => api.funding.agencies(), []);
  const results = useApi(
    () => api.funding.search({ ...query, page }),
    [query, page]
  );

  function runSearch(e) {
    e.preventDefault();
    setPage(1);            // new search starts at page 1
    setQuery({ ...draft });
  }

  const totalPages = results.data ? Math.ceil(results.data.total / results.data.page_size) : 1;

  return (
    <div>
      <h1 className="page-title">Grant Search</h1>
      <p className="page-sub">Search open funding opportunities by keyword, agency, and award size.</p>

      <form onSubmit={runSearch} className="card">
        <div className="grid grid-2" style={{ gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: "#94a3b8" }}>Keyword</label>
            <input value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                   placeholder="e.g. quantum, robotics"
                   style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#94a3b8" }}>Agency</label>
            <select value={draft.agency} onChange={(e) => setDraft({ ...draft, agency: e.target.value })}
                    style={inputStyle}>
              <option value="">Any agency</option>
              {agencies.data?.map((a) => (
                <option key={a.agency} value={a.agency}>{a.agency} ({a.count})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#94a3b8" }}>Minimum award ($)</label>
            <input type="number" value={draft.min_award}
                   onChange={(e) => setDraft({ ...draft, min_award: e.target.value })}
                   placeholder="0" style={inputStyle} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={draft.open_only}
                     onChange={(e) => setDraft({ ...draft, open_only: e.target.checked })} />
              Open only
            </label>
            <button className="btn btn-primary" type="submit">Search</button>
          </div>
        </div>
      </form>

      {results.loading ? <Spinner label="Searching..." /> :
       results.error ? <ErrorBox error={results.error} onRetry={results.reload} /> :
       (
        <>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 12 }}>
            {results.data.total} opportunities found
          </p>

          {results.data.results.map((o) => (
            <div className="rec-item" key={o.id}>
              <div className="rec-header">
                <div>
                  <div className="rec-title">
                    {o.url ? <a href={o.url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>{o.title}</a> : o.title}
                  </div>
                  <div className="rec-agency">{o.agency}</div>
                </div>
              </div>
              <div className="rec-meta">
                {o.close_date && <span>Closes: {o.close_date}</span>}
                {o.award_ceiling && <span>Up to ${Number(o.award_ceiling).toLocaleString()}</span>}
                {o.category && <span>{o.category}</span>}
              </div>
            </div>
          ))}

          {results.data.total > results.data.page_size && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
              <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Page {page} of {totalPages}</span>
              <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
       )}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", background: "#232d47",
  border: "1px solid #2d3a56", borderRadius: 8, color: "#e8edf5", fontSize: 14,
};
