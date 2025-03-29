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
      main: paletteComponents.neutral[600],
      light: paletteComponents.neutral[500],
      dark: paletteComponents.neutral[700],
      contrastText: paletteComponents.neutral[300],
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
    divider: paletteComponents.neutral[700],
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif' },
    h2: { fontFamily: '"Playfair Display", serif' },
    h3: { fontFamily: '"Playfair Display", serif' },
    h4: { fontFamily: '"Playfair Display", serif' },
    h5: { fontFamily: '"Playfair Display", serif' },
    h6: { fontFamily: '"Playfair Display", serif' },

    subtitle1: { fontFamily: '"Playfair Display", serif' },
    subtitle2: { fontFamily: '"Playfair Display", serif' },

    body1: { fontFamily: '"Roboto", sans-serif' },
    body2: { fontFamily: '"Roboto", sans-serif' },

    button: { fontFamily: '"Roboto", sans-serif' },
    caption: { fontFamily: '"Roboto", sans-serif' },
    overline: { fontFamily: '"Roboto", sans-serif'},
  },
});

export default lightTheme;