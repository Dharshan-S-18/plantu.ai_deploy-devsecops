import { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Select, MenuItem, InputLabel, Chip, Menu  } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {Textarea, FormLabel} from '@mui/joy';
import axios from 'axios';

const SubtaskModal = ({ workspaceId, projectId, taskId, open, onClose, subtask, onSubtaskChange }) => {
  // Initialize state with existing subtask data or default values
  const [subtaskData, setSubtaskData] = useState({
    name: '',
    assignee: '',
    dueDate: '',
    priority: '',
    status: '',
    comments: ''
  });
  const [assignees, setAssignees] = useState([]);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null); // For status chip menu
  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null); // For priority chip menu

  const statusOptions = ['To Do', 'In Progress', 'Done'];
  const priorityOptions = ['Low', 'Medium', 'High'];

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

  const handleInputChange = (name, value) => {
    setSubtaskData({ ...subtaskData, [name]: value });
  };

    // Fetch assignees from the API when the modal opens
    useEffect(() => {
      const fetchAssignees = async () => {
        const hostname = window.location.hostname;
      const extractedSubdomain = hostname.split('.')[0];
        const accountId = sessionStorage.getItem('accountId');
        if (!accountId) {
          console.error('No accountId found in sessionStorage');
          return;
        }
        try {
          const response = await axios.get(`/api/auth/getAgents?accountId=${accountId}&subdomain=${extractedSubdomain}`);
          setAssignees(response.data); // Assuming the API returns an array of assignee         
        } catch (error) {
          console.error('Failed to fetch assignees:', error);
        }
      };
  
      if (open) {
        fetchAssignees(); // Fetch assignees when the modal is opened
      }
    }, [open, workspaceId, projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!taskId) {
    //   alert('Task ID is missing');
    //   return;
    // }
    
    try {
      if (subtask && subtask._id) {
        // Update existing subtask
        await axios.put(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/subtasks/${subtask._id}`, subtaskData);
        alert('Subtask updated successfully');
        onSubtaskChange();
      } else {
        // Create new subtask
        await axios.post(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/subtasks`, subtaskData);
        alert('Subtask added successfully');
        onSubtaskChange();
      }
      onClose();
    } catch (error) {
      console.error('Error saving subtask:', error);
      alert('Failed to save subtask');
    }
  };

    // Handle Status Chip Click and Menu Opening
    const handleStatusClick = (event) => {
      setStatusAnchorEl(event.currentTarget); // Open the menu at the position of the clicked chip
    };
  
    const handleStatusClose = () => {
      setStatusAnchorEl(null); // Close the menu
    };
  
    const handleStatusSelect = (status) => {
      handleInputChange('status', status); // Update the selected status
      handleStatusClose(); // Close the menu
    };
  
    // Handle Priority Chip Click and Menu Opening
    const handlePriorityClick = (event) => {
      setPriorityAnchorEl(event.currentTarget); // Open the menu at the position of the clicked chip
    };
  
    const handlePriorityClose = () => {
      setPriorityAnchorEl(null); // Close the menu
    };
  
    const handlePrioritySelect = (priority) => {
      handleInputChange('priority', priority); // Update the selected priority
      handlePriorityClose(); // Close the menu
    };

      // Helper function to determine chip color for Status
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'To Do':
        return 'primary'; // Blue
      case 'In Progress':
        return 'warning'; // Orange
      case 'Done':
        return 'success'; // Green
      default:
        return 'default';
    }
  };

  // Helper function to determine chip color for Priority
  const getPriorityChipColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'default'; // Gray
      case 'Medium':
        return 'warning'; // Orange
      case 'High':
        return 'error'; // Red
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle  sx={{
          bgcolor: '#00264d',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2
        }}>SubTask
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
        </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <FormLabel>Task Name</FormLabel>
          <Textarea
            fullWidth
            label="Subtask Name"
            name="name"
            value={subtaskData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />
          <InputLabel>Assignee</InputLabel>
          <Select
            fullWidth
            name="assignee"
            value={subtaskData.assignee}
            onChange={(e) => handleInputChange('assignee', e.target.value)}
          >
            {/* Map through fetched assignees and display them in the dropdown */}
            {assignees.map((assignee) => (
              <MenuItem key={assignee.id} value={assignee.name}>
                {assignee.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            type="date"
            fullWidth
            label="Due Date"
            name="dueDate"
            value={subtaskData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {/* Status and Priority in the Same Row */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Status Chip */}
            <Chip
              label={subtaskData.status || 'Select Status'}
              onClick={handleStatusClick}
              color={getStatusChipColor(subtaskData.status)}
              sx={{ cursor: 'pointer' }}
            />
            <Menu
              anchorEl={statusAnchorEl}
              open={Boolean(statusAnchorEl)}
              onClose={handleStatusClose}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} onClick={() => handleStatusSelect(status)}>
                  {status}
                </MenuItem>
              ))}
            </Menu>

            {/* Priority Chip */}
            <Chip
              label={subtaskData.priority || 'Select Priority'}
              onClick={handlePriorityClick}
              color={getPriorityChipColor(subtaskData.priority)}
              sx={{ cursor: 'pointer' }}
            />
            <Menu
              anchorEl={priorityAnchorEl}
              open={Boolean(priorityAnchorEl)}
              onClose={handlePriorityClose}
            >
              {priorityOptions.map((priority) => (
                <MenuItem key={priority} onClick={() => handlePrioritySelect(priority)}>
                  {priority}
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Textarea
            fullWidth
            label="Comments"
            name="comments"
            value={subtaskData.comments}
            onChange={(e) => handleInputChange('comments', e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary">
            {subtask ? 'Update Subtask' : 'Add Subtask'}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubtaskModal;
