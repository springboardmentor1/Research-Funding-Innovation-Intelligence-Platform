import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";
import { OpportunityStatusBadge } from "../components/StatusBadges";

export default function Bookmarks() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    axiosClient
      .get("/bookmarks/me", { params: { page, page_size: 10 } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleRemove = async (opportunityId) => {
    await axiosClient.delete(`/bookmarks/${opportunityId}`);
    load();
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-wide text-signal-emeraldDark">Saved</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Your bookmarks</h1>
        </div>

        {loading && <p className="py-10 text-center text-sm text-ink-900/40">Loading…</p>}
        {!loading && data?.items.length === 0 && (
          <div className="card-panel text-center">
            <p className="text-sm text-ink-900/50">You haven&apos;t bookmarked anything yet.</p>
            <Link to="/funding" className="btn-primary mt-4 inline-flex">Browse funding opportunities</Link>
          </div>
        )}

        <div className="space-y-3">
          {!loading &&
            data?.items.map((bookmark) => (
              <div key={bookmark.id} className="card-panel flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    {bookmark.opportunity && <OpportunityStatusBadge status={bookmark.opportunity.status} />}
                  </div>
                  <Link
                    to={`/funding/${bookmark.opportunity_id}`}
                    className="font-display text-base font-semibold text-ink-900 hover:text-signal-emeraldDark"
                  >
                    {bookmark.opportunity?.title || "Funding opportunity"}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-900/50">{bookmark.opportunity?.organization_name}</p>
                </div>
                <button
                  onClick={() => handleRemove(bookmark.opportunity_id)}
                  className="shrink-0 text-xs font-medium text-signal-rose hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
        </div>

        {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}
      </main>
    </div>
  );
}
