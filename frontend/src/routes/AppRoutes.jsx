import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Funding from "../pages/Funding/Funding";
import Patent from "../pages/Patent/Patent";
import Reports from "../pages/Reports/Reports";
import Profile from "../pages/Profile/Profile";

import MainLayout from "../layouts/MainLayout";

function AppRoutes() {
  return (
    <Routes>

      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Protected Layout */}
      <Route element={<MainLayout />}>

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/funding" element={<Funding />} />

        <Route path="/patent" element={<Patent />} />

        <Route path="/reports" element={<Reports />} />

        <Route path="/profile" element={<Profile />} />

      </Route>

    </Routes>
  );
}

export default AppRoutes;