import { Card, CardContent, Typography, Box } from "@mui/material";

function StatCard({
  title,
  value,
  icon,
  color = "#6C63FF",
  subtitle,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        background: "linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)",
        border: "1px solid rgba(124, 58, 237, 0.1)",
        color: "white",
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`,
          opacity: 0.8
        },
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(124, 58, 237, 0.2)",
          borderColor: color,
          "&::before": {
            opacity: 1,
            height: "6px"
          }
        },
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
                mb: 1
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: "2rem",
                lineHeight: 1.2,
                background: "linear-gradient(90deg, #FFFFFF 0%, #A78BFA 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 0.5
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(167, 139, 250, 0.9)",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
              width: 64,
              height: 64,
              borderRadius: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 8px 24px ${color}40`,
              transition: "all 0.3s ease-in-out",
              "& svg": {
                fontSize: 32,
                color: "white"
              }
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default StatCard;