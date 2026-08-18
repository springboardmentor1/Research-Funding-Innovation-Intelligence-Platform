import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Pagination from "../components/Pagination";

function formatDate(dateString) {
  return new Date(dateString).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Notifications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    axiosClient
      .get("/notifications/me", { params: { unread_only: unreadOnly, page, page_size: 15 } })
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [unreadOnly, page]);

  const handleMarkRead = async (id) => {
    await axiosClient.patch(`/notifications/${id}/read`);
    load();
  };

  const handleMarkAllRead = async () => {
    await axiosClient.patch("/notifications/read-all");
    load();
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-signal-emeraldDark">Notifications</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">Your notifications</h1>
          </div>
          <button onClick={handleMarkAllRead} className="btn-secondary">
            Mark all read
          </button>
        </div>

        <label className="mb-4 flex items-center gap-2 text-sm text-ink-900/70">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
            className="h-4 w-4 rounded border-ink-900/20 text-signal-emerald focus:ring-signal-emerald/30"
          />
          Show unread only
        </label>

        <div className="card-panel divide-y divide-ink-900/5 p-0">
          {loading && <p className="px-6 py-10 text-center text-sm text-ink-900/40">Loading…</p>}
          {!loading && data?.items.length === 0 && (
            <p className="px-6 py-10 text-center text-sm text-ink-900/40">No notifications to show.</p>
          )}
          {!loading &&
            data?.items.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 px-6 py-4 ${!n.is_read ? "bg-signal-emerald/5" : ""}`}>
                {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-signal-emerald" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                  <p className="mt-0.5 text-sm text-ink-900/60">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-900/35">{formatDate(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 text-xs font-medium text-signal-emeraldDark hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
        </div>

        {data && <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />}
      </main>
    </div>
  );
}
