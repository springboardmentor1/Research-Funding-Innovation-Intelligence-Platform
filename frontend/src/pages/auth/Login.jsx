import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import { FaBrain, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaArrowRight, FaRocket, FaShieldAlt } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      // Fetch profile to verify
      try {
        await authService.getMe();
      } catch (profileErr) {
        console.warn('Profile sync optional warning:', profileErr);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setDemoLoading(true);
    setError('');
    const demoEmail = 'sarah.connor@cyberdyne.org';
    const demoPassword = 'securepassword123';

    try {
      // First try to login directly
      await authService.login(demoEmail, demoPassword);
      await authService.getMe();
      navigate('/dashboard');
    } catch (loginErr) {
      // If user doesn't exist, auto-register first then login
      try {
        await authService.register('Dr. Sarah Connor', demoEmail, demoPassword, 'Researcher');
        await authService.login(demoEmail, demoPassword);
        await authService.getMe();
        navigate('/dashboard');
      } catch (regErr) {
        console.error('Demo registration failed:', regErr);
        // Fallback to trying alternative password
        try {
          await authService.login(demoEmail, 'terminator101password');
          await authService.getMe();
          navigate('/dashboard');
        } catch (finalErr) {
          setError('Demo auto-login failed. Please register a new account below.');
        }
      }
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-white">
      
      {/* Left Side Cover Art Panel */}
      <div className="hidden md:flex relative flex-col justify-between p-12 overflow-hidden bg-slate-950 border-r border-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="/login_cover.jpg" 
            alt="IgniteFunding Login Cover" 
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
            The premium AI-powered platform designed to identify funding portfolios, track conceptual trends, and map patent landscapes with instant intelligence.
          </p>
        </div>

        {/* Footer overlay */}
        <div className="relative z-10 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} IgniteFunding. All rights reserved.
        </div>
      </div>

      {/* Right Side Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background Ambient Glows */}
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
            <h1 className="text-3xl font-black tracking-tight text-white">Welcome Back</h1>
            <p className="text-sm text-slate-400">
              Sign in to access your AI-powered research intelligence, patent analysis, and grant opportunities.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Quick Demo One-Click Access Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-purple-950/60 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <FaRocket size={12} />
                  <span>Instant Demo Access</span>
                </div>
                <p className="text-[11px] text-slate-400">Log in as Dr. Sarah Connor with 1 click</p>
              </div>
              <button
                onClick={handleQuickDemoLogin}
                disabled={demoLoading || loading}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {demoLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Quick Demo</span>
                    <FaArrowRight size={10} />
                  </>
                )}
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full"></div>
              <span className="bg-slate-950 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 absolute">
                Or Sign In Manually
              </span>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
                <FaShieldAlt size={16} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <FaEnvelope size={14} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sarah.connor@cyberdyne.org"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <FaLock size={14} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950/70 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || demoLoading}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FaArrowRight size={13} />
                  </>
                )}
              </button>
            </form>

            {/* Registration Link */}
            <div className="text-center pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-amber-400 font-bold hover:underline">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
