import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Avatar,
  Button,
  MenuItem, Menu,
  Select,
  Paper,
  InputBase,
  Tooltip,
  Chip, Popover, Checkbox
} from '@mui/material';
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
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import dayjs from 'dayjs';
import Subtask from './Subtask'; // Import the Subtask component
import relativeTime from 'dayjs/plugin/relativeTime'; // Import the relativeTime plugin
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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
        subactions: [],
        labels: [],
        dependencies: [],
        comments: [],
        checklist: [],
      });
    }
  }, [taskId]);

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
        <Typography variant="h6" sx={{ color: '#fff' }}>{taskData.taskNumber}</Typography>
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
              flex: '5',
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
            <Textarea
              fullWidth
              label="Task Name"
              variant="plain"
              value={taskData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={handleTaskNameBlur} // Save on blur
              sx={{ mb: 1, fontSize: '16px', fontWeight: 'bold' }}
            />

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
            {/* ))} */}

            {/* Comments */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MapsUgcRoundedIcon sx={{ mr: 1 }} /> {/* Adjust margin as needed */}
              <Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: '600' }}>Comments</Typography>
            </Box>
            <Box sx={{
              mt: 2,
              mb: 2,
              maxHeight: '200px',
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: '#f0f0f0' },
              '&::-webkit-scrollbar-thumb': { background: '#b0b0b0', borderRadius: '4px' },
              scrollbarWidth: 'thin',
              scrollbarColor: '#b0b0b0 #f0f0f0',
            }}>
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
            {/* Comment Input Field Styled Like the Image */}
            <Box
              component={Paper}
              sx={{
                position: 'sticky',  // Make the comment input sticky
                bottom: 0,  // Stick it to the bottom of the dialog
                display: "flex",
                alignItems: "center",
                border: "1px solid #cfcfcf",
                borderRadius: "5px",
                p: 1,
                mt: 2,
              }}
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
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  outline: 'none',
                  '&:empty:before': { content: 'attr(placeholder)', color: '#9e9e9e' },
                }}
                onInput={() => handleInputChange('comment')}  // Listen for changes to enable/disable Post button
              />

              {/* Post Button */}
              <Button
                variant="contained"
                sx={{ ml: 2 }}
                onClick={handleAddComment}
                disabled={isPostDisabled}  // Enable/Disable based on content
              >
                Post
              </Button>
            </Box>
            {/* </Box> */}
          </Box>

          {/* Right Column - Sticky */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              flex: '5',
              alignSelf: 'flex-start',
              minWidth: '200px',
              maxWidth: '350px',
              bgcolor: 'background.paper',
              pl: 2,
              borderLeft: '1px solid #ddd',
            }}
          >
            {/* Assignee */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonOutlineOutlinedIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: '600' }}>Assignee</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {/* Avatar and Assignee Name Clickable */}
              <IconButton onClick={handleClick}>
                <Avatar sx={{ mr: 1, bgcolor: '#00264d' }}>
                  {taskData.assigneePrimary ? taskData.assigneePrimary.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>

              <Typography variant="body1" onClick={handleClick} sx={{ cursor: 'pointer' }}>
                {taskData.assigneePrimary || 'Unassigned'}
              </Typography>

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
                    {/* <Avatar sx={{ mr: 1, bgcolor: '#ff5722' }}>{assignee.name.charAt(0).toUpperCase()}</Avatar> */}
                    {assignee.name}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Date Picker */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarMonthOutlinedIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: '600' }}>Dates</Typography>
            </Box>
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <Chip
                label={`Start Date: ${taskData.startDate ? taskData.startDate.format('DD/MM/YYYY') : 'Select Start Date'}`}
                onClick={handleStartDateClick}
                sx={{ mb: 1 }}
              />
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

              <Chip
                label={`Due Date: ${taskData.dueDate ? taskData.dueDate.format('DD/MM/YYYY') : 'Select Due Date'}`}
                onClick={handleDueDateClick}
                sx={{ mb: 1 }}
              />
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

            {/* Status */}
            <Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: '600' }}>Status</Typography>
            <Autocomplete
              value={taskData.status}
              // onChange={(e) => handleInputChange('status', e.target.value)}
              onChange={(event, newValue) =>
                handleStatusChange(event, newValue)
              }
              filterOptions={(options, params) =>
                handlefilterOptions(options, params)
              }
              displayEmpty
              fullWidth
              options={statusList}
              sx={{ mb: 2 }}
              getOptionLabel={(option) => {
                // Value selected with enter, right from the input
                if (typeof option === "string") {
                  return option;
                }
                // Add "xxx" option created dynamically
                if (option.inputValue) {
                  return option.inputValue;
                }
                // Regular option
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
              renderInput={(params) => <TextField {...params} />}
            />
            {/* Checklist Section */}
            <Box sx={{ display: 'flex', alignItems: 'center'}}>
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
                  fullWidth
                />
                <IconButton onClick={handleAddChecklistItem} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!isSaveButtonEnabled} >
              Save Changes
            </Button>
          </Box>
        </LocalizationProvider>
      </DialogContent>

      {/* Submit Button */}
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}> */}
      {/* <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!isSaveButtonEnabled} >
          Save Changes
        </Button> */}
      {/* </Box> */}

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
