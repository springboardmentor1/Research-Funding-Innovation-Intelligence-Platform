import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Card from "../Card";
import EmptyState from "../EmptyState";
import Loading from "../Loading";
import MiniBarChart from "../MiniBarChart";
import Pagination from "../Pagination";

function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyState message="No patent filing data yet." className="py-6 text-center text-sm text-ink-900/40" />;
  }
  const max = Math.max(...data.map((d) => d.patent_count), 1);
  return (
    <div className="flex items-end gap-3 overflow-x-auto pb-2">
      {data.map((point) => (
        <div key={point.year} className="flex flex-col items-center gap-1" title={`${point.year}: ${point.patent_count} patents, ${point.total_citations} citations`}>
          <div className="w-8 rounded-t bg-signal-emerald" style={{ height: `${Math.max((point.patent_count / max) * 100, 4)}px` }} />
          <span className="text-[11px] text-ink-900/50">{point.year}</span>
        </div>
      ))}
    </div>
  );
}

export default function PatentIntelligenceTab() {
  const [filters, setFilters] = useState({ q: "", technology_domain: "", assignee: "" });
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState(null);
  const [trend, setTrend] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [innovationMap, setInnovationMap] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSearch = () => {
    const params = { page, page_size: 8 };
    if (filters.q) params.q = filters.q;
    if (filters.technology_domain) params.technology_domain = filters.technology_domain;
    if (filters.assignee) params.assignee = filters.assignee;
    axiosClient.get("/patent-analysis/search", { params }).then(({ data }) => setSearchResults(data));
  };

  useEffect(loadSearch, [page, filters]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axiosClient.get("/patent-analysis/trend"),
      axiosClient.get("/patent-analysis/clusters", { params: { limit: 8 } }),
      axiosClient.get("/patent-analysis/competitors", { params: { limit: 8 } }),
      axiosClient.get("/patent-analysis/innovation-map"),
    ])
      .then(([trendRes, clustersRes, competitorsRes, mapRes]) => {
        setTrend(trendRes.data);
        setClusters(clustersRes.data);
        setCompetitors(competitorsRes.data);
        setInnovationMap(mapRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (e) => {
    setPage(1);
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Patent filing trend</h3>
        {loading ? <Loading className="text-sm text-ink-900/40" /> : <TrendChart data={trend} />}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Patent clusters</h3>
          {loading ? (
            <Loading className="text-sm text-ink-900/40" />
          ) : clusters.length === 0 ? (
            <EmptyState message="No patents recorded yet." className="py-4 text-center text-sm text-ink-900/40" />
          ) : (
            <div className="space-y-3">
              {clusters.map((c, idx) => (
                <div key={idx} className="rounded-lg border border-ink-900/8 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink-900">
                      {c.classification || "Unclassified"} · {c.technology_domain || "Unspecified domain"}
                    </span>
                    <span className="font-mono text-xs text-ink-900/50">{c.patent_count} patents</span>
                  </div>
                  <p className="mt-1 text-xs text-ink-900/50">{c.sample_titles.join(" · ")}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Competitor analysis</h3>
          {loading ? (
            <Loading className="text-sm text-ink-900/40" />
          ) : (
            <MiniBarChart
              data={competitors.map((c) => ({ label: c.assignee, count: c.patent_count }))}
              labelKey="label"
              valueKey="count"
              color="bg-signal-amber"
            />
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Innovation map</h3>
        {loading ? (
          <Loading className="text-sm text-ink-900/40" />
        ) : innovationMap.length === 0 ? (
          <EmptyState message="No cross-domain patent data yet." className="py-4 text-center text-sm text-ink-900/40" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {innovationMap.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-ink-900/8 px-3 py-2 text-sm">
                <span className="truncate text-ink-900/70">{entry.technology_domain} × {entry.classification}</span>
                <span className="font-mono text-xs text-ink-900/50">{entry.patent_count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Search patents</h3>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <input name="q" className="field-input" placeholder="Search title/assignee/classification…" value={filters.q} onChange={handleFilterChange} />
          <input name="technology_domain" className="field-input" placeholder="Technology domain" value={filters.technology_domain} onChange={handleFilterChange} />
          <input name="assignee" className="field-input" placeholder="Assignee" value={filters.assignee} onChange={handleFilterChange} />
        </div>

        {!searchResults ? (
          <Loading className="text-sm text-ink-900/40" />
        ) : searchResults.items.length === 0 ? (
          <EmptyState message="No patents match your filters." className="py-4 text-center text-sm text-ink-900/40" />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {searchResults.items.map((p) => (
              <div key={p.id} className="py-3">
                <p className="text-sm font-semibold text-ink-900">{p.title}</p>
                <p className="mt-0.5 text-xs text-ink-900/50">
                  {[p.assignee, p.technology_domain, p.filing_date, `${p.citation_count} citations`].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        )}
        {searchResults && <Pagination page={searchResults.page} totalPages={searchResults.total_pages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
