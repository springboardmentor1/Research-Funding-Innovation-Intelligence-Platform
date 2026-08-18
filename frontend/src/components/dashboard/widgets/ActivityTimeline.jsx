import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";

function ActivityTimeline({ activities = [] }) {
  const defaultActivities = [
    { title: "Welcome to the platform", time: "Just now" },
    { title: "Start by completing your profile", time: "Guide" },
    { title: "Explore funding opportunities", time: "Dashboard" },
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <Card
      sx={{
        background: "linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)",
        border: "1px solid rgba(124, 58, 237, 0.1)",
        color: "white",
        borderRadius: 3,
        height: "500px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(124, 58, 237, 0.15)",
          borderColor: "rgba(124, 58, 237, 0.3)"
        }
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography
          variant="h6"
          mb={2}
          sx={{
            fontWeight: 600,
            background: "linear-gradient(90deg, #FFFFFF 0%, #A78BFA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            flexShrink: 0
          }}
        >
          Recent Activity
        </Typography>

        <List 
          sx={{ 
            p: 0,
            overflowY: 'auto',
            maxHeight: '400px',
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
          {displayActivities.map((activity, index) => (
            <ListItem
              key={index}
              sx={{
                p: 1.5,
                borderRadius: 2,
                mb: 1,
                transition: "all 0.2s ease-in-out",
                borderLeft: "3px solid transparent",
                "&:hover": {
                  background: "rgba(124, 58, 237, 0.1)",
                  borderLeft: "3px solid #7C3AED",
                  transform: "translateX(4px)"
                }
              }}
            >
              <ListItemText
                primary={activity.title}
                secondary={activity.time}
                slotProps={{
                  primary: {
                    sx: {
                      color: "rgba(255, 255, 255, 0.9)",
                      fontWeight: 500,
                      fontSize: "0.875rem"
                    },
                  },
                  secondary: {
                    sx: {
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "0.75rem"
                    },
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export default ActivityTimeline;