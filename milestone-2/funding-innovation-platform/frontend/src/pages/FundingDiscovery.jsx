import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";
import { OpportunityStatusBadge } from "../components/StatusBadges";
import { useAuth } from "../context/AuthContext";

const SOURCE_TYPE_OPTIONS = [
  { value: "", label: "All sources" },
  { value: "government_grant", label: "Government Grant" },
  { value: "research_council", label: "Research Council" },
  { value: "innovation_fund", label: "Innovation Fund" },
  { value: "startup_accelerator", label: "Startup Accelerator" },
  { value: "venture_program", label: "Venture Program" },
  { value: "international_agency", label: "International Agency" },
  { value: "other", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Newest" },
  { value: "application_deadline", label: "Deadline" },
  { value: "amount_max", label: "Amount" },
  { value: "view_count", label: "Popularity" },
];

function formatAmount(min, max, currency) {
  if (min == null && max == null) return "Amount not specified";
  const fmt = (n) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
  if (min != null && max != null) return `${currency} ${fmt(min)} – ${fmt(max)}`;
  return `${currency} ${fmt(min ?? max)}`;
}

function OpportunityCard({ opportunity, bookmarked, onToggleBookmark }) {
  return (
    <div className="card-panel flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/funding/${opportunity.id}`} className="font-display text-lg font-semibold text-ink-900 hover:text-signal-emeraldDark">
            {opportunity.title}
          </Link>
          <p className="mt-0.5 text-sm text-ink-900/50">{opportunity.organization_name}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggleBookmark(opportunity.id, bookmarked)}
          className={`shrink-0 rounded-lg border p-2 transition ${
            bookmarked
              ? "border-signal-amber bg-signal-amberSoft text-signal-amber"
              : "border-ink-900/10 text-ink-900/30 hover:text-signal-amber"
          }`}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <OpportunityStatusBadge status={opportunity.status} />
        <span className="tag-chip">{opportunity.funding_source_type.replace(/_/g, " ")}</span>
        {opportunity.application_deadline && (
          <span className="tag-chip">Deadline: {opportunity.application_deadline}</span>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-ink-900/60">{opportunity.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {opportunity.research_domains.slice(0, 3).map((d) => (
          <span key={d} className="tag-chip">{d}</span>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-between border-t border-ink-900/5 pt-3">
        <span className="font-mono text-sm text-ink-900/70">
          {formatAmount(opportunity.amount_min, opportunity.amount_max, opportunity.currency)}
        </span>
        <Link to={`/funding/${opportunity.id}`} className="text-sm font-semibold text-signal-emeraldDark hover:underline">
          View details →
        </Link>
      </div>
    </div>
  );
}

export default function FundingDiscovery() {
  const { user } = useAuth();
  const isManager = user?.role === "administrator" || user?.role === "innovation_manager";

  const [filters, setFilters] = useState({
    q: "",
    funding_source_type: "",
    min_amount: "",
    max_amount: "",
    sort_by: "created_at",
    sort_dir: "desc",
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [recommended, setRecommended] = useState([]);

  const loadOpportunities = () => {
    setLoading(true);
    const params = { page, page_size: 12, sort_by: filters.sort_by, sort_dir: filters.sort_dir };
    if (filters.q) params.q = filters.q;
    if (filters.funding_source_type) params.funding_source_type = filters.funding_source_type;
    if (filters.min_amount) params.min_amount = filters.min_amount;
    if (filters.max_amount) params.max_amount = filters.max_amount;

    axiosClient
      .get("/funding-opportunities", { params })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  };

  const loadBookmarks = () => {
    axiosClient
      .get("/bookmarks/me", { params: { page: 1, page_size: 100 } })
      .then(({ data }) => setBookmarkedIds(new Set(data.items.map((b) => b.opportunity_id))))
      .catch(() => {});
  };

  const loadRecommended = () => {
    axiosClient
      .get("/funding-opportunities/recommended/me", { params: { limit: 4 } })
      .then(({ data }) => setRecommended(data))
      .catch(() => setRecommended([]));
  };

  useEffect(loadOpportunities, [page, filters]);
  useEffect(() => {
    loadBookmarks();
    loadRecommended();
  }, []);

  const handleToggleBookmark = async (opportunityId, isBookmarked) => {
    try {
      if (isBookmarked) {
        await axiosClient.delete(`/bookmarks/${opportunityId}`);
      } else {
        await axiosClient.post(`/bookmarks/${opportunityId}`);
      }
      loadBookmarks();
    } catch {
      // non-critical UI action; silently ignore transient failures
    }
  };

  const handleFilterChange = (e) => {
    setPage(1);
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-signal-emeraldDark">Funding Discovery</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Find your next opportunity</h1>
          <p className="mt-1 text-sm text-ink-900/60">
            Search grants, accelerators, and innovation funds{isManager ? " — including your drafts" : ""}.
          </p>
        </div>

        {recommended.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-900/50">
              Recommended for your profile
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((opp) => (
                <Link
                  key={opp.id}
                  to={`/funding/${opp.id}`}
                  className="rounded-xl2 border border-signal-emerald/20 bg-signal-emerald/5 p-4 transition hover:border-signal-emerald/40"
                >
                  <p className="text-sm font-semibold text-ink-900 line-clamp-2">{opp.title}</p>
                  <p className="mt-1 text-xs text-ink-900/50">{opp.organization_name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card-panel mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            name="q"
            className="field-input lg:col-span-2"
            placeholder="Search title, org, description…"
            value={filters.q}
            onChange={handleFilterChange}
          />
          <select name="funding_source_type" className="field-input" value={filters.funding_source_type} onChange={handleFilterChange}>
            {SOURCE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            name="min_amount"
            type="number"
            className="field-input"
            placeholder="Min amount"
            value={filters.min_amount}
            onChange={handleFilterChange}
          />
          <input
            name="max_amount"
            type="number"
            className="field-input"
            placeholder="Max amount"
            value={filters.max_amount}
            onChange={handleFilterChange}
          />
          <select name="sort_by" className="field-input" value={filters.sort_by} onChange={handleFilterChange}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
        </div>

        {loading && <p className="py-10 text-center text-sm text-ink-900/40">Searching…</p>}
        {!loading && data?.items.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-900/40">No funding opportunities match your filters.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {!loading &&
            data?.items.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                bookmarked={bookmarkedIds.has(opp.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
        </div>

        {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}
      </main>
    </div>
  );
}
