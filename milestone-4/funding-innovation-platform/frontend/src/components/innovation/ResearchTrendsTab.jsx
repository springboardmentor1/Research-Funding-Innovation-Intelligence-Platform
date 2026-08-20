import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Card from "../Card";
import EmptyState from "../EmptyState";
import Loading from "../Loading";
import MiniBarChart from "../MiniBarChart";

function PublicationTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyState message="No dated publications yet." className="py-6 text-center text-sm text-ink-900/40" />;
  }
  const max = Math.max(...data.map((d) => d.publication_count), 1);
  return (
    <div className="flex items-end gap-3 overflow-x-auto pb-2">
      {data.map((point) => (
        <div
          key={point.year}
          className="flex flex-col items-center gap-1"
          title={`${point.year}: ${point.publication_count} publications, ${point.total_citations} citations`}
        >
          <div
            className="w-8 rounded-t bg-signal-emerald"
            style={{ height: `${Math.max((point.publication_count / max) * 100, 4)}px` }}
          />
          <span className="text-[11px] text-ink-900/50">{point.year}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold text-ink-900">{value}</p>
    </Card>
  );
}

export default function ResearchTrendsTab() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/research-trends/overview")
      .then(({ data }) => setOverview(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading message="Loading research trends…" />;
  if (!overview) return null;

  const { publication_trend, emerging_topics, research_hotspots, citation_analytics, top_cited_publications } = overview;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Publications" value={citation_analytics.total_publications} />
        <StatCard label="Total Citations" value={citation_analytics.total_citations} />
        <StatCard label="Avg Citations" value={citation_analytics.average_citations} />
        <StatCard label="Max Citations" value={citation_analytics.max_citations} />
      </div>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Publication trend</h3>
        <PublicationTrendChart data={publication_trend} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Emerging topics</h3>
          <p className="mb-3 text-xs text-ink-900/50">
            Research domains/keywords with the fastest recent publication growth.
          </p>
          <MiniBarChart
            data={emerging_topics.map((t) => ({ label: t.topic, count: t.recent_count }))}
            labelKey="label"
            valueKey="count"
            color="bg-signal-amber"
          />
        </Card>
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Research hotspots</h3>
          <p className="mb-3 text-xs text-ink-900/50">Domains ranked by current publication activity.</p>
          <MiniBarChart
            data={research_hotspots.map((h) => ({ label: h.domain, count: h.recent_publication_count }))}
            labelKey="label"
            valueKey="count"
            color="bg-ink-900"
          />
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Top cited publications</h3>
        {top_cited_publications.length === 0 ? (
          <EmptyState message="No cited publications yet." className="py-6 text-center text-sm text-ink-900/40" />
        ) : (
          <div className="divide-y divide-ink-900/8">
            {top_cited_publications.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink-900">{p.title}</p>
                  <p className="text-xs text-ink-900/50">
                    {p.journal || "—"} {p.publication_date ? `· ${p.publication_date}` : ""}
                  </p>
                </div>
                <span className="font-mono text-sm font-semibold text-signal-emeraldDark">{p.citation_count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
