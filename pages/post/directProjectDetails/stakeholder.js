import React, { useState, useEffect } from 'react';
import { Dialog, Typography, DialogContent, DialogTitle, Button, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert, TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import Layout from '../../../components/Layout';
import StakeholderForm from '../stakeholders'; // Import your StakeholderForm component
import axios from 'axios';

const App = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [projectStakeholders, setProjectStakeholders] = useState([]);  // Store project stakeholders separately
  const [directStakeholders, setDirectStakeholders] = useState([]);  // Store direct stakeholders separately
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [showProjectNameField, setShowProjectNameField] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [searchValue, setSearchValue] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Fetch stakeholders data from /api/projects
  const fetchProjectStakeholders = async () => {
    const accountId = sessionStorage.getItem('accountId');
    try {
      const response = await axios.get(`/api/project?accountId=${accountId}`);
      console.log('GET Projects:', response);

      // Restructure projects to include only relevant stakeholders
      const filteredProjects = response.data.projects.map((project) => ({
        ...project,
        stakeholders: project.stakeholders.filter(
          (stakeholder) => stakeholder.createdBy === sessionStorage.getItem('email')
        ),
      }));

      setProjectStakeholders(filteredProjects); // Set state as an array of projects
    } catch (error) {
      console.error('Failed to fetch project stakeholders:', error);
      setAlert({ open: true, message: 'Failed to fetch project stakeholders', severity: 'error' });
    }
  };


  // Fetch stakeholders data from /api/directProjectApi/stakeholder
  const fetchDirectStakeholders = async () => {
    try {
      const response = await axios.get('/api/directProjectApi/stakeholder');
      console.log('GET Direct Stakeholders:', response);

      // Update state with direct stakeholders
      setDirectStakeholders(response.data.stakeholders);
    } catch (error) {
      console.error('Failed to fetch direct stakeholders:', error);
      setAlert({ open: true, message: 'Failed to fetch direct stakeholders', severity: 'error' });
    }
  };

  // Call both APIs separately when the component mounts
  useEffect(() => {
    fetchProjectStakeholders(); // Fetch project stakeholders
    fetchDirectStakeholders(); // Fetch direct project stakeholders
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
    fetchProjectStakeholders();  // Refresh project stakeholders list after add/edit
    fetchDirectStakeholders();   // Refresh direct project stakeholders list after add/edit
  };

  const handleEditClick = (stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setShowProjectNameField(true);
    setOpenDialog(true);
    console.log(stakeholder);
  };

  const handleEditClick1 = (projectId, stakeholder) => {
    setSelectedProjectId(projectId);
    setSelectedStakeholder(stakeholder);
    setOpenDialog(true); // Keep dialog closed as per the requirement
    setShowProjectNameField(false);
    console.log(projectId, stakeholder);
  };


  // Handle search value change
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Filter stakeholders based on search value
  const filteredProjects = projectStakeholders
  .map((project) => ({
    ...project,
    stakeholders: project.stakeholders.filter((stakeholder) =>
      (stakeholder.name?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
      (stakeholder.email?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
      (stakeholder.contact?.toString().toLowerCase() || '').includes(searchValue.toLowerCase()) || // Ensure `contact` is a string
      (stakeholder.type?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
      (stakeholder.role?.toLowerCase() || '').includes(searchValue.toLowerCase())
    ),
  }))
  .filter((project) => project.stakeholders.length > 0); // Keep projects with matching stakeholders

  const filteredDirectStakeholders = directStakeholders.filter(stakeholder =>
    stakeholder.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    stakeholder.email.toLowerCase().includes(searchValue.toLowerCase()) ||
    stakeholder.contact.toLowerCase().includes(searchValue.toLowerCase()) ||
    stakeholder.type.toLowerCase().includes(searchValue.toLowerCase()) ||
    stakeholder.role.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Layout>
      <Typography variant="h4" sx={{ fontSize: '20px', mt:-2 }}>Stakeholder</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Chip to open the StakeholderForm dialog */}
        <Chip
          label="Add Stakeholder"
          icon={<PeopleIcon />}
          onClick={handleChipClick}
          color="primary"
          sx={{ cursor: 'pointer', mb:2 }}
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
              placeholder="Search Stakeholder....."
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

      {/* Table to display stakeholders from /api/projects */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Project</TableCell>
              {/* <TableCell>Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) =>
              project.stakeholders.map((stakeholder) => (
                <TableRow
                  key={stakeholder._id}
                  hover
                  onClick={() => handleEditClick1(project._id, stakeholder)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{stakeholder.name}</TableCell>
                  <TableCell>{stakeholder.email}</TableCell>
                  <TableCell>{stakeholder.contact}</TableCell>
                  <TableCell>{stakeholder.type}</TableCell>
                  <TableCell>{stakeholder.role}</TableCell>
                  <TableCell>{project.projectName}</TableCell>
                  {/* <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick1(project._id, stakeholder);
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

      {/* Table to display stakeholders from /api/directProjectApi/stakeholder */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          {/* <TableHead>
            <TableRow >
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead> */}
          <TableBody>
            {filteredDirectStakeholders.map((stakeholder) => (
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
                <TableCell>{"N/A"}</TableCell>
                {/* <TableCell>
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
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Stakeholder Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selectedStakeholder ? 'Edit Stakeholder' : 'Add Stakeholder'}</DialogTitle>
        <DialogContent>
          <StakeholderForm
            stakeholder={selectedStakeholder} // Pass selectedStakeholder to pre-fill the form
            projectId={selectedProjectId}
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
    </Layout>
  );
};

export default App;
