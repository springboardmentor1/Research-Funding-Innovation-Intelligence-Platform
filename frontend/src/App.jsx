import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <div className="bg-slate-950 min-h-screen text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
