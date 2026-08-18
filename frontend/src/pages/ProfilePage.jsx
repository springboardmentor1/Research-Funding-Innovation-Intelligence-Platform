import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Building, Sparkles, CheckCircle2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfileState } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [researchDomain, setResearchDomain] = useState(user?.research_domain || '');
  const [keywords, setKeywords] = useState(user?.keywords || '');
  const [researchInterests, setResearchInterests] = useState(user?.research_interests || '');
  const [savedMsg, setSavedMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedMsg(false);
    try {
      const res = await api.put('/profile/', {
        full_name: fullName,
        organization,
        research_domain: researchDomain,
        keywords,
        research_interests: researchInterests
      });
      updateProfileState(res.data);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a2530] flex items-center gap-2">
          <User className="w-6 h-6 text-[#24527a]" />
          Research Profile Management
        </h1>
        <p className="text-xs text-[#576574] mt-1 font-semibold">
          Your profile parameters directly train the AI Grant Recommendation and Patent Similarity engine
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-[#e2ded4] shadow-sm">
        {savedMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Profile updated successfully. AI recommendation embeddings recalculated.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1a2530] mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-[#dcd6c8] rounded-xl px-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a2530] mb-1.5">Organization / University</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-white border border-[#dcd6c8] rounded-xl px-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1a2530] mb-1.5">Primary Research Domain</label>
              <input
                type="text"
                value={researchDomain}
                onChange={(e) => setResearchDomain(e.target.value)}
                className="w-full bg-white border border-[#dcd6c8] rounded-xl px-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a2530] mb-1.5">Keywords (Comma Separated)</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full bg-white border border-[#dcd6c8] rounded-xl px-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a2530] mb-1.5">Detailed Research Abstract / Project Goals</label>
            <textarea
              rows={4}
              value={researchInterests}
              onChange={(e) => setResearchInterests(e.target.value)}
              className="w-full bg-white border border-[#dcd6c8] rounded-xl p-3.5 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#24527a] hover:bg-[#1b3d5c] text-white font-bold text-xs rounded-xl shadow-md shadow-[#24527a]/20 flex items-center gap-2 transition"
          >
            {loading ? 'Saving Profile...' : 'Update Profile & AI Model'}
            <Sparkles className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
