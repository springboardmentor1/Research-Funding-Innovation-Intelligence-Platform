import { Typography, Box } from "@mui/material";
import { useAuth } from "../../context/AuthContext";

function DashboardHeader() {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box
      sx={{
        mb: 4,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
      >
        {getGreeting()}, {user?.full_name?.split(' ')[0] || 'User'}!
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
      >
        Monitor your funding, innovation and research intelligence.
      </Typography>
    </Box>
  );
}

export default DashboardHeader;