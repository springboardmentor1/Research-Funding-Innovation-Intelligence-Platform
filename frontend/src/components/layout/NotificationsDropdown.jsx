import {
  Menu,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import TimelineIcon from "@mui/icons-material/Timeline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import notificationService from "../../services/notificationService";

function NotificationsDropdown({ anchorEl, onClose, onNotificationCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (anchorEl) {
      fetchNotifications();
    }
  }, [anchorEl]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      if (onNotificationCountChange) {
        onNotificationCountChange(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    const newUnreadCount = notifications.filter(n => n.id !== notificationId && !n.read).length;
    setUnreadCount(newUnreadCount);
    if (onNotificationCountChange) {
      onNotificationCountChange(newUnreadCount);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
    if (onNotificationCountChange) {
      onNotificationCountChange(0);
    }
  };

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'lightbulb':
        return <LightbulbIcon sx={{ color: "#F59E0B", fontSize: 20 }} />;
      case 'timeline':
        return <TimelineIcon sx={{ color: "#7C3AED", fontSize: 20 }} />;
      default:
        return <CheckCircleIcon sx={{ color: "#10B981", fontSize: 20 }} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'insight':
        return '#F59E0B';
      case 'activity':
        return '#7C3AED';
      default:
        return '#10B981';
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
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
          minWidth: 380,
          maxWidth: 420,
          maxHeight: 500,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          mt: 1,
          overflow: 'hidden'
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid rgba(124, 58, 237, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            background: "linear-gradient(90deg, #FFFFFF 0%, #A78BFA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Notifications
        </Typography>
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={handleMarkAllAsRead}
            sx={{
              color: "#7C3AED",
              fontSize: "0.75rem",
              textTransform: "none",
              "&:hover": {
                background: "rgba(124, 58, 237, 0.1)"
              }
            }}
            startIcon={<MarkEmailReadIcon sx={{ fontSize: 16 }} />}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {/* Notifications List */}
      <Box
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(124, 58, 237, 0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(124, 58, 237, 0.3)',
            borderRadius: '3px',
            '&:hover': {
              background: 'rgba(124, 58, 237, 0.5)',
            },
          },
        }}
      >
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              Loading notifications...
            </Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: "rgba(255, 255, 255, 0.5)" }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 1 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  mb: 0.5,
                  transition: "all 0.2s ease-in-out",
                  borderLeft: notification.read ? "3px solid transparent" : "3px solid #7C3AED",
                  background: notification.read ? "transparent" : "rgba(124, 58, 237, 0.05)",
                  "&:hover": {
                    background: "rgba(124, 58, 237, 0.1)",
                    transform: "translateX(4px)"
                  }
                }}
                secondaryAction={
                  !notification.read && (
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      sx={{
                        color: "rgba(255, 255, 255, 0.5)",
                        "&:hover": {
                          color: "#7C3AED"
                        }
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )
                }
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getIcon(notification.icon)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: 500,
                          fontSize: "0.875rem"
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.type}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          background: `rgba(${parseInt(getTypeColor(notification.type).slice(1, 3), 16)}, ${parseInt(getTypeColor(notification.type).slice(3, 5), 16)}, ${parseInt(getTypeColor(notification.type).slice(5, 7), 16)}, 0.2)`,
                          color: getTypeColor(notification.type),
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: "0.8rem",
                          mb: 0.5
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.4)",
                          fontSize: "0.7rem"
                        }}
                      >
                        {notification.time}
                      </Typography>
                    </Box>
                  }
                  slotProps={{
                    primary: {
                      sx: { mb: 0.5 }
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Divider sx={{ borderColor: "rgba(124, 58, 237, 0.1)" }} />
          <Box
            sx={{
              p: 1.5,
              textAlign: 'center'
            }}
          >
            <Typography
              sx={{
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: "0.75rem",
                cursor: 'pointer',
                "&:hover": {
                  color: "#7C3AED"
                }
              }}
              onClick={onClose}
            >
              View all notifications
            </Typography>
          </Box>
        </>
      )}
    </Menu>
  );
}

export default NotificationsDropdown;
