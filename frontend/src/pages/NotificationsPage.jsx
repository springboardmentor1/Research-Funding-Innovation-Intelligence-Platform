import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530] flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#24527a]" />
          Alerts & Notification Feed
        </h1>
        <p className="text-xs text-[#576574] mt-1 font-semibold">
          Automated grant deadline reminders, new publication matches, and patent filings
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#24527a] border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-[#e2ded4] shadow-sm divide-y divide-[#e2ded4]">
          {notifications.map((n) => (
            <div key={n.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#24527a]/15 text-[#24527a] mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1a2530]">{n.title}</h4>
                  <p className="text-xs text-[#576574] mt-0.5 font-medium">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="px-3 py-1 bg-[#f8f6f0] hover:bg-[#24527a] text-[#24527a] hover:text-white text-[11px] font-bold rounded-lg border border-[#e5e0d4] transition shrink-0"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
