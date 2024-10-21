import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Layout from "../../../../../../../components/Layout";
import {
  TextField,
  Box,
  Typography,
  Paper,
  Tabs,
  Tooltip,
  Tab,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  ListItemIcon,
} from "@mui/material";
import Textarea from "@mui/joy/Textarea";
import DeleteIcon from "@mui/icons-material/Delete";
import FlagIcon from "@mui/icons-material/Flag"; // Import Priority Icon
import NotesIcon from "@mui/icons-material/Notes";
import CheckIcon from "@mui/icons-material/Check";
import DateRangeIcon from "@mui/icons-material/DateRange"; // Import Date Range Icon
import PersonIcon from "@mui/icons-material/Person";
import KanbanView from "../../../../kanbanTask";
import GanttChartView from "../../../../taskGanttChart";
import CalendarTab from "../../../../taskCalendar";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import dynamic from "next/dynamic";
import format from "date-fns/format"; // Import date formatting function

// Import ReactQuill dynamically to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // Import styles
import {
  AttachFile,
  Attachment,
  Cancel,
  Delete,
  LinkRounded,
  UploadFile,
} from "@mui/icons-material";

const EditProjectPage = () => {
  const router = useRouter();
  const { id, projectId, tab, workspaceId } = router.query;
  const [project, setProject] = useState(null);
  const [activeSection, setActiveSection] = useState("Status");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // State for agent menu anchor element
  const [agents, setAgents] = useState([]); // State for storing agent list
  const [loadingAgents, setLoadingAgents] = useState(false); // State for loading status
  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null); // State for priority menu anchor element
  const [dateAnchorEl, setDateAnchorEl] = useState(null); // State for date menu anchor element
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isAttachmentOpen, setAttachmentOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch the attachments for the project
  useEffect(() => {
    fetchAttachments();
  }, [projectId]);

  const fetchAttachments = async () => {
    try {
      const response = await fetch(
        `/api/OnlyTaskApi/workspace/${id}/project/${projectId}/workSpaceAttachment`
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

  // Unified state for both description and assignedAgent
  const [projectUpdates, setProjectUpdates] = useState({
    projectName: "",
    description: "",
    assignedAgent: "", // Initially empty, will store agent name
    priority: "",
    startDate: "", // Start date state
    dueDate: "", // Due date state
  });

  useEffect(() => {
    if (tab) {
      setActiveSection(tab);
    }

    if (projectId) {
      const fetchProject = async () => {
        const response = await fetch(
          `/api/OnlyTaskApi/workspace/${id}/project/${projectId}`
        );
        const data = await response.json();
        setProject(data.project);
        setProjectUpdates({
          projectName: data.project.projectName || "",
          description: data.project.description || "",
          assignedAgent: data.project.assignedAgent || "", // Initially empty or fetched dynamically
          priority: data.project.priority || "Low",
          startDate: data.project.startDate || "", // Fetch start date
          dueDate: data.project.dueDate || "", // Fetch due date
        });
      };
      fetchProject();
    }
  }, [projectId, tab]);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true); // Open confirmation modal
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false); // Close confirmation modal
  };

  // Handle the delete operation when the user confirms the action
  const deleteDueDate = async () => {
    try {
      const response = await fetch(
        `/api/OnlyTaskApi/workspace/${id}/project/${projectId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (data.success) {
        setProjectUpdates((prev) => ({
          ...prev,
          dueDate: "", // Clear the dueDate in the UI
        }));
        setDeleteConfirmOpen(false); // Close the modal
        router.push(`/post/OnlyTask/workspace/${id}/projectList`);
      } else {
        console.error("Failed to delete due date");
      }
    } catch (error) {
      console.error("Error deleting due date:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveSection(newValue);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab: newValue },
    });
  };

  const handleBackClick = () => {
    router.push(`/post/OnlyTask/workspace/${id}/projectList`);
  };

  // Handle project name change and blur event
  const handleProjectNameChange = (event) => {
    setProjectUpdates((prevState) => ({
      ...prevState,
      projectName: event.target.value,
    }));
  };

  const handleProjectNameBlur = () => {
    handleSaveUpdates({ projectName: projectUpdates.projectName });
  };

  // Description-related handlers
  const handleDescriptionClick = () => {
    setDescriptionOpen(true);
  };

  const handleDescriptionClose = () => {
    setDescriptionOpen(false);
  };

  const handleDescriptionChange = (value) => {
    setProjectUpdates((prevState) => ({
      ...prevState,
      description: value,
    }));
  };

  // Agent-related handlers
  const handleAgentClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchAgents(); // Fetch agent list when menu is opened
  };

  const handleAgentClose = () => {
    setAnchorEl(null);
  };

  const fetchAgents = async () => {
    setLoadingAgents(true);
    const hostname = window.location.hostname;
    const extractedSubdomain = hostname.split(".")[0];
    const accountId = sessionStorage.getItem("accountId");
    if (!accountId) {
      console.error("No accountId found in sessionStorage");
      return;
    }
    try {
      const response = await fetch(
        `/api/auth/getAgents?accountId=${accountId}&subdomain=${extractedSubdomain}`
      ); // Replace with your actual API endpoint for agents
      const data = await response.json();
      setAgents(data); // Assuming API returns an array of agents
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleMenuItemSelect = (agentName) => {
    // Update the assignedAgent in state with agent name and save to database
    setProjectUpdates((prevState) => ({
      ...prevState,
      assignedAgent: agentName, // Store agent name
    }));
    setAnchorEl(null); // Close the menu
    handleSaveUpdates({ assignedAgent: agentName }); // Save the updated agent name to the database
  };

  // Priority-related handlers
  const handlePriorityClick = (event) => {
    setPriorityAnchorEl(event.currentTarget); // Open the priority menu
  };

  const handlePriorityClose = () => {
    setPriorityAnchorEl(null); // Close the priority menu
  };

  const handlePrioritySelect = (priority) => {
    setProjectUpdates((prevState) => ({
      ...prevState,
      priority: priority, // Update priority in state
    }));
    setPriorityAnchorEl(null); // Close the menu
    handleSaveUpdates({ priority: priority }); // Save updated priority to the database
  };

  // Date-related handlers
  const handleDateClick = (event) => {
    setDateAnchorEl(event.currentTarget); // Open the date menu
  };

  const handleDateClose = () => {
    setDateAnchorEl(null); // Close the date menu
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setProjectUpdates((prevState) => ({
      ...prevState,
      [name]: value, // Update the correct date field (startDate or dueDate)
    }));
  };

  const handleDateBlur = () => {
    handleSaveUpdates({
      startDate: projectUpdates.startDate,
      dueDate: projectUpdates.dueDate,
    });
  };

  // Unified update function for both description and assignedAgent
  const handleSaveUpdates = async (updates = projectUpdates) => {
    const response = await fetch(
      `/api/OnlyTaskApi/workspace/${id}/project/${projectId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates), // Send the updates object containing changes
      }
    );
    const data = await response.json();

    if (data.success) {
      setProject({
        ...project,
        ...updates, // Update project state with new values
      });
      if (updates.description) {
        setDescriptionOpen(false); // Close description dialog if updating description
      }
    } else {
      alert("Failed to update project");
    }
  };

  // Get icon color based on priority
  const getPriorityIconColor = () => {
    switch (projectUpdates.priority) {
      case "Urgent":
        return "red";
      case "High":
        return "orange";
      case "Medium":
        return "blue";
      case "Low":
        return "gray";
      default:
        return "gray";
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date ? format(new Date(date), "MMM dd, yyyy") : "";
  };

  if (!project) {
    return <Typography>Loading...</Typography>;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "Status":
        return <KanbanView projectId={projectId} workspaceId={id} />;
      case "Gantt":
        return <GanttChartView projectId={projectId} workspaceId={id} />;
      case "Table":
        return (
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6">Timecard</Typography>
            <Typography variant="body2">
              Time Entry 1: 01/01/2024 - 8 hours
            </Typography>
            <Typography variant="body2">
              Time Entry 2: 01/02/2024 - 7.5 hours
            </Typography>
          </Paper>
        );
      case "Calendar":
        return <CalendarTab projectId={projectId} workspaceId={id} />;
      default:
        return null;
    }
  };

  //   Attachments handler
  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the hidden file input click
    }
  };
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Handle the file upload logic here (e.g., upload to server or display file)
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

    console.log("workspaceId:", id); // Check if this logs the correct value
    console.log("projectId:", projectId); // Check if this logs the correct value

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `/api/OnlyTaskApi/workspace/${id}/project/${projectId}/workSpaceAttachment`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded:", data.url);
        console.log("Unique file ID:", data.uploadfileId); // You can use this ID for further actions
        handleCancelSelection(); // cancel the selection of file
        fetchAttachments(); // Refresh the list of files
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDeleteAttachment = async (fileKey) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const res = await fetch(
        `/api/OnlyTaskApi/workspace/${id}/project/${projectId}/workSpaceAttachment`,
        {
          method: "DELETE",
          body: JSON.stringify({ fileKey }),
        }
      );
      const data = await res.json();
      console.log("File Deleted:", data);
      handleCancelSelection(); // cancel the selection of file
      fetchAttachments(); // Refresh the list of files
    } catch (error) {
      console.error("Error Deleting File:", error);
    }
  };

  return (
    <Layout>
      <Box sx={{ width: "100%", p: 0, gap: 0, mb: -1, marginTop: -1, }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Back" placement="right" arrow>
            <IconButton onClick={handleBackClick} sx={{
              mb: 1,
              marginTop: -1,
              width: 40, // Adjust the width
              height: 40, // Adjust the height
              borderRadius: '50%', // Makes it a circle
              border: '2px solid', // Border width
              borderColor: 'primary.main', // Border color
              backgroundColor: 'transparent', // No fill color
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': {
                borderColor: 'primary.dark', // Change border color on hover
              },
            }}>
              <ArrowBackIosIcon />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}> {/* Added margin left for spacing */}
            <Textarea
              variant="plain"
              size="small"
              value={projectUpdates.projectName}
              onChange={handleProjectNameChange}
              onBlur={handleProjectNameBlur} // Update on blur
              sx={{ mb: 2, fontSize: '1.25rem', fontWeight: 'bold' }}
            />
            <Tooltip title="Description" placement="top" arrow>
              <IconButton onClick={handleDescriptionClick} sx={{ mb: 1 }}>
                <NotesIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Assignee" placement="top" arrow>
              <IconButton onClick={handleAgentClick} sx={{ mb: 1 }}>
                <PersonIcon />
              </IconButton>
            </Tooltip>
            {projectUpdates.assignedAgent && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                {projectUpdates.assignedAgent}
              </Typography>
            )}
            <Tooltip title="Priority" placement="top" arrow>
              <IconButton
                onClick={handlePriorityClick}
                sx={{ mb: 1, color: getPriorityIconColor() }}
              >
                <FlagIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Date" placement="top" arrow>
              <IconButton onClick={handleDateClick} sx={{ mb: 1 }}>
                <DateRangeIcon />
              </IconButton>
            </Tooltip>
            {projectUpdates.startDate && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                {`Start: ${formatDate(projectUpdates.startDate)}`}
              </Typography>
            )}
            {projectUpdates.dueDate && (
              <Typography variant="body2" sx={{ ml: 1 }}>
                {`Due: ${formatDate(projectUpdates.dueDate)}`}
              </Typography>
            )}
            <Tooltip title="Delete Project" placement="top" arrow>
              <IconButton onClick={handleDeleteClick} sx={{ mb: 1 }}>
                <DeleteIcon color="error" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Attachment" placement="top" arrow>
              <IconButton sx={{ mb: 1 }} onClick={() => setAttachmentOpen(true)}>
                <Attachment />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ ml: -3 }} />

        <Tabs
          value={activeSection}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="project sections"
        >
          <Tab label="Status" value="Status" />
          <Tab label="Gantt" value="Gantt" />
          {/* <Tab label="Table" value="Table" /> */}
          <Tab label="Calendar" value="Calendar" />
        </Tabs>

        <Box sx={{ height: "calc(100vh - 160px)" }}>{renderContent()}</Box>
      </Box>

      {/* Description Popup */}
      <Dialog open={descriptionOpen} onClose={handleDescriptionClose}>
        <DialogTitle>Edit Project Description</DialogTitle>
        <DialogContent>
          <ReactQuill
            value={projectUpdates.description}
            onChange={handleDescriptionChange}
            modules={{
              toolbar: [
                [{ header: "1" }, { header: "2" }, { font: [] }],
                [{ size: [] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [
                  { list: "ordered" },
                  { list: "bullet" },
                  { indent: "-1" },
                  { indent: "+1" },
                ],
                ["link", "image"],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "font",
              "size",
              "bold",
              "italic",
              "underline",
              "strike",
              "blockquote",
              "list",
              "bullet",
              "indent",
              "link",
              "image",
            ]}
            style={{ minHeight: "200px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDescriptionClose} color="primary">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              handleSaveUpdates({ description: projectUpdates.description })
            }
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Agent Selection Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleAgentClose}
      >
        {loadingAgents ? (
          <MenuItem>
            <CircularProgress size={24} />
          </MenuItem>
        ) : agents.length > 0 ? (
          agents.map((agent) => (
            <MenuItem
              key={agent.id}
              onClick={() => handleMenuItemSelect(agent.name)}
              selected={projectUpdates.assignedAgent === agent.name} // Highlight selected agent
            >
              {projectUpdates.assignedAgent === agent.name && (
                <ListItemIcon>
                  <CheckIcon />
                </ListItemIcon>
              )}
              {agent.name} {/* Display agent name */}
            </MenuItem>
          ))
        ) : (
          <MenuItem>No Agents Available</MenuItem>
        )}
      </Menu>
      {/* Priority Selection Menu */}
      <Menu
        anchorEl={priorityAnchorEl}
        open={Boolean(priorityAnchorEl)}
        onClose={handlePriorityClose}
      >
        {["Urgent", "High", "Medium", "Low"].map((priority) => (
          <MenuItem
            key={priority}
            onClick={() => handlePrioritySelect(priority)}
            selected={projectUpdates.priority === priority} // Highlight selected priority
          >
            {projectUpdates.priority === priority && (
              <ListItemIcon>
                <CheckIcon />
              </ListItemIcon>
            )}
            {priority}
          </MenuItem>
        ))}
      </Menu>
      {/* Date Selection Menu */}
      <Menu
        anchorEl={dateAnchorEl}
        open={Boolean(dateAnchorEl)}
        onClose={handleDateClose}
      >
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1">Start Date</Typography>
          <TextField
            name="startDate"
            type="date"
            value={projectUpdates.startDate}
            onChange={handleDateChange}
            onBlur={handleDateBlur} // Update on blur
          />
          <Typography variant="subtitle1">Due Date</Typography>
          <TextField
            name="dueDate"
            type="date"
            value={projectUpdates.dueDate}
            onChange={handleDateChange}
            onBlur={handleDateBlur} // Update on blur
          />
        </Box>
      </Menu>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-confirm-dialog"
        aria-describedby="delete-confirm-description"
      >
        <DialogTitle
          id="delete-confirm-dialog"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#00264d",
            p: 1,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            color: "white",
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-confirm-description">
            Are you sure you want to delete the project "
            {projectUpdates.projectName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteDueDate} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* attachment popup */}
      <Dialog open={isAttachmentOpen} onClose={() => setAttachmentOpen(false)}>
        <DialogTitle>
          <Button onClick={handleAttachClick}>
            Add Attachment &nbsp;
            <AttachFile />
          </Button>
        </DialogTitle>
        <DialogContent>
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
                <IconButton onClick={handleCancelSelection}>
                  <Cancel />
                </IconButton>
                <IconButton>
                  <UploadFile onClick={handleFileUpload} />
                </IconButton>
              </Typography>
            </>
          )}
          <Box>
            {attachments.length === 0 ? (
              <Typography>No attachments found for this project.</Typography>
            ) : (
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
                      <Button>
                        <LinkRounded />
                      </Button>
                    </a>
                    <Button onClick={() => handleDeleteAttachment(file.key)}>
                      <Delete />
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EditProjectPage;
