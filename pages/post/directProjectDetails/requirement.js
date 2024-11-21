import React, { useState, useEffect } from 'react';
import { Typography, Chip, Menu, MenuItem, Dialog, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Layout from '../../../components/Layout';
import axios from 'axios';
import RequirementForm from '../Requirement'; // Import the form component

const Requirement = () => {
  const [projects, setProjects] = useState([]); // State to store projects
  const [requirements, setRequirements] = useState([]); // State to store all filtered requirements across projects
  const [selectedProject, setSelectedProject] = useState(''); // State for selected project
  const [selectedProjectId, setSelectedProjectId] = useState(null); // Store project ID
  const [anchorEl, setAnchorEl] = useState(null); // Anchor for the menu
  const [openModal, setOpenModal] = useState(false); // Control modal visibility
  const [selectedRequirementId, setSelectedRequirementId] = useState(null); // State for selected requirement ID
  const [userEmail, setUserEmail] = useState(''); // State for current user email
  const [searchTerm, setSearchTerm] = useState(''); // State for the search term

  // Fetch all project names from API
  useEffect(() => {
    const accountId = sessionStorage.getItem('accountId');
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`/api/project?accountId=${accountId}`);
        setProjects(response.data.projects); // Assuming the response contains an array of projects
        console.log(response);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  // Fetch and filter all requirements by createdBy (email from sessionStorage)
  useEffect(() => {
    const email = sessionStorage.getItem('email');
    setUserEmail(email || ''); // Set email to filter requirements by createdBy

    if (projects.length > 0) {
      const fetchRequirements = async () => {
        try {
          const allRequirements = [];

          // Fetch requirements for each project and add projectId to each requirement
          for (const project of projects) {
            const response = await axios.get(`/api/project/${project._id}/requirement`);

            if (Array.isArray(response.data.requirements)) {
              // Add projectId to each requirement
              const requirementsWithProjectId = response.data.requirements.map(requirement => ({
                ...requirement,
                projectId: project._id  // Ensure projectId is added
              }));
              allRequirements.push(...requirementsWithProjectId);
            } else {
              console.error(`Unexpected response format for project ${project._id}`, response.data);
            }
          }

          setRequirements(allRequirements); // Set all filtered requirements across projects
        } catch (error) {
          console.error('Error fetching requirements:', error);
        }
      };

      fetchRequirements();
    }
  }, [projects, userEmail]); // Re-fetch when projects or userEmail changes

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value); // Update search term as the user types
  };

  // Filter the requirements based on the search term
  const filteredRequirements = requirements.filter((requirement) => {
    return (
      requirement.requirementNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      requirement.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projects.find(project => project._id === requirement.projectId)?.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle chip click to open menu
  const handleChipClick = (event) => {
    setAnchorEl(event.currentTarget); // Set anchor to open menu
  };

  // Handle menu item selection
  const handleMenuItemClick = (projectName, projectId) => {
    setSelectedProject(projectName); // Update the selected project name
    setSelectedProjectId(projectId); // Update the selected project ID
    setAnchorEl(null); // Close menu
    setOpenModal(true); // Open the modal
  };

  // Handle modal close
  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedRequirementId(null); // Reset selected requirement ID when closing the modal
    setSelectedProject('');
  };

  // Handle row click to edit requirement
  const handleRowClick = (requirement) => {
    // Ensure that the requirement object contains _id
    console.log(requirement); // Debugging line to check if the requirement has _id

    // Find the project associated with this requirement
    const project = projects.find(project =>
      project.requirements.some(r => r._id === requirement._id)
    );

    // If the requirement and project are found, set the selected IDs
    if (requirement && project) {
      setSelectedRequirementId(requirement); // Set the selected requirement ID
      setSelectedProjectId(project._id); // Set the selected project ID
      setOpenModal(true); // Open the modal for editing
    } else {
      console.error("Requirement or Project not found!");
    }
  };

  return (
    <Layout>
      <div>
        <Typography variant="h4">Requirements</Typography>
        <Typography variant="body1">
          Note: If you want to create a Requirement then please Select the Project.
        </Typography>



        {/* Chip to show selected project */}
        <Chip
          label={selectedProject || 'Select Project'}
          onClick={handleChipClick} // Open menu on click
          sx={{ mt: 2, cursor: 'pointer' }}
          color="primary"
        />

        {/* Menu for project selection */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {projects.map((project) => (
            <MenuItem
              key={project._id}
              onClick={() => handleMenuItemClick(project.projectName, project._id)}
            >
              {project.projectName}
            </MenuItem>
          ))}
        </Menu>

        {/* Display filtered requirements in a table */}
        <div>
          {/* <Typography variant="h6" sx={{ mt: 4 }}>
            All Requirements Created by {userEmail}
          </Typography> */}
          {/* Search field */}
          <TextField
            // label="Search"
            variant="outlined"
            fullWidth
            sx={{
              mb: 1,
              mt:1,
              borderRadius: '20px', // Rounded edges for the input field
            }}
            value={searchTerm} // Set the value of the input to searchTerm
            onChange={handleSearchChange} // Update the search term when the user types
            placeholder="Search by requirement number, description, status, createdBy, or project name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon /> {/* Add the search icon here */}
                </InputAdornment>
              ),
              sx: {
                borderRadius: '20px', // Rounded edges for the input itself as well
              }
            }}
          />
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="requirements table">
              <TableHead>
                <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
                  <TableCell>Requirement No</TableCell>
                  <TableCell>Short Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Project</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequirements.length > 0 ? (
                  filteredRequirements.map((requirement) => (
                    <TableRow
                      key={requirement._id}
                      onClick={() => handleRowClick(requirement)} // Passing the whole requirement object
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{requirement.requirementNo}</TableCell>
                      <TableCell>{requirement.shortDescription}</TableCell>
                      <TableCell>{requirement.status}</TableCell>
                      <TableCell>{requirement.createdBy}</TableCell>
                      <TableCell>
                        {
                          // Find the project by matching projectId in the requirement with _id in the projects array
                          (() => {
                            const project = projects.find((project) => project._id === requirement.projectId);
                            console.log('Requirement projectId:', requirement.projectId);  // Debugging line
                            console.log('Matching Project:', project);  // Debugging line
                            return project ? project.projectName : 'N/A';
                          })()
                        }
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No requirements found for this user.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Modal for Requirement Form */}
        <Dialog open={openModal} onClose={handleModalClose} fullWidth maxWidth="md">
          <RequirementForm
            projectId={selectedProjectId} // Pass the selected project ID
            requirementId={selectedRequirementId} // Pass the selected requirement ID (for editing)
            onClose={handleModalClose}
            onRequirementChange={(message, severity) => {
              console.log(`${severity}: ${message}`);
            }}
          />
        </Dialog>
      </div>
    </Layout>
  );
};

export default Requirement;
