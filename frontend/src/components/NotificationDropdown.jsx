import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import api from '../services/api';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 rounded-xl text-[#576574] hover:text-[#1a2530] hover:bg-[#f7f4ed] transition"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#24527a] text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-[#e2ded4] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#e2ded4] bg-[#f7f4ed]">
            <h4 className="font-bold text-xs text-[#1a2530]">Notifications</h4>
            <span className="text-[11px] text-[#24527a] font-semibold">{unreadCount} unread</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#e2ded4]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`p-3 text-xs cursor-pointer transition ${n.is_read ? 'bg-white opacity-60' : 'bg-[#f7f4ed] hover:bg-[#ebd9cb]/30'}`}
                >
                  <div className="flex items-start gap-2.5">
                    {n.type === 'funding' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                    {n.type === 'research' && <FileText className="w-4 h-4 text-[#24527a] shrink-0 mt-0.5" />}
                    {n.type === 'patent' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-bold text-[#1a2530]">{n.title}</p>
                      <p className="text-[#576574] mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
