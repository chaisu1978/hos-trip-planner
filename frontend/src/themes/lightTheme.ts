import { createTheme } from '@mui/material/styles';
import paletteComponents from './paletteComponents';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: paletteComponents.primary[500] },
    secondary: { main: paletteComponents.secondary[500] },
    tertiary: { main: paletteComponents.tertiary[500] },
    searchbox: {
      main: paletteComponents.tertiary[700],
      light: paletteComponents.tertiary[300],
      dark: paletteComponents.tertiary[900],
      contrastText: paletteComponents.neutral[300],
    },
    highlight: {
      main: paletteComponents.secondary[300],
      light: paletteComponents.secondary[200],
      dark: paletteComponents.secondary[500],
      contrastText: paletteComponents.neutral[800],
    },
    background: {
      default: paletteComponents.neutral[300],
      paper: paletteComponents.neutral[400],
    },
    text: {
      primary: paletteComponents.neutral[800],
      secondary: paletteComponents.neutral[700],
      branda: paletteComponents.primary[500],
      brandb: paletteComponents.secondary[700],
      brandc: paletteComponents.tertiary[700],
      searchbox: paletteComponents.tertiary[700],
    },
    error: { main: paletteComponents.red[500] },
    warning: { main: paletteComponents.orange[500] },
    info: { main: paletteComponents.blue[500] },
    success: { main: paletteComponents.green[500] },
    divider: paletteComponents.secondary[700],
  },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Montserrat", sans-serif' },
  },
});

export default lightTheme;