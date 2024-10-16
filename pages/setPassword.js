import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Container, Grid, Paper, Box, Toolbar, Typography, TextField, Button, Snackbar, Alert, CircularProgress, Tooltip, List, ListItem, ListItemText, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import plantoLogo from './post/image/plantoLogo2.png';
import LockIcon from '@mui/icons-material/Lock';
import SyncLockIcon from '@mui/icons-material/SyncLock';

const SetPassword = () => {
  const router = useRouter();
  const { token } = router.query; // Retrieve the token from the query params
  const [loading, setLoading] = useState(true); // State to show the loading spinner for page load
  const [isSubmitting, setIsSubmitting] = useState(false); // State to show the loading spinner for form submission
  const [isTokenValid, setIsTokenValid] = useState(false); // State to check if token is valid
  const [password, setPassword] = useState(''); // State to manage the new password input
  const [confirmPassword, setConfirmPassword] = useState(''); // State to manage the confirm password input
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // State to track password field focus
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility
  const [checklist, setChecklist] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
 
  useEffect(() => {
    if (typeof token === 'string' && token.trim() !== '') {
      // If token is present, verify it
      verifyToken();
    } else if (token === undefined) {
      // Wait until the token is available from the query params
      return;
    } else {
      // If token is missing or empty, handle the error immediately
      setLoading(false);
      setIsTokenValid(false);
      setSnackbarMessage('Token is missing or link is broken.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [token]);
 
  const verifyToken = async () => {
    try {
      const response = await fetch('/api/auth/verifyToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
 
      const data = await response.json();
      if (response.ok) {
        setIsTokenValid(true); // Token is valid, allow user to set a new password
      } else {
        throw new Error(data.error || 'Invalid token');
      }
    } catch (error) {
      console.error('Error verifying token:', error.message);
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false); // Hide the loading spinner
    }
  };
 
  const handlePasswordFocus = () => setIsPasswordFocused(true);
  const handlePasswordBlur = () => setIsPasswordFocused(false);
 
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setChecklist({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  };
 
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
 
  const isPasswordValid = Object.values(checklist).every((value) => value);
 
  const handleSubmit = async () => {
    // Validate passwords match
    if (password !== confirmPassword) {
      setSnackbarMessage('Passwords do not match.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
 
    if (!isPasswordValid) {
      setSnackbarMessage('Password does not meet the requirements.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
 
    // Set submitting state to true
    setIsSubmitting(true);
 
    // Logic to handle password submission
    try {
      const response = await fetch('/api/setPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
 
      const data = await response.json();
      if (response.ok) {
        setSnackbarMessage('Password set successfully!');
        setSnackbarSeverity('success');
        setTimeout(() => {
          router.push('/');
        }, 2000); // Route to home after showing success message
      } else {
        throw new Error(data.error || 'Failed to set password');
      }
    } catch (error) {
      console.error('Error setting password:', error.message);
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setIsSubmitting(false); // Stop showing the spinner after submission
    }
  };
 
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
 
    setSnackbarOpen(false);
  };
 
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
 
  return (
    <div className={styles.backgroundImage}>
      <Grid container style={{ height: '100vh' }}>
        {/* Left Section with background image */}
        <Grid
          item
          xs={5}
          sm={6}
          md={8}
          lg={9}
          style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></Grid>

        {/* Right Section with form */}
        <Grid
          item
          xs={7}
          sm={6}
          md={4}
          lg={3}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f2f8ff',
          }}
        >
          <Container maxWidth="sm">
            {/* Logo */}
            <Toolbar
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Image
                src={plantoLogo}
                alt="Plantu.ai Logo"
                style={{ width: '40%', maxWidth: '300px', height: 'auto' }}
              />
            </Toolbar>

            {/* Title */}
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ mt: 2 }}
            >
              Set Your Password
            </Typography>

            {/* Success / Error Messages */}
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                }}
              >
                <CircularProgress />
              </Box>
            ) : isTokenValid ? (
              <>
                {/* Password Input Form */}
                <Tooltip
                  title={
                    <List sx={{ mt: 2 }}>
                      <ListItem>
                        <ListItemText
                          primary={`At least 8 characters long: ${
                            checklist.length ? '✅' : '❌'
                          }`}
                          primaryTypographyProps={{
                            sx: {
                              color: checklist.length ? 'green' : 'red',
                            },
                          }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={`At least one uppercase letter: ${
                            checklist.uppercase ? '✅' : '❌'
                          }`}
                          primaryTypographyProps={{
                            sx: {
                              color: checklist.uppercase ? 'green' : 'red',
                            },
                          }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={`At least one lowercase letter: ${
                            checklist.lowercase ? '✅' : '❌'
                          }`}
                          primaryTypographyProps={{
                            sx: {
                              color: checklist.lowercase ? 'green' : 'red',
                            },
                          }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={`At least one number: ${
                            checklist.number ? '✅' : '❌'
                          }`}
                          primaryTypographyProps={{
                            sx: {
                              color: checklist.number ? 'green' : 'red',
                            },
                          }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary={`At least one special character: ${
                            checklist.specialChar ? '✅' : '❌'
                          }`}
                          primaryTypographyProps={{
                            sx: {
                              color: checklist.specialChar ? 'green' : 'red',
                            },
                          }}
                        />
                      </ListItem>
                    </List>
                  }
                  open={isPasswordFocused}
                  placement="right-start"
                  arrow
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
                  <LockIcon sx={{ color: '#404040', mr: 1, my: 0.5 }} />
                  <TextField
                    label="New Password"
                    variant='standard'
                    type={passwordVisible ? 'text' : 'password'}
                    fullWidth
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                          >
                            {passwordVisible ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mt: 2 }}
                  />
                  </Box>
                </Tooltip>

                <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
                <SyncLockIcon sx={{ color: '#404040', mr: 1, my: 0.5 }} />
                <TextField
                  label="Confirm Password"
                  variant='standard'
                  type={passwordVisible ? 'text' : 'password'}
                  fullWidth
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {passwordVisible ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 2 }}
                />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    mb: 2.5,
                    backgroundColor: '#5A20CB',
                    '&:hover': { backgroundColor: '#3a138b' },
                  }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Set Password'
                  )}
                </Button>
              </>
            ) : (
              <Typography variant="h6" color="error" align="center">
                Token expired or invalid. Please request a new link from your
                admin.
              </Typography>
            )}

            {/* Snackbar for success/error messages */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={snackbarSeverity}
                sx={{ width: '100%' }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Container>
        </Grid>
      </Grid>
    </div>
  );
};
 
export default SetPassword;