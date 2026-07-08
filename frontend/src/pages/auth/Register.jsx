import React from 'react';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-2 text-blue-400">Registration Page</h1>
        <p className="text-slate-400 mb-6">
          Create an account and select your role to personalize your research analytics and match recommendations.
        </p>
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-sm text-slate-300">
          [Placeholder form: Name, Email, Account Type options, and Register Account button]
        </div>
      </div>
    </div>
  );
}
