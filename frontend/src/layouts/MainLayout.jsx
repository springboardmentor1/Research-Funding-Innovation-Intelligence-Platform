import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { useState } from "react";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

const drawerWidth = 260;
const collapsedWidth = 88;

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#0F0F1A",
      }}
    >
      {/* Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        onMobileClose={handleDrawerToggle}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={handleSidebarToggle}
      />

      {/* Right Side */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top Navigation */}
        <Navbar 
          onMobileOpen={handleDrawerToggle} 
          mobileOpen={mobileOpen}
          sidebarOpen={sidebarOpen}
        />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 20, sm: 20, md: 20 },
            overflow: "auto",
            bgcolor: "#0F0F1A",
            transition: "margin-left 0.3s ease-in-out",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;