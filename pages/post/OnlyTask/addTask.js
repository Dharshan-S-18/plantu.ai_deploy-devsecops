import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Divider, IconButton, Dialog, DialogTitle, DialogContent, TextField, Avatar, Button, MenuItem, Menu, Select, Paper, FormControl, Grid, ListItemIcon, ListItemText, InputBase, Tooltip, Chip, Popover, Checkbox
} from '@mui/material';
import { ChromePicker } from 'react-color'; // Color picker library
import Textarea from '@mui/joy/Textarea';
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloseIcon from '@mui/icons-material/Close';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ListIcon from '@mui/icons-material/List';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import ChecklistIcon from '@mui/icons-material/Checklist';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import MoreTimeOutlinedIcon from '@mui/icons-material/MoreTimeOutlined';
import AddIcon from '@mui/icons-material/Add';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import { Person } from '@mui/icons-material';
import FlagIcon from '@mui/icons-material/Flag';
import axios from 'axios';
import dayjs from 'dayjs';
import Subtask from './Subtask'; // Import the Subtask component
import relativeTime from 'dayjs/plugin/relativeTime'; // Import the relativeTime plugin
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PaletteIcon from '@mui/icons-material/Palette'; // Color picker icon
import ClickAwayListener from '@mui/material/ClickAwayListener';

dayjs.extend(relativeTime); // Extend Day.js with the relativeTime plugin
const filter = createFilterOptions();

const AddTaskModal = ({ workspaceId, projectId, taskId, onClose, open, onTaskChange }) => {
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    assigneePrimary: '',
    startDate: dayjs(), // Default to current date
    dueDate: dayjs().add(7, 'day'), // Default to one week from current date
    status: '',
    priority: 'Normal',
    relation: [],
    actualEffort: 0, // Default actual effort
    allocatedEffort: 0, // Default allocated effort
    subactions: [],
    labels: [],
    dependencies: [],
    checklist: [],
    comments: [],
  });

  const [task, setTask] = useState({});
  const [subtasks, setSubtasks] = useState([]); // Initialize subtasks state
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [openSubtaskModal, setOpenSubtaskModal] = useState(false); // State to control subtask modal visibility
  const [selectedSubtask, setSelectedSubtask] = useState(null); // State to store the selected subtask data
  const [newComment, setNewComment] = useState(''); // State for new comment input
  const [comments, setComments] = useState([]); // State for storing all comments
  const [newStatus, setNewStatus] = useState(''); // State for new status input
  const [statusList, setStatusList] = useState([]);
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const commentRef = useRef(null);
  const [isPostDisabled, setIsPostDisabled] = useState(true);
  const [initialValues, setInitialValues] = useState({
    name: '',
    description: ''
  });
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [anchorElStart, setAnchorElStart] = useState(null);
  const [anchorElDue, setAnchorElDue] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openStatusPicker, setOpenStatusPicker] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null); // To handle opening/closing of priority menu
  const isPriorityMenuOpen = Boolean(priorityAnchorEl);
  const [editingField, setEditingField] = useState(null); // To track which field is in edit mode (e.g., 'actualEffort', 'allocatedEffort')
  const [labels, setLabels] = useState([]); // Store available labels for the project
  const [editLabelId, setEditLabelId] = useState(null); // Track which label is being edited
  const [editLabelData, setEditLabelData] = useState({ name: '', color: '' });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textFieldRef = useRef(null);

  const handlePriorityClick = (event) => {
    setPriorityAnchorEl(event.currentTarget); // Open menu at the chip's position
  };

  const handlePriorityClose = (priority) => {
    setPriorityAnchorEl(null); // Close menu
    if (priority) {
      setTaskData((prevData) => ({ ...prevData, priority })); // Set selected priority
      setIsSaveButtonEnabled(true);
    }
  };

  // Handle multiple selection for relations
  const handleRelationChange = (event) => {
    const {
      target: { value },
    } = event;
    setTaskData((prevData) => ({
      ...prevData,
      relation: typeof value === 'string' ? value.split(',') : value, // Store multiple selections in an array
    }));
    setIsSaveButtonEnabled(true);
  };


  // Handle effort value changes (both actual and allocated)
  const handleEffortChange = (field, value) => {
    setTaskData((prevData) => ({
      ...prevData,
      [field]: Number(value),
    }));
    setIsSaveButtonEnabled(true);
  };

  // Handle saving the effort field when blur or Enter is pressed
  const handleSaveEffort = (field) => {
    setEditingField(null); // Close the input by setting `editingField` to null
  };

  const handleStartDateClick = (event) => {
    setAnchorElStart(event.currentTarget);
  };

  const handleDueDateClick = (event) => {
    setAnchorElDue(event.currentTarget);
  };

  const handleDateClose = () => {
    setAnchorElStart(null);
    setAnchorElDue(null);
  };

  const openStartDatePicker = Boolean(anchorElStart);
  const openDueDatePicker = Boolean(anchorElDue);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    if (taskId) {
      fetchTask(taskId);

      // Fetch subtasks and comments for the current task using the API
      fetchSubtasks(taskId);
      fetchComments(taskId); // Fetch existing comments
      fetchStatusList(projectId);
    } else {
      // This block is for when no taskId is provided, indicating task creation
      setTaskData({
        name: '',
        description: '',
        assigneePrimary: '',
        startDate: dayjs(), // Default to current date
        dueDate: dayjs().add(7, 'day'), // Default to one week from current date
        status: '',
        priority: 'Normal',
        relation: '',
        actualEffort: 0, // Default actual effort
        allocatedEffort: 0, // Default allocated effort
        subactions: [],
        labels: [],
        dependencies: [],
        comments: [],
        checklist: [],
      });
    }
  }, [taskId]);

  useEffect(() => {
    const fetchProjectLabels = async () => {
      try {
        const response = await axios.get(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/labels`);
        setLabels(response.data.labels || []);
      } catch (error) {
        console.error('Failed to fetch project labels:', error);
      }
    };
    fetchProjectLabels();
  }, [projectId]);

  // Handle selecting multiple labels for the task
  const handleLabelChange = (event) => {
    setTaskData((prev) => ({ ...prev, labels: event.target.value }));
    setIsSaveButtonEnabled(true);
  };

  // Focus the TextField whenever entering edit mode
  useEffect(() => {
    if (editLabelId && textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, [editLabelId]);

  // Handle text input changes for label name
  const handleLabelNameChange = (e) => {
    const newName = e.target.value;
    setEditLabelData((prev) => ({ ...prev, name: newName }));
  };

  // Start editing a label (name and color)
  const handleEditLabel = (label) => {
    setEditLabelId(label._id); // Track which label is being edited
    setEditLabelData({ name: label.name, color: label.color || '#111' }); // Initialize with current label data
  };

  // Save the edited label (both name and color)
  const handleSaveLabelEdit = async () => {
    try {
      await axios.put(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/labels`, {
        labelId: editLabelId,
        newLabelName: editLabelData.name,
        newLabelColor: editLabelData.color,
      });
      setLabels((prevLabels) =>
        prevLabels.map((label) =>
          label._id === editLabelId
            ? { ...label, name: editLabelData.name, color: editLabelData.color }
            : label
        )
      );
      setEditLabelId(null); // Stop editing after saving
    } catch (error) {
      console.error('Failed to save label edit:', error);
    }
  };

  // Function to handle adding a checklist item
  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setTaskData((prevData) => ({
        ...prevData,
        checklist: [...prevData.checklist, { text: newChecklistItem, completed: false }],
      }));
      setNewChecklistItem('');
      setIsSaveButtonEnabled(true);
    }
  };

  // Fetch tasks for Relation dropdown
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task`);
        setTasks(response.data.tasks); // Assuming response contains tasks in `tasks` field
        console.log(response);
      } catch (error) {
        console.error('Failed to fetch tasks for Relation dropdown:', error);
      }
    };

    fetchTasks();
  }, [workspaceId, projectId]);

  // Function to handle removing a checklist item
  const handleRemoveChecklistItem = (index) => {
    setTaskData((prevData) => ({
      ...prevData,
      checklist: prevData.checklist.filter((_, i) => i !== index),
    }));
    setIsSaveButtonEnabled(true);
  };

  // Function to toggle the completion status of a checklist item
  const handleToggleChecklistItem = (index) => {
    setTaskData((prevData) => {
      const updatedChecklist = [...prevData.checklist];
      updatedChecklist[index].completed = !updatedChecklist[index].completed;
      return { ...prevData, checklist: updatedChecklist };
    });
    setIsSaveButtonEnabled(true);
  };


  // Function to fetch Task
  const fetchTask = async (taskId) => {
    try {
      const response = await axios.get(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}`
      );
      const task = response.data.task;
      setTask(task);
      const updatedTaskData = {
        ...task,
        startDate: task.startDate ? dayjs(task.startDate) : dayjs(),
        dueDate: task.dueDate ? dayjs(task.dueDate) : dayjs().add(7, 'day'),
      };
      setTaskData(updatedTaskData);
      setInitialValues({
        name: updatedTaskData.name,
        description: updatedTaskData.description
      });
    } catch (error) {
      console.error('Failed to fetch task:', error);
    }
  };

  // Function to fetch subtasks from MongoDB
  const fetchSubtasks = async (taskId) => {
    try {
      const response = await axios.get(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/subtasks`
      );
      setSubtasks(response.data.subtasks);
    } catch (error) {
      console.error('Failed to fetch subtasks:', error);
    }
  };

  // Function to fetch comments from the backend
  const fetchComments = async (taskId) => {
    try {
      const response = await axios.get(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/comments`
      );
      setComments(response.data.comments); // Assuming API response contains a 'comments' array
      commentRef.current.innerHTML = '';  // Clear the content after posting
      setIsPostDisabled(true);  // Disable post button after posting
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  // Callback to trigger alerts
  const handleSubtaskChange = () => {
    //setAlert({ open: true, message, severity });
    fetchSubtasks(taskId); // Refresh table after changes
  };

  // Function to wrap selected text with a tag for formatting
  const applyTextFormat = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleAddComment = async () => {
    const commentHTML = commentRef.current.innerHTML.trim();  // Get HTML content
    if (!commentHTML) return;

    const newCommentData = {
      text: commentHTML,
      user: sessionStorage.getItem('email'),
      timestamp: new Date(),
    };

    try {
      const response = await axios.post(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${task._id}/comments`,
        newCommentData
      );

      if (response.status === 200) {
        setComments((prevComments) => [...prevComments, newCommentData]); // Add new comment to the top
        setNewComment(''); // Clear the comment input field
        commentRef.current.innerHTML = '';
      } else {
        console.error('Failed to add comment:', response.data.error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const fetchStatusList = async (projectId) => {
    try {
      const response = await axios.get(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/statusList`
      );
      setStatusList(response.data.statusList);
    } catch (error) {
      console.error('Failed to fetch status list:', error);
    }
  };

  const handleProjectAddStatus = async (newStatus) => {
    const newStatusData = {
      title: newStatus,
      value: newStatus,
      color: '#111',
    };
    try {
      const response = await axios.post(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/statusList`,
        newStatusData
      );
      if (response.status === 200) {
        setStatusList((prevStatusList) => [...prevStatusList, newStatusData]);
        setNewStatus('');
      } else {
        console.error('Failed to add new status:', response.data.error);
      }
    } catch (error) {
      console.error('Error adding status:', error);
    }
  };

  const handleOpenSubtaskModal = (subtask) => {
    setSelectedSubtask(subtask);
    setOpenSubtaskModal(true);
  };

  const handleCloseSubtaskModal = () => {
    setSelectedSubtask(null);
    setOpenSubtaskModal(false);
  };

  const handleStatusChange = (event, newValue) => {
    if (newValue && typeof newValue.value === 'string') {
      handleInputChange('status', newValue.value);
    } else if (newValue && newValue.inputValue) {
      handleProjectAddStatus(newValue.inputValue);
      handleInputChange('status', newValue.inputValue);
    } else {
      handleInputChange('status', newValue);
    }
    setOpenStatusPicker(false);
  };

  const handlefilterOptions = (options, params) => {
    const filtered = filter(options, params);
    const { inputValue } = params;
    // Suggest the creation of a new value
    const isExisting = options.some((option) => inputValue === option.title);
    if (inputValue !== "" && !isExisting) {
      filtered.push({
        inputValue,
        title: `Add "${inputValue}"`,
      });
    }
    return filtered;
  };

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
        const response = await axios.get(
          `/api/auth/getAgents?accountId=${accountId}&subdomain=${extractedSubdomain}`
        );
        setAssigneeOptions(response.data);
      } catch (error) {
        console.error('Failed to fetch assignees:', error);
      }
    };

    fetchAssignees();
  }, []);

  const handleInputChange = (field, value) => {
    setTaskData((prevData) => ({
      ...prevData,
      [field]: value, // For relation, value will be an array of selected task IDs
    }));
    //setIsSaveButtonEnabled(true);
    // Check if the field is for the comment, and handle that separately
    if (field === 'comment') {
      const content = commentRef.current.innerHTML.trim();
      setIsPostDisabled(content === '');  // Enable/Disable "Post" button based on comment content
      return; // Stop here, don't affect task data or "Save Changes" button
    }
    setTaskData((prevData) => ({ ...prevData, [field]: value }));

    // Enable save button if relevant fields are changed
    if (field !== 'description') {
      setIsSaveButtonEnabled(true);
    }
    // Automatically save task name if it was changed
    if (field === 'name') {
      setIsSaveButtonEnabled(false);
    }
  };

  const handleDateChange = (field, newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      setTaskData((prevData) => ({
        ...prevData,
        [field]: dayjs(newValue),
      }));
      setIsSaveButtonEnabled(true); // Enable save button
    }
  };

  // Automatically save on description change
  const handleDescriptionBlur = async () => {
    await handleSubmit(); // Save the updated description
  };

  const handleTaskNameBlur = async () => {
    await handleSubmit(); // Save the updated task name on blur
  };

  const handleSubmit = async () => {
    try {
      if (taskId) {
        // Task update logic (as it is already in your code)
        const response = await axios.put(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${task._id}`, taskData);

        if (response.status === 200) {
          console.log(response);
          setIsSaveButtonEnabled(false); // Reset after successful save
          onTaskChange('Task updated successfully', 'success');
          //onClose();
        } else {
          onTaskChange('Failed to update Task');
        }
      } else {
        // Task creation logic
        const response = await axios.post(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task`, taskData);

        if (response.status === 200) {
          setIsSaveButtonEnabled(false); // Reset after successful creation
          onTaskChange('Task created successfully', 'success');
          onClose();
        } else {
          onTaskChange('Failed to create Task');
        }
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      onTaskChange('Error submitting Task');
    }
  };

  // Handler to open the menu
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handler to close the menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handler to select an assignee
  const handleAssigneeSelect = (assignee) => {
    setTaskData((prevData) => ({
      ...prevData,
      assigneePrimary: assignee,
    }));
    setIsSaveButtonEnabled(true);
    handleClose(); // Close the menu after selection
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth sx={{
      '& .MuiDialog-paper': {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',  // Set the width of the dialog (80% of the viewport width)
        height: '90vh',  // Set the height of the dialog (90% of the viewport height)
        maxWidth: 'none',  // Disable the default maxWidth behavior
        maxHeight: 'none',  // Disable the default maxHeight behavior
        //maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        p: 0,
      },
    }}>
      <DialogTitle
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
        <Typography variant="h6" sx={{ color: '#fff', ml: 2 }}>{taskData.taskNumber}</Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          height: '600px',
        }}
      >
        {/* Wrap the component with LocalizationProvider */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Left Column - Scrollable with Custom Scrollbar */}
          <Box
            sx={{
              overflowY: 'auto',
              maxHeight: '100%',
              flex: '6',
              pr: 2,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#dcd8f3',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            {/* Task Name */}
            <Box display="flex" alignItems="center" flexGrow={1}>
              {/* Task Name */}
              <Textarea
                fullWidth
                label="Task Name"
                variant="plain"
                value={taskData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={handleTaskNameBlur} // Save on blur
                sx={{ mb: 1, fontSize: '16px', fontWeight: 'bold', width: '1000px' }}
              />


              {/* Status Chip */}
              <Tooltip title="Status" placement="bottom" arrow>
                <Chip
                  label={taskData.status || 'Select Status'}
                  icon={<RadioButtonCheckedOutlinedIcon />}
                  onClick={() => setOpenStatusPicker(true)} // Opens the dialog when the chip is clicked
                  sx={{ cursor: 'pointer', bgcolor: '#e0f7fa', mr: 2 }}
                />
              </Tooltip>

              {/* Dialog for Autocomplete */}
              <Dialog open={openStatusPicker} onClose={handleClose}>
                <DialogTitle>Select Status</DialogTitle>
                <DialogContent>
                  {/* Autocomplete for Status */}
                  <Autocomplete
                    value={taskData.status}
                    onChange={(event, newValue) => {
                      handleStatusChange(event, newValue);
                      handleClose(); // Close the dialog on selection
                    }}
                    filterOptions={(options, params) => handlefilterOptions(options, params)}
                    displayEmpty
                    fullWidth
                    options={statusList}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') {
                        return option;
                      }
                      if (option.inputValue) {
                        return option.inputValue;
                      }
                      return option.title;
                    }}
                    renderOption={(props, option) => {
                      const { key, ...optionProps } = props;
                      return (
                        <li key={key} {...optionProps}>
                          {option.title}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} onFocus={() => setOpenStatusPicker(true)} sx={{ width: '200px' }} /> // Open on focus
                    )}
                  />
                </DialogContent>
              </Dialog>

              {/* Assignee Chip */}
              <Tooltip title="Assigne" placement="bottom" arrow>
                <Chip
                  label={taskData.assigneePrimary || 'Unassigned'}
                  onClick={handleClick}
                  variant="outlined"
                  icon={<Person />}
                  sx={{ cursor: 'pointer', bgcolor: taskData.assigneePrimary ? '#e0f7fa' : '#f5f5f5', mr: 2 }}
                />
              </Tooltip>

              {/* Menu for Assignees */}
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',  // Position the menu below the clicked element
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',  // Ensure the menu pops up from the top
                  horizontal: 'left',
                }}
              >
                {assigneeOptions.map((assignee) => (
                  <MenuItem key={assignee.id} onClick={() => handleAssigneeSelect(assignee.name)}>
                    {assignee.name}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            {/* Description */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ArticleOutlinedIcon sx={{ mr: 1 }} /> {/* Adjust margin as needed */}
              <Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: '600' }}>Description</Typography>
            </Box>
            <Textarea
              fullWidth
              variant="plain"
              placeholder="Add description"
              multiline
              minRows={2}
              value={taskData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={handleDescriptionBlur} // Call onBlur to save on focus out
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
              {/* Priority Field (Chip style) */}
              {/* <Grid item xs={12} md={6}> */}
              <Tooltip title="Priority" placement="top" arrow>
                <Chip
                  label={taskData.priority}
                  icon={<FlagIcon />} // Example icon
                  onClick={handlePriorityClick} // Click to open the menu
                  sx={{ cursor: 'pointer', bgcolor: '#e0f7fa', mr: 2 }} // Customize background color if desired
                />
              </Tooltip>

              {/* Priority Menu */}
              <Menu
                anchorEl={priorityAnchorEl}
                open={isPriorityMenuOpen}
                onClose={() => handlePriorityClose(null)} // Close without selection
              >
                <MenuItem onClick={() => handlePriorityClose('Urgent')}>Urgent</MenuItem>
                <MenuItem onClick={() => handlePriorityClose('Medium')}>Medium</MenuItem>
                <MenuItem onClick={() => handlePriorityClose('Low')}>Low</MenuItem>
                <MenuItem onClick={() => handlePriorityClose('Normal')}>Normal</MenuItem>
              </Menu>
              {/* </Grid> */}


              {/* Allocated Effort Chip */}
              <Grid item xs={12} md={4}>
                {editingField === 'allocatedEffort' ? (
                  <TextField
                    fullWidth
                    autoFocus
                    type="number"
                    value={taskData.allocatedEffort}
                    onChange={(e) => handleEffortChange('allocatedEffort', e.target.value)}
                    onBlur={() => handleSaveEffort('allocatedEffort')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEffort('allocatedEffort');
                      }
                    }}
                  />
                ) : (
                  <Tooltip title="Allocated Effort" placement="top" arrow>
                    <Chip
                      label={`${taskData.allocatedEffort} hours`}
                      icon={<MoreTimeOutlinedIcon />}
                      onClick={() => setEditingField('allocatedEffort')}
                      sx={{ cursor: 'pointer', bgcolor: '#e0f7fa', mr: 2 }} // Customize the chip as desired
                    />
                  </Tooltip>
                )}
              </Grid>

              {/* Actual Effort Chip */}
              <Grid item xs={12} md={4}>

                {editingField === 'actualEffort' ? (
                  <TextField
                    fullWidth
                    autoFocus
                    type="number"
                    value={taskData.actualEffort}
                    onChange={(e) => handleEffortChange('actualEffort', e.target.value)}
                    onBlur={() => handleSaveEffort('actualEffort')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEffort('actualEffort');
                      }
                    }}
                  />
                ) : (
                  <Tooltip title="Actual Effort" placement="top" arrow>
                    <Chip
                      label={`${taskData.actualEffort} hours`}
                      icon={<MoreTimeOutlinedIcon />}
                      onClick={() => setEditingField('actualEffort')}
                      sx={{ cursor: 'pointer', bgcolor: '#e0f7fa', mr: 2 }} // Customize the chip as desired
                    />
                  </Tooltip>
                )}
              </Grid>

              {/* Start Date Chip */}
              <Tooltip title="Start Date" placement="top" arrow>
                <Chip
                  label={`${taskData.startDate ? taskData.startDate.format('DD/MM/YYYY') : 'Select Start Date'}`}
                  icon={<CalendarMonthOutlinedIcon />}
                  onClick={handleStartDateClick}
                  sx={{ mr: 2 }} // Margin to separate from the next chip
                />
              </Tooltip>

              <Popover
                open={openStartDatePicker}
                anchorEl={anchorElStart}
                onClose={handleDateClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={taskData.startDate}
                    onChange={(newValue) => handleDateChange('startDate', newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    disablePast
                  />
                </LocalizationProvider>
              </Popover>

              {/* Due Date Chip */}
              <Tooltip title="Due Date" placement="top" arrow>
                <Chip
                  label={`${taskData.dueDate ? taskData.dueDate.format('DD/MM/YYYY') : 'Select Due Date'}`}
                  icon={<CalendarMonthOutlinedIcon />}
                  onClick={handleDueDateClick}
                  sx={{ mr: 2 }} // Margin to separate from the next chip
                />
              </Tooltip>

              <Popover
                open={openDueDatePicker}
                anchorEl={anchorElDue}
                onClose={handleDateClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={taskData.dueDate}
                    onChange={(newValue) => handleDateChange('dueDate', newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    disablePast
                  />
                </LocalizationProvider>
              </Popover>
            </Box>
            {/* ))} */}

            {/* Relation Field with Custom Layout */}
            <Box mt={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mr: 2, fontSize: '16px', fontWeight: '600' }}>
                <SwapHorizOutlinedIcon sx={{ marginRight: '8px' }} /> Relation
              </Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={taskData.relation || []} // Make sure it's always an array
                  onChange={(e) => handleInputChange('relation', e.target.value)}
                  displayEmpty
                  input={<InputBase />}
                  renderValue={(selected) => {
                    // Check if `selected` is an array before accessing its length
                    if (!Array.isArray(selected) || selected.length === 0) {
                      return <Typography color="textSecondary" sx={{ marginLeft: '50px', mr: 2 }}>Empty</Typography>;
                    }
                    const selectedTasks = tasks.filter((task) => selected.includes(task._id));
                    return (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedTasks.map((task) => (
                          <Chip key={task._id} label={task.name} />
                        ))}
                      </Box>
                    );
                  }}
                >
                  <MenuItem disabled value="">
                    <Typography color="textSecondary">Empty</Typography>
                  </MenuItem>
                  {tasks.map((task) => (
                    <MenuItem key={task._id} value={task._id}>
                      <ListItemIcon>
                        <FlagIcon sx={{ color: 'gray' }} />
                      </ListItemIcon>
                      <ListItemText primary={task.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            </Box>

            <Box mt={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mr: 2, fontSize: '16px', fontWeight: '600' }}>
                <LabelOutlinedIcon sx={{ marginRight: '8px' }} /> Label
              </Typography>
              <Select
                multiple
                value={taskData.labels}
                onChange={handleLabelChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const selectedLabel = labels.find((label) => label._id === value);
                      return (
                        <Chip
                          key={value}
                          label={selectedLabel ? selectedLabel.name : 'Unknown'}
                          style={{ backgroundColor: selectedLabel ? selectedLabel.color : '#ccc', color: '#fff' }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {labels.map((label) => (
                  <MenuItem key={label._id} value={label._id}>
                    {editLabelId === label._id ? (
                      <Box display="flex" alignItems="center" width="100%">
                        {/* Inline editing text field for label name */}
                        <TextField
                          value={editLabelData.name}
                          onChange={handleLabelNameChange}
                          fullWidth
                          inputRef={textFieldRef}
                        />
                        {/* Color picker icon */}
                        <IconButton onClick={() => setShowColorPicker((prev) => !prev)}>
                          <PaletteIcon />
                        </IconButton>
                        {/* Conditionally render the ChromePicker */}
                        {showColorPicker && (
                          <ClickAwayListener onClickAway={() => setShowColorPicker(false)}>
                            <Box position="absolute" zIndex={2} height="100%">
                              <ChromePicker
                                color={editLabelData.color}
                                onChangeComplete={(color) => setEditLabelData((prev) => ({ ...prev, color: color.hex }))}
                              />
                            </Box>
                          </ClickAwayListener>
                        )}
                        {/* Save button to save changes */}
                        <IconButton onClick={handleSaveLabelEdit} sx={{ ml: 2 }}>
                          <SaveIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Checkbox checked={taskData.labels.indexOf(label._id) > -1} />
                        <ListItemText primary={label.name} style={{ color: label.color }} />
                        <IconButton onClick={() => handleEditLabel(label)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            {/* Checklist Section */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ChecklistIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: '600' }}>Checklist</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              {taskData.checklist.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Checkbox
                    checked={item.completed}
                    onChange={() => handleToggleChecklistItem(index)}
                  />
                  <Typography sx={{ textDecoration: item.completed ? 'line-through' : 'none' }}>
                    {item.text}
                  </Typography>
                  <IconButton onClick={() => handleRemoveChecklistItem(index)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              ))}
              {/* Input for adding new checklist item */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add a checklist item"
                //fullWidth
                />
                <IconButton onClick={handleAddChecklistItem} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
            {/* Subactions */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ListIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: '600' }}>Subtask</Typography>
            </Box>
            <Button startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => handleOpenSubtaskModal({})}>
              New subtask
            </Button>

            {/* List of Subtasks */}
            {/* {subtasks.map((subtask) => ( */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {subtasks.map((subtask) => (
                <Chip
                  key={subtask._id}
                  label={subtask.name}
                  onClick={() => handleOpenSubtaskModal(subtask)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!isSaveButtonEnabled} sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', mt: 2 }} >
              Save Changes
            </Button>
          </Box>

          <Divider orientation="vertical" variant="middle" flexItem />
          {/* Right Column - Sticky */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              flex: '4',
              alignSelf: 'flex-start',
              minWidth: '200px',
              maxWidth: '550px',
              bgcolor: 'background.paper',
              pl: 2,
              //borderLeft: '1px solid #ddd',
            }}
          >

            {/* Comments */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <MapsUgcRoundedIcon sx={{ mr: 1 }} /> {/* Adjust margin as needed */}
              <Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: '600' }}>Comments</Typography>
            </Box>
            <Box 
            sx={{
              mt: 2,
              mb: 2,
              maxHeight: '361px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: '#f0f0f0' },
              '&::-webkit-scrollbar-thumb': { background: '#b0b0b0', borderRadius: '4px' },
              scrollbarWidth: 'thin',
              scrollbarColor: '#b0b0b0 #f0f0f0',
            }}
            >
              {comments.map((comment, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <Avatar sx={{ mr: 2 }}>{comment.user ? comment.user.charAt(0).toUpperCase() : 'U'}</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: '600' }}>
                      {comment.user || 'Unknown User'} {comment.timestamp ? dayjs(comment.timestamp).fromNow() : ''}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="div"
                      dangerouslySetInnerHTML={{ __html: comment.text }}  // Safely render the HTML content
                    />
                  </Box>
                </Box>
              ))}
            </Box>
            <Divider variant="middle"  />
            {/* Comment Input Field Styled Like the Image */}
            <Box
              //component={Paper}
              // sx={{
              //   position: 'sticky',  // Make the comment input sticky
              //   bottom: 0,  // Stick it to the bottom of the dialog
              //   display: "flex",
              //   alignItems: "center",
              //   border: "1px solid #cfcfcf",
              //   borderRadius: "5px",
              //   p: 1,
              //   mt: 2,
              // }}
            >
              {/* Formatting Icons */}
              <Tooltip title="Bold">
                <IconButton onClick={() => applyTextFormat('bold')}>
                  <FormatBoldIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Italic">
                <IconButton onClick={() => applyTextFormat('italic')}>
                  <FormatItalicIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Bulleted List">
                <IconButton onClick={() => applyTextFormat('insertUnorderedList')}>
                  <FormatListBulletedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Numbered List">
                <IconButton onClick={() => applyTextFormat('insertOrderedList')}>
                  <FormatListNumberedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Link">
                <IconButton onClick={() => {
                  const url = prompt('Enter the URL', 'http://');
                  if (url) {
                    applyTextFormat('createLink', url);
                  }
                }}>
                  <InsertLinkIcon />
                </IconButton>
              </Tooltip>

              {/* Rich Text HTML Comment Input */}
              <Box
                ref={commentRef}
                contentEditable={true}  // Enable rich text editing
                placeholder="Add a comment..."
                sx={{
                  ml: 1,
                  flex: 1,
                  p: 1,
                  minHeight: '40px',
                  //border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  outline: 'none',
                  '&:empty:before': { content: 'attr(placeholder)', color: '#9e9e9e' },
                }}
                onInput={() => handleInputChange('comment')}  // Listen for changes to enable/disable Post button
              />

              {/* Post Button */}
              <Button
                variant="contained"
                sx={{ ml: 1, mt:1 }}
                onClick={handleAddComment}
                disabled={isPostDisabled}  // Enable/Disable based on content
              >
                Post
              </Button>
            </Box>
          </Box>
        </LocalizationProvider>
      </DialogContent>
      {/* Subtask Modal Rendering */}
      {
        openSubtaskModal && selectedSubtask && (
          <Subtask
            open={openSubtaskModal}
            onClose={handleCloseSubtaskModal}
            taskId={task._id}
            projectId={projectId}
            workspaceId={workspaceId}
            subtaskId={selectedSubtask._id}
            subtask={selectedSubtask}
            onSubtaskChange={handleSubtaskChange}
          />
        )
      }
    </Dialog >
  );
};

export default AddTaskModal;
