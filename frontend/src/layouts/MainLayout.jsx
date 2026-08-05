import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div>

      <h2>Navbar</h2>

      <hr />

      <div style={{ display: "flex" }}>

        <div style={{ width: "200px" }}>
          Sidebar
        </div>

        <div style={{ flex: 1 }}>
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default MainLayout;