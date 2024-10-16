// pages/info.js

import React from 'react';
import styles from '../styles/Home.module.css';
import { Button, Box } from '@mui/material'; 
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/newAccount');
  };

  return (
    <div 
    // className={styles.infoBackgroundImage}
    >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column', // Arrange items vertically
        justifyContent: 'center', // Center items vertically
        alignItems: 'center',     // Center items horizontally
        height: '80vh',          // Set the height to full viewport height
        textAlign: 'center',      // Center text inside the h1
      }}
    >
      <h1>Welcome to Plantu.AI</h1>
      
      <Button 
        variant="contained" 
        color="primary"
        onClick={handleRedirect}
        sx={{ marginTop: '1px' }}
      >
        Create New Account
      </Button>
    </Box>
    </div>
  );
}
