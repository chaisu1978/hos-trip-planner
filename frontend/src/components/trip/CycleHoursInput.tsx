import { Box, Typography, Slider, TextField } from "@mui/material";
import WatchLaterIcon from "@mui/icons-material/WatchLater";

interface CycleHoursInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const CycleHoursInput = ({
  value,
  onChange,
  disabled,
}: CycleHoursInputProps) => {
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    onChange(typeof newValue === "number" ? newValue : newValue[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0 && val <= 70) {
      onChange(val);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding="10px"
      gap="8px"
      width="100%"
      sx={{
        backgroundColor: "highlight.main",
        color: "highlight.contrastText",
        borderRadius: "0px 12px 0px 12px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          backgroundColor: disabled ? "grey" : "background.default",
          color: "text.branda",
          borderRadius: "24px",
          padding: "8px 16px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* //Icon  */}
        <WatchLaterIcon fontSize="small" sx={{ marginRight: "8px" }} />
        <Typography variant="body2" fontWeight={600}>
          SET CYCLE HOURS
        </Typography>
      </Box>
      <Typography fontSize={12} align="center">
        Hours of Service used in your current 70-hour/8-day cycle?
      </Typography>
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        width={"100%"}
      >
        <Slider
          value={value}
          min={0}
          max={70}
          step={0.25}
          disabled={disabled}
          onChange={handleSliderChange}
          sx={{
            width: "75%",
            backgroundColor: "primary.main",
            margin: "4px 8px 0 8px",
            color: "highlight.contrastText",
            // Shadow like a button
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
          }}
        />
        <TextField
          type="number"
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
          inputProps={{ min: 0, max: 70, step: 0.25 }}
          label="Hours"
          size="small"
          sx={{
            backgroundColor: "highlight.main",
            "& .MuiInputBase-input": {
              color: "highlight.contrastText",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "highlight.contrastText",
              },
              "&:hover fieldset": {
                borderColor: "primary.main",
              },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
            "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
              {
                "-webkit-appearance": "none",
                margin: 0,
              },
            "& input[type=number]": {
              "-moz-appearance": "textfield",
            },
          }}
          slotProps={{
            inputLabel: {
              sx: {
                color: "highlight.contrastText",
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default CycleHoursInput;
