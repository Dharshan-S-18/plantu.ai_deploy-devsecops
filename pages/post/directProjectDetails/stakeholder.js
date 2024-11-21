import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from '@mui/material';
import Layout from '../../../components/Layout';
import StakeholderForm from '../stakeholders'; // Import your StakeholderForm component
import axios from 'axios';

const App = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [stakeholders, setStakeholders] = useState([]);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [showProjectNameField, setShowProjectNameField] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch stakeholders when the component mounts
  const fetchStakeholders = async () => {
    try {
      const response = await axios.get('/api/directProjectApi/stakeholder'); // Modify the endpoint if needed
      console.log('GET the Stakeholder:',response);
      setStakeholders(response.data.stakeholders);
    } catch (error) {
      console.error('Failed to fetch stakeholders', error);
      setAlert({ open: true, message: 'Failed to fetch stakeholders', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchStakeholders();
  }, []);

  // Handle the click on the chip to open the form dialog
  const handleChipClick = () => {
    setShowProjectNameField(true); // Show Project Name field when chip is clicked
    setOpenDialog(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStakeholder(null); // Reset selected stakeholder when dialog is closed
    setShowProjectNameField(false);
  };

  const handleStakeholderChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchStakeholders(); // Refresh stakeholder list after add/edit
  };

  const handleEditClick = (stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setShowProjectNameField(true);
    setOpenDialog(true);
  };

  return (
    <Layout>
      <Box>
        {/* Chip to open the StakeholderForm dialog */}
        <Chip
          label="Add Stakeholder"
          onClick={handleChipClick}
          color="primary"
          sx={{ cursor: 'pointer', margin: 2 }}
        />

        {/* Table to display the stakeholder list */}
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
              {stakeholders.map((stakeholder) => (
                <TableRow
                  key={stakeholder._id}
                  hover
                  onClick={() => handleEditClick(stakeholder)} // Open dialog to edit
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{stakeholder.name}</TableCell>
                  <TableCell>{stakeholder.email}</TableCell>
                  <TableCell>{stakeholder.contact}</TableCell>
                  <TableCell>{stakeholder.type}</TableCell>
                  <TableCell>{stakeholder.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click from triggering edit
                        handleEditClick(stakeholder);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog for creating or editing a stakeholder */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{selectedStakeholder ? 'Edit Stakeholder' : 'Add Stakeholder'}</DialogTitle>
          <DialogContent>
            <StakeholderForm
              stakeholder={selectedStakeholder} // Pass selectedStakeholder to pre-fill the form
              onClose={handleCloseDialog}
              onStakeholderChange={handleStakeholderChange}
              showProjectNameField={showProjectNameField}
            />
          </DialogContent>
        </Dialog>

        {/* Snackbar for displaying status messages */}
        <Snackbar open={alert.open} autoHideDuration={6000} onClose={() => setAlert({ ...alert, open: false })}>
          <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default App;
