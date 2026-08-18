import { Typography, Box } from "@mui/material";

function PageHeader({
  title,
  subtitle,
}) {
  return (
    <Box mb={4}>
      <Typography
        variant="h4"
        fontWeight="bold"
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        mt={1}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}

export default PageHeader;