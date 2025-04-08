import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Box,
  Button,
  useTheme,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import apiClient from "../../services/auth";
import { useState } from "react";

interface SvgLogbookModalProps {
  open: boolean;
  onClose: () => void;
  svgUrls: string[];
  tripId: number;
}

const SvgLogbookModal = ({
  open,
  onClose,
  svgUrls,
  tripId,
}: SvgLogbookModalProps) => {
  const theme = useTheme();
  const [downloading, setDownloading] = useState(false);
  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const response = await apiClient.get(
        `/trips/trips/${tripId}/download_logs/`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DailyLogs-${tripId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download logs PDF", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <DialogTitle>
        Daily Logbook Preview
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          sx={{ position: "absolute", right: 16, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          {svgUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Log Sheet ${index + 1}`}
              style={{ width: "100%" }}
            />
          ))}
        </Box>
      </DialogContent>

      {/* Sticky footer */}
      <DialogActions
        sx={{
          position: "sticky",
          bottom: 0,
          background: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          justifyContent: "center",
          padding: "12px 24px",
        }}
      >
        <Button
          color="error"
          variant="contained"
          onClick={onClose}
          startIcon={<CloseIcon />}
        >
          Close
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={
            downloading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PictureAsPdfIcon />
            )
          }
          onClick={handleDownloadPdf}
          disabled={downloading}
        >
          {downloading ? "Preparing..." : "Download All"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SvgLogbookModal;
