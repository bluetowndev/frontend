import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { useUnmarkedAttendanceUsers } from '../hooks/useUnmarkedAttendanceUser';

const HorizontalCards = () => {
  const { users, error } = useUnmarkedAttendanceUsers();

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (users.length === 0) {
    return <Typography>No unmarked attendance today.</Typography>;
  }

  return (
    <Box
      sx={{
        width: '100%',
        mt: 4,
        py: 2,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <motion.div
        animate={{ x: '-100%' }} // Moves the cards leftward continuously
        transition={{
          x: {
            repeat: Infinity, // Continuous scrolling
            repeatType: 'loop', // Loops indefinitely
            duration: 70, // Adjust speed by changing duration
            ease: 'linear', // Smooth linear scrolling
          },
        }}
        style={{
          display: 'flex',
        }}
      >
        {users.map((user) => (
          <Card
            key={user.id}
            sx={{
              minWidth: { xs: '100px', sm: '130px', md: '160px' }, // Reduced minWidth for smaller cards
              margin: '0 4px', // Reduced margin
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Reduced shadow for a subtler effect
              borderRadius: '8px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <CardContent sx={{ p: 1 }}> {/* Reduced padding for smaller content area */}
              <Typography variant="body1" noWrap fontSize="0.875rem"> {/* Smaller font size */}
                {user.fullName}
              </Typography>
              <Typography variant="body2" noWrap fontSize="0.75rem"> {/* Smaller font size */}
                State: {user.state}
              </Typography>
              <Typography variant="body2" noWrap fontSize="0.75rem"> {/* Smaller font size */}
                Email: {user.email}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </Box>
  );
};

export default HorizontalCards;
