import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Funding from "../pages/Funding/Funding";
import Patent from "../pages/Patent/Patent";
import Reports from "../pages/Reports/Reports";
import Profile from "../pages/Profile/Profile";
import ResearchIntelligence from "../pages/ResearchIntelligence/ResearchIntelligence";
import Publications from "../pages/Publications/Publications";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/funding" element={<Funding />} />
        <Route path="/patent" element={<Patent />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/research-intelligence" element={<ResearchIntelligence />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;