import React from 'react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-2 text-blue-400">Login Page</h1>
        <p className="text-slate-400 mb-6">
          Access the Research Funding & Innovation Intelligence Platform to manage your research, patents, and grants.
        </p>
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-sm text-slate-300">
          [Placeholder form: Username, Password input fields, and Primary Sign In action button]
        </div>
      </div>
    </div>
  );
}
