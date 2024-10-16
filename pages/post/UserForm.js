import React, { useState } from 'react';
import styles from '../../styles/Home.module.css';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Paper, Typography, Snackbar, Alert } from '@mui/material';

const UserForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: ''
    });

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                setFormData({ username: '', email: '', password: '', role: ''});
                setSnackbarMessage('User created successfully!');
                setSnackbarSeverity('success');
                setTimeout(() => setSuccess(''), 10000); // 10 seconds
            } else {
                setSnackbarMessage(data.message || 'Failed to create user.');
                setSnackbarSeverity('error');
            }
        } catch (error) {
            setSnackbarMessage('An unexpected error occurred.');
            setSnackbarSeverity('error');
        } finally {
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <div className={`${styles.backgroundImage} ${styles.container}`}>
            <Paper
                elevation={24}
                sx={{
                    my: 4,
                    p: 2,
                    px: 4, // Add padding on the left and right sides
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 10,
                    width: '600px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background color
                }}
            >
                <Typography variant="h6" gutterBottom>
                    User Form
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" color="primary">
                        Submit
                    </Button>
                </form>
            </Paper>
            {/* Snackbar for notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UserForm;
