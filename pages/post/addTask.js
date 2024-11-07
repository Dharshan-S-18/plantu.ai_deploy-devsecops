import { useState, useEffect, useRef } from "react";
import {
  Button,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Checkbox,
  Avatar,
  Paper,
  Grid,
  Alert, // Import Alert component
  Snackbar,
  Tooltip,
  DialogContentText,
  CircularProgress, // Import Snackbar component for dismissible alert
} from "@mui/material";
import { FormControl, FormLabel, Input } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import PersonIcon from "@mui/icons-material/Person";
import DateRangeIcon from "@mui/icons-material/DateRange";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CancelIcon from "@mui/icons-material/Cancel";
import SubtaskModal from "./Subtask";
import axios from "axios";
import dayjs from "dayjs";
import { formatDistanceToNow } from "date-fns";
import { Delete, LinkRounded, Upload, UploadFile } from "@mui/icons-material";

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
    status: "",
    dependency: "",
    comments: [],
    description: "",
    checklist: [],
    allocatedEffort: "",
    actualEffort: "",
  });

  const [openDialog, setOpenDialog] = useState(null);
  const [openSubtaskModal, setOpenSubtaskModal] = useState(false);
  const [taskId, setTaskId] = useState(task ? task._id : null);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [assigneeOptions, setAssigneeOptions] = useState([]); // State to store fetched assignee options
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

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const [open, setOpen] = useState(false);
  const [selectedFileKey, setSelectedFileKey] = useState(null);

  const handleClickOpen = (fileKey) => {
    setSelectedFileKey(fileKey);
    setOpen(true);
  };

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
      });
      setTaskId(task._id);
    }
  }, [task]);

  // Fetch assignees from API filtered by accountId when component mounts
  useEffect(() => {
    const fetchAssignees = async () => {
      const hostname = window.location.hostname;
      const extractedSubdomain = hostname.split(".")[0];
      const accountId = sessionStorage.getItem("accountId"); // Get accountId from sessionStorage
      if (!accountId) {
        console.error("No accountId found in sessionStorage");
        return;
      }

      try {
        const response = await axios.get(
          `/api/auth/getAgents?accountId=${accountId}&subdomain=${extractedSubdomain}`
        );
        console.log(response.data);
        setAssigneeOptions(response.data); // Assuming API response contains an 'assignees' array
      } catch (error) {
        console.error("Failed to fetch assignees:", error);
      }
    };

    fetchAssignees();
  }, []);

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
    try {
      if (task) {
        const response = await axios.put(
          `/api/project/${projectId}/task/${task._id}`,
          taskData
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

  const handleDialogOpen = (field) => {
    setOpenDialog(field);
  };

  const handleDialogClose = () => {
    setOpenDialog(null);
  };

  const handleDialogSelect = (field, value) => {
    if (field === "assigneePrimary") {
      // If 'assigneePrimary', handle multiple selections
      setTaskData((prevData) => {
        const updatedAssignees = prevData.assigneePrimary.includes(value)
          ? prevData.assigneePrimary.filter((assignee) => assignee !== value) // Remove if already selected
          : [...prevData.assigneePrimary, value]; // Add if not selected
        return { ...prevData, assigneePrimary: updatedAssignees };
      });
    } else {
      handleInputChange(field, value); // Handle other fields as before
    }
    handleDialogClose();
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
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        bgcolor: "background.paper",
        boxShadow: 24,
        borderRadius: 2,
        p: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#00264d",
          p: 2,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Typography variant="h6" component="div" sx={{ color: "#fff" }}>
          Task Details
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
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
      <Box sx={{ display: "flex", mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", flex: 4 }}>
          <Grid container spacing={2}>
            {/* Main Content (80% width) */}
            <Grid item xs={9}>
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Short Description</FormLabel>
                <Input
                  fullWidth
                  name="name"
                  value={taskData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </FormControl>
              <FormControl sx={{ mb: 2 }}>
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
                {/* <Grid item xs={6}>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Short Description</FormLabel>
                    <Input
                      fullWidth
                      name="name"
                      value={taskData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </FormControl>
                </Grid> */}

                {/* Assignee and Effort Fields */}
                {/* <Grid item xs={6}>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Allocated Effort (Hours)</FormLabel>
                    <Input
                      fullWidth
                      type="number"
                      name="allocatedEffort"
                      value={taskData.allocatedEffort}
                      onChange={(e) => handleInputChange('allocatedEffort', e.target.value)}
                    />
                  </FormControl>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Assigned To (Secondary)</FormLabel>
                    <Input
                      fullWidth
                      name="assigneeSecondary"
                      value={taskData.assigneeSecondary}
                      onChange={(e) => handleInputChange('assigneeSecondary', e.target.value)}
                      placeholder="Secondary Assignee"
                    />
                  </FormControl>
                </Grid> */}

                {/* Row of Chips: Priority, Status, Due Date, and Assignee */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      required
                      label={taskData.status || "Set Status"}
                      onClick={() => handleDialogOpen("status")}
                      color={
                        taskData.status === "To Do"
                          ? "default"
                          : taskData.status === "In Progress"
                          ? "info"
                          : taskData.status === "Blocked"
                          ? "error"
                          : "success"
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
                      variant="outlined"
                      clickable
                    />
                    <Chip
                      label={
                        taskData.assigneePrimary.length > 0
                          ? taskData.assigneePrimary.join(", ")
                          : "Select Assignees"
                      }
                      onClick={() => handleDialogOpen("assigneePrimary")}
                      icon={<PersonIcon />}
                      variant="outlined"
                      clickable
                    />
                    <Chip
                      label={
                        taskData.startDate
                          ? dayjs(taskData.startDate).format("YYYY-MM-DD")
                          : "Set Start Date"
                      }
                      onClick={() => handleDialogOpen("startDate")}
                      icon={<DateRangeIcon />}
                      variant="outlined"
                      clickable
                    />
                    <Chip
                      label={
                        taskData.dueDate
                          ? dayjs(taskData.dueDate).format("YYYY-MM-DD")
                          : "Set Due Date"
                      }
                      onClick={() => handleDialogOpen("dueDate")}
                      icon={<DateRangeIcon />}
                      variant="outlined"
                      clickable
                    />
                    <Chip
                      label={taskData.priority || "Set Priority"}
                      onClick={() => handleDialogOpen("priority")}
                      color={
                        taskData.priority === "High"
                          ? "error"
                          : taskData.priority === "Medium"
                          ? "warning"
                          : "default"
                      }
                      icon={<PriorityHighIcon />}
                      variant="outlined"
                      clickable
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

                {/* <FormControl sx={{ mb: 2 }}>
                <FormLabel>Detailed Description</FormLabel>
                <Input
                  fullWidth
                  name="description"
                  value={taskData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={3}
                />
              </FormControl> */}

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {/* <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Dependency</FormLabel>
                    <Input
                      fullWidth
                      name="dependency"
                      value={taskData.dependency}
                      onChange={(e) => handleInputChange('dependency', e.target.value)}
                    />
                  </FormControl> */}

                    <FormControl sx={{ mb: 2 }}>
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
                  {/* <Grid item xs={6}>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Allocated Effort (Hours)</FormLabel>
                    <Input
                      fullWidth
                      type="number"
                      name="allocatedEffort"
                      value={taskData.allocatedEffort}
                      onChange={(e) => handleInputChange('allocatedEffort', e.target.value)}
                    />
                  </FormControl>
                </Grid> */}
                  <Grid item xs={6}>
                    <FormControl sx={{ mb: 2 }}>
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

              {task && (
                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
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
              <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
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
            </Grid>

            {/* Right Content (20% width) */}
            <Grid item xs={3}>
              <Typography variant="h6">Comments</Typography>
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
                {/* Display existing comments */}
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
              </Button>
            </Grid>
          </Grid>
        </Box>
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          p: 2,
          position: "sticky",
          bottom: 0,
          bgcolor: "background.paper",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.2)",
          zIndex: 1100, // Ensure it stays above other content
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
      </Box>

      {/* Dialog for selecting values */}
      <Dialog open={Boolean(openDialog)} onClose={handleDialogClose}>
        <DialogTitle>Select {openDialog}</DialogTitle>
        <DialogContent>
          <List>
            {openDialog === "status" &&
              ["To Do", "In Progress", "Blocked", "Completed"].map((option) => (
                <ListItem
                  button
                  key={option}
                  onClick={() => handleDialogSelect("status", option)}
                >
                  <ListItemIcon>
                    {option === "To Do" && (
                      <RadioButtonCheckedIcon sx={{ color: "#ff9800" }} />
                    )}
                    {option === "In Progress" && (
                      <RadioButtonCheckedIcon sx={{ color: "#2196f3" }} />
                    )}
                    {option === "Blocked" && (
                      <DoNotDisturbOnIcon sx={{ color: "#f44336" }} />
                    )}
                    {option === "Completed" && (
                      <CheckCircleIcon sx={{ color: "#4caf50" }} />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={option} />
                </ListItem>
              ))}
            {openDialog === "assigneePrimary" &&
              assigneeOptions.map((option) => (
                <ListItem
                  button
                  key={option._id}
                  onClick={() =>
                    handleDialogSelect("assigneePrimary", option.name)
                  }
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={taskData.assigneePrimary.includes(option.name)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={option.name} />
                </ListItem>
              ))}
            {openDialog === "priority" &&
              ["High", "Medium", "Low"].map((option) => (
                <ListItem
                  button
                  key={option}
                  onClick={() => handleDialogSelect("priority", option)}
                >
                  <ListItemIcon>
                    <PriorityHighIcon />
                  </ListItemIcon>
                  <ListItemText primary={option} />
                </ListItem>
              ))}
            {openDialog === "startDate" && (
              <Input
                type="date"
                fullWidth
                value={taskData.startDate}
                onChange={(e) =>
                  handleDialogSelect("startDate", e.target.value)
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
            {openDialog === "dueDate" && (
              <Input
                type="date"
                fullWidth
                value={taskData.dueDate}
                onChange={(e) => handleDialogSelect("dueDate", e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Subtask Modal */}
      <SubtaskModal
        open={openSubtaskModal}
        onClose={() => setOpenSubtaskModal(false)}
        taskId={taskId}
        projectId={projectId}
      />
    </Box>
  );
};

export default AddTaskModal;
