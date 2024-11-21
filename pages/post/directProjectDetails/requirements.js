import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from '@mui/material';
import Layout from '../../../components/Layout';
import RequirementForm from '../Requirement'; // Import your RequirementForm component
import axios from 'axios';

const App = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showProjectNameField, setShowProjectNameField] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch requirements when the component mounts
  const fetchRequirements = async () => {
    try {
      const response = await axios.get('/api/directProjectApi/requirement'); // Modify the endpoint if needed
      console.log('GET the Requirement:',response);
      setRequirements(response.data.requirements);
    } catch (error) {
      console.error('Failed to fetch requirements', error);
      setAlert({ open: true, message: 'Failed to fetch requirements', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // Handle the click on the chip to open the form dialog
  const handleChipClick = () => {
    setShowProjectNameField(true); // Show Project Name field when chip is clicked
    setOpenDialog(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequirement(null); // Reset selected requirement when dialog is closed
    setShowProjectNameField(false);
  };

  const handleRequriementChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchRequirements(); // Refresh requirement list after add/edit
  };

  const handleEditClick = (requirement) => {
    setSelectedRequirement(requirement);
    setShowProjectNameField(true);
    setOpenDialog(true);
  };

  return (
    <Layout>
      <Box>
        {/* Chip to open the RequirementForm dialog */}
        <Chip
          label="Add Requirement"
          onClick={handleChipClick}
          color="primary"
          sx={{ cursor: 'pointer', margin: 2 }}
        />

        {/* Table to display the requirement list */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
                <TableCell>Requirement No</TableCell>
                <TableCell>Short Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigne</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requirements.map((requirement) => (
                <TableRow
                  key={requirement._id}
                  hover
                  onClick={() => handleEditClick(requirement)} // Open dialog to edit
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{requirement.requirementNo}</TableCell>
                  <TableCell>{requirement.shortDescription}</TableCell>
                  <TableCell>{requirement.status}</TableCell>
                  <TableCell>{requirement.assignedTo}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click from triggering edit
                        handleEditClick(requirement);
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
          <DialogTitle>{selectedRequirement ? 'Edit Requirement' : 'Add Requirement'}</DialogTitle>
          <DialogContent>
            <RequirementForm
              requirementId={selectedRequirement} // Pass selectedRequirement to pre-fill the form
              onClose={handleCloseDialog}
              onRequirementChange={handleRequriementChange}
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
