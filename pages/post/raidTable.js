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
import RaidForm from './projectRaid'; // Adjust the import path as needed

const RaidTable = ({ projectId }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRaid, SetSelectedRaid] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false); // State for confirmation dialog
  const [raidToDelete, SetRaidToDelete] = useState(null); // State for raid to delete
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });


  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/project/${projectId}/raid`);
      console.log(response.data);
      setRows(response.data.raids); // Assuming response has a 'stakeholders' array
      console.log(response.data.raids);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {  
    fetchData();
  }, [projectId]);

  const handleDeleteClick = (raid) => {
    SetRaidToDelete(raid);
    setConfirmationOpen(true); // Open confirmation dialog
  };

  const handleDelete = async () => {
    if (!raidToDelete) return;

    try {
      await axios.delete(`/api/project/${projectId}/raid/${raidToDelete._id}`);
      setRows((prevRows) => prevRows.filter((raid) => raid._id !== raidToDelete._id));
      setConfirmationOpen(false); // Close confirmation dialog
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleModalOpen = (raid) => {
    SetSelectedRaid(raid);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    SetSelectedRaid(null);
  };

  const handleConfirmationClose = () => {
    setConfirmationOpen(false);
    SetRaidToDelete(null);
  };
  console.log(selectedRaid);

  // Callback to trigger alerts
  const handleRaidChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchData(); // Refresh table after changes
  };

  // Close the alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Button variant="text" startIcon={<AddIcon />} onClick={() => handleModalOpen(null)}>Create Raid</Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
          <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
              <TableCell>Raid ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>assigned To</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((raid) => (
              <TableRow
                key={raid._id}
                hover
                onClick={() => handleModalOpen(raid)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{raid.raidId}</TableCell>
                <TableCell>{raid.description}</TableCell>
                <TableCell>{raid.assignedTo}</TableCell>
                <TableCell>{raid.type}</TableCell>
                <TableCell>{raid.status}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(raid);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for creating or updating a raid */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <RaidForm projectId={projectId} raid={selectedRaid} onClose={handleModalClose} onRaidChange={handleRaidChange} />
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
          <Typography>Are you sure you want to delete this raid?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmationClose}>Cancel</Button>
          <Button variant="contained" onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RaidTable;
