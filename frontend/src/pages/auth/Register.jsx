import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { FaBrain, FaUser, FaEnvelope, FaLock, FaUserCheck, FaArrowRight, FaShieldAlt, FaLightbulb, FaFlask, FaBuilding, FaUserCog } from 'react-icons/fa';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Researcher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const roles = [
    { id: 'Researcher', title: 'Researcher', desc: 'Academic literature & citations', icon: FaFlask },
    { id: 'Startup Founder', title: 'Startup Founder', desc: 'Patents & commercialization', icon: FaLightbulb },
    { id: 'Innovation Manager', title: 'Innovation Manager', desc: 'Portfolio & intelligence reports', icon: FaBuilding },
    { id: 'Administrator', title: 'Administrator', desc: 'Platform settings & user access', icon: FaUserCog },
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Register account
      await authService.register(fullName, email, password, role);
      
      // Step 2: Auto-login after registration
      await authService.login(email, password);
      await authService.getMe();
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-white">
      
      {/* Left Side Cover Art Panel */}
      <div className="hidden md:flex relative flex-col justify-between p-12 overflow-hidden bg-slate-950 border-r border-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="/login_cover.jpg" 
            alt="IgniteFunding Register Cover" 
            className="w-full h-full object-cover opacity-60 filter saturate-100 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>
        
        {/* Brand Header overlay */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <FaBrain size={22} />
          </div>
          <span className="text-lg font-black text-white tracking-widest uppercase">IgniteFunding</span>
        </div>

        {/* Narrative overlay */}
        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-white leading-tight">
            Accelerate research, matching, and IP analytics.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Join the platform to discover grants, monitor patents, and leverage AI innovation analytics. Configure your academic standing and search vectors instantly.
          </p>
        </div>

        {/* Footer overlay */}
        <div className="relative z-10 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} IgniteFunding. All rights reserved.
        </div>
      </div>

      {/* Right Side Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full relative z-10 space-y-8">
          
          {/* Header */}
          <div className="text-center md:text-left space-y-3">
            <div className="inline-flex md:hidden items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-amber-500/25 mb-2">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <FaBrain size={26} />
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Create Account</h1>
            <p className="text-sm text-slate-400">
              Set up your profile to access premium research analysis tools, IP landscape pipelines, and grant opportunities.
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                <FaShieldAlt size={16} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <FaUser size={13} />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Sarah Connor"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <FaEnvelope size={13} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.connor@cyberdyne.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <FaLock size={13} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Platform Role Dropdown */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Platform Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm text-slate-200 transition-all outline-none cursor-pointer"
                  required
                >
                  <option value="Researcher" className="bg-slate-950 text-slate-200">Researcher (Academic literature & citations)</option>
                  <option value="Startup Founder" className="bg-slate-950 text-slate-200">Startup Founder (Patents & commercialization)</option>
                  <option value="Innovation Manager" className="bg-slate-950 text-slate-200">Innovation Manager (Portfolio & intelligence reports)</option>
                  <option value="Administrator" className="bg-slate-950 text-slate-200">Administrator (Platform settings & user access)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <FaArrowRight size={13} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-amber-400 font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
