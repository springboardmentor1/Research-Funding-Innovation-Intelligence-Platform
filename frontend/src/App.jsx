import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/layout/Navbar';

function MainLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 antialiased selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
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
