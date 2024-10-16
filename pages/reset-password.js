import { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Grid, Paper, Typography, TextField, Button, Alert, CircularProgress, Tooltip, List, ListItem, ListItemText, IconButton, InputAdornment  } from '@mui/material'; // Import Material-UI components
import axios from 'axios';
import backgroundImage from './post/image/forgot-password.webp';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Icons for password visibility toggle

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false); // State to track loading state
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // State to track password field focus
  const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility
  const [checklist, setChecklist] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const handlePasswordFocus = () => setIsPasswordFocused(true);
  const handlePasswordBlur = () => setIsPasswordFocused(false);

  const handleChange = (value) => {
    setNewPassword(value);
    setChecklist({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  };

  const isPasswordValid = Object.values(checklist).every(value => value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setTimeout(() => setErrorMessage(''), 2000);
      return; // Prevent form submission if passwords do not match
    }

    if (!isPasswordValid) {
      setErrorMessage('Password does not meet the requirements.');
      setTimeout(() => setErrorMessage(''), 2000);
      return; // Prevent form submission if password is not valid
    }
    setLoading(true); // Start loading state
    try {
      const response = await axios.post('/api/reset-password', { token, newPassword });
      setSuccessMessage(response.data.message);
      setErrorMessage('');
      setMessage(''); // Clear any previous messages
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setErrorMessage(error.response.data.error);
      setSuccessMessage('');
      setMessage(''); // Clear any previous messages
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Container maxWidth="sm">
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{
          minHeight: '100vh',
          backgroundImage: `url(${backgroundImage.src})`, // Background image URL
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          position: 'fixed', /* Fixed position to cover the viewport without scrolling */
          top: '0',
          left: '0',
          height: '100vh', /* Full viewport height */
          width: '100vw' /* Full viewport width */
        }}
      >
        <Grid item>
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: 10,
              width: '100%', // Adjust width as needed
              maxWidth: 400, // Maximum width of the Paper
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" gutterBottom>Reset Password</Typography>
            <form onSubmit={handleSubmit}>
              <Tooltip
                title={
                  <List sx={{ mt: 2 }}>
                    <ListItem>
                      <ListItemText
                        primary={`At least 8 characters long: ${checklist.length ? '✅' : '❌'}`}
                        primaryTypographyProps={{ sx: { color: checklist.length ? 'green' : 'red' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={`At least one uppercase letter: ${checklist.uppercase ? '✅' : '❌'}`}
                        primaryTypographyProps={{ sx: { color: checklist.uppercase ? 'green' : 'red' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={`At least one lowercase letter: ${checklist.lowercase ? '✅' : '❌'}`}
                        primaryTypographyProps={{ sx: { color: checklist.lowercase ? 'green' : 'red' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={`At least one number: ${checklist.number ? '✅' : '❌'}`}
                        primaryTypographyProps={{ sx: { color: checklist.number ? 'green' : 'red' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={`At least one special character: ${checklist.specialChar ? '✅' : '❌'}`}
                        primaryTypographyProps={{ sx: { color: checklist.specialChar ? 'green' : 'red' } }}
                      />
                    </ListItem>
                  </List>
                }
                open={isPasswordFocused}
                placement="right-start"
                arrow
              >
                <TextField
                  fullWidth
                  required
                  label="New Password"
                  variant="outlined"
                  type={passwordVisible ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handleChange(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()} // Prevents focus shift
                          edge="end"
                        >
                          {passwordVisible ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  style={{ marginBottom: '1rem' }}
                />
              </Tooltip>
              <TextField
                fullWidth
                required
                label="Confirm Password"
                variant="outlined"
                type={passwordVisible ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ marginBottom: '1rem' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        onMouseDown={(e) => e.preventDefault()} // Prevents focus shift
                        edge="end"
                      >
                        {passwordVisible ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading} // Disable button while loading
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
              </Button>
            </form>
            {errorMessage && (
              <Alert variant="filled" severity="error" style={{ marginTop: '1rem' }}>
                {errorMessage}
              </Alert>
            )}
            {successMessage && (
              <Alert variant="filled" severity="success" style={{ marginTop: '1rem' }}>
                {successMessage}
              </Alert>
            )}
            {message && <Typography variant="body1" style={{ marginTop: '1rem' }}>{message}</Typography>}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
