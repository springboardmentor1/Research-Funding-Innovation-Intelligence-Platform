import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

function MainLayout() {
  return (
    <div>

      <Navbar />

      <div style={{ display: "flex" }}>

        <Sidebar />

        <div style={{ flex: 1 }}>
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default MainLayout;