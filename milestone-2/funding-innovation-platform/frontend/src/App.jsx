import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import Applications from "./pages/Applications";
import Bookmarks from "./pages/Bookmarks";
import Dashboard from "./pages/Dashboard";
import FundingDiscovery from "./pages/FundingDiscovery";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import OpportunityDetail from "./pages/OpportunityDetail";
import OpportunityEdit from "./pages/OpportunityEdit";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/funding" element={<FundingDiscovery />} />
            <Route path="/funding/:id" element={<OpportunityDetail />} />
            <Route path="/funding/:id/edit" element={<OpportunityEdit />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
