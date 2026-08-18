import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoEmail === 'admin@platform.org' ? 'admin123' : 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0ece2] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#24527a]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#24527a] to-[#247291] shadow-lg shadow-[#24527a]/20 mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a2530]">
            AI Research Funding
          </h1>
          <p className="text-xs text-[#576574] mt-1.5 font-semibold">& Innovation Intelligence Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#e2ded4]">
          <h2 className="text-lg font-extrabold text-[#1a2530] mb-1">Sign in to your account</h2>
          <p className="text-xs text-[#576574] mb-6">Enter your credentials to access your personalized dashboard</p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
              {error}
            </div>
          )}

          {forgotMsg && (
            <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#24527a] text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#24527a] shrink-0" />
              Password reset link has been dispatched to your email address.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1a2530] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#576574] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a] focus:ring-2 focus:ring-[#24527a]/20 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-[#1a2530]">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(true)}
                  className="text-[11px] text-[#24527a] font-bold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#576574] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#dcd6c8] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#1a2530] font-semibold focus:outline-none focus:border-[#24527a] focus:ring-2 focus:ring-[#24527a]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#576574] hover:text-[#1a2530]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#24527a] hover:bg-[#1b3d5c] text-white rounded-xl text-xs font-bold shadow-md shadow-[#24527a]/30 transition flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          {/* Create Account Link */}
          <div className="mt-6 pt-5 border-t border-[#e2ded4] text-center">
            <p className="text-xs text-[#576574] font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#24527a] font-extrabold hover:underline ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Demo Selector */}
        <div className="mt-6 bg-white p-4 rounded-2xl border border-[#e2ded4] shadow-sm">
          <p className="text-[10px] font-extrabold text-[#576574] uppercase tracking-wider mb-2.5 text-center">
            ⚡ One-Click Demo Quick Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('researcher@platform.org')}
              className="p-2.5 bg-[#f8f6f0] hover:bg-[#f0ece2] border border-[#e5e0d4] rounded-xl text-[11px] font-bold text-[#1a2530] text-left transition"
            >
              🔬 Researcher Persona
            </button>
            <button
              onClick={() => handleDemoLogin('founder@platform.org')}
              className="p-2.5 bg-[#f8f6f0] hover:bg-[#f0ece2] border border-[#e5e0d4] rounded-xl text-[11px] font-bold text-[#1a2530] text-left transition"
            >
              🚀 Startup Founder
            </button>
            <button
              onClick={() => handleDemoLogin('manager@platform.org')}
              className="p-2.5 bg-[#f8f6f0] hover:bg-[#f0ece2] border border-[#e5e0d4] rounded-xl text-[11px] font-bold text-[#1a2530] text-left transition"
            >
              📈 Innovation Manager
            </button>
            <button
              onClick={() => handleDemoLogin('admin@platform.org')}
              className="p-2.5 bg-[#f8f6f0] hover:bg-[#f0ece2] border border-[#e5e0d4] rounded-xl text-[11px] font-bold text-[#1a2530] text-left transition"
            >
              🛡️ System Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
