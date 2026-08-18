import {
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

import LightbulbIcon from "@mui/icons-material/Lightbulb";

function AIInsights({ insights = [] }) {
  const defaultInsights = [
    "Complete your research profile to get personalized insights",
    "Add your publications to improve recommendations",
    "Save funding opportunities to track applications",
  ];

  // Filter out empty or invalid insights
  const validInsights = insights.filter(item => 
    item && typeof item === 'string' && item.trim().length > 0
  );

  const displayInsights = validInsights.length > 0 ? validInsights : defaultInsights;
  const hasRealData = validInsights.length > 0;

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
          AI Insights
        </Typography>

        <Box 
          sx={{ 
            pl: 0,
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
          {displayInsights.map((item, index) => (
            <Box
              key={index}
              sx={{
                mb: 1.5,
                p: 1.5,
                ml: hasRealData ? 0 : -2,
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                display: "flex",
                alignItems: "center",
                gap: hasRealData ? 1 : 0,
                "&:hover": {
                  background: "rgba(124, 58, 237, 0.1)",
                  transform: "translateX(4px)"
                }
              }}
            >
              {hasRealData && (
                <Box sx={{ color: "#F59E0B", minWidth: 40, display: "flex", justifyContent: "center" }}>
                  <LightbulbIcon sx={{ fontSize: 20 }} />
                </Box>
              )}

              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  flex: 1
                }}
              >
                {item}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default AIInsights;