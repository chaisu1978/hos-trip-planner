import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeText {
    branda: string;
    brandb: string;
    brandc: string;
    searchbox: string;
  }

  interface Palette {
    tertiary: Palette['primary'];
    searchbox: Palette['primary'];
    highlight: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    searchbox?: Palette['primary'];
    highlight?: Palette['primary'];
  }
}