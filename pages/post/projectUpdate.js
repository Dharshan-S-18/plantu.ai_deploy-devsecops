import React, { useEffect, useRef, useState } from "react";
import {
  Paper,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Box,
  Avatar,
  Typography,
  Select,
  MenuItem, Chip, Menu,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { FormControl, Input, FormLabel, Textarea } from "@mui/joy";
import EditIcon from "@mui/icons-material/Edit";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SaveIcon from "@mui/icons-material/Save";
import { useSession } from "next-auth/react";
import CancelIcon from "@mui/icons-material/Cancel";
import { formatDistanceToNow } from "date-fns";
import dynamic from "next/dynamic"; // Import next/dynamic for dynamic imports

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false }); // Dynamic import for ReactQuill
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { Delete, LinkRounded, Upload, UploadFile } from "@mui/icons-material";

const Details = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [editableProject, setEditableProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [subDomain, setSubDomain] = useState("");
  const [accountId, setAccountId] = useState(""); // State to store accountId
  const [projectManagers, setProjectManagers] = useState([]); // New state for project managers
  const [isEditing, setIsEditing] = useState(false);
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for API call
  const openStatus = Boolean(anchorEl);
  const statusOptions = ["To Do", "In Progress", "Completed"]; // Predefined statuses
  // Status color mapping
  const statusColors = {
    "To Do": '#ff9800',
    "In Progress": '#2196f3',
    "Completed": "#66bb6a",
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [selectedFileKey, setSelectedFileKey] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // success or error

  const handleChipClick = (event) => {
    // if (isEditing) {
    setAnchorEl(event.currentTarget); // Open the menu
    // }
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the menu
  };


  const handleStatusChange = async (status) => {
    setLoading(true); // Show loading spinner

    try {
      // Update the status locally
      setEditableProject((prev) => ({
        ...prev,
        status,
      }));

      // Call the PUT API
      const response = await fetch(`/api/project/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setSnackbarMessage("Status updated successfully!");
        setSnackbarSeverity("success");
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      setSnackbarMessage("Error updating status.");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false); // Hide loading spinner
      handleMenuClose();
      setSnackbarOpen(true); // Show snackbar
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

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
      const response = await fetch(`/api/project/${projectId}/getattachments`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data || []); // Set the attachments
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
  //Upload file Attachment handle
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`/api/project/${projectId}/attachment`, {
        method: "POST",
        body: formData,
      });

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
      fetchAttachments(); // Refresh the list of files
      handleClose();
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
    if (status === "authenticated" && session?.user?.name) {
      const email = sessionStorage.getItem("email");
      const accountIdFromStorage = sessionStorage.getItem("accountId"); // Get accountId from sessionStorage
      const hostname = window.location.hostname;
      const extractedSubdomain = hostname.split(".")[0];
      setSubDomain(extractedSubdomain);
      setUserEmail(email);
      setUserName(email ? email.split("@")[0] : "Unknown User");
      setAccountId(accountIdFromStorage); // Set the accountId state
    }
  }, [session, status]);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/project/${projectId}`);
          const data = await response.json();
          setProject(data.project);
          setEditableProject(data.project);
          setMilestones(data.project.milestones || []);
          setComments(data.project.comments || []);
        } catch (error) {
          console.error("Failed to fetch project data:", error);
        }
      };
      fetchProject();
    }
  }, [projectId]);

  // New useEffect to fetch project managers
  useEffect(() => {
    if (accountId) {
      // Ensure accountId is available before making the API call
      const fetchProjectManagers = async () => {
        try {
          const response = await fetch(
            `/api/auth/getAgents?accountId=${accountId}&subdomain=${subDomain}`
          ); // Pass accountId as query parameter
          const data = await response.json();
          console.log(data.managers);
          setProjectManagers(data); // Set the project managers data directly
        } catch (error) {
          console.error("Failed to fetch project managers:", error);
        }
      };

      fetchProjectManagers();
    }
  }, [accountId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editableProject),
      });
      const data = await response.json();
      setProject(data.project);
      console.log(data.project);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update project data:", error);
    }
  };

  const handleUpdateMilestones = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}/milestones`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ milestones }),
      });
      await response.json();
    } catch (error) {
      console.error("Failed to update milestones:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/project/${projectId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newComment, user: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        const newCommentData = {
          text: newComment,
          user: userEmail,
          timestamp: new Date(),
        };
        setComments((prevComments) => [...prevComments, newCommentData]);
        setNewComment("");
      } else {
        console.error("Failed to add comment:", data);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", mb: 4 }}>
        <Typography variant="h5" fontWeight="bold">
          {project.projectId}
          {/* <Tooltip title="Add Attachment" arrow>
            <Button onClick={handleAttachClick}>
              <AttachFileIcon />
            </Button>
          </Tooltip> */}
        </Typography>

        {/* <Box> */}
        <Chip
          label={
            loading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              editableProject.status || "Select Status"
            )
          }
          onClick={handleChipClick}
          //variant="outlined"
          //color="primary"
          sx={{
            cursor: isEditing ? "pointer" : "default",
            backgroundColor: statusColors[editableProject.status] || "default",
            color: editableProject.status ? "black" : "inherit",
            // fontWeight: "bold",
            ml: 1
          }}
        />
        <Tooltip title="Add Attachment" arrow>
            <Button onClick={handleAttachClick}>
              <AttachFileIcon />
            </Button>
          </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={openStatus}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          {statusOptions.map((option) => (
            <MenuItem
              key={option}
              onClick={() => handleStatusChange(option)}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
        {/* Snackbar for feedback */}
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
        {/* </Box> */}

        <input
          type="file"
          ref={fileInputRef} // Attach the ref to the input element
          style={{ display: "none" }} // Hide the file input
          onChange={handleFileSelect}
        />

        {/* Display selected file */}
        {selectedFile && (
          <>
            <Typography>
              {selectedFile.name}
              <Tooltip title="Cancel" arrow>
                <Button onClick={handleCancelSelection}>
                  <CancelIcon color="error" />
                </Button>
              </Tooltip>
              <Tooltip title="Upload" arrow>
                <Button onClick={handleFileUpload} disabled={uploading}>
                  {uploading ? (
                    <CircularProgress size={24} sx={{ color: "green" }} />
                  ) : (
                    <UploadFile />
                  )}
                </Button>
              </Tooltip>
            </Typography>
          </>
        )}
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

        {isEditing ? (
          <>
            <IconButton
              color="primary"
              sx={{ position: "absolute", top: 16, right: 56 }}
              onClick={handleUpdate}
            >
              <SaveIcon />
            </IconButton>
            <IconButton
              color="secondary"
              sx={{ position: "absolute", top: 16, right: 16 }}
              onClick={() => setIsEditing(false)}
            >
              <CancelIcon />
            </IconButton>
          </>
        ) : (
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              sx={{ position: "absolute", top: 16, right: 16 }}
              onClick={() => setIsEditing(true)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Box sx={{ mb: 4, position: "relative" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <FormControl sx={{ flex: 1 }}>
            <FormLabel>Project Name</FormLabel>
            <Input
              fullWidth
              name="projectName"
              value={editableProject.projectName || ""}
              onChange={handleInputChange}
              placeholder="Project Name"
              disabled={!isEditing}
            />
          </FormControl>
        </Box>
        <FormControl sx={{ mb: 2 }}>
          <FormLabel>Description</FormLabel>
          <Textarea
            fullWidth
            name="description"
            value={editableProject.description || ""}
            onChange={handleInputChange}
            placeholder="Description"
            disabled={!isEditing}
            minRows={4}
          />
        </FormControl>
      </Box>
      {/* <Paper elevation={2} sx={{ p: 3, mb: 4, position: "relative" }}> */}
        {/* {isEditing ? (
                    <>
                        <IconButton
                            color="primary"
                            sx={{ position: 'absolute', top: 16, right: 56 }}
                            onClick={handleUpdate}
                        >
                            <SaveIcon />
                        </IconButton>
                        <IconButton
                            color="secondary"
                            sx={{ position: 'absolute', top: 16, right: 16 }}
                            onClick={() => setIsEditing(false)}
                        >
                            <CancelIcon />
                        </IconButton>
                    </>
                ) : (
                    <Tooltip title="Edit">
                        <IconButton
                            color="primary"
                            sx={{ position: 'absolute', top: 16, right: 16 }}
                            onClick={() => setIsEditing(true)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                )} */}
        <Grid container spacing={3}>
          {/* <Grid item xs={12}>
            <div>Project Details</div>
          </Grid> */}
          <Grid item xs={12} sm={4}>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Portfolio</FormLabel>
              <Input
                fullWidth
                name="portfolio"
                value={editableProject.portfolio || ""}
                onChange={handleInputChange}
                placeholder="Portfolio"
                disabled={!isEditing}
              />
            </FormControl>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Program</FormLabel>
              <Input
                fullWidth
                name="program"
                value={editableProject.program || ""}
                onChange={handleInputChange}
                placeholder="Program"
                disabled={!isEditing}
              />
            </FormControl>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Project Manager</FormLabel>
              {isEditing ? (
                <Select
                  fullWidth
                  name="projectManager"
                  value={editableProject.projectManager || ""}
                  onChange={handleInputChange}
                >
                  {projectManagers.map((manager) => (
                    <MenuItem key={manager._id} value={manager.email}>
                      {manager.name}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <Input
                  fullWidth
                  name="projectManager"
                  value={editableProject.projectManager || ""}
                  placeholder="Project Manager"
                  disabled
                />
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Start Date</FormLabel>
              <Input
                fullWidth
                type="date"
                name="startDate"
                value={
                  editableProject.startDate
                    ? new Date(editableProject.startDate)
                      .toISOString()
                      .substr(0, 10)
                    : ""
                }
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormControl>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Budget</FormLabel>
              <Input
                fullWidth
                type="number"
                name="totalBudget"
                value={editableProject.totalBudget || ""}
                onChange={handleInputChange}
                placeholder="Budget"
                disabled={!isEditing}
              />
            </FormControl>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Actual Start Date</FormLabel>
              <Input
                fullWidth
                type="date"
                name="budgetStartDate"
                value={
                  editableProject.budgetStartDate
                    ? new Date(editableProject.budgetStartDate)
                      .toISOString()
                      .substr(0, 10)
                    : ""
                }
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>End Date</FormLabel>
              <Input
                fullWidth
                type="date"
                name="endDate"
                value={
                  editableProject.endDate
                    ? new Date(editableProject.endDate)
                      .toISOString()
                      .substr(0, 10)
                    : ""
                }
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormControl>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Actual Budget</FormLabel>
              <Input
                fullWidth
                type="number"
                name="actualBudget"
                value={editableProject.actualBudget || ""}
                onChange={handleInputChange}
                placeholder="Actual Budget"
                disabled={!isEditing}
              />
            </FormControl>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Actual End Date</FormLabel>
              <Input
                fullWidth
                type="date"
                name="budgetEndDate"
                value={
                  editableProject.budgetEndDate
                    ? new Date(editableProject.budgetEndDate)
                      .toISOString()
                      .substr(0, 10)
                    : ""
                }
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </FormControl>
          </Grid>
        </Grid>
      {/* </Paper> */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, position: "relative" }}>
        <div>Business Case</div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            {isEditing ? (
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Business Case</FormLabel>
                <ReactQuill
                  theme="snow"
                  value={editableProject.businessCase || ""}
                  onChange={(value) =>
                    setEditableProject((prev) => ({
                      ...prev,
                      businessCase: value,
                    }))
                  }
                  style={{ width: "1000px" }}
                />
              </FormControl>
            ) : (
              <Box
                sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2 }}
                dangerouslySetInnerHTML={{
                  __html: editableProject.businessCase || "",
                }}
                style={{ width: "1000px" }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <div>Milestones</div>
            {isEditing
              ? milestones.map((milestone, index) => (
                <FormControl key={index} sx={{ mb: 2 }}>
                  <FormLabel>{`Milestone ${index + 1}`}</FormLabel>
                  <Input
                    fullWidth
                    value={milestone}
                    onChange={(e) => {
                      const updatedMilestones = [...milestones];
                      updatedMilestones[index] = e.target.value;
                      setMilestones(updatedMilestones);
                    }}
                  />
                </FormControl>
              ))
              : milestones.map((milestone, index) => (
                <Input
                  key={index}
                  fullWidth
                  value={milestone}
                  disabled
                  readOnly
                  sx={{ mb: 2 }}
                />
              ))}
            {isEditing && (
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={handleUpdateMilestones}
              >
                Update Milestones
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            position: "relative",
          }}
        >
          <div>Attachments</div>
          <Box
            sx={{
              maxHeight: "330px",
              overflow: "auto",
              mt: 1,
            }}
          >
            {attachments && attachments.length > 0 ? (
              <Box>
                {attachments.map((file, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", mb: 2 }}
                  >
                    <Typography sx={{ mr: 2 }}>
                      {file.key.split("-").pop()} {/* Extracts the file name */}
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
                      <Button onClick={() => handleClickOpen(file.key)}>
                        <Delete color="error" />
                      </Button>
                    </Tooltip>
                    <Dialog open={open} onClose={handleClose}>
                      <DialogTitle>{"Confirm Delete"}</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          Are you sure you want to delete this file? This action
                          cannot be undone.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleConfirmDelete} color="error">
                          Delete
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography>No attachments found for this project.</Typography>
            )}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <div>Comments</div>
          {userEmail ? (
            <>
              <FormControl sx={{ mb: 2, width: "100%" }}>
                <FormLabel>Add a comment</FormLabel>
                <ReactQuill
                  theme="snow"
                  value={newComment}
                  onChange={(value) => setNewComment(value)}
                  style={{ height: "150px" }} // Adjust height if needed
                />
              </FormControl>
              <Button
                variant="contained"
                sx={{ mb: 3, mt: 5 }}
                onClick={handleAddComment}
              >
                Submit Comment
              </Button>
            </>
          ) : (
            <div>You need to be logged in to add comments.</div>
          )}
          {sortedComments.map((comment, index) => (
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
                <Box
                  //sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2 }}
                  dangerouslySetInnerHTML={{ __html: comment.text }}
                />
                {comment.user === userName && (
                  <div style={{ color: "red", cursor: "pointer" }}>Delete</div>
                )}
              </Box>
            </Box>
          ))}
        </Paper>
      </Grid>
    </>
  );
};

export default Details;
