import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";

function Navbar() {

  return (

    <AppBar position="static" color="primary" elevation={4}>

      <Toolbar>

        <Typography
          variant="h6"
          sx={{ flexGrow: 1 }}
        >
          Research Funding & Innovation Platform
        </Typography>

        <IconButton color="inherit">

          <NotificationsIcon />

        </IconButton>

        <Avatar sx={{ ml: 2 }}>
          Y
        </Avatar>

      </Toolbar>

    </AppBar>

  );

}

export default Navbar;