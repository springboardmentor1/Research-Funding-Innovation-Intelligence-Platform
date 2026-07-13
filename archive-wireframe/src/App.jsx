import { BrowserRouter, Routes, Route } from "react-router-dom";

import { SearchProvider } from "./context/SearchContext";

import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Publications from "./pages/Publications";
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
          <Route path="/search" element={<Search />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/funding" element={<Funding />} />
          <Route path="/patents" element={<Patents />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/researchers" element={<Researchers />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </BrowserRouter>
    </SearchProvider>
  );
}

export default App;