import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { Button, TextField, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Divider, IconButton, Tooltip, MenuItem, List, Chip, Menu, Checkbox, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import PersonIcon from "@mui/icons-material/Person";
import MoreTimeOutlinedIcon from '@mui/icons-material/MoreTimeOutlined';
import DateRangeIcon from "@mui/icons-material/DateRange";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';
import { Textarea, FormLabel } from '@mui/joy';
import axios from 'axios';
import AssigneeMenu from '../../components/AssigneeMenu';
import CommentsSection from './subTaskComment'; // Import the new component

const SubtaskModal = ({ workspaceId, projectId, taskId, open, onClose, subtask, onSubtaskChange, subtasks, setSubtasks }) => {
  const [subtaskData, setSubtaskData] = useState({
    name: '',
    description: '',
    assignee: '',
    dueDate: '',
    priority: '',
    status: '',
    allocatedEffort: '',
    actualEffort: '',
    comments: [],
    checklist: []
  });
  const [assigneeAnchorEl, setAssigneeAnchorEl] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null);
  const [dueDateAnchorEl, setDueDateAnchorEl] = useState(null);
  const [allocatedEffortAnchorEl, setAllocatedEffortAnchorEl] = useState(null);
  const [actualEffortAnchorEl, setActualEffortAnchorEl] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isModified, setIsModified] = useState(false);
  const initialDataRef = useRef(null);

  const statusOptions = ['To Do', 'In Progress', 'Done'];
  const priorityOptions = ['Low', 'Medium', 'High'];

  useEffect(() => {
    if (subtask) {
      setSubtaskData({
        ...subtask,
        _id: subtask._id,
        dueDate: subtask.dueDate ? dayjs(subtask.dueDate) : null // Ensure dueDate is a dayjs object or null
      });
      initialDataRef.current = subtask;
    } else {
      setSubtaskData({
        name: '',
        description: '',
        assignee: '',
        dueDate: '',
        priority: '',
        status: '',
        allocatedEffort: '',
        actualEffort: '',
        comments: [],
        checklist: []
      });
    }
  }, [subtask]);

  useEffect(() => {
    const isDataModified = JSON.stringify(subtaskData) !== JSON.stringify(initialDataRef.current);
    setIsModified(isDataModified);
  }, [subtaskData]);

  const handleInputChange = (name, value) => {
    setSubtaskData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Menu handlers
  const handleAssigneeChipClick = (event) => setAssigneeAnchorEl(event.currentTarget);
  const handleAssigneeMenuClose = () => setAssigneeAnchorEl(null);
  const handleAssigneeSelect = (assignee) => {
    handleInputChange('assignee', assignee);
    setAssigneeAnchorEl(null);
  };

  const handleStatusClick = (event) => setStatusAnchorEl(event.currentTarget);
  const handleStatusClose = () => setStatusAnchorEl(null);
  const handleStatusSelect = (status) => {
    handleInputChange('status', status);
    handleStatusClose();
  };

  const handlePriorityClick = (event) => setPriorityAnchorEl(event.currentTarget);
  const handlePriorityClose = () => setPriorityAnchorEl(null);
  const handlePrioritySelect = (priority) => {
    handleInputChange('priority', priority);
    handlePriorityClose();
  };

  const handleAllocatedEffortChipClick = (event) => setAllocatedEffortAnchorEl(event.currentTarget);
  const handleAllocatedEffortMenuClose = () => setAllocatedEffortAnchorEl(null);

  const handleActualEffortChipClick = (event) => setActualEffortAnchorEl(event.currentTarget);
  const handleActualEffortMenuClose = () => setActualEffortAnchorEl(null);

  const handleDueDateChipClick = (event) => setDueDateAnchorEl(event.currentTarget);
  const handleDueDateMenuClose = () => setDueDateAnchorEl(null);
  const handleDueDateSelect = (date) => {
    handleInputChange('dueDate', date);
    setDueDateAnchorEl(null);
  };

  // Helpers to set chip colors
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'To Do': return 'primary';
      case 'In Progress': return 'warning';
      case 'Done': return 'success';
      default: return 'default';
    }
  };

  const getPriorityChipColor = (priority) => {
    switch (priority) {
      case 'Low': return 'default';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem = { text: newChecklistItem, completed: false };
    setSubtaskData((prevData) => ({
      ...prevData,
      checklist: [...prevData.checklist, newItem]
    }));
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (index) => {
    const updatedChecklist = [...subtaskData.checklist];
    updatedChecklist[index].completed = !updatedChecklist[index].completed;
    setSubtaskData({ ...subtaskData, checklist: updatedChecklist });
  };

  const handleRemoveChecklistItem = (index) => {
    const updatedChecklist = subtaskData.checklist.filter((_, i) => i !== index);
    setSubtaskData({ ...subtaskData, checklist: updatedChecklist });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (subtask && subtask._id) {
        await axios.put(`/api/project/${projectId}/task/${taskId}/subtasks/${subtask._id}`, subtaskData);
        alert('Subtask updated successfully');
        // Update the existing subtask in the subtasks array
        const updatedSubtasks = subtasks.map((subtask) =>
          subtask._id === subtaskData._id ? { ...subtask, ...subtaskData } : subtask
        );
        setSubtasks(updatedSubtasks); // Update shared state
      } else {
        await axios.post(`/api/project/${projectId}/task/${taskId}/subtasks`, subtaskData);
        alert('Subtask added successfully');
        setSubtasks([...subtasks, response.data.subtask]);
      }
      onSubtaskChange();
      onClose();
    } catch (error) {
      console.error('Error saving subtask:', error);
      alert('Failed to save subtask');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { width: '80%', maxWidth: '1200px' } }}>
        <DialogTitle
          sx={{
            bgcolor: '#00264d',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          Subtask
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Link icon to copy URL */}
            <Tooltip title="Copy Subtask Link" arrow>
              <IconButton
                onClick={() => {
                  const taskUrl = `${window.location.origin}/post/projects/${projectId}/edit?section=Tasks&taskId=${taskId}&subtaskId=${subtask._id}`;
                  navigator.clipboard.writeText(taskUrl); // Copy URL to clipboard
                }}
                sx={{
                  color: '#fff',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(20deg)',
                  },
                }}
              >
                <LinkIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close the Subtask" arrow>
              <IconButton onClick={onClose} sx={{
                color: '#fff',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(20deg)',
                },
              }}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" gap={1}>
            <Box flex={4} component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormLabel>Task Name</FormLabel>
              <Textarea
                fullWidth
                label="Subtask Name"
                name="name"
                value={subtaskData?.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontSize: '13px', fontWeight: '600' }}>Description</Typography>
              </Box>
              <Textarea
                fullWidth
                placeholder="Add description"
                multiline
                minRows={2}
                value={subtaskData?.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* Status and Priority */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title="Status" placement="top" arrow>
                  <Chip
                    label={subtaskData?.status || 'Select Status'}
                    icon={<RadioButtonCheckedIcon />}
                    onClick={handleStatusClick}
                    color={getStatusChipColor(subtaskData?.status)}
                    sx={{ cursor: 'pointer' }}
                  />
                </Tooltip>
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

                <Tooltip title="Priority" placement="top" arrow>
                  <Chip
                    label={subtaskData?.priority || 'Select Priority'}
                    onClick={handlePriorityClick}
                    icon={<PriorityHighIcon />}
                    color={getPriorityChipColor(subtaskData?.priority)}
                    sx={{ cursor: 'pointer' }}
                  />
                </Tooltip>
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


                {/* </Box> */}
                {/* Assignee Chip */}
                {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> */}
                {/* <Typography variant="body1">Assignee:</Typography> */}
                <Tooltip title="Assigne" placement="top" arrow>
                  <Chip
                    label={subtaskData.assignee || 'Select Assignee'}
                    icon={<PersonIcon />}
                    onClick={handleAssigneeChipClick}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: subtaskData.assignee ? '#e0f7fa' : 'default'
                    }}
                  />
                </Tooltip>

                <AssigneeMenu
                  anchorEl={assigneeAnchorEl}
                  open={Boolean(assigneeAnchorEl)}
                  onClose={handleAssigneeMenuClose}
                  onAssigneeSelect={handleAssigneeSelect}
                />
                {/* </Box> */}

                {/* Due Date, Allocated Effort, Actual Effort */}
                {/* Due Date Chip */}
                {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}> */}
                {/* <Typography variant="body1">Due Date:</Typography> */}
                <Tooltip title="Due Date" placement="top" arrow>
                  <Chip
                    label={subtaskData.dueDate ? new Date(subtaskData.dueDate).toLocaleDateString() : 'Select Due Date'}
                    icon={<DateRangeIcon />}
                    onClick={handleDueDateChipClick}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: subtaskData.dueDate ? '#ffe0b2' : 'default'
                    }}
                  />
                </Tooltip>
                <Menu
                  anchorEl={dueDateAnchorEl}
                  open={Boolean(dueDateAnchorEl)}
                  onClose={handleDueDateMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <Box sx={{ m: 2 }}>
                    <DateCalendar
                      value={subtaskData.dueDate || null}
                      onChange={(date) => handleDueDateSelect(date)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Box>
                </Menu>
                {/* </Box> */}

                <Tooltip title="Allocated Effort" placement="top" arrow>
                  <Chip
                    label={subtaskData.allocatedEffort ? `${subtaskData.allocatedEffort} hrs` : 'Set Allocated Effort'}
                    icon={<MoreTimeOutlinedIcon />}
                    onClick={handleAllocatedEffortChipClick}
                    sx={{ cursor: 'pointer' }}
                  />
                </Tooltip>
                <Menu
                  anchorEl={allocatedEffortAnchorEl}
                  open={Boolean(allocatedEffortAnchorEl)}
                  onClose={handleAllocatedEffortMenuClose}
                >
                  <Box sx={{ p: 2 }}>
                    <TextField
                      label="Allocated Effort (hrs)"
                      type="number"
                      fullWidth
                      value={subtaskData.allocatedEffort || ''}
                      onChange={(e) => handleInputChange('allocatedEffort', e.target.value)}
                      onBlur={handleAllocatedEffortMenuClose}
                      autoFocus
                    />
                  </Box>
                </Menu>

                <Tooltip title="Actual Effort" placement="top" arrow>
                  <Chip
                    label={subtaskData.actualEffort ? `${subtaskData.actualEffort} hrs` : 'Set Actual Effort'}
                    icon={<MoreTimeOutlinedIcon />}
                    onClick={handleActualEffortChipClick}
                    sx={{ cursor: 'pointer' }}
                  />
                </Tooltip>
                <Menu
                  anchorEl={actualEffortAnchorEl}
                  open={Boolean(actualEffortAnchorEl)}
                  onClose={handleActualEffortMenuClose}
                >
                  <Box sx={{ p: 2 }}>
                    <TextField
                      label="Actual Effort (hrs)"
                      type="number"
                      fullWidth
                      value={subtaskData.actualEffort || ''}
                      onChange={(e) => handleInputChange('actualEffort', e.target.value)}
                      onBlur={handleActualEffortMenuClose}
                      autoFocus
                    />
                  </Box>
                </Menu>
                {/* </Box> */}
              </Box>

              {/* Checklist */}
              <Typography variant="h6">Checklist</Typography>
              <List sx={{ padding: -2 }}>
                {subtaskData.checklist.map((item, index) => (
                  <ListItem key={index} sx={{ display: 'flex', alignItems: 'center', paddingY: 0.5, marginBottom: 0.5, }}>
                    <Checkbox
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(index)}
                    />
                    <ListItemText
                      primary={item.text}
                      style={{
                        textDecoration: item.completed ? 'line-through' : 'none', marginLeft: 1,
                      }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveChecklistItem(index)}>
                        <CloseIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Add new checklist item"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  sx={{
                    marginRight: 1, // Space between text field and icon button
                  }}
                />
                <IconButton onClick={handleAddChecklistItem} variant="contained" color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
            <Divider orientation="vertical" variant="middle" flexItem />

            {/* Comments Section */}
            {subtask && subtask._id && (
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  flex: '6',
                  alignSelf: 'flex-start',
                  minWidth: '200px',
                  maxWidth: '550px',
                  bgcolor: 'background.paper',
                  pl: 2,
                  //borderLeft: '1px solid #ddd',
                }}
              >
                <CommentsSection
                  //workspaceId={workspaceId}
                  projectId={projectId}
                  taskId={taskId}
                  // subtaskId={subtaskData?._id}
                  subtaskId={subtask._id}
                  comments={subtaskData?.comments || []}
                //onCommentsChange={(updatedComments) => setSubtaskData((prevData) => ({ ...prevData, comments: updatedComments }))}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={!isModified} onClick={handleSubmit}>
            {subtask ? 'Update Subtask' : 'Add Subtask'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SubtaskModal;
