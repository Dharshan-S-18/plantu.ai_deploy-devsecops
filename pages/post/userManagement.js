import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
    Avatar,
    IconButton,
    Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSession } from 'next-auth/react';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import Layout from '../../components/Layout';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';

const AgentManagement = () => {
    const [open, setOpen] = useState(false);
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [agentName, setAgentName] = useState('');
    const [agentEmail, setAgentEmail] = useState('');
    const [accountId, setAccountId] = useState('');
    const [orgName, setOrgName] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [agents, setAgents] = useState([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState(null);
    const [loadingReset, setLoadingReset] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationType, setConfirmationType] = useState('');
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [resetConfirmationOpen, setResetConfirmationOpen] = useState(false); // State for reset confirmation

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.name) {
            const storedAccountId = sessionStorage.getItem('accountId');
            setAccountId(storedAccountId);
            setOrgName(session.user.organizationName);

            if (storedAccountId) {
                fetchAgents(storedAccountId);
            }
        }
    }, [session, status]);

    const fetchAgents = async (accountId) => {
        const hostname = window.location.hostname;
        const extractedSubdomain = hostname.split('.')[0];
        
        try {
            const response = await fetch(`/api/auth/getAgents?accountId=${accountId}&subdomain=${extractedSubdomain}`);
            const data = await response.json();

            if (response.ok) {
                setAgents(data.map((agent) => ({
                    id: agent._id,
                    name: agent.name,
                    email: agent.email,
                    phone: agent.phone || 'N/A',
                    role: agent.role || 'N/A',
                })));
            } else {
                throw new Error(data.error || 'Failed to fetch agents');
            }
        } catch (error) {
            console.error('Error fetching agents:', error.message);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleInviteAgent = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setAgentName('');
        setAgentEmail('');
        setOpen(false);
    };

    const handleAddAgent = async () => {
        if (!agentName || !agentEmail) {
            setSnackbarMessage('Please fill all the required fields');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        setIsLoading(true);
        const portNumber = window.location.port;
        const hostname = window.location.hostname;
        const extractedSubdomain = hostname.split('.')[0];

        try {
            const response = await fetch('/api/auth/addAgent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentName, agentEmail, accountId, orgName, subdomain: extractedSubdomain, portNumber }),
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
            setSnackbarSeverity('success');
            setAgentName('');
            setAgentEmail('');
            fetchAgents(accountId);
            setOpen(false);
        } catch (error) {
            console.error('Error:', error.message);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
        } finally {
            setIsLoading(false);
            setSnackbarOpen(true);
        }
    };

    const handleDeleteAgent = (id) => {
        setSelectedAgentId(id);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`/api/auth/removeAgent?id=${selectedAgentId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete agent');
            }

            setSnackbarMessage('Agent deleted successfully!');
            setSnackbarSeverity('success');
            fetchAgents(accountId);
        } catch (error) {
            console.error('Error deleting agent:', error.message);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
        } finally {
            setIsLoading(false);
            setSnackbarOpen(true);
            setDeleteOpen(false);
            setSelectedAgentId(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteOpen(false);
        setSelectedAgentId(null);
    };

    const handleResetPassword = (agent) => {
        setSelectedAgent(agent);
        setResetConfirmationOpen(true); // Open reset confirmation dialog
    };

    const handleConfirmResetPassword = async () => {
        setLoadingReset(true);
        const portNumber = window.location.port;
        const hostname = window.location.hostname;
        const extractedSubdomain = hostname.split('.')[0];

        try {
            const response = await fetch('/api/auth/addAgent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentName: selectedAgent.name,
                    agentEmail: selectedAgent.email,
                    accountId,
                    orgName,
                    subdomain: extractedSubdomain,
                    portNumber,
                    resetPassword: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset agent password');
            }

            setSnackbarMessage(`Password reset email sent to ${selectedAgent.email}.`);
            setSnackbarSeverity('success');
        } catch (error) {
            console.error('Error resetting password:', error.message);
            setSnackbarMessage(error.message);
            setSnackbarSeverity('error');
        } finally {
            setLoadingReset(false);
            setResetConfirmationOpen(false);
            setSnackbarOpen(true);
        }
    };

    const handleCancelResetPassword = () => {
        setResetConfirmationOpen(false);
        setSelectedAgent(null);
    };

    const handleRoleChange = (agent, type) => {
        setSelectedAgent(agent);
        setConfirmationType(type);
        setConfirmationOpen(true);
    };

    const handleConfirmRoleChange = async () => {
        const url = `/api/auth/removeAgent?id=${selectedAgent.id}`;
        const newRole = confirmationType === 'Make as Admin' ? 'Admin' : 'User';

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                throw new Error(`Failed to change role to ${newRole}`);
            }

            setSnackbarMessage(`User role updated successfully`);
            setSnackbarSeverity('success');
            fetchAgents(accountId);
        } catch (error) {
            console.error(`Error updating user role:`, error.message);
            setSnackbarMessage(`Error: ${error.message}`);
            setSnackbarSeverity('error');
        } finally {
            setConfirmationOpen(false);
            setSnackbarOpen(true);
        }
    };

    const handleCancelRoleChange = () => {
        setConfirmationOpen(false);
        setSelectedAgent(null);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbarOpen(false);
    };

    const columns = [
        {
            field: 'avatar',
            headerName: 'Avatar',
            width: 80,
            renderCell: (params) => (
                <Avatar sx={{ mt: 0.5, bgcolor: '#00264d' }}>{params.row.name[0]}</Avatar>
            ),
        },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'phone', headerName: 'Phone', width: 150 },
        { field: 'role', headerName: 'Role', width: 100 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                // Check if the current row's email matches the logged-in user's email
                params.row.email === session?.user?.email ? (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1.8, ml: 1 }}>You</Typography>
                ) : (
                    <Box>
                        {params.row.role === 'Admin' ? (
                            <Tooltip title="Make as User" placement="bottom">
                                <IconButton
                                    aria-label="make-as-user"
                                    color="primary"
                                    onClick={() => handleRoleChange(params.row, 'Make as User')}
                                >
                                    <PersonOutlineOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        ) : (
                            <Tooltip title="Make as Admin" placement="bottom">
                                <IconButton
                                    aria-label="make-as-admin"
                                    color="primary"
                                    onClick={() => handleRoleChange(params.row, 'Make as Admin')}
                                >
                                    <ManageAccountsOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title="Delete Agent" placement="bottom">
                            <IconButton
                                aria-label="delete"
                                color="error"
                                onClick={() => handleDeleteAgent(params.row.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Reset Password of Agent" placement="bottom">
                            <IconButton
                                aria-label="reset-password"
                                color="secondary"
                                onClick={() => handleResetPassword(params.row)}
                            >
                                <LockResetIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )
            ),
        },
    ];


    return (
        <Layout>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 3, width: '100%' }}>
                <Button startIcon={<PersonAddAltOutlinedIcon />} variant="contained" color="primary" onClick={handleInviteAgent} sx={{ marginBottom: 2, backgroundColor: '#0077b3' }}>
                    Invite Agent
                </Button>

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle sx={{ bgcolor: '#00264d', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>Invite Agent</DialogTitle>
                    <DialogContent sx={{ mt: 3 }}>
                        <TextField autoFocus margin="dense" label="Name" type="text" fullWidth value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                        <TextField margin="dense" label="Email" type="email" fullWidth value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} />
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose} color="primary" variant="outlined" disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddAgent} color="primary" variant="contained" sx={{ backgroundColor: '#0077b3' }} disabled={isLoading}>
                            {isLoading ? <CircularProgress size={24} /> : 'Add Agent'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Paper elevation={3} sx={{ width: '70%', mt: 0, minWidth: '70%' }}>
                    <DataGrid
                        rows={agents}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        checkboxSelection
                        autoHeight
                    />
                </Paper>

                <Dialog open={deleteOpen} onClose={handleCancelDelete}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this agent?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelDelete} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDelete} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={confirmationOpen} onClose={handleCancelRoleChange}>
                    <DialogTitle>{confirmationType}</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to {confirmationType.toLowerCase()} "{selectedAgent?.name}"?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelRoleChange} color="primary">
                            No
                        </Button>
                        <Button onClick={handleConfirmRoleChange} color="primary">
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={resetConfirmationOpen} onClose={handleCancelResetPassword}>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to reset the password for "{selectedAgent?.name}"?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelResetPassword} color="primary">
                            No
                        </Button>
                        <Button onClick={handleConfirmResetPassword} color="primary">
                            Yes
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={loadingReset} PaperProps={{ style: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100px', height: '100px' } }}>
                    <CircularProgress size={68} />
                </Dialog>

                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert variant="filled" severity={snackbarSeverity} onClose={handleSnackbarClose}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Layout>
    );
};

export default AgentManagement;