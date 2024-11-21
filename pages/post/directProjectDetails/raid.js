import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from '@mui/material';
import Layout from '../../../components/Layout';
import RaidForm from '../projectRaid'; // Import your RaidForm component
import axios from 'axios';

const App = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [raids, setRaids] = useState([]);
  const [selectedRaid, setSelectedRaid] = useState(null);
  const [showProjectNameField, setShowProjectNameField] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  // Fetch raids when the component mounts
  const fetchRaids = async () => {
    try {
      const response = await axios.get('/api/directProjectApi/raid'); // Modify the endpoint if needed
      console.log('GET the Raid:',response);
      setRaids(response.data.raids);
    } catch (error) {
      console.error('Failed to fetch raids', error);
      setAlert({ open: true, message: 'Failed to fetch raids', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchRaids();
  }, []);

  // Handle the click on the chip to open the form dialog
  const handleChipClick = () => {
    setShowProjectNameField(true); // Show Project Name field when chip is clicked
    setOpenDialog(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRaid(null); // Reset selected raid when dialog is closed
    setShowProjectNameField(false);
  };

  const handleRaidChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchRaids(); // Refresh raid list after add/edit
  };

  const handleEditClick = (raid) => {
    setSelectedRaid(raid);
    setShowProjectNameField(true);
    setOpenDialog(true);
  };

  return (
    <Layout>
      <Box>
        {/* Chip to open the RaidForm dialog */}
        <Chip
          label="Add Raid"
          onClick={handleChipClick}
          color="primary"
          sx={{ cursor: 'pointer', margin: 2 }}
        />

        {/* Table to display the raid list */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
                <TableCell>Raid No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Assigne</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {raids.map((raid) => (
                <TableRow
                  key={raid._id}
                  hover
                  onClick={() => handleEditClick(raid)} // Open dialog to edit
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{raid.raidId}</TableCell>
                  <TableCell>{raid.date}</TableCell>
                  <TableCell>{raid.status}</TableCell>
                  <TableCell>{raid.type}</TableCell>
                  <TableCell>{raid.assignedTo}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click from triggering edit
                        handleEditClick(raid);
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
          <DialogTitle>{selectedRaid ? 'Edit Raid' : 'Add Raid'}</DialogTitle>
          <DialogContent>
            <RaidForm
              raid={selectedRaid} // Pass selectedRaid to pre-fill the form
              onClose={handleCloseDialog}
              onRaidChange={handleRaidChange}
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
