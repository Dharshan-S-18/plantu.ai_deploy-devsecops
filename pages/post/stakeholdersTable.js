import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar, 
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import StakeholderForm from './stakeholders'; // Adjust the import path as needed

const UserTable = ({ projectId }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false); // State for confirmation dialog
  const [stakeholderToDelete, setStakeholderToDelete] = useState(null); // State for stakeholder to delete
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  
  // Function to fetch the stakeholders list
  const fetchStakeholders = async () => {
    try {
      const response = await axios.get(`/api/project/${projectId}/stakeholders`);
      setRows(response.data.stakeholders); // Assuming response has a 'stakeholders' array
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchStakeholders(); // Initial fetch of stakeholders
  }, [projectId]);

  const handleDeleteClick = (stakeholder) => {
    setStakeholderToDelete(stakeholder);
    setConfirmationOpen(true); // Open confirmation dialog
  };

  const handleDelete = async () => {
    if (!stakeholderToDelete) return;

    try {
      await axios.delete(`/api/project/${projectId}/stakeholders/${stakeholderToDelete._id}`);
      setRows((prevRows) => prevRows.filter((row) => row._id !== stakeholderToDelete._id));
      setConfirmationOpen(false); // Close confirmation dialog
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleModalOpen = (stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedStakeholder(null);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    setStakeholderToDelete(null);
  };

  // Callback to trigger alerts
  const handleStakeholderChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchStakeholders(); // Refresh table after changes
  };

  // Close the alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Button variant="text" startIcon={<AddIcon />} onClick={() => handleModalOpen(null)}>Create Stakeholder</Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
          <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row._id}
                hover
                onClick={() => handleModalOpen(row)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.contact}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(row);
                    }}
                  >
                    <DeleteIcon color="error"/>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for creating or updating a stakeholder */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <StakeholderForm projectId={projectId} stakeholder={selectedStakeholder} onClose={handleModalClose} onStakeholderChange={handleStakeholderChange} />
      </Modal>

      {/* Snackbar for alerts */}
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert variant="filled" onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this stakeholder?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTable;
