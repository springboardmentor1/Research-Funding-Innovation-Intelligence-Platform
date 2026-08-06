import { createTheme } from "@mui/material/styles";

const theme = createTheme({

    palette: {

        mode: "dark",

        primary: {
            main: "#6C63FF"
        },

        secondary: {
            main: "#9D8CFF"
        },

        background: {

            default: "#121212",

            paper: "#1E1E2F"

        },

        text: {

            primary: "#F5F5F5",

            secondary: "#C0C0C0"

        }

    }

});

export default theme;