import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Research from "./pages/Research";
import Funding from "./pages/Funding";
import Patents from "./pages/Patents";
import Bookmarks from "./pages/Bookmarks";

function App() {
  return (
    <BrowserRouter>
      {/* Navbar stays visible across all pages */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        
        {/* Navigation pages */}
        <Route path="/research" element={<Research />} />
        <Route path="/funding" element={<Funding />} />
        <Route path="/patents" element={<Patents />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
      </Routes>

      {/* Footer stays visible across all pages */}
      <Footer />
    </BrowserRouter>
  );
}

export default App;