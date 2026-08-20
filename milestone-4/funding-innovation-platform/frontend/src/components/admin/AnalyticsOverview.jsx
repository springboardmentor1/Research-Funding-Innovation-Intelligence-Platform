import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Card from "../Card";
import EmptyState from "../EmptyState";
import Loading from "../Loading";
import MiniBarChart from "../MiniBarChart";

function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold text-ink-900">{value}</p>
    </Card>
  );
}

function toChartData(obj, labelFormatter = (k) => k) {
  return Object.entries(obj || {}).map(([key, count]) => ({ label: labelFormatter(key), count }));
}

export default function AnalyticsOverview() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topDomains, setTopDomains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosClient.get("/admin/analytics/overview"),
      axiosClient.get("/admin/analytics/applications-trend", { params: { days: 30 } }),
      axiosClient.get("/admin/analytics/top-research-domains", { params: { limit: 8 } }),
    ])
      .then(([overviewRes, trendRes, domainsRes]) => {
        setOverview(overviewRes.data);
        setTrend(trendRes.data);
        setTopDomains(domainsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading message="Loading analytics…" />;
  if (!overview) return null;

  const humanize = (s) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={overview.total_users} />
        <StatCard label="Active Users" value={overview.active_users} />
        <StatCard label="Funding Opportunities" value={overview.total_opportunities} />
        <StatCard label="Total Applications" value={overview.total_applications} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Users by role</h3>
          <MiniBarChart data={toChartData(overview.users_by_role, humanize)} labelKey="label" valueKey="count" />
        </Card>
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Opportunities by status</h3>
          <MiniBarChart
            data={toChartData(overview.opportunities_by_status, humanize)}
            labelKey="label"
            valueKey="count"
            color="bg-signal-amber"
          />
        </Card>
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Applications by status</h3>
          <MiniBarChart
            data={toChartData(overview.applications_by_status, humanize)}
            labelKey="label"
            valueKey="count"
            color="bg-signal-emerald"
          />
        </Card>
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Top research domains</h3>
          <MiniBarChart
            data={topDomains.map((d) => ({ label: d.domain, count: d.count }))}
            labelKey="label"
            valueKey="count"
            color="bg-ink-900"
          />
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Applications — last 30 days</h3>
        {trend.length === 0 ? (
          <EmptyState message="No applications submitted in this period." className="py-6 text-center text-sm text-ink-900/40" />
        ) : (
          <div className="flex items-end gap-1 overflow-x-auto pb-2">
            {trend.map((point) => {
              const max = Math.max(...trend.map((p) => p.count), 1);
              return (
                <div key={point.date} className="flex flex-col items-center gap-1" title={`${point.date}: ${point.count}`}>
                  <div
                    className="w-4 rounded-t bg-signal-emerald"
                    style={{ height: `${Math.max((point.count / max) * 80, 3)}px` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
