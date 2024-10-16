import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Container, TextField, Button, Typography, Box, Alert, Toolbar, IconButton, InputAdornment, Divider, Grid, Paper, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import logoImage from './post/image/Gmail_Logo.png';
import microsoft from './post/image/Microsoft.png';
import plantoLogo from './post/image/plantuLogo.png'
import Animations from './animation/logoAnimation';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';

const Login = () => {
    const [accountId, setAccountId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false); // New state variable
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false); // State to control animation display
    const { data: session, status } = useSession();
    console.log(session, status)

    useEffect(() => {
        //--------------Function to check session of logged in User-------------
        const checkUserInDB = async () => {
            if (status === 'authenticated') {
                const response = await fetch('/api/auth/clientLogin', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: session.user.email })
                });

                if (response.ok) {
                    const data = await response.json();
                    sessionStorage.setItem('accountId', data.accountId);
                    router.push('/post/home');
                } else {
                    const result = await response.json();
                    setError(result.message || 'Failed to log in');
                    // await delay('3000')
                    await signOut();
                }
            }
        };
        // checkUserInDB();
    }, [status, router, session]);

    useEffect(() => {
        const hostname = window.location.hostname;
        const extractedSubdomain = hostname.split('.')[0];
        setSubdomain(extractedSubdomain);
        let timer;
        if (errorVisible) {
            timer = setTimeout(() => {
                setError('');
                setErrorVisible(false);
            }, 3000); // 3000ms = 3 seconds
        }
        return () => clearTimeout(timer);
    }, [errorVisible]);

    //---------Function for normal login----------------------------------
    const handleLogin = async (e) => {
        e.preventDefault();

        // Check if all required fields are filled
        if (!email || !password) {
            setError('Please enter all required fields.');
            setErrorVisible(true); // Show the error message
            return; // Abort the login process if any field is empty
        }

        setIsLoading(true);

        try {
            const response = await signIn("credentials", {
                subdomain, email, password, redirect: false
            });

            if (response.ok === false) {
                setError(response.error);
                setErrorVisible(true); // Show the error message
            }
            else {
                // sessionStorage.setItem('accountId', accountId);
                // sessionStorage.setItem('email', email);
                setShowAnimation(true);

                // Wait for a short period to show the animation
                setTimeout(() => {
                    router.reload();
                }, 2000);
            }
        } catch (error) {
            console.log(error);
            setError('Account does not exist or entered credentials are wrong.');
            setErrorVisible(true); // Show the error message
        } finally {
            setIsLoading(false);
        }
    };

    //-----------Function for password toggle--------------------------
    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    //-----------Function for create user account----------------------
    const handleCreateAccount = () => {
        router.push('/newAccount');
    };

    if (showAnimation) {
        return <Animations />; // Show only the animation when the state is true
    }

    return (
        <div className={styles.backgroundImage}>
    <Grid container style={{ height: '100vh' }}>
        <Grid item xs={5} sm={6} md={8} lg={9} style={{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
        </Grid>

        <Grid item xs={7} sm={6} md={4} lg={3} style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f8ff'
        }}>
            <Container maxWidth="sm">
                <Toolbar style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    <Image src={plantoLogo} alt="Plantu.ai Logo" style={{ width: '90%', maxWidth: '300px', height: 'auto' }} />
                </Toolbar>

                <Typography variant="h5" align="center" gutterBottom sx={{ mt: 2 }}>
                    Hello Again!
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <form>
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

                    <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: 1 }}>
                        <LockIcon sx={{ color: '#404040', mr: 1, my: 0.5 }} />
                        <TextField
                            required
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            variant="standard"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={togglePasswordVisibility} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mt: 2 }}
                        />
                    </Box>

                    <Button
                        onClick={handleLogin}
                        variant="contained"
                        fullWidth
                        sx={{ mt: 5, mb: 2.5, backgroundColor: '#5A20CB', '&:hover': { backgroundColor: '#3a138b' } }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Log In'}
                    </Button>
                    <Button
                        variant="text"
                        fullWidth
                        sx={{ mb: 1, color: '#000000', mt: 1 }}
                        onClick={() => router.push('/forgot-password')}
                    >
                        Forgot Password?
                    </Button>
                </form>
            </Container>
        </Grid>
    </Grid>
</div>

    );
};

export default Login;