// Patent landscape analytics. Five charts straight off the /patents endpoints.

import { api } from "../api/client";
import { useApi } from "../lib/useApi";
import { Spinner, ErrorBox } from "../components/common";
import { BarChartCard, HBarChartCard } from "../components/charts";

function ChartCard({ title, state, children }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      {state.loading ? <Spinner /> :
       state.error ? <ErrorBox error={state.error} onRetry={state.reload} /> :
       children(state.data)}
    </div>
  );
}

export default function Patents() {
  const volume = useApi(() => api.patents.volumeByYear(), []);
  const applicants = useApi(() => api.patents.topApplicants(12), []);
  const cpc = useApi(() => api.patents.topCpc(12), []);
  const juris = useApi(() => api.patents.jurisdictions(10), []);

  return (
    <div>
      <h1 className="page-title">Patent Landscape</h1>
      <p className="page-sub">
        Analysis of ~10,000 machine-learning patents (CPC G06N, 2015&ndash;2024).
      </p>

      <ChartCard title="Patent Volume by Year" state={volume}>
        {(data) => <BarChartCard data={data} xKey="year" yKey="count" />}
      </ChartCard>

      <div className="grid grid-2">
        <ChartCard title="Top Applicants" state={applicants}>
          {(data) => <HBarChartCard data={data} yKey="applicant" xKey="count" />}
        </ChartCard>
        <ChartCard title="Top CPC Groups" state={cpc}>
          {(data) => <HBarChartCard data={data} yKey="cpc_group" xKey="count" color="#4f8cff" />}
        </ChartCard>
      </div>

      <ChartCard title="Filing Jurisdictions" state={juris}>
        {(data) => <BarChartCard data={data} xKey="jurisdiction" yKey="count" color="#22d3aa" />}
      </ChartCard>
    </div>
  );
}
