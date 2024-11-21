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
  Alert,
  Snackbar,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import RequirementForm from './Requirement'; // Adjust the import path as needed

const RaidTable = ({ projectId }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequirement, SetSelectedRequirement] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false); // State for confirmation dialog
  const [requirementToDelete, SetRaidToDelete] = useState(null); // State for requirement to delete
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });


  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/project/${projectId}/requirement`);
      console.log(response.data);
      setRows(response.data.requirements); // Assuming response has a 'stakeholders' array
      console.log(response.data.requirements);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => { 
    fetchData();
  }, [projectId]);

  const handleDeleteClick = (requirement) => {
    SetRaidToDelete(requirement);
    setConfirmationOpen(true); // Open confirmation dialog
  };

  const handleDelete = async () => {
    if (!requirementToDelete) return;

    try {
      await axios.delete(`/api/project/${projectId}/requirement/${requirementToDelete._id}`);
      setRows((prevRows) => prevRows.filter((requirement) => requirement._id !== requirementToDelete._id));
      setConfirmationOpen(false); // Close confirmation dialog
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleModalOpen = (requirement) => {
    SetSelectedRequirement(requirement);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    SetSelectedRequirement(null);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    SetRaidToDelete(null);
  };
  console.log(selectedRequirement);

  // Handle alert close
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  // Callback to trigger alert
  const handleRequirementChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchData(); // Refresh the table
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Button variant="text" startIcon={<AddIcon />} onClick={() => handleModalOpen(null)}>Create Requirement</Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
          <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
              <TableCell>Requirement ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>assigned To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((requirement) => (
              <TableRow
                key={requirement._id}
                hover
                onClick={() => handleModalOpen(requirement)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{requirement.requirementNo}</TableCell>
                <TableCell>{requirement.description}</TableCell>
                <TableCell>{requirement.assignedTo}</TableCell>
                <TableCell>{requirement.status}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(requirement);
                    }}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for creating or updating a requirement */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <RequirementForm projectId={projectId} requirementId={selectedRequirement} onClose={handleModalClose} onRequirementChange={handleRequirementChange}/>
      </Modal>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={handleConfirmationClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this requirement?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for alerts */}
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert variant="filled" onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default RaidTable;
