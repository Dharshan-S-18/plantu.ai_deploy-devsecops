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

const StakeholderForm = ({ projectId, stakeholder, onClose, onStakeholderChange  }) => {
  const [formData, setFormData] = useState({
    name: stakeholder?.name || '',
    email: stakeholder?.email || '',
    contact: stakeholder?.contact || '',
    type: stakeholder?.type || '',
    role: stakeholder?.role || '',
  });

  useEffect(() => {
    if (stakeholder) {
      setFormData({
        name: stakeholder.name || '',
        email: stakeholder.email || '',
        contact: stakeholder.contact || '',
        type: stakeholder.type || '',
        role: stakeholder.role || '',
      });
    }
  }, [stakeholder]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (stakeholder) {
        const response = await axios.put(`/api/project/${projectId}/stakeholders/${stakeholder._id}`, formData);
        console.log('Stakeholder updated:', response.data);
        onStakeholderChange('Stakeholder updated Successfully', 'success');
        onClose();
      } else {
        const response = await axios.post(`/api/project/${projectId}/stakeholders`, formData);
        console.log('Stakeholder added to project:', response.data);
        onStakeholderChange('Stakeholder Created Successfully', 'success');
      }
      // onStakeholderChange(); // Call to refresh the list
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
        <Typography variant="h6" component="div" sx={{ color: '#fff' }}>Stakeholder Details</Typography>
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
