import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, Mail, Lock, Building, Tag, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Researcher');
  const [organization, setOrganization] = useState('');
  const [researchDomain, setResearchDomain] = useState('Computer Vision');
  const [keywords, setKeywords] = useState('');
  const [researchInterests, setResearchInterests] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        organization,
        research_domain: researchDomain,
        keywords,
        research_interests: researchInterests
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ece2] flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      <div className="w-full max-w-xl z-10">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#24527a] to-[#247291] mb-3 shadow-md shadow-[#24527a]/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1a2530]">Create Account</h1>
          <p className="text-xs text-[#576574] mt-1 font-semibold">Join the AI Innovation & Funding Intelligence Platform</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#e2ded4]">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a2530] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Doe"
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a2530] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@university.edu"
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a2530] mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a2530] mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a2530] mb-1">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
                >
                  <option value="Researcher">Researcher</option>
                  <option value="Startup Founder">Startup Founder</option>
                  <option value="Innovation Manager">Innovation Manager</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a2530] mb-1">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="MIT / Stanford / BioTech Inc."
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a2530] mb-1">Primary Research Domain</label>
                <input
                  type="text"
                  value={researchDomain}
                  onChange={(e) => setResearchDomain(e.target.value)}
                  placeholder="Computer Vision, Quantum, Energy"
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a2530] mb-1">Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Deep Learning, MRI, Oncology"
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a2530] mb-1">Research Interests & Summary</label>
              <textarea
                rows={2}
                value={researchInterests}
                onChange={(e) => setResearchInterests(e.target.value)}
                placeholder="Briefly describe your current research focus or startup mission..."
                className="w-full bg-white border border-[#dcd6c8] rounded-xl px-3.5 py-2 text-xs text-[#1a2530] font-semibold focus:border-[#24527a] focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#24527a] hover:bg-[#1b3d5c] text-white rounded-xl text-xs font-bold shadow-md shadow-[#24527a]/30 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-xs text-[#576574] font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-[#24527a] font-extrabold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
