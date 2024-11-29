import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { TextField, Button, MenuItem, Typography, Box, Snackbar, Alert, Chip, Grid, Menu, Divider, IconButton, ListItemIcon, ListItemText, Modal } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';

// Function to generate a unique Project ID
const generateProjectId = () => {
  const prefix = 'PI';
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
  return `${prefix}${randomNumber}`;
};

// Status icon color mapping
const statusIconColor = {
  'To Do': '#ff9800',       // Orange for "To Do"
  'In Progress': '#2196f3', // Blue for "In Progress"
  'Completed': '#4caf50',   // Green for "Completed"
};

const ProjectPage = ({ open, handleClose }) => {
  const [project, setProject] = useState({
    accountId: '', // Added accountId to state
    projectId: '',
    projectName: '',
    description: '',
    status: '',
    startDate: null,
    endDate: null,
  });

  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [startDateAnchorEl, setStartDateAnchorEl] = useState(null);
  const [endDateAnchorEl, setEndDateAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const router = useRouter();

  useEffect(() => {
    // Retrieve accountId from sessionStorage
    const accountId = sessionStorage.getItem('accountId');
    setProject((prev) => ({
      ...prev,
      projectId: generateProjectId(),
      accountId: accountId || '', // Set accountId from sessionStorage or default to ''
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusClick = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = (value) => {
    setStatusAnchorEl(null);
    if (value) {
      setProject((prev) => ({ ...prev, status: value }));
    }
  };

  const handleStartDateClick = (event) => {
    setStartDateAnchorEl(event.currentTarget);
  };

  const handleEndDateClick = (event) => {
    setEndDateAnchorEl(event.currentTarget);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation for required fields
  if (!project.status || !project.startDate || !project.endDate) {
    setSnackbarMessage('Status, Start Date, and End Date are required fields.');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    return; // Prevent form submission if validation fails
  }

      // Get the current user's email from sessionStorage
  const createdBy = sessionStorage.getItem("email");
  // Get the current date
  const createdDate = dayjs().format('YYYY-MM-DD HH:mm:ss'); // You can adjust the format as needed.
  // Add these fields to the project object
  const projectData = {
    ...project,
    createdBy,  // Add email from sessionStorage
    createdDate // Add the current date
  };

    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      console.log(project);
      console.log(response);

      if (response.ok) {
        const data = await response.json();
        console.log('Project saved:', data);
        setProject({
          projectId: generateProjectId(),
          projectName: '',
          description: '',
          status: '',
          startDate: '',
          endDate: '',
        });
        setSnackbarMessage('Project created successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        handleClose();
        router.push(`/post/projects/${data.Projects._id}/edit`);
      } else {
        console.error('Error saving project:', response.statusText);
        setSnackbarMessage('Failed to create project. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Network error:', error);
      setSnackbarMessage('An error occurred. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          maxWidth: 800,
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: 3,
          p: 0,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#00264d', p: 1, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
            <Typography variant="h6" component="h1" sx={{ color: 'white', ml: 2 }}>
              Create New Project
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: 'white', mr: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Grid container spacing={2} sx={{ p: 3 }}>
            {/* Left Column */}
            <Grid item xs={8}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Project ID"
                  name="projectId"
                  value={project.projectId}
                  onChange={() => {}}
                  disabled
                />
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Project Name"
                  name="projectName"
                  value={project.projectName}
                  onChange={handleChange}
                  required
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Project Description"
                  name="description"
                  value={project.description}
                  onChange={handleChange}
                  
                />
                {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Team</Typography>
                  <IconButton>
                    <AddCircleOutlineIcon fontSize="large" />
                  </IconButton>
                </Box> */}
              </Box>
            </Grid>

            {/* Divider */}
            <Grid item xs={1}>
              <Divider orientation="vertical" flexItem sx={{ height: '100%', width: 2, bgcolor: 'divider.main' }} />
            </Grid>

            {/* Right Column */}
            <Grid item xs={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Chip
                  label={project.status || 'Status'}
                  variant="outlined"
                  clickable
                  onClick={handleStatusClick}
                  sx={{ fontWeight: 'bold', justifyContent: 'flex-start' }}
                  icon={
                    <RadioButtonCheckedIcon
                      style={{
                        color: statusIconColor[project.status] || 'inherit',
                      }}
                    />
                  }
                />
                <Menu
                  anchorEl={statusAnchorEl}
                  open={Boolean(statusAnchorEl)}
                  onClose={() => handleStatusClose(null)}
                >
                  <MenuItem onClick={() => handleStatusClose('To Do')}>
                    <ListItemIcon sx={{ minWidth: 0, mr: 1, color: '#ff9800' }}>
                      <RadioButtonCheckedIcon />
                    </ListItemIcon>
                    <ListItemText primary="To Do" />
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusClose('In Progress')}>
                    <ListItemIcon sx={{ minWidth: 0, mr: 1, color: '#2196f3' }}>
                      <RadioButtonCheckedIcon />
                    </ListItemIcon>
                    <ListItemText primary="In Progress" />
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusClose('Completed')}>
                    <ListItemIcon sx={{ minWidth: 0, mr: 1, color: '#4caf50' }}>
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Completed" />
                  </MenuItem>
                </Menu>

                <Chip
                  label={project.startDate ? `Start Date: ${dayjs(project.startDate).format('YYYY-MM-DD')}` : 'Start Date'}
                  variant="outlined"
                  clickable
                  icon={<CalendarTodayIcon />}
                  onClick={handleStartDateClick}
                />
                <Menu
                  anchorEl={startDateAnchorEl}
                  open={Boolean(startDateAnchorEl)}
                  onClose={() => setStartDateAnchorEl(null)}
                >
                  <Box sx={{ p: 2 }}>
                    <DatePicker
                      label="Select Start Date"
                      value={project.startDate}
                      onChange={(newValue) => {
                        setProject((prev) => ({ ...prev, startDate: newValue }));
                        setStartDateAnchorEl(null);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Box>
                </Menu>

                <Chip
                  label={project.endDate ? `End Date: ${dayjs(project.endDate).format('YYYY-MM-DD')}` : 'End Date'}
                  variant="outlined"
                  clickable
                  icon={<CalendarTodayIcon />}
                  onClick={handleEndDateClick}
                />
                <Menu
                  anchorEl={endDateAnchorEl}
                  open={Boolean(endDateAnchorEl)}
                  onClose={() => setEndDateAnchorEl(null)}
                >
                  <Box sx={{ p: 2 }}>
                    <DatePicker
                      label="Select End Date"
                      value={project.endDate}
                      onChange={(newValue) => {
                        setProject((prev) => ({ ...prev, endDate: newValue }));
                        setEndDateAnchorEl(null);
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Box>
                </Menu>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Button variant="outlined" onClick={handleSubmit}>Save Project</Button>
          </Box>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert variant="filled" onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default ProjectPage;
