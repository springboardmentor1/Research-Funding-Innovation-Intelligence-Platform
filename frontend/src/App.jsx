// The app shell: routing, navbar, and the layout every page sits inside.

import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/common";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";
import Patents from "./pages/Patents";
import Profile from "./pages/Profile";
import Commercialization from "./pages/Commercialization";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  if (!user) return null;   // no navbar on the login page

  const link = (to, label) => (
    <Link className={location.pathname === to ? "nav-link active" : "nav-link"} to={to}>
      {label}
    </Link>
  );

  return (
    <nav className="navbar">
      <div className="nav-brand">RFIIP</div>
      <div className="nav-links">
        {link("/", "Dashboard")}
        {link("/recommendations", "Funding")}
        {link("/patents", "Patents")}
        {link("/commercialization", "Commercialization")}
        {link("/profile", "Profile")}
      </div>
      <div className="nav-user">
        <span>{user.full_name || user.email}</span>
        <span className="role-badge">{user.role}</span>
        <button className="btn btn-sm" onClick={logout}>Log out</button>
      </div>
    </nav>
  );
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="main-content">{children}</main>
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/recommendations" element={
        <ProtectedRoute><Layout><Recommendations /></Layout></ProtectedRoute>
      } />
      <Route path="/patents" element={
        <ProtectedRoute><Layout><Patents /></Layout></ProtectedRoute>
      } />
      <Route path="/commercialization" element={
        <ProtectedRoute><Layout><Commercialization /></Layout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
