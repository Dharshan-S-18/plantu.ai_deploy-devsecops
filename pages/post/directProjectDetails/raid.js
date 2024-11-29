import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert, Typography, TextField, IconButton, InputAdornment  } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShieldIcon from '@mui/icons-material/Shield';
import Layout from '../../../components/Layout';
import RaidForm from '../projectRaid'; // Import your RaidForm component
import axios from 'axios';

const App = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [raids, setRaids] = useState([]);
  const [selectedRaid, setSelectedRaid] = useState(null);
  const [showProjectNameField, setShowProjectNameField] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [projectRaids, setProjectRaids] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [directRaids, setDirectRaids] = useState([]);

   // Fetch raids data from /api/projects
   const fetchProjectRaids = async () => {
    const accountId = sessionStorage.getItem('accountId');
    try {
      const response = await axios.get(`/api/project?accountId=${accountId}`);
      console.log('GET Projects:', response);

      // Restructure projects to include only relevant raids
      const filteredProjects = response.data.projects.map((project) => ({
        ...project,
        raids: project.raids.filter(
          (raid) => raid.createdBy === sessionStorage.getItem('email')
        ),
      }));

      setProjectRaids(filteredProjects); // Set state as an array of projects
    } catch (error) {
      console.error('Failed to fetch project raids:', error);
      setAlert({ open: true, message: 'Failed to fetch project raids', severity: 'error' });
    }
  };

  // Fetch raids when the component mounts
  const fetchRaids = async () => {
    try {
      const response = await axios.get('/api/directProjectApi/raid'); // Modify the endpoint if needed
      console.log('GET the Raid:',response);
      setDirectRaids(response.data.raids);
    } catch (error) {
      console.error('Failed to fetch raids', error);
      setAlert({ open: true, message: 'Failed to fetch raids', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchRaids();
    fetchProjectRaids();
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
    fetchProjectRaids();
  };

  const handleEditClick = (raid) => {
    setSelectedRaid(raid);
    setShowProjectNameField(true);
    setOpenDialog(true);
  };

  const handleEditClick1 = (projectId, raid) => {
    setSelectedProjectId(projectId);
    setSelectedRaid(raid);
    setShowProjectNameField(false);
    setOpenDialog(true);
  };

  // Handle search value change
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const filteredProjects = projectRaids
  .map((project) => ({
    ...project,
    raids: project.raids.filter((raid) =>
      (raid.raidId?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
      (raid.date?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
      (raid.status?.toString().toLowerCase() || '').includes(searchValue.toLowerCase()) || // Ensure `contact` is a string
      (raid.type?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
      (raid.assignedTo?.toLowerCase() || '').includes(searchValue.toLowerCase())
    ),
  }))
  .filter((project) => project.raids.length > 0); // Keep projects with matching raids

  const filteredDirectRaids = directRaids.filter(raid =>
    raid.raidId.toLowerCase().includes(searchValue.toLowerCase()) ||
    raid.date.toLowerCase().includes(searchValue.toLowerCase()) ||
    raid.status.toLowerCase().includes(searchValue.toLowerCase()) ||
    raid.type.toLowerCase().includes(searchValue.toLowerCase()) ||
    raid.assignedTo.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Layout>
      <Typography variant="h6" sx={{ fontSize: '20px', mt:-2 }}>Raids </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Chip to open the RaidForm dialog */}
        <Chip
          label="Add Raid"
          onClick={handleChipClick}
          icon={<ShieldIcon />}
          color="primary"
          sx={{ cursor: 'pointer', mb:2}}
        />

        {/* Search Icon and Input Field */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', mb:2 }}>
          {/* Search Icon Button */}
          {!searchExpanded && (
            <IconButton onClick={() => setSearchExpanded(true)} sx={{ backgroundColor: '#ffffff', borderRadius: '50%', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', padding: '10px' }}>
              <SearchIcon sx={{ color: '#3b82f6', fontSize: '24px' }} />
            </IconButton>
          )}

          {/* Search Field */}
          {searchExpanded && (
            <TextField
              variant="outlined"
              placeholder="Search Raid....."
              fullWidth
              autoFocus
              onChange={handleSearchChange}
              onBlur={() => setSearchExpanded(false)} // Close the field on blur
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#3b82f6' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                borderRadius: '50px',
                backgroundColor: '#ffffff',
                width: '300px',
                transition: 'all 0.3s ease',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px',
                  paddingLeft: '8px',
                },
                '& input': {
                  padding: '10px',
                },
              }}
            />
          )}
        </Box>
        </Box>

        {/* Table to display raids from /api/projects */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
              <TableCell>Raid No</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Assigne</TableCell>
              <TableCell>Project</TableCell>
              {/* <TableCell>Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) =>
              project.raids.map((raid) => (
                <TableRow
                  key={raid._id}
                  hover
                  onClick={() => handleEditClick1(project._id, raid)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{raid.raidId}</TableCell>
                  <TableCell>{raid.date}</TableCell>
                  <TableCell>{raid.status}</TableCell>
                  <TableCell>{raid.type}</TableCell>
                  <TableCell>{raid.assignedTo}</TableCell>
                  <TableCell>{project.projectName}</TableCell>
                  {/* <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick1(project._id, raid);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
      </TableContainer>


        {/* Table to display the raid list */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            {/* <TableHead>
              <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
                <TableCell>Raid No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Assigne</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead> */}
            <TableBody>
              {filteredDirectRaids.map((raid) => (
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
                  <TableCell>{"N/A"}</TableCell>
                  {/* <TableCell>
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
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog for creating or editing a raid */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{selectedRaid ? 'Edit Raid' : 'Add Raid'}</DialogTitle>
          <DialogContent>
            <RaidForm
              raid={selectedRaid} // Pass selectedRaid to pre-fill the form
              projectId={selectedProjectId}
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
      
    </Layout>
  );
};

export default App;
