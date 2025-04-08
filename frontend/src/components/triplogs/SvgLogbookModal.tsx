import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import apiClient from "../../services/auth";

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
  const handleDownloadPdf = async () => {
    try {
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
      <DialogContent>
        {/* Render carousel or stacked preview of SVGs */}
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
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPdf}
          >
            Download All as PDF
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SvgLogbookModal;
