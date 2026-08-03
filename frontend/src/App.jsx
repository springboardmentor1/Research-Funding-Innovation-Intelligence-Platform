import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ResearchDashboard from "./components/ResearchDashboard";
import ResearchExplorer from "./pages/ResearchExplorer";
import FundingPage from "./pages/FundingPage";
import PatentExplorer from "./pages/PatentExplorer";
import Assistant from "./pages/Assistant";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Bookmarks from "./pages/Bookmarks";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1 style={{ fontSize: "4rem", color: "#2563eb" }}>404</h1>
      <h2>Page Not Found</h2>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

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
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;