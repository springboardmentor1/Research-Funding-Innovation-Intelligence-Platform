import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Researcher'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-2 text-blue-400">Registration Page</h1>
        <p className="text-slate-400 mb-6">
          Create an account and select your role to personalize your research analytics and match recommendations.
        </p>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input 
              type="text" 
              name="full_name"
              required
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Dr. Sarah Connor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              required
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.email}
              onChange={handleChange}
              placeholder="sarah.connor@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
            <select 
              name="role"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Researcher">Researcher</option>
              <option value="Startup Founder">Startup Founder</option>
              <option value="Innovation Manager">Innovation Manager</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all mt-4"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-slate-400">
          Already have an account? <a href="/login" className="text-blue-400 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
}
