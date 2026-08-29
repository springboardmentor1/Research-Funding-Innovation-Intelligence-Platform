import { Link } from "react-router-dom";
// Startup Founder dashboard (Module 9). Same endpoints as the researcher view,
// arranged for what a founder cares about: funding, tech opportunities, patent
// landscape, and commercialization pathways.

import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { Spinner, ErrorBox, StatCard } from "../components/common";
import { BarChartCard } from "../components/charts";

export default function StartupDashboard() {
  const recs = useApi(() => api.recommendations.list(5), []);
  const commercial = useApi(() => api.commercialization.me(), []);
  const patents = useApi(() => api.patents.volumeByYear(), []);

  if (recs.error?.status === 404 || commercial.error?.status === 404) {
    return (
      <div className="card">
        <h1 className="page-title">Startup Dashboard</h1>
        <p className="page-sub">Create a research profile to unlock funding and commercialization insights.</p>
        <Link className="btn btn-primary" to="/profile">Create profile</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Startup Dashboard</h1>
      <p className="page-sub">Funding, technology, and commercialization at a glance.</p>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <StatCard label="Funding Matches" value={recs.loading ? "..." : recs.data?.length ?? 0} sub="top opportunities" />
        <StatCard label="Innovation Score" value={commercial.loading ? "..." : commercial.data?.innovation_score ?? "-"} />
        <StatCard label="Pathways" value={commercial.loading ? "..." : commercial.data?.pathways?.length ?? 0} sub="commercialization routes" />
      </div>

      <div className="card">
        <div className="card-title">Top Funding Opportunities</div>
        {recs.loading ? <Spinner /> :
         recs.error ? <ErrorBox error={recs.error} onRetry={recs.reload} /> :
         recs.data.map((r, i) => (
          <div className="rec-item" key={i}>
            <div className="rec-header">
              <div>
                <div className="rec-title">{r.opportunity.title}</div>
                <div className="rec-agency">{r.opportunity.agency}</div>
              </div>
              {r.opportunity.award_ceiling && (
                <div className="rec-score">${(Number(r.opportunity.award_ceiling)/1000).toFixed(0)}k</div>
              )}
            </div>
          </div>
         ))}
        <Link className="btn" to="/recommendations" style={{ marginTop: 8 }}>All recommendations &rarr;</Link>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Commercialization Pathways</div>
          {commercial.loading ? <Spinner /> :
           commercial.error ? <ErrorBox error={commercial.error} /> :
           commercial.data.pathways.map((p, i) => (
            <div className="pathway" key={i}>
              <div className="pathway-head">
                <span className="pathway-name">{p.pathway}</span>
                {p.confidence !== "n/a" && (
                  <span className={`confidence-badge confidence-${p.confidence}`}>{p.confidence}</span>
                )}
              </div>
            </div>
           ))}
          <Link className="btn" to="/commercialization" style={{ marginTop: 8 }}>Details &rarr;</Link>
        </div>
        <div className="card">
          <div className="card-title">Patent Activity Trend</div>
          {patents.loading ? <Spinner /> :
           patents.error ? <ErrorBox error={patents.error} /> :
           <BarChartCard data={patents.data} xKey="year" yKey="count" />}
        </div>
      </div>
    </div>
  );
}
