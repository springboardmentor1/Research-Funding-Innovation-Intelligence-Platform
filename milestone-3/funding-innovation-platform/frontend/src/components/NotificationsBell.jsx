import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Loading from "./Loading";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const fetchUnreadCount = useCallback(() => {
    axiosClient
      .get("/notifications/me/unread-count")
      .then(({ data }) => setUnreadCount(data.unread_count))
      .catch(() => {});
  }, []);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    axiosClient
      .get("/notifications/me", { params: { page: 1, page_size: 10 } })
      .then(({ data }) => setNotifications(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await axiosClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch {
      // best-effort UI update; ignore transient failures
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosClient.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // best-effort UI update; ignore transient failures
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border border-white/15 p-2 text-white/80 transition hover:bg-white/10"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-signal-rose px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl2 border border-ink-900/8 bg-white shadow-panel">
          <div className="flex items-center justify-between border-b border-ink-900/8 px-4 py-3">
            <span className="text-sm font-semibold text-ink-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-signal-emeraldDark hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && <Loading className="px-4 py-6 text-center text-sm text-ink-900/40" />}
            {!loading && notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-900/40">You&apos;re all caught up.</p>
            )}
            {!loading &&
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`block w-full border-b border-ink-900/5 px-4 py-3 text-left transition hover:bg-surface-50 ${
                    !n.is_read ? "bg-signal-emerald/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-emerald" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-ink-900/55">{n.message}</p>
                      <p className="mt-1 text-[11px] text-ink-900/35">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))}
          </div>

          <div className="border-t border-ink-900/8 px-4 py-2.5 text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-signal-emeraldDark hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
