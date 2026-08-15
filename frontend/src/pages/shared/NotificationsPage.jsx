import React, { useState, useEffect, useCallback } from 'react';
import { FaBolt, FaMicroscope, FaChartLine, FaBell, FaTimes, FaCheck, FaFilter } from 'react-icons/fa';
import notificationService from '../../services/notificationService';

const TYPE_META = {
  funding:  { icon: FaBolt,      bg: 'bg-blue-500',   label: 'Funding'  },
  patent:   { icon: FaMicroscope, bg: 'bg-cyan-500',   label: 'Patent'   },
  research: { icon: FaChartLine,  bg: 'bg-purple-500', label: 'Research' },
  deadline: { icon: FaBell,       bg: 'bg-pink-500',   label: 'Deadline' },
  match:    { icon: FaBolt,       bg: 'bg-emerald-500',label: 'Match'    },
  general:  { icon: FaBell,       bg: 'bg-slate-500',  label: 'General'  },
};

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'funding', label: 'Funding' },
  { key: 'patent', label: 'Patents' },
  { key: 'research', label: 'Research' },
  { key: 'deadline', label: 'Deadlines' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const params = {};
      if (activeFilter !== 'all' && activeFilter !== 'unread') params.notif_type = activeFilter;
      if (activeFilter === 'unread') params.is_read = false;
      const data = await notificationService.getAll(params);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    setLoading(true);
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) { console.error(e); }
    finally { setMarkingAll(false); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-normal bg-blue-500 text-white px-2.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-slate-400 text-sm">Stay updated with funding, patent, and research alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-full px-4 py-2 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <FaCheck size={11} /> {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${activeFilter === f.key ? 'bg-blue-500 text-white' : 'bg-[#1c2438] border border-slate-700 text-slate-400 hover:text-slate-200'}`}
          >
            {f.label}
            {f.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <FaBell size={40} className="mx-auto mb-4 opacity-30" />
          <p>No notifications to show.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => {
            const meta = TYPE_META[notif.notif_type] || TYPE_META.general;
            const Icon = meta.icon;
            return (
              <div
                key={notif.id}
                className={`bg-[#1c2438] border rounded-xl p-4 flex items-start justify-between gap-4 transition-all ${notif.is_read ? 'border-slate-800 opacity-70' : 'border-slate-700 shadow-[0_0_15px_rgba(59,130,246,0.05)]'}`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 mt-0.5 rounded-full ${meta.bg} flex items-center justify-center text-white shadow-lg shrink-0 relative`}>
                    <Icon size={15} />
                    {!notif.is_read && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-400 border-2 border-[#1c2438] rounded-full" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`font-bold text-sm ${notif.is_read ? 'text-slate-400' : 'text-white'}`}>{notif.title}</h3>
                      <span className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded-full">{meta.label}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-snug mb-1">{notif.body}</p>
                    <p className="text-xs text-slate-600">{timeAgo(notif.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-slate-500 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-emerald-500/10"
                      title="Mark as read"
                    >
                      <FaCheck size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-700"
                    title="Dismiss"
                  >
                    <FaTimes size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
