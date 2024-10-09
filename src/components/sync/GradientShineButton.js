import { Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";

const MotionButton = motion(Button);

const GradientShineButton = ({ type = "button", disabled, sx, children, text }) => {
  const theme = useTheme();

  return (
    <MotionButton
      type={type} // Pass the type prop (either "submit" or "button")
      variant="contained"
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      sx={{
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(110deg, #6A85B6 45%, #BAC8E0 55%, #6A85B6)" // Light mode gradient (blue & light purple)
            : "linear-gradient(110deg, #3A3D9B 45%, #572A82 55%, #3A3D9B)", // Dark mode gradient (deep blue & purple)
        backgroundSize: "200% 100%",
        animation: "shine 3s linear infinite",
        color: "white",
        border: "none",
        "&:hover": {
          backgroundPosition: "100% 0", // Smooth transition on hover
        },
        "@keyframes shine": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        ...sx, // Spread additional styles if provided
      }}
    >
      {text} {/* Render the text passed as prop */}
    </MotionButton>
  );
};

export default GradientShineButton;
