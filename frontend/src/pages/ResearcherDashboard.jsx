import { Link } from "react-router-dom";
// Researcher dashboard: the landing page after login.
// Pulls together the innovation score, funding recommendation count, and the
// key trend charts into one overview.

import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { Spinner, ErrorBox, StatCard } from "../components/common";
import { BarChartCard, LineChartCard } from "../components/charts";

function ScoreBar({ label, value, weight }) {
  return (
    <div className="score-row">
      <div className="score-row-head">
        <span>{label.replace(/_/g, " ")}</span>
        <span>{value} <span style={{ color: "#94a3b8" }}>({Math.round(weight * 100)}%)</span></span>
      </div>
      <div className="score-bar-bg">
        <div className="score-bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ResearcherDashboard() {
  const score = useApi(() => api.score.me(), []);
  const recs = useApi(() => api.recommendations.list(5), []);
  const pubs = useApi(() => api.trends.pubsPerYear(), []);
  const patents = useApi(() => api.patents.volumeByYear(), []);

  // The score call 404s when there is no profile yet. That is a call to
  // action, not an error.
  if (score.error && score.error.status === 404) {
    return (
      <div className="card">
        <h1 className="page-title">Welcome</h1>
        <p className="page-sub">
          Create a research profile to unlock your innovation score and
          personalised funding recommendations.
        </p>
        <Link className="btn btn-primary" to="/profile">Create profile</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Your research intelligence at a glance.</p>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <StatCard
          label="Innovation Score"
          value={score.loading ? "..." : score.data?.total_score ?? "-"}
          sub={score.data?.interpretation?.split(" - ")[0]}
        />
        <StatCard
          label="Funding Matches (top 5)"
          value={recs.loading ? "..." : recs.data?.length ?? 0}
          sub="open opportunities"
        />
        <StatCard
          label="Corpus"
          value={score.data ? score.data.corpus.patents.toLocaleString() : "..."}
          sub="patents analysed"
        />
      </div>

      <div className="card">
        <div className="card-title">Innovation Score Breakdown</div>
        {score.loading ? <Spinner /> :
         score.error ? <ErrorBox error={score.error} onRetry={score.reload} /> :
         (
          <>
            {Object.entries(score.data.components).map(([k, v]) => (
              <ScoreBar key={k} label={k} value={v.value} weight={v.weight} />
            ))}
            <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 12 }}>
              {score.data.interpretation}
            </p>
          </>
         )}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Publications per Year</div>
          {pubs.loading ? <Spinner /> :
           pubs.error ? <ErrorBox error={pubs.error} /> :
           <LineChartCard data={pubs.data} xKey="year" yKey="count" />}
        </div>
        <div className="card">
          <div className="card-title">Patent Volume per Year</div>
          {patents.loading ? <Spinner /> :
           patents.error ? <ErrorBox error={patents.error} /> :
           <BarChartCard data={patents.data} xKey="year" yKey="count" />}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Top Funding Matches</div>
        {recs.loading ? <Spinner /> :
         recs.error ? <ErrorBox error={recs.error} onRetry={recs.reload} /> :
         recs.data.length === 0 ? <p style={{ color: "#94a3b8" }}>No matches yet.</p> :
         recs.data.map((r, i) => (
          <div className="rec-item" key={i}>
            <div className="rec-header">
              <div>
                <div className="rec-title">{r.opportunity.title}</div>
                <div className="rec-agency">{r.opportunity.agency}</div>
              </div>
              <div className="rec-score">{(r.score * 1000).toFixed(1)}</div>
            </div>
            {r.matched_terms?.length > 0 && (
              <div className="rec-terms">
                {r.matched_terms.map((t) => <span className="term-chip" key={t}>{t}</span>)}
              </div>
            )}
          </div>
         ))}
        <Link className="btn" to="/recommendations" style={{ marginTop: 8 }}>View all &rarr;</Link>
      </div>
    </div>
  );
}
