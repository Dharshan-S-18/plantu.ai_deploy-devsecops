import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FormControl,
  FormLabel,
  Input,

  Option,
  Textarea,
  Tooltip,
} from "@mui/joy";
import {
  IconButton,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Close";
import {
  Attachment,
  Cancel,
  Delete,
  LinkRounded,
  Upload,
  UploadFile,
  UploadRounded,
} from "@mui/icons-material";
import { green } from "@mui/material/colors";
import AssigneeMenu from '../../components/AssigneeMenu';

const generateSequentialId = (lastId) => {
  const baseId = "RQ";
  const lastNumber = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
  return `${baseId}${lastNumber}`;
};

const RequirementForm = ({
  projectId,
  requirementId,
  onClose,
  onRequirementChange,
  showProjectNameField
}) => {
  const [requirement, setRequirement] = useState({
    requirementNo: "",
    description: "",
    shortDescription: "",
    assignedTo: "",
    createdBy: "",
    status: "Open", // Default value for status
    projectId: "",
  });
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [projectNames, setProjectNames] = useState([]); // State to store the list of project names
  const [loading, setLoading] = useState(false); // Loading state for the API call
  const [error, setError] = useState(''); // State for handling errors

  const [selectedFile, setSelectedFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [selectedFileKey, setSelectedFileKey] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // sucess or error
  const [uploading, setUploading] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);  // For controlling the Menu position
  const [openMenu, setOpenMenu] = useState(false);
  const [statusMenuAnchorEl, setStatusMenuAnchorEl] = useState(null); // For Status Menu
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  // Fetch project names from the API if the showProjectNameField is true
  useEffect(() => {
    if (showProjectNameField) {
      const fetchProjectNames = async () => {
        const accountId = sessionStorage.getItem('accountId');
        setLoading(true);
        try {
          const response = await axios.get(`/api/project?accountId=${accountId}`); // Assuming this is the endpoint for fetching projects
          setProjectNames(response.data.projects); // Set the fetched project names
          setLoading(false);
        } catch (error) {
          setError('Failed to fetch projects');
          setLoading(false);
        }
      };

      fetchProjectNames();
    }
  }, [showProjectNameField]);

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

  // Trigger AssigneeMenu on Chip click
  const handleAssigneeClick = (event) => {
    setAnchorEl(event.currentTarget); // Set the anchor element (chip)
    setOpenMenu(true);  // Open the menu
  };

  // Handle assignee selection from the AssigneeMenu
  const handleAssigneeSelect = (assignee) => {
    setSelectedAssignee(assignee);  // Set the selected assignee
    setRequirement((prevData) => ({ ...prevData, assignedTo: assignee }));  // Update the requirement state
    setOpenMenu(false);  // Close the menu after selection
  };

  // Close the AssigneeMenu
  const handleMenuClose = () => {
    setOpenMenu(false);
  };

    // Status color mapping
    const statusColorMap = {
      Open: "#e0e0d1", // Gray color for Open
      "In Progress": "#1a75ff", // Blue color for In Progress
      Resolved: "#ff8000", // Orange color for Resolved
      Closed: "#29a329", // Green color for Closed
    };

    // Handle Status chip click to open status menu
    const handleStatusChipClick = (event) => {
      setStatusMenuAnchorEl(event.currentTarget); // Set the anchor element (chip)
      setStatusMenuOpen(true); // Open the menu
    };
  
    // Handle status selection from the menu
    const handleStatusSelect = (status) => {
      setRequirement((prevData) => ({ ...prevData, status }));
      setStatusMenuOpen(false); // Close the menu after selection
    };

  // Fetch the attachments for the project
  useEffect(() => {
    fetchAttachments();
  }, [projectId]);

  const fetchAttachments = async () => {
    try {
      const response = await fetch(
        `/api/project/${projectId}/requirement/${requirementId._id}/reqattachment`
      );
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
      const response = await fetch(
        `/api/project/${projectId}/requirement/${requirementId._id}/reqattachment`,
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
        setSnackbarMessage("File uploaded successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      } else {
        console.error("File upload failed");
        setSnackbarMessage("file uploaded failed!");
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
      const res = await fetch(
        `/api/project/${projectId}/requirement/${requirementId._id}/reqattachment`,
        {
          method: "DELETE",
          body: JSON.stringify({ fileKey: selectedFileKey }),
        }
      );
      const data = await res.json();
      console.log("File Deleted:", data);
      fetchAttachments(); // Refresh the list of files
      handleClose(); // Close the dialog after delete
      setSnackbarMessage("File Deleted successfully");
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
    if (requirementId) {
      // If a requirementId is provided, populate the form for editing
      setRequirement({
        requirementNo: requirementId.requirementNo || "", // Ensure requirementId is a string
        description: requirementId.description || "",
        shortDescription: requirementId.shortDescription || "",
        assignedTo: requirementId.assignedTo || "",
        createdBy: requirementId.createdBy || "",
        status: requirementId.status || "",
        projectId: requirementId.projectId || "",
      });
      setEditMode(true);
    } else {
      // Generate a new requirement ID locally if not in edit mode
      const newId = generateSequentialId();
      setRequirement((prevData) => ({ ...prevData, requirementNo: newId }));
    }
  }, [projectId, requirementId]);

  // Generate Requirement Number
  // useEffect(() => {
  //     const generateRequirementNo = () =>
  //         `RN${Math.floor(Math.random() * 10000)
  //             .toString()
  //             .padStart(4, '0')}`;
  //     setRequirement((prev) => ({ ...prev, requirementNo: generateRequirementNo() }));
  // }, []);

  // Retrieve email from sessionStorage
  useEffect(() => {
    const email = sessionStorage.getItem("email") || "";
    setRequirement((prev) => ({ ...prev, createdBy: email }));
  }, []);

  // General handler for input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setRequirement((prevData) => ({ ...prevData, [name]: value }));
  };

  // Specific handler for Select components
  const handleSelectChange = (name) => (event) => {
    const { value } = event.target;
    setRequirement((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newRequirementData = {
      ...requirement,
      createdDate: new Date().toISOString(), // Set createdDate to the current timestamp
    };
    try {
      let response;
  
      if (requirementId) {
        // Editing an existing requirement
        if (requirement.projectId && requirement.projectId !== projectId) {
          // If Project Name is updated (requirementData.projectId is different)
          response = await axios.post(`/api/project/${requirement.projectId}/requirement`, newRequirementData);
          console.log('requirement added to new project:', response.data);

          // Step 2: After successful POST, delete the requirement from its original location
        await axios.delete(`/api/directProjectApi/requirement/${requirementId._id}`);
        console.log('requirement removed from the original location');
        
        } else if (projectId && requirementId) {
          // If Project Name is not updated (keep the requirement in the same project)
          response = await axios.put(`/api/project/${projectId}/requirement/${requirementId._id}`, newRequirementData);
          console.log('requirement updated under the same project:', response.data);
        } else if ( requirementId) {
          // If no project context, update requirement directly
          response = await axios.put(`/api/directProjectApi/requirement/${requirementId._id}`, newRequirementData);
          console.log('requirement updated directly:', response.data);
        }
      } else {
        // Creating a new requirement (unchanged logic)
        if (requirement.projectId) {
          response = await axios.post(`/api/project/${requirement.projectId}/requirement`, newRequirementData);
          console.log('requirement added to project:', response.data);
        } else if (projectId) {
          // If opened from the UserTable and no projectId in requirementData, use the projectId passed from the parent
          response = await axios.post(`/api/project/${projectId}/requirement`, newRequirementData);
          console.log('requirement added to project from UserTable:', response.data);
        } else {
          response = await axios.post(`/api/directProjectApi/requirement`, newRequirementData);
          console.log('requirement created without a project:', response.data);
        }
      }
  
      onRequirementChange(requirementId ? 'Requirement Updated Successfully' : 'Requirement Created Successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to submit form:', error);
      onRequirementChange('Error saving requirement', 'error');
    }
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
          {editMode ? "Edit Requirement Details" : "Add Requirement Details"}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ p: 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Requirement No</FormLabel>
            <Input value={requirement.requirementNo} readOnly />
          </FormControl>
          {showProjectNameField && (
            <FormControl fullWidth>
              <FormLabel>Project Name</FormLabel>
              {loading ? (
                <Typography>Loading projects...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Select
                  name="projectId"
                  value={requirement.projectId}
                  onChange={handleChange}
                  
                >
                  {projectNames.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.projectId}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>
          )}

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              placeholder="Enter description"
              value={requirement.description}
              onChange={handleChange}
              minRows={3}
            />
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Short Description</FormLabel>
            <Input
              name="shortDescription"
              placeholder="Enter short description"
              value={requirement.shortDescription}
              onChange={handleChange}
            />
          </FormControl>

          {/* Assignee and Status Chips in Same Row */}
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            {/* Assigned To Chip */}
            <FormControl sx={{ mb: 2}}>
              <FormLabel>Assigned To</FormLabel>
              <Box display="flex" alignItems="center">
                <Chip
                  label={requirement.assignedTo || "Select Assignee"}
                  onClick={handleAssigneeClick}
                  color={requirement.assignedTo ? "primary" : "default"}
                  //onDelete={() => setSelectedAssignee(null)}
                  sx={{ mr: 1 }}
                />
              </Box>
            </FormControl>
           { /* AssigneeMenu component to display options when button is clicked */}
            <AssigneeMenu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              onAssigneeSelect={handleAssigneeSelect}
            />

            {/* Status Chip */}
            <FormControl sx={{ mb: 2, mr:150  }}>
              <FormLabel>Status</FormLabel>
              <Box display="flex" alignItems="center">
              <Chip
                  label={requirement.status}
                  onClick={handleStatusChipClick}
                  style={{ backgroundColor: statusColorMap[requirement.status] }}
                  sx={{ mr: 1 }}
                />
              </Box>
              {/* Status Menu */}
              <Menu
                anchorEl={statusMenuAnchorEl}
                open={statusMenuOpen}
                onClose={() => setStatusMenuOpen(false)}
              >
                <MenuItem onClick={() => handleStatusSelect("Open")}>Open</MenuItem>
                <MenuItem onClick={() => handleStatusSelect("In Progress")}>In Progress</MenuItem>
                <MenuItem onClick={() => handleStatusSelect("Resolved")}>Resolved</MenuItem>
                <MenuItem onClick={() => handleStatusSelect("Closed")}>Closed</MenuItem>
              </Menu>
            </FormControl>
          </Box>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Created By</FormLabel>
            <Input value={requirement.createdBy} readOnly />
          </FormControl>

          {/* Status - Using Chip for Status */}
          {/* <FormControl sx={{ mb: 2 }}>
            <FormLabel>Status</FormLabel>
            <Box display="flex" alignItems="center">
              <Chip
                label={requirement.status}
                onClick={handleStatusChipClick}
                color="primary"
                sx={{ mr: 1 }}
              />
            </Box>
            <Menu
              anchorEl={statusMenuAnchorEl}
              open={statusMenuOpen}
              onClose={() => setStatusMenuOpen(false)}
            >
              <MenuItem onClick={() => handleStatusSelect("Open")}>Open</MenuItem>
              <MenuItem onClick={() => handleStatusSelect("In Progress")}>In Progress</MenuItem>
              <MenuItem onClick={() => handleStatusSelect("Resolved")}>Resolved</MenuItem>
              <MenuItem onClick={() => handleStatusSelect("Closed")}>Closed</MenuItem>
            </Menu>
          </FormControl> */}

          {editMode && (
            <>
              <Button onClick={handleAttachClick}>
                Add Attachment &nbsp;
                <Attachment />
              </Button>
              <input
                type="file"
                ref={fileInputRef} // Attach the ref to the input element
                style={{ display: "none" }} // Hide the file input
                onChange={handleFileSelect}
              />
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
                          <CircularProgress size={24} sx={{ color: green }} />
                        ) : (
                          <UploadRounded />
                        )}
                      </Button>
                    </Tooltip>
                  </Typography>
                </>
              )}
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
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography sx={{ mr: 2 }}>
                              {file.key.split("-").pop()}{" "}
                              {/* Extracts the file name */}
                            </Typography>
                            <a
                              href={`https://app-project-attachment.s3.ap-southeast-2.amazonaws.com/${file.key}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Tooltip title="View">
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
                    ) : (
                      <Typography>
                        No attachments found for this project.
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </>
          )}

          {/* Snackbar messages */}
          <Snackbar
            open={snackbarOpen}
            onClose={handleSnackbarClose}
            autoHideDuration={3000}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbarSeverity}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>

          {/* Submit Button */}
          <Button type="submit" variant="contained" color="primary">
            {editMode ? "Update" : "Submit"}
          </Button>

          {message && <p>{message}</p>}
        </Box>
      </Box>
    </Box>
  );
};

export default RequirementForm;
