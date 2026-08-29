// Innovation Manager dashboard (Module 9). Portfolio-level view: aggregate
// trends across the whole corpus rather than one profile. Managers care about
// the landscape, not personal recommendations.

import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { Spinner, ErrorBox, StatCard } from "../components/common";
import { LineChartCard, BarChartCard, HBarChartCard, AreaChartCard } from "../components/charts";

export default function ManagerDashboard() {
  const pubs = useApi(() => api.trends.pubsPerYear(), []);
  const patents = useApi(() => api.patents.volumeByYear(), []);
  const topics = useApi(() => api.trends.topTopics(10), []);
  const applicants = useApi(() => api.patents.topApplicants(10), []);
  const oa = useApi(() => api.trends.openAccess(), []);

  const totalPubs = pubs.data?.reduce((s, r) => s + r.count, 0);
  const totalPatents = patents.data?.reduce((s, r) => s + r.count, 0);

  return (
    <div>
      <h1 className="page-title">Innovation Portfolio</h1>
      <p className="page-sub">Landscape-level analytics across the full research and patent corpus.</p>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <StatCard label="Publications" value={totalPubs?.toLocaleString() ?? "..."} sub="in analysis window" />
        <StatCard label="Patents" value={totalPatents?.toLocaleString() ?? "..."} sub="ML domain (G06N)" />
        <StatCard label="Top Topic" value={topics.data?.[0]?.topic ?? "..."} sub="most active research area" small />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Research Output Trend</div>
          {pubs.loading ? <Spinner /> : pubs.error ? <ErrorBox error={pubs.error} /> :
           <LineChartCard data={pubs.data} xKey="year" yKey="count" />}
        </div>
        <div className="card">
          <div className="card-title">Patent Filing Trend</div>
          {patents.loading ? <Spinner /> : patents.error ? <ErrorBox error={patents.error} /> :
           <BarChartCard data={patents.data} xKey="year" yKey="count" />}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Leading Patent Holders</div>
          {applicants.loading ? <Spinner /> : applicants.error ? <ErrorBox error={applicants.error} /> :
           <HBarChartCard data={applicants.data} yKey="applicant" xKey="count" />}
        </div>
        <div className="card">
          <div className="card-title">Open Access Adoption</div>
          {oa.loading ? <Spinner /> : oa.error ? <ErrorBox error={oa.error} /> :
           <AreaChartCard data={oa.data} xKey="year" yKey="oa_percent" />}
        </div>
      </div>
    </div>
  );
}
