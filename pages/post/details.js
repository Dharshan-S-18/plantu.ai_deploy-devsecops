import { useState, useEffect } from 'react';
import { Button, Box, Typography, TextField, Grid } from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';

const BudgetForm = ({ projectId, onSuccess }) => {
  const [formData, setFormData] = useState({
    totalBudget: '',
    budgetStartDate: '',
    businessCase: '',
    actualBudget: '',
    budgetEndDate: ''
  });

  useEffect(() => {
    // Fetch project details including budget when component mounts
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`/api/project/${projectId}`);
        if (response.status === 200) {
          const project = response.data.project;
          console.log(project);
          setFormData({
            totalBudget: project.totalBudget || '',
            budgetStartDate: project.budgetStartDate ? new Date(project.budgetStartDate).toISOString().split('T')[0] : '',
            businessCase: project.businessCase || '',
            actualBudget: project.actualBudget || '',
            budgetEndDate: project.budgetEndDate ? new Date(project.budgetEndDate).toISOString().split('T')[0] : ''
          });
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/project/${projectId}`, formData);

      if (response.status === 200) {
        alert('Budget details updated successfully');
        if (onSuccess) onSuccess(response.data);
      }
    } catch (error) {
      console.error('Error saving budget details:', error);
      alert('Failed to save budget details');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleFormSubmit}
      sx={{
        width: 800, // Increased width for larger form
        bgcolor: 'background.paper',
        // boxShadow: 1,
        // p: 4,
        margin: 'auto',
        // mt: 0,
        marginBottom: 20
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Budget Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Total Budget"
            name="totalBudget"
            type="number"
            value={formData.totalBudget}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Actual Budget"
            name="actualBudget"
            type="number"
            value={formData.actualBudget}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Start Date"
            name="budgetStartDate"
            type="date"
            value={formData.budgetStartDate}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="End Date"
            name="budgetEndDate"
            type="date"
            value={formData.budgetEndDate}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Business Case"
            name="businessCase"
            multiline
            rows={4}
            value={formData.businessCase}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Save Details
      </Button>
    </Box>
  );
};

BudgetForm.propTypes = {
  projectId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func
};

export default BudgetForm;
