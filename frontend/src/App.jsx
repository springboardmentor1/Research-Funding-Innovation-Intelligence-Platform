import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Researchers from "./pages/Researchers";
import Grants from "./pages/Grants";
import Publications from "./pages/Publications";
import Patents from "./pages/Patents";
import Technology from "./pages/Technology";
import Innovation from "./pages/Innovation";
import Commercialization from "./pages/Commercialization";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/researchers" element={<Researchers />} />
      <Route path="/grants" element={<Grants />} />
      <Route path="/publications" element={<Publications />} />
      <Route path="/patents" element={<Patents />} />
      <Route path="/technology" element={<Technology />} />
      <Route path="/innovation" element={<Innovation />} />
      <Route path="/commercialization" element={<Commercialization />} />
    </Routes>
  );
}

export default App;