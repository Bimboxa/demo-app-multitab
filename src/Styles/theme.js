import {createTheme} from "@mui/material/styles";
import {blueGrey, green} from "@mui/material/colors";

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 0,
        },
      },
    },
  },
  typography: {fontSize: 11},
  palette: {
    background: {
      default: "#F4F4F8",
      dark: "#F5F5F5",
    },
    shape: {
      default: blueGrey[500],
      selected: green[500],
    },
  },
});

export default theme;
