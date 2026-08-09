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

function App() {
  return (
    <SearchProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />

          <Route
            path="/publications"
            element={
              <ProtectedRoute>
                <Publications />
              </ProtectedRoute>
            }
          />

          {/* NEW Publication Details Page */}

          <Route
            path="/publication/:doi"
            element={
              <ProtectedRoute>
                <PublicationDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/funding"
            element={
              <ProtectedRoute>
                <Funding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patents"
            element={
              <ProtectedRoute>
                <Patents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <Organizations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/researchers"
            element={
              <ProtectedRoute>
                <Researchers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </SearchProvider>
  );
}

export default App;