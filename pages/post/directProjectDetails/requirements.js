import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, IconButton, TextField, InputAdornment ,Chip, Table, TableBody, Typography, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert } from '@mui/material';
import Layout from '../../../components/Layout';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SearchIcon from '@mui/icons-material/Search';
import RequirementForm from '../Requirement'; // Import your RequirementForm component
import axios from 'axios';

const App = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showProjectNameField, setShowProjectNameField] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [projectRequirements, setProjectRequirements] = useState([]);
  const [directRequirements, setDirectRequirements] = useState([]);
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
        requirements: project.requirements.filter(
          (requirement) => requirement.createdBy === sessionStorage.getItem('email')
        ),
      }));

      setProjectRequirements(filteredProjects); // Set state as an array of projects
    } catch (error) {
      console.error('Failed to fetch project stakeholders:', error);
      setAlert({ open: true, message: 'Failed to fetch project stakeholders', severity: 'error' });
    }
  };

  // Fetch requirements when the component mounts
  const fetchRequirements = async () => {
    try {
      const response = await axios.get('/api/directProjectApi/requirement'); // Modify the endpoint if needed
      console.log('GET the Requirement:',response);
      setDirectRequirements(response.data.requirements);
    } catch (error) {
      console.error('Failed to fetch requirements', error);
      setAlert({ open: true, message: 'Failed to fetch requirements', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchRequirements();
    fetchProjectStakeholders();
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
    fetchProjectStakeholders();
  };

  const handleEditClick = (requirement) => {
    setSelectedRequirement(requirement);
    setShowProjectNameField(true);
    setOpenDialog(true);
  };

  const handleEditClick1 = (projectId, requirement) => {
    setSelectedProjectId(projectId);
    setSelectedRequirement(requirement);
    setShowProjectNameField(false);
    setOpenDialog(true);
  };

   // Handle search value change
   const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Filter stakeholders based on search value
  const filteredProjects = projectRequirements
  .map((project) => ({
    ...project,
    requirements: project.requirements.filter((requirement) =>
      (requirement.requirementNo?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
      (requirement.shortDescription?.toLowerCase() || '').includes(searchValue.toLowerCase()) ||
      (requirement.status?.toString().toLowerCase() || '').includes(searchValue.toLowerCase()) || // Ensure `contact` is a string
      (requirement.assignedTo?.toLowerCase() || '').includes(searchValue.toLowerCase()) 
      
    ),
  }))
  .filter((project) => project.requirements.length > 0); // Keep projects with matching stakeholders

  const filteredDirectStakeholders = directRequirements.filter(requirement =>
    requirement.requirementNo.toLowerCase().includes(searchValue.toLowerCase()) ||
    requirement.shortDescription.toLowerCase().includes(searchValue.toLowerCase()) ||
    requirement.status.toLowerCase().includes(searchValue.toLowerCase()) ||
    requirement.assignedTo.toLowerCase().includes(searchValue.toLowerCase()) 
    
  );

  return (
    <Layout>
      <Typography variant="h6" sx={{ fontSize: '20px', mt:-2 }}>Requirement </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Chip to open the RequirementForm dialog */}
        <Chip
          label="Add Requirement"
          icon={<ListAltIcon />}
          onClick={handleChipClick}
          color="primary"
          sx={{ cursor: 'pointer',  mb:2 }}
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

        {/* Table to display Requirement from /api/projects */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
              <TableCell>Requirement No</TableCell>
              <TableCell>Short Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigne</TableCell>
              <TableCell>Project</TableCell>
              {/* <TableCell>Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.map((project) =>
              project.requirements.map((requirement) => (
                <TableRow
                  key={requirement._id}
                  hover
                  onClick={() => handleEditClick1(project._id, requirement)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{requirement.requirementNo}</TableCell>
                  <TableCell>{requirement.shortDescription}</TableCell>
                  <TableCell>{requirement.status}</TableCell>
                  <TableCell>{requirement.assignedTo}</TableCell>
                  <TableCell>{project.projectName}</TableCell>
                  {/* <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick1(project._id, requirement);
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

        {/* Table to display the requirement list */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            {/* <TableHead>
              <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
                <TableCell>Requirement No</TableCell>
                <TableCell>Short Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigne</TableCell>
                <TableCell>Project</TableCell>
              </TableRow>
            </TableHead> */}
            <TableBody>
              {filteredDirectStakeholders.map((requirement) => (
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
                  <TableCell>{"N/A"}</TableCell>
                  {/* <TableCell>
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
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog for creating or editing a requirement */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{selectedRequirement ? 'Edit Requirement' : 'Add Requirement'}</DialogTitle>
          <DialogContent>
            <RequirementForm
              requirementId={selectedRequirement} // Pass selectedRequirement to pre-fill the form
              projectId={selectedProjectId}
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
    </Layout>
  );
};

export default App;
