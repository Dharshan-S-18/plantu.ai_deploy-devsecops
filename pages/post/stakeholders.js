import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import { FormControl, FormLabel, Input } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close'; // Import the close icon

const StakeholderForm = ({ projectId, stakeholder, onClose, onStakeholderChange, showProjectNameField }) => {
  const [formData, setFormData] = useState({
    name: stakeholder?.name || '',
    email: stakeholder?.email || '',
    contact: stakeholder?.contact || '',
    type: stakeholder?.type || '',
    role: stakeholder?.role || '',
    projectId: stakeholder?.projectId || '', // If editing, keep the projectId
  });
  const [projectNames, setProjectNames] = useState([]); // State to store the list of project names
  const [loading, setLoading] = useState(false); // Loading state for the API call
  const [error, setError] = useState(''); // State for handling errors

  useEffect(() => {
    if (stakeholder) {
      setFormData({
        name: stakeholder.name || '',
        email: stakeholder.email || '',
        contact: stakeholder.contact || '',
        type: stakeholder.type || '',
        role: stakeholder.role || '',
        projectId: stakeholder.projectId || '',
      });
    }
  }, [stakeholder]);
  console.log(showProjectNameField);

  // Fetch project names from the API if the showProjectNameField is true
  useEffect(() => {
    if (showProjectNameField) {
      const fetchProjectNames = async () => {
        const accountId = sessionStorage.getItem('accountId');
        setLoading(true);
        try {
          const response = await axios.get(`/api/project?accountId=${accountId}`); // Assuming this is the endpoint for fetching projects
          setProjectNames(response.data.projects); // Set the fetched project names
          setLoading(false);
        } catch (error) {
          setError('Failed to fetch projects');
          setLoading(false);
        }
      };

      fetchProjectNames();
    }
  }, [showProjectNameField]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const createdByEmail = sessionStorage.getItem('email'); // Retrieve the user's email from sessionStorage
    if (!createdByEmail) {
      console.error('User email not found in sessionStorage');
      onStakeholderChange('Error: User email not found', 'error');
      return;
    }
  
    const newStakeholderData = {
      ...formData,
      createdBy: createdByEmail, // Set createdBy to the email from sessionStorage
      createdDate: new Date().toISOString(), // Set createdDate to the current timestamp
    };
  
    try {
      let response;
  
      if (stakeholder) {
        // Editing an existing stakeholder
        if (formData.projectId && formData.projectId !== projectId) {
          // If Project Name is updated (formData.projectId is different)
          response = await axios.post(`/api/project/${formData.projectId}/stakeholders`, newStakeholderData);
          console.log('Stakeholder added to new project:', response.data);

          // Step 2: After successful POST, delete the stakeholder from its original location
        await axios.delete(`/api/directProjectApi/stakeholder/${stakeholder._id}`);
        console.log('Stakeholder removed from the original location');
        
        } else if (projectId && stakeholder) {
          // If Project Name is not updated (keep the stakeholder in the same project)
          response = await axios.put(`/api/project/${projectId}/stakeholders/${stakeholder._id}`, newStakeholderData);
          console.log('Stakeholder updated under the same project:', response.data);
        } else if ( stakeholder) {
          // If no project context, update stakeholder directly
          response = await axios.put(`/api/directProjectApi/stakeholder/${stakeholder._id}`, newStakeholderData);
          console.log('Stakeholder updated directly:', response.data);
        }
      } else {
        // Creating a new stakeholder (unchanged logic)
        if (formData.projectId) {
          response = await axios.post(`/api/project/${formData.projectId}/stakeholders`, newStakeholderData);
          console.log('Stakeholder added to project:', response.data);
        } else if (projectId) {
          // If opened from the UserTable and no projectId in formData, use the projectId passed from the parent
          response = await axios.post(`/api/project/${projectId}/stakeholders`, newStakeholderData);
          console.log('Stakeholder added to project from UserTable:', response.data);
        } else {
          response = await axios.post(`/api/directProjectApi/stakeholder`, newStakeholderData);
          console.log('Stakeholder created without a project:', response.data);
        }
      }
  
      onStakeholderChange(stakeholder ? 'Stakeholder Updated Successfully' : 'Stakeholder Created Successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to submit form:', error);
      onStakeholderChange('Error saving Stakeholder', 'error');
    }
  };
  

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        p: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#00264d',
          p: 2,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Typography variant="h6" component="div" sx={{ color: '#fff' }}>
          Stakeholder Details
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Form Content */}
      <Box sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <FormLabel>Name</FormLabel>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </FormControl>

          {/* Conditionally render Project Name field */}
          {showProjectNameField && (
            <FormControl fullWidth>
              <FormLabel>Project Name</FormLabel>
              {loading ? (
                <Typography>Loading projects...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  
                >
                  {projectNames.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.projectId}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>
          )}

          <FormControl fullWidth>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Contact</FormLabel>
            <Input type="tel" name="contact" value={formData.contact} onChange={handleChange} required />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Type</FormLabel>
            <Select name="type" value={formData.type} onChange={handleChange} required>
              <MenuItem value="internal">Internal</MenuItem>
              <MenuItem value="external">External</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Role</FormLabel>
            <Select name="role" value={formData.role} onChange={handleChange} required>
              <MenuItem value="Project Manager">Project Manager</MenuItem>
              <MenuItem value="Developer">Developer</MenuItem>
              <MenuItem value="Designer">Designer</MenuItem>
              <MenuItem value="HR Manager">HR Manager</MenuItem>
              <MenuItem value="Consultant">Consultant</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="primary">
            {stakeholder ? 'Update' : 'Submit'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default StakeholderForm;
