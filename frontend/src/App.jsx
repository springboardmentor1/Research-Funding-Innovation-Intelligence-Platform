import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regRole, setRegRole] = useState('Researcher');
  const [isRegistering, setIsRegistering] = useState(false);

  // Profile fields
  const [domains, setDomains] = useState('');
  const [keywords, setKeywords] = useState('');
  
  // Data Lake Integration fields
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchedData, setFetchedData] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDomains(res.data.domains);
      setKeywords(res.data.keywords);
    } catch (err) {
      logout();
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await axios.post(`${API_URL}/register`, { username, password, role: regRole });
        alert('Registration successful! Please login.');
        setIsRegistering(false);
      } else {
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('password', password);
        const res = await axios.post(`${API_URL}/token`, params);
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('role', res.data.role);
        setToken(res.data.access_token);
        setRole(res.data.role);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Authentication failed');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/profile`, { domains, keywords }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const triggerIngestion = async () => {
    if (!searchQuery) return;
    try {
      setMessage('Ingesting dataset trends...');
      const res = await axios.get(`${API_URL}/fetch-datasets?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFetchedData(res.data.data);
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Ingestion failed');
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken('');
    setRole('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
          <h2 className="text-3xl font-extrabold text-center mb-6 text-indigo-400">
            {isRegistering ? 'Create Platform Account' : 'Innovation Dashboard Portal'}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-indigo-500" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-indigo-500" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium mb-1">Account System Role</label>
                <select className="w-full p-2.5 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none" value={regRole} onChange={e => setRegRole(e.target.value)}>
                  <option>Researcher</option>
                  <option>Startup Founder</option>
                  <option>Innovation Manager</option>
                  <option>Admin</option>
                </select>
              </div>
            )}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded font-bold transition duration-200">
              {isRegistering ? 'Register' : 'Sign In'}
            </button>
          </form>
          <p className="text-sm text-center mt-4 text-gray-400">
            {isRegistering ? 'Already have an account?' : 'Need a platform account?'} &nbsp;
            <button className="text-indigo-400 underline" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Login directly' : 'Register here'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black text-indigo-400 tracking-wider">INNOVATION INTELLIGENCE ENGINE</h1>
        <div className="flex items-center space-x-4">
          <span className="bg-indigo-900/50 border border-indigo-700 text-indigo-300 text-xs px-3 py-1 rounded-full font-semibold uppercase">{role} Dashboard</span>
          <button onClick={logout} className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 px-3 py-1.5 rounded text-sm transition font-medium">Log out</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Setup Module: Profile Metadata Management */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4 text-indigo-300 border-b border-gray-800 pb-2">1. Research Profile Management</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Research Domains (Comma Separated)</label>
              <input type="text" className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white" value={domains} onChange={e => setDomains(e.target.value)} placeholder="e.g. Embedded Systems, Deep Learning, Renewable Tech" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Keywords / Target Interests</label>
              <textarea className="w-full p-2.5 rounded bg-gray-800 border border-gray-700 text-white h-24" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. Kinetic Energy Harvesting, OpenAlex metadata optimization"></textarea>
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded.5 font-bold text-sm transition">
              Save Infrastructure Profile
            </button>
          </form>
        </section>

        {/* Core Setup Module: Live OpenAlex Dataset Integration */}
        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-4 text-indigo-300 border-b border-gray-800 pb-2">2. Dataset Integration & Ingestion Pipeline</h2>
            <p className="text-sm text-gray-400 mb-4">Query external frameworks live (OpenAlex API & patent landscape engines) and bridge them straight down into your MongoDB Data lake layer.</p>
            <div className="flex space-x-2 mb-4">
              <input type="text" className="flex-grow p-2.5 rounded bg-gray-800 border border-gray-700 text-white" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Enter technology domain query..." />
              <button onClick={triggerIngestion} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-bold text-sm transition">Fetch & Sync</button>
            </div>
            {message && <div className="p-3 bg-gray-800 text-amber-400 border border-amber-900/40 text-xs rounded mb-4 font-mono">{message}</div>}
          </div>

          <div className="flex-grow overflow-y-auto max-h-48 bg-gray-950 p-3 rounded border border-gray-800">
            <span className="text-xs text-gray-500 font-bold tracking-wider uppercase block mb-2">Ingested Documents Batch Logs:</span>
            {fetchedData.length === 0 ? (
              <span className="text-xs text-gray-600 italic">No historical synchronization runs triggered yet today.</span>
            ) : (
              <ul className="space-y-2">
                {fetchedData.map((data, idx) => (
                  <li key={idx} className="text-xs border-b border-gray-900 pb-1">
                    <span className={`inline-block text-[10px] uppercase font-extrabold mr-2 px-1 rounded ${data.type === 'patent' ? 'bg-amber-900/40 text-amber-300' : 'bg-cyan-900/40 text-cyan-300'}`}>{data.type}</span>
                    <span className="text-gray-300 font-medium">{data.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}