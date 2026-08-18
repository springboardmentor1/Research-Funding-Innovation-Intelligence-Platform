import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Box,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";
import notificationService from "../../services/notificationService";

const drawerWidth = 260;
const collapsedWidth = 88;

function Navbar({ onMobileOpen, mobileOpen, sidebarOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Fetch initial notification count
    fetchNotificationCount();
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotificationCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleNotificationCountChange = (newCount) => {
    setNotificationCount(newCount);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const getUserInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "linear-gradient(90deg, #1E1E3F 0%, #2A2A4A 100%)",
        borderBottom: "1px solid rgba(124, 58, 237, 0.15)",
        backdropFilter: "blur(10px)",
        zIndex: theme.zIndex.drawer + 1,
        width: isMobile ? "100%" : {
          lg: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedWidth}px)`,
          md: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedWidth}px)`,
        },
        ml: isMobile ? 0 : {
          lg: `${sidebarOpen ? drawerWidth : collapsedWidth}px`,
          md: `${sidebarOpen ? drawerWidth : collapsedWidth}px`,
        },
        transition: "width 0.3s ease-in-out, margin-left 0.3s ease-in-out",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3, md: 4 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMobileOpen}
          sx={{
            mr: 2,
            display: { md: "none" },
            borderRadius: 2,
            padding: 1,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              background: "rgba(124, 58, 237, 0.1)"
            }
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              background: "linear-gradient(90deg, #FFFFFF 0%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Research Funding Platform
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton
            color="inherit"
            onClick={handleNotificationClick}
            sx={{
              borderRadius: 2,
              padding: 1,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background: "rgba(124, 58, 237, 0.1)"
              }
            }}
          >
            <Badge
              badgeContent={notificationCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)"
                }
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box
            onClick={handleMenuClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              padding: "6px 12px",
              borderRadius: 2,
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              border: "1px solid rgba(124, 58, 237, 0.2)",
              background: "rgba(124, 58, 237, 0.05)",
              "&:hover": {
                background: "rgba(124, 58, 237, 0.1)",
                borderColor: "rgba(124, 58, 237, 0.4)",
                transform: "translateY(-2px)"
              }
            }}
          >
            <Avatar
              sx={{
                background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
                width: 36,
                height: 36,
                fontWeight: 700,
                fontSize: "0.9rem",
                boxShadow: "0 4px 14px 0 rgba(124, 58, 237, 0.39)"
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "white",
                  fontSize: "0.875rem"
                }}
              >
                {user?.full_name?.split(' ')[0] || 'User'}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                background: "linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)",
                border: "1px solid rgba(124, 58, 237, 0.2)",
                borderRadius: 2,
                minWidth: 200,
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                mt: 1
              }
            }}
          >
            <MenuItem
              disabled
              sx={{
                borderBottom: "1px solid rgba(124, 58, 237, 0.1)",
                mb: 1
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight="bold" color="white">
                  {user?.full_name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email || ''}
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: "#EF4444",
                "&:hover": {
                  background: "rgba(239, 68, 68, 0.1)"
                }
              }}
            >
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
              Logout
            </MenuItem>
          </Menu>

          <NotificationsDropdown
            anchorEl={notificationAnchorEl}
            onClose={handleNotificationClose}
            onNotificationCountChange={handleNotificationCountChange}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
