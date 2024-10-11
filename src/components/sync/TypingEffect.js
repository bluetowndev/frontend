import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";

const TypingEffect = ({ text, className, style }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setTimeout(() => {
        setDisplayText("");
        setIndex(0);
      }, 1000);
    }
  }, [index, text]);

  return (
    <Typography 
      variant="h5" 
      className={className}
      style={style}
    >
      {displayText}
    </Typography>
  );
};

export default TypingEffect;
