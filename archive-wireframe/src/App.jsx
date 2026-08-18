import { BrowserRouter, Routes, Route } from "react-router-dom";

import { SearchProvider } from "./context/SearchContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Publications from "./pages/Publications";
import PublicationDetails from "./pages/PublicationDetails";
import Funding from "./pages/Funding";
import Patents from "./pages/Patents";
import Organizations from "./pages/Organizations";
import Researchers from "./pages/Researchers";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";


function App() {
  return (
    <SearchProvider>

      <BrowserRouter>

        <Routes>

          {/* =====================================================
              PUBLIC ROUTE
          ===================================================== */}

          <Route
            path="/login"
            element={
              <Login />
            }
          />


          {/* =====================================================
              DASHBOARD
          ===================================================== */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              SEARCH
          ===================================================== */}

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              PUBLICATIONS
          ===================================================== */}

          <Route
            path="/publications"
            element={
              <ProtectedRoute>
                <Publications />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              PUBLICATION DETAILS
          ===================================================== */}

          <Route
            path="/publication/:doi"
            element={
              <ProtectedRoute>
                <PublicationDetails />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              FUNDING
          ===================================================== */}

          <Route
            path="/funding"
            element={
              <ProtectedRoute>
                <Funding />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              PATENTS
          ===================================================== */}

          <Route
            path="/patents"
            element={
              <ProtectedRoute>
                <Patents />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              ORGANIZATIONS
          ===================================================== */}

          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <Organizations />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              RESEARCHERS
          ===================================================== */}

          <Route
            path="/researchers"
            element={
              <ProtectedRoute>
                <Researchers />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              REPORTS
          ===================================================== */}

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              PROFILE
          ===================================================== */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />


        </Routes>

      </BrowserRouter>

    </SearchProvider>
  );
}


export default App;