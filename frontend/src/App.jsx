import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/layout/Navbar';

function MainLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 antialiased selection:bg-orange-500 selection:text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Global Background Glow Spots for Colorful Glassmorphism */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[20%] w-[35%] h-[35%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {!isAuthPage && <Navbar />}
      <main className="flex-1 overflow-y-auto max-h-screen relative z-10">
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;
