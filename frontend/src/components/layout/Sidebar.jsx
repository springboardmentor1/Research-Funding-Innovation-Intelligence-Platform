import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Box,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import ScienceIcon from "@mui/icons-material/Science";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const drawerWidth = 260;
const collapsedWidth = 88;

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
  },
  {
    text: "Funding",
    icon: <AccountBalanceIcon />,
    path: "/funding",
  },
  {
    text: "Patent Analytics",
    icon: <LightbulbIcon />,
    path: "/patent",
  },
  {
    text: "Publications",
    icon: <ImportContactsIcon />,
    path: "/publications",
  },
  {
    text: "Research Intelligence",
    icon: <ScienceIcon />,
    path: "/research-intelligence",
  },
  {
    text: "Reports",
    icon: <AssessmentIcon />,
    path: "/reports",
  },
  {
    text: "Profile",
    icon: <PersonIcon />,
    path: "/profile",
  },
];

function Sidebar({ mobileOpen, onMobileClose, sidebarOpen, onSidebarToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const drawerVariant = isMobile ? "temporary" : "permanent";
  const currentDrawerWidth = isMobile ? drawerWidth : (sidebarOpen ? drawerWidth : collapsedWidth);

  return (
    <Drawer
      variant={drawerVariant}
      open={isMobile ? mobileOpen : true}
      onClose={onMobileClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        width: currentDrawerWidth,
        flexShrink: 0,
        transition: "width 0.3s ease-in-out",
        "& .MuiDrawer-paper": {
          width: currentDrawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #1E1E3F 0%, #151528 100%)",
          borderRight: "1px solid rgba(124, 58, 237, 0.1)",
          color: "white",
          overflowX: "hidden",
          transition: "width 0.3s ease-in-out",
        },
      }}
    >
      {/* Logo and Toggle Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          px: sidebarOpen ? 2 : 1.5,
          py: 2,
          borderBottom: "1px solid rgba(124, 58, 237, 0.1)",
          position: "relative",
          minHeight: 64,
        }}
      >
        {/* Logo - Small and on left */}
        <Box
          onClick={!sidebarOpen ? onSidebarToggle : undefined}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            cursor: !sidebarOpen ? "pointer" : "default",
            flex: sidebarOpen ? 1 : "auto",
          }}
        >
          {/* 3D Logical Diagram Logo - Smaller */}
          <Box
            sx={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 3D Cube Network Logo */}
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="50%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              {/* Main cube */}
              <path
                d="M18 4L32 12V28L18 36L4 28V12L18 4Z"
                fill="url(#logoGradient)"
                opacity="0.9"
              />
              {/* Top face - lighter */}
              <path
                d="M18 4L32 12L18 20L4 12L18 4Z"
                fill="#A78BFA"
                opacity="0.4"
              />
              {/* Left face - medium */}
              <path
                d="M4 12L18 20V36L4 28V12Z"
                fill="#7C3AED"
                opacity="0.6"
              />
              {/* Right face - medium */}
              <path
                d="M32 12L18 20V36L32 28V12Z"
                fill="#EC4899"
                opacity="0.6"
              />
              {/* Network nodes */}
              <circle cx="18" cy="12" r="2" fill="white" opacity="0.9" />
              <circle cx="18" cy="28" r="2" fill="white" opacity="0.9" />
              <circle cx="8" cy="20" r="1.5" fill="white" opacity="0.7" />
              <circle cx="28" cy="20" r="1.5" fill="white" opacity="0.7" />
              {/* Connection lines */}
              <line x1="18" y1="12" x2="18" y2="28" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="18" y1="20" x2="8" y2="20" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="18" y1="20" x2="28" y2="20" stroke="white" strokeWidth="1" opacity="0.5" />
            </svg>
          </Box>
        </Box>

        {/* Toggle Button - Only show when expanded */}
        {sidebarOpen && (
          <IconButton
            onClick={onSidebarToggle}
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              borderRadius: 2,
              padding: 1,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background: "rgba(124, 58, 237, 0.1)"
              }
            }}
          >
            <MenuOpenIcon />
          </IconButton>
        )}
      </Box>

      <List sx={{ px: sidebarOpen ? 2 : 1, mt: 1 }}>
        {menuItems.map((item) => (
          <Tooltip key={item.text} title={item.text} placement="right" arrow={!sidebarOpen}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                mx: sidebarOpen ? 0.5 : 0,
                my: 0.75,
                borderRadius: 2,
                py: 1.5,
                px: sidebarOpen ? 2 : 1.5,
                transition: "all 0.2s ease-in-out",
                position: "relative",
                overflow: "hidden",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                minHeight: 48,

                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: 3,
                  background: "linear-gradient(180deg, #7C3AED 0%, #EC4899 100%)",
                  transform: "scaleY(0)",
                  transition: "transform 0.2s ease-in-out",
                  borderRadius: "0 4px 4px 0"
                },

                "&.active": {
                  background: "linear-gradient(90deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.05) 100%)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  boxShadow: "inset 0 0 20px rgba(124, 58, 237, 0.1)",

                  "&::before": {
                    transform: "scaleY(1)"
                  },

                  "& .MuiListItemIcon-root": {
                    color: "#A78BFA"
                  },

                  "& .MuiTypography-root": {
                    color: "#FFFFFF",
                    fontWeight: 600
                  }
                },

                "&:hover:not(.active)": {
                  background: "rgba(124, 58, 237, 0.1)",
                  transform: sidebarOpen ? "translateX(4px)" : "none"
                },

                "&:active": {
                  transform: sidebarOpen ? "translateX(2px)" : "none"
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  minWidth: sidebarOpen ? 40 : "auto",
                  justifyContent: "center",
                  transition: "color 0.2s ease-in-out",
                  margin: 0,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.text}
                sx={{
                  display: sidebarOpen ? "block" : "none",
                  "& .MuiTypography-root": {
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 400,
                    fontSize: "0.95rem",
                    transition: "all 0.2s ease-in-out"
                  }
                }}
              />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      <Divider sx={{ bgcolor: "rgba(124, 58, 237, 0.1)", my: 2 }} />

      <List sx={{ px: sidebarOpen ? 2 : 1 }}>
        <Tooltip title="Logout" placement="right" arrow={!sidebarOpen}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: sidebarOpen ? 0.5 : 0,
              my: 0.75,
              borderRadius: 2,
              py: 1.5,
              px: sidebarOpen ? 2 : 1.5,
              transition: "all 0.2s ease-in-out",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              minHeight: 48,

              "&:hover": {
                background: "linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                transform: sidebarOpen ? "translateX(4px)" : "none"
              },

              "&:active": {
                transform: sidebarOpen ? "translateX(2px)" : "none"
              }
            }}
          >
            <ListItemIcon
              sx={{
                color: "rgba(239, 68, 68, 0.8)",
                minWidth: sidebarOpen ? 40 : "auto",
                justifyContent: "center",
                margin: 0,
              }}
            >
              <LogoutIcon />
            </ListItemIcon>

            <ListItemText
              primary="Logout"
              sx={{
                display: sidebarOpen ? "block" : "none",
                "& .MuiTypography-root": {
                  color: "rgba(239, 68, 68, 0.9)",
                  fontWeight: 500
                }
              }}
            />
          </ListItemButton>
        </Tooltip>
      </List>
    </Drawer>
  );
}

export default Sidebar;