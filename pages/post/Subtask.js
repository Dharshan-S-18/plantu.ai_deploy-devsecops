import { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';

const SubtaskModal = ({ projectId, taskId, open, onClose, subtask }) => {
  // Initialize state with existing subtask data or default values
  const [subtaskData, setSubtaskData] = useState({
    name: '',
    assignee: '',
    dueDate: '',
    priority: '',
    status: '',
    comments: ''
  });

  const [userOptions, setUserOptions] = useState([]); // State to store fetched user options

  // Effect to populate fields when a subtask is passed
  useEffect(() => {
    if (subtask) {
      setSubtaskData(subtask);
    } else {
      // Reset state if no subtask data is provided
      setSubtaskData({
        name: '',
        assignee: '',
        dueDate: '',
        priority: '',
        status: '',
        comments: ''
      });
    }
  }, [subtask]);

  // Fetch users filtered by accountId when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      const hostname = window.location.hostname;
      const extractedSubdomain = hostname.split('.')[0];
      const accountId = sessionStorage.getItem('accountId'); // Get accountId from sessionStorage
      if (!accountId) {
        console.error('No accountId found in sessionStorage');
        return;
      }

      try {
        const response = await fetch(`/api/auth/getAgents?accountId=${accountId}&subdomain=${extractedSubdomain}`); // Pass accountId as query parameter
        const data = await response.json();
        console.log(data); // Log response to check data format
        setUserOptions(data); // Set fetched user data to state
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (name, value) => {
    setSubtaskData({ ...subtaskData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!taskId) {
    //   alert('Task ID is missing');
    //   return;
    // }

    try {
      if (subtask && subtask._id) {
        // Update existing subtask
        await axios.put(`/api/project/${projectId}/task/${taskId}/subtasks/${subtask._id}`, subtaskData);
        alert('Subtask updated successfully');
      } else {
        // Create new subtask
        await axios.post(`/api/project/${projectId}/task/${taskId}/subtasks`, subtaskData);
        alert('Subtask added successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving subtask:', error);
      alert('Failed to save subtask');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} >
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
        <DialogTitle variant="h6" component="div" sx={{ color: '#fff' }}>{subtask ? 'Edit Subtask' : 'Add Subtask'}</DialogTitle>
      </Box>
      <DialogContent sx={{
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
      }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            label="Subtask Name"
            name="name"
            value={subtaskData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
          <TextField
            fullWidth
            select
            label="Assignee"
            name="assignee"
            value={subtaskData.assignee}
            onChange={(e) => handleInputChange('assignee', e.target.value)}
            SelectProps={{
              native: true, // Use native select element
            }}
          >
            <option value="">Select Assignee</option>
            {userOptions.map((user) => (
              <option key={user._id} value={user.name}>
                {user.name}
              </option>
            ))}
          </TextField>
          <TextField
            type="date"
            fullWidth
            label="Due Date"
            name="dueDate"
            value={subtaskData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Priority"
            name="priority"
            value={subtaskData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
          />
          <TextField
            fullWidth
            label="Status"
            name="status"
            value={subtaskData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
          />
          <TextField
            fullWidth
            label="Comments"
            name="comments"
            value={subtaskData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary">
            {subtask ? 'Update Subtask' : 'Add Subtask'}
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Box>
      </DialogContent>
      {/* <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default SubtaskModal;
