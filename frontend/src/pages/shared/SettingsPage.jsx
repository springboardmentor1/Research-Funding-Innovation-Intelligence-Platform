import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaBell, FaSlidersH, FaChevronRight, FaTimes, FaCheck, FaMoon, FaSun, FaDesktop } from 'react-icons/fa';

const NOTIF_PREFS_KEY = 'notif_prefs';
const THEME_KEY = 'theme_pref';

function SecurityModal({ onClose }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [twoFA, setTwoFA] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (form.newPass && form.newPass !== form.confirm) {
      alert('Passwords do not match');
      return;
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#141b2d] border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-white font-bold text-lg">Security & Privacy</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-4">
          {saved ? (
            <div className="text-center py-6">
              <FaCheck size={40} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-bold">Settings Saved!</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm text-slate-400 font-medium mb-3">Change Password</p>
                {['current', 'newPass', 'confirm'].map((field, i) => (
                  <input key={field} type="password"
                    placeholder={['Current Password', 'New Password', 'Confirm New Password'][i]}
                    value={form[field]}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    className="w-full bg-[#1c2438] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none mb-2 transition-colors" />
                ))}
              </div>
              <div className="flex items-center justify-between py-3 border-t border-slate-800">
                <div>
                  <p className="text-sm text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security</p>
                </div>
                <button onClick={() => setTwoFA(!twoFA)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${twoFA ? 'bg-blue-500' : 'bg-slate-700'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${twoFA ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              <button onClick={handleSave} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors">
                Save Security Settings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationPrefsModal({ onClose }) {
  const saved = JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) || '{}');
  const [prefs, setPrefs] = useState({
    funding: saved.funding ?? true,
    patents: saved.patents ?? true,
    research: saved.research ?? true,
    deadlines: saved.deadlines ?? true,
    emailDigest: saved.emailDigest ?? false,
    pushNotifications: saved.pushNotifications ?? true,
  });
  const [isSaved, setIsSaved] = useState(false);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = () => {
    localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
    setIsSaved(true);
    setTimeout(() => { setIsSaved(false); onClose(); }, 1500);
  };

  const items = [
    { key: 'funding', label: 'Funding Opportunities', desc: 'New grants and funding alerts' },
    { key: 'patents', label: 'Patent Alerts', desc: 'Competitor IP and patent filings' },
    { key: 'research', label: 'Research Trends', desc: 'Emerging research and publications' },
    { key: 'deadlines', label: 'Funding Deadlines', desc: 'Application deadline reminders' },
    { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Summary email every Monday' },
    { key: 'pushNotifications', label: 'Push Notifications', desc: 'In-app real-time alerts' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#141b2d] border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-white font-bold text-lg">Notification Preferences</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-3">
          {isSaved ? (
            <div className="text-center py-6">
              <FaCheck size={40} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-bold">Preferences Saved!</p>
            </div>
          ) : (
            <>
              {items.map(item => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <button onClick={() => toggle(item.key)}
                    className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ml-4 ${prefs[item.key] ? 'bg-purple-500' : 'bg-slate-700'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${prefs[item.key] ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
              <button onClick={handleSave} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-colors mt-2">
                Save Preferences
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemPrefsModal({ onClose }) {
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || 'dark');
  const [density, setDensity] = useState('comfortable');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(THEME_KEY, theme);
    setIsSaved(true);
    setTimeout(() => { setIsSaved(false); onClose(); }, 1500);
  };

  const themeOptions = [
    { key: 'dark', label: 'Dark', icon: FaMoon },
    { key: 'light', label: 'Light', icon: FaSun },
    { key: 'system', label: 'System', icon: FaDesktop },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#141b2d] border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-white font-bold text-lg">System Preferences</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><FaTimes /></button>
        </div>
        <div className="p-5 space-y-5">
          {isSaved ? (
            <div className="text-center py-6">
              <FaCheck size={40} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-bold">Preferences Saved!</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm text-slate-400 font-medium mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map(t => {
                    const Icon = t.icon;
                    return (
                      <button key={t.key} onClick={() => setTheme(t.key)}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${theme === t.key ? 'border-pink-500 bg-pink-500/10 text-pink-300' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                        <Icon size={20} />
                        <span className="text-xs font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium mb-3">Dashboard Density</p>
                <div className="grid grid-cols-2 gap-2">
                  {['comfortable', 'compact'].map(d => (
                    <button key={d} onClick={() => setDensity(d)}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all capitalize ${density === d ? 'border-pink-500 bg-pink-500/10 text-pink-300' : 'border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSave} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-colors">
                Save Preferences
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(null);

  const settingsBlocks = [
    {
      title: 'Profile Settings',
      desc: 'Update your personal information and research profile',
      icon: FaUser, color: 'text-blue-400', bg: 'bg-blue-500/10',
      action: () => navigate('/profile')
    },
    {
      title: 'Security & Privacy',
      desc: 'Manage passwords, 2FA and data privacy settings',
      icon: FaLock, color: 'text-emerald-400', bg: 'bg-emerald-500/10',
      action: () => setOpenModal('security')
    },
    {
      title: 'Notification Preferences',
      desc: 'Control which alerts and emails you receive',
      icon: FaBell, color: 'text-purple-400', bg: 'bg-purple-500/10',
      action: () => setOpenModal('notifications')
    },
    {
      title: 'System Preferences',
      desc: 'Customize dashboard layout and theme',
      icon: FaSlidersH, color: 'text-pink-400', bg: 'bg-pink-500/10',
      action: () => setOpenModal('system')
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
        <p className="text-slate-400 text-sm">Manage your account and preferences</p>
      </div>

      <div className="bg-[#1c2438] border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {settingsBlocks.map((block, idx) => (
          <div
            key={idx}
            onClick={block.action}
            className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${block.bg} ${block.color}`}>
                <block.icon size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1 group-hover:text-slate-100 transition-colors">{block.title}</h3>
                <p className="text-sm text-slate-400">{block.desc}</p>
              </div>
            </div>
            <FaChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
          </div>
        ))}
      </div>

      {/* App Version */}
      <div className="text-center text-xs text-slate-600 pt-2">
        ResearchAI Platform v1.0.0 — © 2026 Infosys SpringBoard
      </div>

      {openModal === 'security' && <SecurityModal onClose={() => setOpenModal(null)} />}
      {openModal === 'notifications' && <NotificationPrefsModal onClose={() => setOpenModal(null)} />}
      {openModal === 'system' && <SystemPrefsModal onClose={() => setOpenModal(null)} />}
    </div>
  );
}
