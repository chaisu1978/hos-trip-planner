import { createTheme } from '@mui/material/styles';
import paletteComponents from './paletteComponents';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: paletteComponents.primary[600], },
    secondary: { main: paletteComponents.secondary[800] },
    tertiary: { main: paletteComponents.tertiary[700] },
    searchbox: {
      main: paletteComponents.tertiary[700],
      light: paletteComponents.tertiary[300],
      dark: paletteComponents.tertiary[900],
      contrastText: paletteComponents.neutral[300],
    },
    highlight: {
      main: paletteComponents.secondary[700],
      light: paletteComponents.secondary[600],
      dark: paletteComponents.secondary[800],
      contrastText: paletteComponents.neutral[200],
    },
    background: {
      default: paletteComponents.neutral[800],
      paper: paletteComponents.neutral[700],
    },
    text: {
      primary: paletteComponents.neutral[300],
      secondary: paletteComponents.neutral[400],
      branda: paletteComponents.primary[500],
      brandb: paletteComponents.secondary[300],
      brandc: paletteComponents.tertiary[300],
      searchbox: paletteComponents.tertiary[700],
    },
    error: { main: paletteComponents.red[600] },
    warning: { main: paletteComponents.orange[600] },
    info: { main: paletteComponents.blue[600] },
    success: { main: paletteComponents.green[600] },
    divider: paletteComponents.secondary[200],
  },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Montserrat", sans-serif' },
  },
});

export default darkTheme;