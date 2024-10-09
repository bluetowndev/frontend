import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const GeminiWave = () => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      background: "linear-gradient(135deg, #1e3a8a, #5b21b6)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        width: "150%",
        height: "100%",
        left: "-25%",
      }}
    >
      {[...Array(3)].map((_, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.7 - index * 0.2,
          }}
        >
          <svg
            viewBox="0 0 1440 320"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            <motion.path
              d="M0,160 C320,300,420,240,640,160 C880,80,1200,220,1440,200 V320 H0 Z"
              fill={`rgba(255,255,255,${0.3 - index * 0.1})`}
              animate={{
                d: [
                  "M0,160 C320,300,420,240,640,160 C880,80,1200,220,1440,200 V320 H0 Z",
                  "M0,200 C320,100,420,260,640,200 C880,140,1200,180,1440,240 V320 H0 Z",
                  "M0,160 C320,300,420,240,640,160 C880,80,1200,220,1440,200 V320 H0 Z",
                ],
              }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 10 - index * 2,
                ease: "easeInOut",
              }}
            />
          </svg>
        </Box>
      ))}
    </Box>
  </Box>
);

export default GeminiWave;