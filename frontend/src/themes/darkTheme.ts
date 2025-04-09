import { createTheme } from '@mui/material/styles';
import paletteComponents from './paletteComponents';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: paletteComponents.primary[700], },
    secondary: { main: paletteComponents.secondary[700] },
    tertiary: { main: paletteComponents.tertiary[700] },
    searchbox: {
      main: paletteComponents.tertiary[700],
      light: paletteComponents.tertiary[300],
      dark: paletteComponents.tertiary[900],
      contrastText: paletteComponents.neutral[300],
    },
    highlight: {
      main: paletteComponents.neutral[800],
      light: paletteComponents.neutral[700],
      dark: paletteComponents.neutral[900],
      contrastText: paletteComponents.neutral[300],
    },
    background: {
      default: paletteComponents.neutral[800],
      paper: paletteComponents.neutral[700],
    },
    text: {
      primary: paletteComponents.neutral[300],
      secondary: paletteComponents.neutral[400],
      branda: paletteComponents.primary[100],
      brandb: paletteComponents.secondary[100],
      brandc: paletteComponents.tertiary[100],
      searchbox: paletteComponents.tertiary[100],
    },
    error: { main: paletteComponents.red[700] },
    warning: { main: paletteComponents.orange[700] },
    info: { main: paletteComponents.blue[700] },
    success: { main: paletteComponents.green[700] },
    divider: paletteComponents.neutral[300],
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

export default darkTheme;