import React, { useState, useEffect, useRef } from "react";
import {
  IconButton,
  Typography,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Button,
  Tooltip,
  Grid,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import { FormControl, FormLabel, Input } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import {
  Attachment,
  Cancel,
  Delete,
  LinkRounded,
  Upload,
  UploadFile,
} from "@mui/icons-material";

const generateSequentialId = (lastId) => {
  const baseId = "RD";
  const lastNumber = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
  return `${baseId}${lastNumber}`;
};

const RaidForm = ({ projectId, raid, onClose, onRaidChange }) => {
  const [raidData, setRaidData] = useState({
    raidId: "",
    description: "",
    type: "",
    assignedTo: "",
    createdDate: "",
    status: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [userOptions, setUserOptions] = useState([]); // State to store fetched user options

  const [selectedFile, setSelectedFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const [open, setOpen] = useState(false); // Dialog open state
  const [selectedFileKey, setSelectedFileKey] = useState(null); // To track which file is being deleted
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
        `/api/project/${projectId}/raid/${raid._id}/raidattachment`
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

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `/api/project/${projectId}/raid/${raid._id}/raidattachment`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded:", data.url);
        console.log("Unique file ID:", data.uploadfileId); // You can use this ID for further actions
        handleCancelSelection();
        fetchAttachments();
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  //Delete Attachment handle
  const handleConfirmDelete = async () => {
    try {
      const res = await fetch(
        `/api/project/${projectId}/raid/${raid._id}/raidattachment`,
        {
          method: "DELETE",
          body: JSON.stringify({ fileKey: selectedFileKey }),
        }
      );
      const data = await res.json();
      console.log("File Deleted:", data);
      fetchAttachments(); // Refresh the list of files
      handleClose(); // Close the dialog after delete
    } catch (error) {
      console.error("Error Deleting File:", error);
    }
  };

  useEffect(() => {
    if (raid) {
      // If a raid is provided, populate the form for editing
      setRaidData({
        raidId: raid.raidId || "", // Ensure raidId is a string
        description: raid.description || "",
        type: raid.type || "",
        assignedTo: raid.assignedTo || "",
        createdDate: raid.createdDate || "",
        status: raid.status || "",
      });
      setEditMode(true);
    } else {
      // Generate a new RAID ID locally if not in edit mode
      const newId = generateSequentialId();
      setRaidData((prevData) => ({ ...prevData, raidId: newId }));
    }
  }, [projectId, raid]);

  // Fetch users filtered by accountId when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      const hostname = window.location.hostname;
      const extractedSubdomain = hostname.split(".")[0];
      const accountId = sessionStorage.getItem("accountId"); // Get accountId from sessionStorage
      if (!accountId) {
        console.error("No accountId found in sessionStorage");
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/getAgents?accountId=${accountId}&subdomain=${extractedSubdomain}`
        ); // Pass accountId as query parameter
        const data = await response.json();
        console.log(data); // Log response to check data format
        setUserOptions(data); // Set fetched user data to state
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Handlers for input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setRaidData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (event) => {
    const { value } = event.target;
    setRaidData((prevData) => ({ ...prevData, createdDate: value }));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editMode) {
        // Update existing RAID data
        await axios.put(`/api/project/${projectId}/raid/${raid._id}`, raidData);
        onRaidChange("RAID updated successfully", "success"); // Success alert
      } else {
        // Create new RAID data
        await axios.post(`/api/project/${projectId}/raid`, raidData);
        onRaidChange("RAID created successfully", "success"); // Success alert
      }
      //onRaidChange();
      onClose(); // Close the form after submission
    } catch (error) {
      console.error("Error saving data:", error);
      onRaidChange("Error saving RAID", "error"); // Error alert
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
          {editMode ? "Edit RAID Details" : "Add RAID Details"}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      {/* Form Content */}
      <Box sx={{ p: 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Raid Id */}
          <FormControl fullWidth margin="normal">
            <FormLabel>Raid Id</FormLabel>
            <Input value={raidData.raidId} name="raidId" readOnly />
          </FormControl>

          {/* Description */}
          <FormControl fullWidth margin="normal">
            <FormLabel>Description</FormLabel>
            <TextField
              multiline
              rows={4}
              value={raidData.description}
              name="description"
              onChange={handleChange}
            />
          </FormControl>

          {/* Type */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select value={raidData.type} name="type" onChange={handleChange}>
              <MenuItem value="Risk">Risk</MenuItem>
              <MenuItem value="Action">Action</MenuItem>
              <MenuItem value="Issue">Issue</MenuItem>
              <MenuItem value="Decision">Decision</MenuItem>
            </Select>
          </FormControl>

          {/* Assigned To */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={raidData.assignedTo}
              name="assignedTo"
              onChange={handleChange}
            >
              {userOptions.map((user) => (
                <MenuItem key={user._id} value={user.name}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Created Date */}
          <FormControl fullWidth margin="normal">
            <FormLabel>Created Date</FormLabel>
            <Input
              type="date"
              value={raidData.createdDate}
              name="createdDate"
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
            />
          </FormControl>

          {/* Status */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={raidData.status}
              name="status"
              onChange={handleChange}
            >
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>

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
                        <Cancel color="error" />
                      </Button>
                    </Tooltip>
                    <Tooltip title="Upload" arrow>
                      <Button>
                        <UploadFile onClick={handleFileUpload} />
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

                            {/* Material UI Dialog for delete confirmation */}
                            <Dialog open={open} onClose={handleClose}>
                              <DialogTitle>{"Confirm Delete"}</DialogTitle>
                              <DialogContent>
                                <DialogContentText>
                                  Are you sure you want to delete this file?
                                  This action cannot be undone.
                                </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={handleClose} color="primary">
                                  Cancel
                                </Button>
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

          {/* Submit Button */}
          <Button type="submit" variant="contained" color="primary">
            {editMode ? "Update" : "Submit"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RaidForm;
