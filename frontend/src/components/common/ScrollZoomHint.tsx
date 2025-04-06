import { useEffect, useState, useRef } from "react";
import { Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const ScrollZoomHint = () => {
  const [show, setShow] = useState(false);
  const hideTimeout = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mapContainer = document.querySelector(".leaflet-container");
    if (!mapContainer) return;

    containerRef.current = mapContainer as HTMLElement;

    const showHint = () => {
      setShow(true);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = window.setTimeout(() => setShow(false), 3000);
    };

    const handleMouseEnter = () => showHint();

    const handleWheel = (event: Event) => {
      const e = event as WheelEvent;
      if (!e.ctrlKey) {
        setShow(true);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        hideTimeout.current = window.setTimeout(() => setShow(false), 3000);
      } else {
        setShow(false);
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
      }
    };

    mapContainer.addEventListener("mouseenter", handleMouseEnter);
    mapContainer.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      mapContainer.removeEventListener("mouseenter", handleMouseEnter);
      mapContainer.removeEventListener("wheel", handleWheel);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(33, 33, 33, 0.8)",
            color: "white",
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: "0.8rem",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <Typography variant="caption">
            <strong>Scroll</strong> to zoom
          </Typography>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollZoomHint;
