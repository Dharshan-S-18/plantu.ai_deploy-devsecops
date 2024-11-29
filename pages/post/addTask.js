import { useState, useEffect, useRef } from "react";
import {
  Button, Box, Typography, IconButton, Menu, MenuItem, InputBase, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, Divider, ListItemIcon, ListItemText, Chip, Avatar, Paper, Grid, Alert, Snackbar, Tooltip, DialogContentText, CircularProgress,
} from "@mui/material";
import { FormControl, FormLabel, Input } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import LinkIcon from '@mui/icons-material/Link';
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PersonIcon from "@mui/icons-material/Person";
import DateRangeIcon from "@mui/icons-material/DateRange";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CancelIcon from "@mui/icons-material/Cancel";
import SubtaskModal from "./Subtask";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs from "dayjs";
import { formatDistanceToNow } from "date-fns";
import { Delete, LinkRounded, Upload, UploadFile } from "@mui/icons-material";
import AssigneeMenu from "../../components/AssigneeMenu";
import Comments from './Comments';
import SubtaskList from './subTaskList';

const AddTaskModal = ({
  projectId,
  task,
  onClose,
  onTaskCreated,
  onTaskUpdated,
}) => {
  const [taskData, setTaskData] = useState({
    name: "",
    assigneePrimary: [], // Changed to an array to allow multiple selections
    assigneeSecondary: "",
    startDate: "",
    dueDate: "",
    priority: "",
    Attachment: [],
    status: "To Do",
    dependencies: [],
    comments: [],
    description: "",
    checklist: [],
    allocatedEffort: "",
    actualEffort: "",
    milestone: false
  });

  const [openSubtaskModal, setOpenSubtaskModal] = useState(false);
  const [taskId, setTaskId] = useState(task ? task._id : null);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [comments, setComments] = useState([]); // State to store comments
  const [newComment, setNewComment] = useState(""); // State to manage new comment input
  const [showAlert, setShowAlert] = useState(false); // State to control the alert visibility

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // success or error
  const [selectedDependencies, setSelectedDependencies] = useState([]); // Store selected dependencies
  const [anchorEl, setAnchorEl] = useState(null); // Controls menu visibility
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState([]);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [startDateAnchorEl, setStartDateAnchorEl] = useState(null);
  const [dueDateAnchorEl, setDueDateAnchorEl] = useState(null);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null);
  const [assigneeAnchorEl, setAssigneeAnchorEl] = useState(null);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Handle selection of assignee
  const handleAssigneeSelect = (assignee) => {
    setTaskData(prev => ({ ...prev, assigneePrimary: assignee || "Unassigned" }));
    closeMenu(setAssigneeAnchorEl);
  };

  // Toggle milestone checkbox
  const handleMilestoneToggle = async (event) => {
    const updatedMilestone = !taskData.milestone;

    // Update the local state to reflect the new milestone status
    setTaskData((prev) => ({ ...prev, milestone: updatedMilestone }));

    try {
      // Make the API call to update the task milestone status
      const response = await axios.put(`/api/project/${projectId}/task/${taskId}`, {
        ...taskData,
        milestone: updatedMilestone,
      });
      // Optionally, show a success notification
      console.log('Milestone status updated successfully', response);
    } catch (error) {
      console.error("Error updating milestone status:", error);
    }
  };

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const response = await axios.get(`/api/project/${projectId}/task/${taskId}`);

        if (response.data && response.data.task) {
          setTaskData(response.data.task); // Populate taskData with the latest data
        } else {
          console.error("Task data not found");
        }
      } catch (error) {
        console.error("Error fetching task data:", error);
      }
    };

    if (taskId) {
      fetchTaskData(); // Fetch the latest task data when the taskId changes
    }
  }, [taskId, projectId]);


  const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const [open, setOpen] = useState(false);
  const [selectedFileKey, setSelectedFileKey] = useState(null);
  // Functions to open/close menus
  const openMenu = (event, setAnchorEl) => setAnchorEl(event.currentTarget);
  const closeMenu = (setAnchorEl) => setAnchorEl(null);


  // Handle selection and update task data
  const handleMenuSelect = (field, value, closeMenuFn) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
    closeMenuFn();
  };


  const handleClickOpen = (fileKey) => {
    setSelectedFileKey(fileKey);
    setOpen(true);
  };

  // Initialize dependencies from task data if available
  useEffect(() => {
    if (task && task.dependencies) {
      setSelectedDependencies(task.dependencies);
    }
  }, [task]);

  const handleClose = () => {
    setOpen(false);
  };
  // Fetch the attachments for the project
  useEffect(() => {
    fetchAttachments();
  }, [projectId]);

  const fetchAttachments = async () => {
    try {
      const response = await fetch(
        `/api/project/${projectId}/task/${taskId}/gettaskattachment`
      );
      if (response.ok) {
        const data = await response.json();
        setAttachments(data); // Set the attachments
      } else {
        console.error("Error fetching attachments");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Handle the file upload logic here (e.g., upload to server or display file)
    }
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input click
    }
  };
  const handleCancelSelection = () => {
    setSelectedFile(null); // Clear the selected file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the input value
    }
  };
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `/api/project/${projectId}/task/${taskId}/taskattachment`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded:", data.url);
        console.log("Unique file ID:", data.uploadfileId); // You can use this ID for further actions
        fetchAttachments();
        setSnackbarMessage("File uploaded successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        console.error("File upload failed");
        setSnackbarMessage("File upload failed!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setSnackbarMessage("Error uploading file!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
      handleCancelSelection();
    }
  };

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const response = await axios.get(`/api/project/${projectId}/task`); // Replace with your actual API endpoint
        console.log(response);
        setTasks(response.data.tasks); // Assuming response is an array of dependency objects
      } catch (error) {
        console.error("Error fetching dependencies:", error);
      }
    };

    fetchDependencies();
  }, [projectId]);

  // Function to handle task navigation
  const handleNavigateToTask = (taskId) => {
    const taskUrl = `http://kakoli.localhost:3000/post/projects/${projectId}/edit?section=Tasks&taskId=${taskId}`;
    window.open(taskUrl, "_blank"); // Open the URL in a new tab
  };

  const handleDeleteDependency = (idToRemove) => {
    setTaskData((prevData) => ({
      ...prevData,
      dependencies: prevData.dependencies.filter((id) => id !== idToRemove),
    }));
  };

  // Handle selection and deselection
  const handleAddDependency = (id) => {
    setTaskData((prevData) => ({
      ...prevData,
      dependencies: prevData.dependencies.includes(id)
        ? prevData.dependencies // Do nothing if already selected
        : [...prevData.dependencies, id], // Add if not selected
    }));
    setAnchorEl2(null); // Close the menu after adding
  };

  //Delete Attachment handle
  const handleConfirmDelete = async (fileKey) => {
    try {
      const res = await fetch(`/api/project/${projectId}/attachment`, {
        method: "DELETE",
        body: JSON.stringify({ fileKey: selectedFileKey }),
      });
      const data = await res.json();
      console.log("File Deleted:", data);
      handleClose();
      fetchAttachments(); // Refresh the list of files
      setSnackbarMessage("File Deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error Deleting File:", error);
      setSnackbarMessage("Error Deleting File!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    if (task) {
      setTaskData({
        ...task,
        actualTime: task.actualTime ? dayjs(task.actualTime) : null,
        milestone: task.milestone,
      });
      setTaskId(task._id);
    }
  }, [task]);

  // Fetch comments when taskId changes
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `/api/project/${projectId}/task/${taskId}/comments`
        );
        console.log(response);
        setComments(response.data.comments);
        console.log(response.data.comments);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const handleInputChange = (name, value) => {
    if (name === "actualTime") {
      value = value ? dayjs(value) : null;
    }
    setTaskData({ ...taskData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Prepare task data with dependencies
    const updatedTaskData = {
      ...taskData,
      dependencies: taskData.dependencies, // Include selected dependencies here
    };
    try {
      if (task) {
        const response = await axios.put(
          `/api/project/${projectId}/task/${task._id}`,
          updatedTaskData
        );
        //alert('Task updated successfully');
        const updatedTask = response.data.task;
        // Call the onTaskUpdated prop to update the task in the list
        if (onTaskUpdated) {
          onTaskUpdated("Task updated successfully", "success", updatedTask);
        }
        onClose();
      } else {
        const response = await axios.post(
          `/api/project/${projectId}/task`,
          taskData
        );
        //alert('Task added successfully');
        const newTask = response.data.task;
        setTaskId(response.data.task._id);
        // Call the onTaskCreated prop to update the task list
        if (onTaskCreated) {
          onTaskCreated("Task Created Successfully", "success", newTask);
        }
        onClose();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      onTaskCreated("Failed to save task", "error", null);
    }
  };

  const openSubtaskHandler = () => {
    if (!taskId) {
      alert("Please save the task first before adding subtasks.");
      return;
    }
    setOpenSubtaskModal(true);
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setTaskData((prevData) => ({
        ...prevData,
        checklist: [
          ...prevData.checklist,
          { text: newChecklistItem, completed: false },
        ],
      }));
      setNewChecklistItem("");
    }
  };

  const handleChecklistChange = (index) => {
    const updatedChecklist = taskData.checklist.map((item, idx) =>
      idx === index ? { ...item, completed: !item.completed } : item
    );
    setTaskData({ ...taskData, checklist: updatedChecklist });
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!taskId) {
      // Show alert if task is not created
      setShowAlert(true);
      return;
    }

    const userEmail = sessionStorage.getItem("email"); // Retrieve user's email from sessionStorage

    if (!userEmail) {
      alert("User is not logged in. Please log in to add a comment.");
      return;
    }

    if (!newComment.trim()) {
      alert("Please enter a comment before submitting.");
      return;
    }

    try {
      await axios.post(`/api/project/${projectId}/task/${taskId}/comments`, {
        text: newComment,
        user: userEmail,
      });

      setComments((prevComments) => [
        ...prevComments,
        {
          text: newComment,
          user: userEmail,
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewComment(""); // Clear the input after successful submission
    } catch (error) {
      console.error("Failed to add comment:", error);
      alert("Failed to add comment. Please try again later.");
    }
  };

  const handleCloseAlert = () => {
    setShowAlert(false); // Close the alert
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
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
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "sticky", // Makes it stick
            top: 0,             // Sticks to the top of the container
            zIndex: 1100,       // Ensure it stays above other content
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#00264d',
            p: 1,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          {/* Milestone Checkbox in top-right corner */}
          <Box display="flex" alignItems="center">
            <Checkbox
              checked={taskData.milestone}
              onChange={handleMilestoneToggle}
              icon={<StarBorderIcon sx={{ color: '#fff' }} />}
              checkedIcon={<StarIcon sx={{ color: '#ffcc00' }} />}
              sx={{ color: "#fff" }}
            />
            <Typography variant="h6" component="div" sx={{ color: "#fff", ml: 2 }}>
              Task Details
            </Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <Tooltip title="Subtasks" arrow>
              <IconButton onClick={openSubtaskHandler} sx={{
                color: '#fff',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(20deg)',
                },
              }}>
                <AccountTreeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy Task Link" arrow>
              <IconButton
                onClick={() => {
                  const taskUrl = `${window.location.origin}/post/projects/${projectId}/edit?section=Tasks&taskId=${taskId}`;
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
            <Tooltip title="Task Close" arrow>
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
        </Box>

        {/* Snackbar Alert for missing task creation */}
        <Snackbar
          variant="filled"
          open={showAlert}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
        >
          <Alert
            variant="filled"
            onClose={handleCloseAlert}
            severity="warning"
            sx={{ width: "100%" }}
          >
            First create a task then add a comment.
          </Alert>
        </Snackbar>

        {/* Content Area */}
        <Box display="flex" gap={1}>
          {/* <Box sx={{ display: "flex", flexDirection: "column", flex: 4 }}> */}
          <Box flex={5} component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Main Content (80% width) */}
            <Grid item xs={9}>
              <FormControl sx={{ mb: 2, ml: 2 }}>
                <FormLabel>Short Description</FormLabel>
                <Input
                  fullWidth
                  name="name"
                  value={taskData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </FormControl>
              <FormControl sx={{ mb: 2, ml: 2 }}>
                <FormLabel>Detailed Description</FormLabel>
                <Input
                  fullWidth
                  name="description"
                  value={taskData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  multiline
                  rows={3}
                />
              </FormControl>
              <Grid container spacing={2}>
                {/* Row of Chips: Priority, Status, Due Date, and Assignee */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
                    <Chip
                      label={taskData.status || "Set Status"}
                      onClick={(e) => openMenu(e, setStatusAnchorEl)}
                      color={
                        taskData.status === "To Do"
                          ? "default"
                          : taskData.status === "In Progress"
                            ? "info"
                            : taskData.status === "Blocked"
                              ? "error"
                              : taskData.status === "Completed"
                                ? "success"
                                : "default"
                      }
                      icon={
                        taskData.status === "To Do" ? (
                          <RadioButtonCheckedIcon />
                        ) : taskData.status === "In Progress" ? (
                          <RadioButtonCheckedIcon />
                        ) : taskData.status === "Blocked" ? (
                          <DoNotDisturbOnIcon />
                        ) : (
                          <CheckCircleIcon />
                        )
                      }
                    // variant="outlined"
                    />
                    <Chip
                      label={taskData.assigneePrimary || "Select Assignee"}
                      onClick={(e) => openMenu(e, setAssigneeAnchorEl)} // Open AssigneeMenu on click
                      icon={<PersonIcon />}
                      variant="outlined"
                    />
                    <Chip
                      label={taskData.startDate ? dayjs(taskData.startDate).format("YYYY-MM-DD") : "Set Start Date"}
                      onClick={(e) => openMenu(e, setStartDateAnchorEl)}
                      icon={<DateRangeIcon />}
                      variant="outlined"
                    />
                    <Chip
                      label={taskData.dueDate ? dayjs(taskData.dueDate).format("YYYY-MM-DD") : "Set Due Date"}
                      onClick={(e) => openMenu(e, setDueDateAnchorEl)}
                      icon={<DateRangeIcon />}
                      variant="outlined"
                    />
                    <Chip
                      label={taskData.priority || "Set Priority"}
                      onClick={(e) => openMenu(e, setPriorityAnchorEl)}
                      icon={<PriorityHighIcon />}
                      variant="outlined"
                    />
                    {task && (
                      <Chip
                        label="Attachment"
                        onClick={handleAttachClick}
                        icon={<AttachFileIcon />}
                        variant="outlined"
                        clickable
                      />
                    )}
                  </Box>
                  <input
                    type="file"
                    ref={fileInputRef} // Attach the ref to the input element
                    style={{ display: "none" }} // Hide the file input
                    onChange={handleFileSelect}
                  />

                  {/* Display selected file */}
                  {selectedFile && (
                    <>
                      <Typography variant="body2">
                        {selectedFile.name}
                        <Tooltip title="Cancel" arrow>
                          <Button onClick={handleCancelSelection}>
                            <CancelIcon color="error" />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Upload" arrow>
                          <Button
                            onClick={handleFileUpload}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <CircularProgress
                                size={24}
                                sx={{ color: "green" }}
                              />
                            ) : (
                              <UploadFile />
                            )}
                          </Button>
                        </Tooltip>
                      </Typography>
                    </>
                  )}
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl sx={{ p: 2, ml: 2 }}>
                      <FormLabel>Allocated Effort (Hours)</FormLabel>
                      <Input
                        fullWidth
                        type="number"
                        name="allocatedEffort"
                        value={taskData.allocatedEffort}
                        onChange={(e) =>
                          handleInputChange("allocatedEffort", e.target.value)
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl sx={{ p: 2 }}>
                      <FormLabel>Actual Effort (Hours)</FormLabel>
                      <Input
                        fullWidth
                        type="number"
                        name="actualEffort"
                        value={taskData.actualEffort}
                        onChange={(e) =>
                          handleInputChange("actualEffort", e.target.value)
                        }
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              <Box mt={2} sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mr: 2,
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  Dependencies
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  {taskData.dependencies.length > 0 ? (
                    taskData.dependencies.map((id) => {
                      const task = tasks.find((t) => t._id === id);
                      return (
                        <Box
                          key={id}
                          onClick={() => handleNavigateToTask(id)} // Open task in new tab
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            border: '1px solid #ddd',
                            borderRadius: '16px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                          }}
                        >
                          <Typography variant="body2">{task?.name || 'Unknown'}</Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ mx: 0 }}
                          >
                            {dayjs(task?.startDate).format('MMM DD')} - {dayjs(task?.dueDate).format('MMM DD')}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering handleNavigateToTask
                              handleDeleteDependency(id);
                            }}
                          >
                            <CloseIcon fontSize="small" sx={{ color: 'red' }} />
                          </IconButton>
                        </Box>
                      );
                    })
                  ) : (
                    <Typography color="textSecondary" onClick={(e) => setAnchorEl2(e.currentTarget)}>
                      Add dependencies
                    </Typography>
                  )}

                  {/* Add icon to open menu */}
                  <Tooltip title="Add another dependency" arrow>
                    <IconButton size="small" onClick={(e) => setAnchorEl2(e.currentTarget)}>
                      <AddIcon fontSize="small" sx={{ color: 'green' }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Menu for adding dependencies */}
                <Menu
                  anchorEl={anchorEl2}
                  open={Boolean(anchorEl2)}
                  onClose={() => setAnchorEl2(null)}
                  PaperProps={{ style: { maxHeight: 300, overflowY: 'auto' } }}
                >
                  <MenuItem>
                    <InputBase
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      sx={{ width: '100%', padding: '8px' }}
                    />
                  </MenuItem>
                  {filteredTasks.map((task) => (
                    <MenuItem
                      key={task._id}
                      onClick={() => handleAddDependency(task._id)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={taskData.dependencies.includes(task._id)} // Check if task is already a dependency
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText primary={task.name} />
                    </MenuItem>
                  ))}
                </Menu>
              </Box>


              {task && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2, ml: 2 }}>
                  <div>Attachments</div>
                  <Box
                    sx={{
                      maxHeight: "330px",
                      overflow: "auto",
                      mt: 1,
                    }}
                  >
                    {attachments.length === 0 ? (
                      <Typography>
                        No attachments found for this project.
                      </Typography>
                    ) : (
                      <Box>
                        {attachments.map((file, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography sx={{ mr: 2 }}>
                              {file.key.split("-").pop()}
                              {/* Extracts the file name */}
                            </Typography>

                            <a
                              href={`https://app-project-attachment.s3.ap-southeast-2.amazonaws.com/${file.key}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Tooltip title="View" arrow>
                                <Button>
                                  <LinkRounded />
                                </Button>
                              </Tooltip>
                            </a>
                            <Tooltip title="Delete" arrow>
                              <Button>
                                <Delete
                                  color="error"
                                  onClick={() => handleClickOpen(file.key)}
                                />
                              </Button>
                            </Tooltip>
                            <Dialog open={open} onClose={handleClose}>
                              <DialogTitle>{"Confirm Delete"}</DialogTitle>
                              <DialogContent>
                                <DialogContentText>
                                  Are you sure you want to delete this file?
                                  This action cannot be undone.
                                </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button
                                  onClick={handleConfirmDelete}
                                  color="error"
                                >
                                  Delete
                                </Button>
                              </DialogActions>
                            </Dialog>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Paper>
              )}

              {/* Checklist Section in Paper */}
              <Paper variant="outlined" sx={{ p: 2, mt: 2, ml: 2 }}>
                <Typography variant="h6">Checklist</Typography>
                {taskData.checklist.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", mb: 1 }}
                  >
                    <Checkbox
                      checked={item.completed}
                      onChange={() => handleChecklistChange(index)}
                    />
                    <Typography variant="body2">{item.text}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Input
                    fullWidth
                    placeholder="Add a checklist item"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddChecklistItem}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
              </Paper>
              {task && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListIcon sx={{ ml: 2 }} />
                    <Typography variant="subtitle1" sx={{ fontSize: '13px', fontWeight: '600' }}>Subtask</Typography>
                  </Box>
                  {/* <Button startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => handleOpenSubtaskModal({})}>
              New subtask
              </Button> */}
                  <SubtaskList
                    //workspaceId={workspaceId}
                    projectId={projectId}
                    taskId={taskId}
                  />
                </>
              )}
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                p: 2,
                // bgcolor: "background.paper",
                // boxShadow: "0 -2px 6px rgba(0,0,0,0.2)",
                // Remove sticky position properties
              }}
            >
              {/* <Button
            variant="outlined"
            color="secondary"
            onClick={openSubtaskHandler}
            sx={{ mr: 2 }}
          >
            Add Subtask
          </Button> */}
              <Button variant="contained" color="primary" onClick={handleFormSubmit}>
                {task ? "Save Task" : "Create Task"}
              </Button>
            </Box>
          </Box>
          {/* </Box> */}

          <Divider orientation="vertical" variant="middle" flexItem />
          {/* Right Content (20% width) */}
          {task && (
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                flex: '5',
                alignSelf: 'flex-start',
                minWidth: '200px',
                maxWidth: '550px',
                bgcolor: 'background.paper',
                pl: 2,
                //borderLeft: '1px solid #ddd',
              }}
            >
              {/* <Typography variant="h6">Comments</Typography>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    mb: 4,
                    position: "relative",
                    height: 300,
                    overflowY: "auto",
                  }}
                >
                  
                  {comments.map((comment, index) => (
                    <Box
                      key={index}
                      sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                    >
                      <Avatar sx={{ mr: 2 }}>
                        {comment.user.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <div style={{ fontWeight: "bold" }}>
                          {comment.user}{" "}
                          {formatDistanceToNow(new Date(comment.timestamp))} ago
                        </div>
                        <div>{comment.text}</div>
                      </Box>
                    </Box>
                  ))}
                </Paper>
                <Input
                  fullWidth
                  label="Add a Comment"
                  name="newComment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mt: 2 }}
                  multiline
                  rows={2}
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddComment}
                  sx={{ mt: 1 }}
                >
                  Add Comment
                </Button> */}
              <Comments projectId={projectId} taskId={taskId} />
            </Box>
          )}

        </Box>

        {/* Snackbar for showing messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Footer */}
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            p: 2,
            bgcolor: "background.paper",
            boxShadow: "0 -2px 6px rgba(0,0,0,0.2)",
            // Remove sticky position properties
          }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={openSubtaskHandler}
            sx={{ mr: 2 }}
          >
            Add Subtask
          </Button>
          <Button variant="contained" color="primary" onClick={handleFormSubmit}>
            {task ? "Save Task" : "Create Task"}
          </Button>
        </Box> */}


        <Menu
          anchorEl={statusAnchorEl}
          open={Boolean(statusAnchorEl)}
          onClose={() => closeMenu(setStatusAnchorEl)}
        >
          {["To Do", "In Progress", "Blocked", "Completed"].map((option) => (
            <MenuItem
              key={option}
              onClick={() => handleMenuSelect("status", option, () => closeMenu(setStatusAnchorEl))}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
        {/* Start Date Menu with DateCalendar */}
        <Menu
          anchorEl={startDateAnchorEl}
          open={Boolean(startDateAnchorEl)}
          onClose={() => closeMenu(setStartDateAnchorEl)}
        >
          <DateCalendar
            value={taskData.startDate ? dayjs(taskData.startDate) : null}
            onChange={(newValue) => handleMenuSelect("startDate", newValue.toISOString(), () => closeMenu(setStartDateAnchorEl))}
          />
        </Menu>

        {/* Due Date Menu with DateCalendar */}
        <Menu
          anchorEl={dueDateAnchorEl}
          open={Boolean(dueDateAnchorEl)}
          onClose={() => closeMenu(setDueDateAnchorEl)}
        >
          <DateCalendar
            value={taskData.dueDate ? dayjs(taskData.dueDate) : null}
            onChange={(newValue) => handleMenuSelect("dueDate", newValue.toISOString(), () => closeMenu(setDueDateAnchorEl))}
          />
        </Menu>

        {/* Priority Menu */}
        <Menu
          anchorEl={priorityAnchorEl}
          open={Boolean(priorityAnchorEl)}
          onClose={() => closeMenu(setPriorityAnchorEl)}
        >
          {["High", "Medium", "Low"].map((option) => (
            <MenuItem
              key={option}
              onClick={() => handleMenuSelect("priority", option, () => closeMenu(setPriorityAnchorEl))}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>

        {/* Assignee Menu */}
        <AssigneeMenu
          anchorEl={assigneeAnchorEl}
          open={Boolean(assigneeAnchorEl)}
          onClose={() => closeMenu(setAssigneeAnchorEl)}
          onAssigneeSelect={handleAssigneeSelect}
        />

        {/* Subtask Modal */}
        <SubtaskModal
          open={openSubtaskModal}
          onClose={() => setOpenSubtaskModal(false)}
          taskId={taskId}
          projectId={projectId}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default AddTaskModal;
