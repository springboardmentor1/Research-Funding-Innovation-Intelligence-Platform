import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import ResearchDashboard from "./components/ResearchDashboard";
import ResearchExplorer from "./pages/ResearchExplorer";
import FundingPage from "./pages/FundingPage";
import PatentExplorer from "./pages/PatentExplorer";
import Assistant from "./pages/Assistant";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Bookmarks from "./pages/Bookmarks";

import "./App.css";

function NotFound() {
  return (
    <div className="professional-404">
      <div className="error-box">
        <div className="error-number">404</div>

        <h1>Page Not Found</h1>

        <p>
          The page you are looking for does not exist or may have been moved.
        </p>

        <a href="/" className="error-button">
          Return to Platform
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      {/* =====================================================
          GLOBAL PROFESSIONAL THEME
      ====================================================== */}

      <style>{`

        /* ================================
           CORE
        ================================= */

        html,
        body,
        #root {
          margin: 0 !important;
          padding: 0 !important;
          min-height: 100% !important;
          width: 100% !important;

          background: #070b12 !important;
          color: #e5e7eb !important;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif !important;
        }

        body {
          min-height: 100vh !important;
          background:
            radial-gradient(
              circle at 15% 0%,
              rgba(20, 184, 166, 0.055),
              transparent 28%
            ),
            radial-gradient(
              circle at 85% 10%,
              rgba(59, 130, 246, 0.04),
              transparent 25%
            ),
            #070b12 !important;
        }

        #root {
          background: transparent !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          border: none !important;
          text-align: left !important;
        }

        * {
          box-sizing: border-box !important;
        }


        /* ================================
           MAIN APP
        ================================= */

        .app {
          min-height: 100vh !important;
          width: 100% !important;

          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(20, 184, 166, 0.06),
              transparent 32%
            ),
            #070b12 !important;
        }


        /* ================================
           NAVBAR
        ================================= */

        .navbar {
          width: 100% !important;
          height: 70px !important;

          display: flex !important;
          align-items: center !important;

          background: rgba(7, 11, 18, 0.94) !important;

          border-bottom: 1px solid #1d2733 !important;

          padding: 0 42px !important;

          position: sticky !important;
          top: 0 !important;
          z-index: 9999 !important;

          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;

          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.25) !important;
        }


        .navbar a {
          color: #8995a5 !important;

          text-decoration: none !important;

          font-size: 14px !important;
          font-weight: 500 !important;

          transition:
            color 0.2s ease,
            background 0.2s ease !important;
        }


        .navbar a:hover {
          color: #f1f5f9 !important;
        }


        .navbar a.active {
          color: #2dd4bf !important;
        }


        /* navbar brand */

        .navbar-brand,
        .brand,
        .logo {
          color: #f1f5f9 !important;

          font-weight: 650 !important;
          letter-spacing: -0.02em !important;
        }


        /* ================================
           HOME
        ================================= */

        .home {
          min-height: calc(100vh - 70px) !important;

          background:
            radial-gradient(
              circle at 20% 0%,
              rgba(20, 184, 166, 0.075),
              transparent 30%
            ),
            radial-gradient(
              circle at 85% 15%,
              rgba(30, 64, 175, 0.05),
              transparent 30%
            ),
            #070b12 !important;
        }


        /* ================================
           HERO
        ================================= */

        .hero {
          background: transparent !important;

          max-width: 1280px !important;

          margin: 0 auto !important;

          padding: 100px 55px 90px !important;
        }


        .hero h1 {
          color: #f8fafc !important;

          font-size: clamp(
            42px,
            5vw,
            66px
          ) !important;

          line-height: 1.06 !important;

          font-weight: 650 !important;

          letter-spacing: -0.045em !important;

          text-shadow: none !important;
        }


        .hero h1 span {
          color: #2dd4bf !important;
        }


        .hero p {
          color: #8d9aaa !important;

          font-size: 16px !important;

          line-height: 1.8 !important;

          max-width: 650px !important;
        }


        /* ================================
           REMOVE OLD BLUE GRADIENTS
        ================================= */

        .hero,
        .hero-section,
        .hero-container,
        .hero-content,
        .hero-right {
          background-image: none !important;
        }


        /* Anything that was using bright
           blue/purple backgrounds */

        .hero > div,
        .hero-section > div {
          box-shadow: none !important;
        }


        /* ================================
           FEATURE CARDS
        ================================= */

        .feature-card {
          background:
            linear-gradient(
              145deg,
              #111923,
              #0c121a
            ) !important;

          border: 1px solid #202c38 !important;

          border-radius: 10px !important;

          box-shadow:
            0 15px 35px rgba(0, 0, 0, 0.2) !important;

          color: #e5e7eb !important;

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease !important;
        }


        .feature-card:hover {
          transform: translateY(-3px) !important;

          background:
            linear-gradient(
              145deg,
              #14202a,
              #0e151e
            ) !important;

          border-color: #2b4b50 !important;
        }


        .feature-card h3 {
          color: #e5e7eb !important;
        }


        .feature-card p {
          color: #718096 !important;
        }


        .feature-card .icon {
          background: rgba(
            20,
            184,
            166,
            0.08
          ) !important;

          color: #2dd4bf !important;

          border: 1px solid rgba(
            45,
            212,
            191,
            0.12
          ) !important;
        }


        /* ================================
           BUTTONS
        ================================= */

        button {
          border-radius: 7px !important;

          background: #0d9488 !important;

          color: #ffffff !important;

          border: 1px solid #14b8a6 !important;

          font-weight: 600 !important;

          box-shadow: none !important;
        }


        button:hover {
          background: #0f766e !important;

          border-color: #2dd4bf !important;

          box-shadow:
            0 5px 20px
            rgba(20, 184, 166, 0.16) !important;
        }


        /* ================================
           INPUTS
        ================================= */

        input,
        textarea,
        select {
          background: #0c1219 !important;

          color: #e5e7eb !important;

          border: 1px solid #273340 !important;

          border-radius: 7px !important;

          box-shadow: none !important;
        }


        input:focus,
        textarea:focus,
        select:focus {
          border-color: #2dd4bf !important;

          outline: none !important;

          box-shadow:
            0 0 0 3px
            rgba(45, 212, 191, 0.08) !important;
        }


        input::placeholder,
        textarea::placeholder {
          color: #536174 !important;
        }


        /* ================================
           DASHBOARD
        ================================= */

        .dashboard {
          min-height: 100vh !important;

          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(20, 184, 166, 0.045),
              transparent 30%
            ),
            #070b12 !important;

          color: #e5e7eb !important;

          padding: 42px 45px 80px !important;
        }


        .dashboard-header h1 {
          color: #f1f5f9 !important;
        }


        .dashboard-header p {
          color: #7f8c9e !important;
        }


        /* ================================
           STAT CARDS
        ================================= */

        .summary-cards .stat-card,
        .stat-card {
          background:
            linear-gradient(
              145deg,
              #111821,
              #0d131b
            ) !important;

          border: 1px solid #202b37 !important;

          border-radius: 9px !important;

          color: #e5e7eb !important;

          box-shadow:
            0 10px 30px
            rgba(0, 0, 0, 0.18) !important;
        }


        .stat-card:hover {
          border-color: #2b4046 !important;
        }


        .stat-card h3,
        .stat-card .title {
          color: #7d8999 !important;
        }


        .stat-card .value {
          color: #f1f5f9 !important;
        }


        .stat-card .subtitle {
          color: #5f6c7d !important;
        }


        /* ================================
           CHART CONTAINERS
        ================================= */

        .charts-grid > *,
        .chart-card,
        .chart-container {
          background:
            #0d131b !important;

          border: 1px solid #202a35 !important;

          border-radius: 9px !important;

          box-shadow:
            0 10px 30px
            rgba(0, 0, 0, 0.18) !important;
        }


        /* ================================
           FUNDING SECTION
        ================================= */

        .dashboard-section {
          background:
            linear-gradient(
              145deg,
              #0f161f,
              #0b1118
            ) !important;

          border: 1px solid #202b37 !important;

          border-radius: 10px !important;

          color: #e5e7eb !important;
        }


        .dashboard-section h2 {
          color: #e5e7eb !important;
        }


        /* ================================
           RECOMMENDATION CARDS
        ================================= */

        .recommendation-card {
          background:
            #101720 !important;

          border: 1px solid #222e3a !important;

          border-radius: 9px !important;

          color: #e5e7eb !important;
        }


        .recommendation-card:hover {
          border-color: #315052 !important;

          background: #121b23 !important;
        }


        .recommendation-card h3 {
          color: #e2e8f0 !important;
        }


        .recommendation-card p {
          color: #7c8999 !important;
        }


        /* ================================
           HEADINGS
        ================================= */

        h1,
        h2,
        h3,
        h4,
        h5 {
          color: #e5e7eb !important;
        }


        /* ================================
           GENERIC WHITE BACKGROUNDS
        ================================= */

        .card,
        .panel,
        .section,
        .container {
          color: #e5e7eb !important;
        }


        /* ================================
           LINKS
        ================================= */

        a {
          text-decoration: none !important;
        }


        /* ================================
           404
        ================================= */

        .professional-404 {
          min-height: 100vh !important;

          display: flex !important;

          align-items: center !important;
          justify-content: center !important;

          padding: 30px !important;

          background: #070b12 !important;
        }


        .error-box {
          width: 100% !important;

          max-width: 470px !important;

          padding: 50px 40px !important;

          text-align: center !important;

          background:
            linear-gradient(
              145deg,
              #111923,
              #0c1219
            ) !important;

          border: 1px solid #23303d !important;

          border-radius: 12px !important;

          box-shadow:
            0 30px 80px
            rgba(0, 0, 0, 0.45) !important;
        }


        .error-number {
          font-size: 70px !important;

          line-height: 1 !important;

          font-weight: 700 !important;

          color: #2dd4bf !important;

          margin-bottom: 18px !important;
        }


        .error-box h1 {
          color: #f1f5f9 !important;

          font-size: 24px !important;

          margin-bottom: 10px !important;
        }


        .error-box p {
          color: #778496 !important;

          font-size: 14px !important;

          line-height: 1.6 !important;

          margin-bottom: 25px !important;
        }


        .error-button {
          display: inline-flex !important;

          padding: 11px 20px !important;

          background: #0d9488 !important;

          border: 1px solid #14b8a6 !important;

          border-radius: 7px !important;

          color: white !important;

          font-size: 14px !important;

          font-weight: 600 !important;
        }


        /* ================================
           SCROLLBAR
        ================================= */

        ::-webkit-scrollbar {
          width: 7px !important;
          height: 7px !important;
        }


        ::-webkit-scrollbar-track {
          background: #070b12 !important;
        }


        ::-webkit-scrollbar-thumb {
          background: #263440 !important;

          border-radius: 10px !important;
        }


        ::-webkit-scrollbar-thumb:hover {
          background: #34505a !important;
        }


        /* ================================
           MOBILE
        ================================= */

        @media (max-width: 900px) {

          .navbar {
            padding: 0 20px !important;
          }

          .hero {
            padding: 70px 25px !important;
          }

          .dashboard {
            padding: 30px 20px !important;
          }

        }

      `}</style>


      {/* =====================================================
          ROUTES
      ====================================================== */}

      <div className="app">

        <Routes>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/dashboard"
            element={<ResearchDashboard />}
          />

          <Route
            path="/research"
            element={<ResearchExplorer />}
          />

          <Route
            path="/funding"
            element={<FundingPage />}
          />

          <Route
            path="/patents"
            element={<PatentExplorer />}
          />

          <Route
            path="/assistant"
            element={<Assistant />}
          />

          <Route
            path="/bookmarks"
            element={<Bookmarks />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/home"
            element={<Navigate to="/" replace />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

      </div>

    </BrowserRouter>
  );
}

export default App;