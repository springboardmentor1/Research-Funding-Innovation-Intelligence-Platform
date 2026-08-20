import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Card from "../Card";
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

const humanize = (s) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function ExecutiveSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/executive-dashboard/summary")
      .then(({ data }) => setSummary(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading message="Loading executive summary…" />;
  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={summary.total_users} />
        <StatCard label="Funding Opportunities" value={summary.total_opportunities} />
        <StatCard label="Applications" value={summary.total_applications} />
        <StatCard label="Patents Tracked" value={summary.total_patents_tracked} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Technology maturity</h3>
          <MiniBarChart
            data={toChartData(summary.technology_maturity_counts, humanize)}
            labelKey="label"
            valueKey="count"
            color="bg-signal-amber"
          />
        </Card>
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Commercialization by type</h3>
          <MiniBarChart
            data={toChartData(summary.commercialization_by_type, humanize)}
            labelKey="label"
            valueKey="count"
            color="bg-signal-emerald"
          />
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Innovation score leaderboard</h3>
        {summary.innovation_leaderboard_top5.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-900/40">No innovation scores computed yet.</p>
        ) : (
          <div className="divide-y divide-ink-900/8">
            {summary.innovation_leaderboard_top5.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink-900">{entry.researcher_full_name}</p>
                  <p className="text-xs text-ink-900/50">{entry.organization || "—"}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-signal-emeraldDark">{entry.overall_score}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Publication trend</h3>
        {summary.publication_trend.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-900/40">No dated publications yet.</p>
        ) : (
          <div className="flex items-end gap-3 overflow-x-auto pb-2">
            {summary.publication_trend.map((point) => {
              const max = Math.max(...summary.publication_trend.map((p) => p.publication_count), 1);
              return (
                <div key={point.year} className="flex flex-col items-center gap-1" title={`${point.year}: ${point.publication_count}`}>
                  <div
                    className="w-8 rounded-t bg-ink-900"
                    style={{ height: `${Math.max((point.publication_count / max) * 100, 4)}px` }}
                  />
                  <span className="text-[11px] text-ink-900/50">{point.year}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
