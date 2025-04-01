import L from "leaflet";
import { Theme } from "@mui/material";

export const createThemedMarkerIcon = (
  theme: Theme,
  color: "primary" | "secondary" | "error" | "warning" | "success" | "info",
  size: number = 24
) => {
  const hexColor = theme.palette[color].main;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${hexColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 6px rgba(0,0,0,0.3);
      "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};
