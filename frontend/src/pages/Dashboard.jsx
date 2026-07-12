import { useAuth } from "../context/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Signed in as <span className="text-indigo-400">{user?.email}</span> · {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg px-4 py-2 transition-colors"
          >
            Sign out
          </button>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400 text-sm">
          Milestone 2 content goes here — funding matches, publication feed, etc.
        </div>
      </div>
    </div>
  );
}