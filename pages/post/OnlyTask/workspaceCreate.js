import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Modal, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';

const WorkspaceForm = ({ open, handleClose, workspaceDetails, isEditing, workspaceId }) => {
  const [workSpace, setWorkSpace] = useState({
    accountId: workspaceDetails?.accountId || '',
    name: workspaceDetails?.name || '',
    date: workspaceDetails?.date ? dayjs(workspaceDetails.date).format('YYYY-MM-DD') : '',
    teamMembers: workspaceDetails?.teamMembers || [],
    startDate: workspaceDetails?.startDate || null,
    endDate: workspaceDetails?.endDate || null,
  });

  const [teamOptions, setTeamOptions] = useState([]); // For storing team members from GET API
  const [message, setMessage] = useState('');

  // Fetch team members on mount (GET Agents API)
  useEffect(() => {
    // Retrieve accountId from sessionStorage
    const accountId = sessionStorage.getItem('accountId');
    setWorkSpace((prev) => ({
      ...prev,

      accountId: accountId || '', // Set accountId from sessionStorage or default to ''
    }));
    const fetchTeamMembers = async () => {
      try {
        const hostname = window.location.hostname;
        const extractedSubdomain = hostname.split('.')[0]; // Assuming you're extracting subdomain

        const response = await axios.get(`/api/auth/getAgents?accountId=${accountId}&subdomain=${extractedSubdomain}`);
        setTeamOptions(response.data); // Set the team members fetched from the API
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      }
    };

    fetchTeamMembers(); // Fetch team members for dropdown

    // Pre-fill workspace details if editing
    if (workspaceDetails) {
      setWorkSpace({
        accountId: workspaceDetails.accountId,
        name: workspaceDetails.name,
        date: workspaceDetails?.date ? dayjs(workspaceDetails.date).format('YYYY-MM-DD') : '',
        teamMembers: workspaceDetails.teamMembers,
        startDate: workspaceDetails.startDate,
        endDate: workspaceDetails.endDate,
      });
    }
  }, [workspaceDetails]);

  // POST (create) or PUT (update) the workspace
  const handleSaveWorkspace = async () => {
    try {
      let response;
      if (isEditing) {
        // PUT: Update an existing workspace
        response = await axios.put(`/api/OnlyTaskApi/workspace/${workspaceId}/workSpace`, workSpace);
        setMessage('Workspace updated successfully!');
      } else {
        // POST: Create a new workspace
        response = await axios.post('/api/OnlyTaskApi/workSpace', workSpace);
        setMessage('Workspace created successfully!');
      }

      console.log('Response:', response);
      handleClose(); // Close the modal
    } catch (error) {
      console.error('Error saving workspace:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkSpace((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamMembersChange = (event) => {
    setWorkSpace((prev) => ({
      ...prev,
      teamMembers: event.target.value,
    }));
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
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
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#00264d',
            p: 1,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <Typography variant="h6" component="h1" sx={{ color: 'white', ml: 2 }}>
            {isEditing ? 'Edit Workspace' : 'Create Workspace'}
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12}>
            <TextField
              label="Workspace Name"
              name="name"
              value={workSpace.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Date"
              type="date"
              name="date"
              value={workSpace.date || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Team Members</InputLabel>
              <Select
                label="Team Members"
                name="teamMembers"
                multiple
                value={workSpace.teamMembers}
                onChange={handleTeamMembersChange}
                renderValue={(selected) => selected.join(', ')}
              >
                {teamOptions.map((member) => (
                  <MenuItem key={member.id} value={member.name}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSaveWorkspace}>
              {isEditing ? 'Update Workspace' : 'Create Workspace'}
            </Button>
          </Grid>
          {message && (
            <Grid item xs={12}>
              <Typography variant="body1" color="error" gutterBottom>
                {message}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Modal>
  );
};

export default WorkspaceForm;
