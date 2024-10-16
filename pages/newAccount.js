import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Paper, Modal, Typography, CircularProgress, Alert, Snackbar, InputAdornment, IconButton, Button, TextField, Grid, Divider, Tooltip, List, ListItem, ListItemText, Box } from '@mui/material';
import plantoLogo from './post/image/plantoLogo2.png'
import BusinessIcon from '@mui/icons-material/Business';

const CreateAccount = () => {
  const { data: session } = useSession();
  console.log(session);

  const router = useRouter();
  const [error, setError] = useState('');
  const [organisationName, setOrganisationName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState('');
  const [subdomainError, setSubdomainError] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState(null); // null, true, or false
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  useEffect(() => {
    return () => {
      if (checkingSubdomain) {
        clearTimeout(checkingSubdomain);
      }
    };
  }, [checkingSubdomain]);

  // State for password validation checklist
  const [checklist, setChecklist] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });
  const [showChecklist, setShowChecklist] = useState(false); // State to control checklist visibility

  const handleOrganisationNameChange = (event) => setOrganisationName(event.target.value);
  const handleNameChange = (event) => setName(event.target.value);
  const handleEmailChange = (event) => setEmail(event.target.value);

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    updateChecklist(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    setPasswordError(event.target.value !== password);
  };

  const handleShowPassword = () => setShowPassword(!showPassword);

  // Function to update the checklist based on password validation
  const updateChecklist = (value) => {
    let newChecklist = { ...checklist };
    const lengthRegex = /.{8,}/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /\d/;

    newChecklist.length = lengthRegex.test(value);
    newChecklist.uppercase = uppercaseRegex.test(value);
    newChecklist.lowercase = lowercaseRegex.test(value);
    newChecklist.number = numberRegex.test(value);

    setChecklist(newChecklist);
  };

  // Function to handle field focus for showing/hiding the checklist
  const handleFieldFocus = (fieldName) => {
    if (fieldName === 'password') {
      setShowChecklist(true);
    }
  };

  // Function to handle field blur for hiding the checklist
  const handleFieldBlur = (fieldName) => {
    if (fieldName === 'password') {
      setShowChecklist(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!checklist.length || !checklist.uppercase || !checklist.lowercase || !checklist.number) {
      setError('Password does not meet requirements');
      setTimeout(() => setError(''), 2000);
      return;
    }

    if (password !== confirmPassword) {
      setSnackbarMessage('Passwords do not match!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Open the modal instead of submitting
    setIsModalOpen(true);
  };

  const handleSubdomainChange = async (e) => {
    const value = e.target.value.toLowerCase();
    setSubdomainInput(value);

    // Reset previous errors and availability
    setSubdomainError('');
    setSubdomainAvailable(null);
    setIsLoading(true);  // Add this line to set loading to true when checking

    // Validate subdomain format
    const subdomainRegex = /^[a-z][a-z]*$/;
    if (!subdomainRegex.test(value)) {
      setSubdomainError('Subdomain can only contain lowercase letters.');
      setIsLoading(false);  // Stop loading if validation fails
      return;
    }

    if (value.length < 3) {
      setSubdomainError('Subdomain must be at least 3 characters long');
      setIsLoading(false);  // Stop loading if validation fails
      return;
    }

    // Check availability after user stops typing (debounce)
    if (checkingSubdomain) {
      clearTimeout(checkingSubdomain);
    }

    setCheckingSubdomain(
      setTimeout(async () => {
        try {
          // Call the API to check subdomain availability
          const response = await fetch(`/api/auth/signup?subdomain=${value}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          const data = await response.json();
          console.log(response);

          if (response.status === 200) {
            // Subdomain is already taken
            setSubdomainError('Subdomain is already taken');
          }
          else if (response.status === 404) {
            // Subdomain is available
            setSubdomainAvailable(data.available);
          }
          else {
            console.error('Error checking subdomain availability:', data.error);
            setSubdomainError('Error checking subdomain availability');
          }

        } catch (error) {
          console.error('Error:', error);
          setSubdomainError('Error checking subdomain availability');
        } finally {
          setIsLoading(false);  // Stop loading after the check
        }
      }, 1000) // Debounce time in milliseconds
    );
  };

  const handleConfirmSubdomain = async () => {
    if (!subdomainInput) {
      setSubdomainError('Subdomain is required');
      return;
    }

    // Optionally, add validation for allowed characters in the subdomain
    const subdomainRegex = /^[a-z]+$/;
    if (!subdomainRegex.test(subdomainInput)) {
      setSubdomainError('Subdomain can only contain lowercase letters');
      return;
    }

    setIsLoading(true);
    setSubdomainError('');

    try {
      const portNumber = window.location.port;
      const requestBody = {
        organisationName,
        name,
        email,
        password,
        subdomain: subdomainInput,
      };

      // Add portNumber only in development mode
      if (process.env.NODE_ENV === 'development') {
        requestBody.portNumber = portNumber;
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage;
        switch (response.status) {
          case 409:
            errorMessage = data.errors ? Object.values(data.errors).join(', ') : data.error;
            break;
          case 404:
            errorMessage = data.error;
            break;
          default:
            errorMessage = 'Failed to create account';
            break;
        }
        throw new Error(errorMessage);
      }

      setSnackbarMessage('Account created successfully!');
      setOrganisationName('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSnackbarSeverity('success');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error.message);
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };

  const clearSubdomainValue = async () => {
    setSubdomainInput('');
    setIsModalOpen(false);
  }

  const handleSnackbarClose = async (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
    if (snackbarSeverity === 'success') {
      // If a session is present and the operation was successful, sign out the user
      if (session) {
        await signOut({ callbackUrl: '/' });
      } else {
        const portNumber = window.location.port;
        // Build the login URL based on the environment
        const loginUrl = process.env.NODE_ENV === 'development'
          ? `http://${subdomainInput}.localhost:${portNumber}`
          : `https://${subdomainInput}.plantu.ai`;

        // Redirect to the login page
        window.location.href = loginUrl;
      }
    }
    else if (snackbarSeverity === 'error') {
      // If a session is present and the operation was successful, sign out the user
      if (session) {
        await signOut({ callbackUrl: '/newAccount' });
      } else {
        // Redirect to the home page
        router.push('/newAccount');
      }
    }
  };

  return (
    <div className={`${styles.backgroundImage} ${styles.container}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '0 2vh' }}>
      <Paper elevation={24} style={{ padding: 30, width: '100%', maxWidth: 550, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 40, backgroundColor: 'rgba(230, 230, 230)' }}>
        <Typography variant="h4" style={{ textAlign: 'center' }} sx={{ my: 4, mt: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src={plantoLogo} alt="Company Logo" style={{ width: '20%', maxWidth: '120px', height: 'auto', marginRight: '10px' }} />
            Create Account
          </Box>
        </Typography>

        {error && <Alert sx={{ mt: -2, mb: 2 }} severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12}>
              <TextField
                sx={{ my: 0 }}
                label="Organisation Name"
                size="small"
                variant="outlined"
                value={organisationName}
                onChange={handleOrganisationNameChange}
                required
                fullWidth
                margin="normal"
                onBlur={() => handleFieldBlur('accountId')} // Hide checklist on blur
                onFocus={() => handleFieldFocus('accountId')} // Hide checklist on focus
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                sx={{ my: 0 }}
                label="Name"
                size="small"
                variant="outlined"
                value={name}
                onChange={handleNameChange}
                required
                fullWidth
                margin="normal"
                onBlur={() => handleFieldBlur('name')} // Hide checklist on blur
                onFocus={() => handleFieldFocus('name')} // Hide checklist on focus
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                sx={{ my: 0 }}
                label="Email"
                size="small"
                variant="outlined"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                fullWidth
                margin="normal"
                onBlur={() => handleFieldBlur('email')} // Hide checklist on blur
                onFocus={() => handleFieldFocus('email')} // Hide checklist on focus
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Tooltip
                title={
                  <List sx={{ mt: 2 }}>
                    <ListItem>
                      <ListItemText
                        primary={`At least 8 characters long: ${checklist.length ? '✅' : '❌'}`}
                        primaryTypographyProps={{ sx: { color: checklist.length ? '#99ff33' : 'white' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={`At least one uppercase letter: ${checklist.uppercase ? '✅' : '❌'}`}
                        primaryTypographyProps={{ sx: { color: checklist.uppercase ? '#99ff33' : 'white' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={`At least one lowercase letter: ${checklist.lowercase ? '✅' : '❌'}`}
                        primaryTypographyProps={{ sx: { color: checklist.lowercase ? '#99ff33' : 'white' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={`At least one number: ${checklist.number ? '✅' : '❌'}`}
                        primaryTypographyProps={{ sx: { color: checklist.number ? '#99ff33' : 'white' } }}
                      />
                    </ListItem>
                  </List>
                }
                open={showChecklist}
                disableFocusListener
                disableTouchListener
                arrow
              >
                <TextField
                  sx={{ my: 0 }}
                  label="Password"
                  size="small"
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                  margin="normal"
                  autoComplete="current-password"
                  onFocus={() => handleFieldFocus('password')}
                  onBlur={() => handleFieldBlur('password')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                sx={{ my: 0 }}
                error={passwordError}
                label="Confirm Password"
                size="small"
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                fullWidth
                margin="normal"
                helperText={passwordError ? "Passwords do not match" : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Button sx={{ mt: 2, my: 0 }} variant="contained" type="submit" disabled={isLoading} fullWidth>
                {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </Grid>

          </Grid>

          <Divider sx={{ my: 3, borderBottomWidth: '2px', textAlign: 'center' }}></Divider>

          <Grid>
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1, mb: 1 }}
              onClick={() => router.push('/info')}
            >
              BACK
            </Button>
          </Grid>

        </form>

      </Paper>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="subdomain-modal-title"
        aria-describedby="subdomain-modal-description"
      >
        <Paper
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: 30,
            width: '90%',
            maxWidth: 500,
            textAlign: 'center'
          }}
        >
          <Typography id="subdomain-modal-title" variant="h6" component="h2" gutterBottom>
            Please enter your desired account name
          </Typography>

          <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={1}>
            <Typography variant="body1">https://</Typography>
            <TextField
              label="Account Name"
              variant="outlined"
              size="small"
              value={subdomainInput}
              onChange={handleSubdomainChange}
              margin="normal"
              style={{ marginLeft: 8, marginRight: 8, minWidth: '100px', width: '40%' }}
              error={Boolean(subdomainError) || subdomainAvailable === false}
            />
            <Typography variant="body1">.plantu.ai</Typography>
          </Box>

          <Typography variant="caption" color={subdomainAvailable === false ? 'error' : 'textSecondary'}>
            {subdomainAvailable === false
              ? 'Subdomain is already taken'
              : `Your URL will be https://${subdomainInput || 'your-subdomain'}.plantu.ai`}
          </Typography>

          {subdomainError && (
            <Typography color="error" variant="body2">
              {subdomainError}
            </Typography>
          )}

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button variant="outlined" sx={{ ml: 8, mb: 2, mr: 1 }} onClick={clearSubdomainValue} color="primary">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubdomain}
              color="primary"
              variant="contained"
              sx={{ ml: 1, mb: 2, mr: 3 }}
              disabled={isLoading || !subdomainInput || !!subdomainError || subdomainAvailable === false}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Confirm'}
            </Button>
          </Box>

        </Paper>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert variant="filled" severity={snackbarSeverity} onClose={handleSnackbarClose}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </div>
  );

};

export default CreateAccount;