import * as React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';

function GradientCircularProgress({ size }) {
  return (
    <React.Fragment>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e01cd5" />
            <stop offset="100%" stopColor="#1CB5E0" />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        size={size}
        sx={{
          'svg circle': { stroke: 'url(#my_gradient)' }
        }}
      />
    </React.Fragment>
  );
}

export default function Animations() {
  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',  
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: '#99ddff', position: 'absolute', top: 0, left: 0 }} />
      <GradientCircularProgress size={100} />
    </Box>
  );
}