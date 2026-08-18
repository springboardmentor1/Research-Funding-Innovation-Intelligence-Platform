import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Trash2 } from 'lucide-react';
import client from '../api/client';
import toast from 'react-hot-toast';

export default function NotificationPanel() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const fetchAlerts = () => {
    client.get('/alerts')
      .then(res => {
        setAlerts(res.data);
        setUnreadCount(res.data.filter(a => !a.is_read).length);
      })
      .catch(err => console.error('Failed to fetch alerts:', err));
  };

  useEffect(() => {
    fetchAlerts();
    
    // Periodically fetch every minute
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close panel on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = (id) => {
    client.put(`/alerts/${id}/read`)
      .then(() => fetchAlerts())
      .catch(() => toast.error('Failed to mark read'));
  };

  const handleDelete = (id) => {
    client.delete(`/alerts/${id}`)
      .then(() => fetchAlerts())
      .catch(() => toast.error('Failed to delete alert'));
  };

  const triggerSynthetic = () => {
    client.post('/alerts/trigger-synthetic')
      .then(() => {
        toast.success('Generated synthetic alerts!');
        fetchAlerts();
      })
      .catch(() => toast.error('Failed to generate alerts'));
  };

  return (
    <div className="notification-wrapper" ref={panelRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="icon-btn" 
        style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '8px' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: 'white',
            fontSize: '10px', borderRadius: '50%', padding: '2px 6px', fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" style={{
          position: 'absolute', top: '100%', right: 0, width: '320px', background: 'var(--bg-card)',
          border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 50, overflow: 'hidden', marginTop: '10px'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Notifications</h3>
            <button onClick={triggerSynthetic} style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Simulate Alerts
            </button>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No notifications right now.
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
                  background: alert.is_read ? 'transparent' : 'rgba(99,102,241,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)' }}>{alert.type}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{alert.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{alert.message}</div>
                  
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    {!alert.is_read && (
                      <button onClick={() => handleMarkRead(alert.id)} style={{ background: 'transparent', border: 'none', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                        <CheckCircle2 size={14} /> Mark Read
                      </button>
                    )}
                    <button onClick={() => handleDelete(alert.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
