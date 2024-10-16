import { useState } from 'react';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { Grid, Container, Box, Toolbar, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useRouter } from 'next/router';
import plantoLogo from './post/image/plantoLogo2.png';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to handle the form submission
  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setLoading(true); 
    setErrorMessage('');
    setSuccessMessage('');

    const portNumber = window.location.port;
    const hostname = window.location.hostname;
    const extractedSubdomain = hostname.split('.')[0];

    try {

      let response;
      if(process.env.NODE_ENV === 'development'){
        response = await axios.post('/api/auth/addAgent', { agentEmail: email, subdomain: extractedSubdomain, portNumber, resetPassword: true });
      }else{
        response = await axios.post('/api/auth/addAgent', { agentEmail: email, subdomain: extractedSubdomain, resetPassword: true });
      }
      
      setSuccessMessage('A reset link has been sent to your email address.');
      setEmail(''); // Clear the email field
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className={styles.backgroundImage}>
      <Grid container style={{ height: '100vh' }}>
        {/* Left Section with background image */}
        <Grid item xs={5} sm={6} md={8} lg={9} style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        </Grid>

        {/* Right Section with form */}
        <Grid item xs={7} sm={6} md={4} lg={3} style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f8ff'
        }}>
          <Container maxWidth="sm">
            {/* Logo */}
            <Toolbar style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <Image src={plantoLogo} alt="Plantu.ai Logo" style={{ width: '40%', maxWidth: '300px', height: 'auto' }} />
            </Toolbar>

            {/* Title */}
            <Typography variant="h5" align="center" gutterBottom sx={{ mt: 2 }}>
              Forgot the password?
            </Typography>

            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              Oh ho! Don’t worry, we’re here to help you out. Just enter your email below and we’ll send you a link to reset your password.
            </Typography>

            {/* Success / Error Messages */}
            {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}

            {/* Email Input Form */}
            <form onSubmit={handlePasswordReset}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
                <AccountCircle sx={{ color: '#404040', mr: 1, my: 0.5 }} />
                <TextField
                  required
                  label="Email"
                  fullWidth
                  variant="standard"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3, mb: 2.5, backgroundColor: '#5A20CB', '&:hover': { backgroundColor: '#3a138b' } }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
              </Button>

              <Button
                variant="text"
                fullWidth
                sx={{ mb: 1, color: '#000000', mt: 1 }}
                onClick={() => router.push('/')}
              >
                Back to Login
              </Button>
            </form>
          </Container>
        </Grid>
      </Grid>
    </div>
  );
}
