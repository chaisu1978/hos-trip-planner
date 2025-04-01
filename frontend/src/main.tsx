import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import store, { RootState } from "./store";
import { useSelector } from "react-redux";
import App from "./App";
import lightTheme from "./themes/lightTheme";
import darkTheme from "./themes/darkTheme";
import "./index.css";
import "leaflet-defaulticon-compatibility";
import { SnackbarProvider } from "./components/common/SnackbarProvider";

const ThemedApp = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemedApp />
  </Provider>
);
