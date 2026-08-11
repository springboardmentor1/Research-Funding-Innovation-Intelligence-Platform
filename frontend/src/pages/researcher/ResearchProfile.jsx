import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSlidersH, FaSave, FaCheck, FaInfoCircle, FaFlask, FaBuilding, FaTags, FaUserTie } from 'react-icons/fa';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

export default function ResearchProfile() {
  const [domain, setDomain] = useState('Robotics & AI');
  const [subdomain, setSubdomain] = useState('Autonomous Systems & Control');
  const [keywords, setKeywords] = useState('robotics, neural networks, machine learning');
  const [organization, setOrganization] = useState('Cyberdyne Research Labs');
  const [designation, setDesignation] = useState('Principal Investigator');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    try {
      const response = await axios.get(`${API_BASE_URL}/profile/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.data) {
        setDomain(response.data.research_domain || '');
        setSubdomain(response.data.research_subdomain || '');
        setKeywords(response.data.keywords || '');
        setOrganization(response.data.organization || '');
        setDesignation(response.data.designation || '');
        setHasExistingProfile(true);
      }
    } catch (err) {
      console.log('No existing profile found or unauthenticated:', err.message);
      setHasExistingProfile(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    if (!token) {
      setMessage({ type: 'error', text: 'You must be signed in to save your profile.' });
      setSaving(false);
      return;
    }

    const payload = {
      research_domain: domain,
      research_subdomain: subdomain,
      keywords,
      organization,
      designation,
    };

    try {
      if (hasExistingProfile) {
        await axios.put(`${API_BASE_URL}/profile`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_BASE_URL}/profile`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasExistingProfile(true);
      }
      setMessage({ type: 'success', text: 'Research profile saved successfully! Context updated.' });
    } catch (err) {
      console.error('Error saving profile:', err);
      const detail = err.response?.data?.detail;
      setMessage({
        type: 'error',
        text: typeof detail === 'string' ? detail : 'Failed to save profile. Please ensure backend is active.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-slate-950 min-h-screen text-slate-100 selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <FaSlidersH size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Research Context & Profile</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure your domain parameters, keywords, and institutional affiliations to drive AI funding and patent matching.
          </p>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div
            className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {message.type === 'success' ? <FaCheck size={14} /> : <FaInfoCircle size={14} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Primary Research Domain */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FaFlask className="text-blue-400" /> Primary Research Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. Robotics & Artificial Intelligence"
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
                required
              />
            </div>

            {/* Subdomain */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FaFlask className="text-purple-400" /> Research Subdomain
              </label>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="e.g. Autonomous Hardware Systems"
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
              />
            </div>

            {/* Organization */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FaBuilding className="text-amber-400" /> Institution / Organization
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Cyberdyne Research Labs"
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
              />
            </div>

            {/* Designation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FaUserTie className="text-emerald-400" /> Role Designation
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Principal Investigator"
                className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
              />
            </div>
          </div>

          {/* Research Keywords */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FaTags className="text-indigo-400" /> Research Keywords (Comma Separated)
            </label>
            <textarea
              rows={3}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. neural networks, robotics, autonomous systems, deep learning"
              className="w-full p-4 bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <FaSave size={14} />
                <span>Save Research Profile Context</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
