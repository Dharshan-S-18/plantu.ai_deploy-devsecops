// Inside createProject.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
  Modal,
  IconButton,
  Grid,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";

// Function to generate a unique Project ID
const generateProjectId = () => {
  const prefix = "PI";
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
  return `${prefix}${randomNumber}`;
};
const statusList = [
  { value: "To Do", title: "To Do", color: "#1976D2" },
  { value: "In Progress", title: "In Progress", color: "#FF9800" },
  { value: "Blocked", title: "Blocked", color: "#ff0000" },
  { value: "Completed", title: "Completed", color: "#009933" },
];

const NewProject = ({ open, handleClose, workspaceId, onProjectCreated }) => {
  const [project, setProject] = useState({
    accountId: "",
    projectId: generateProjectId(), // Ensure projectId is generated
    projectName: "",
    description: "",
    status: "",
    statusList: statusList,
    startDate: null,
    endDate: null,
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const router = useRouter();

  useEffect(() => {
    // Retrieve accountId from sessionStorage and set the project ID
    const accountId = sessionStorage.getItem("accountId");
    setProject((prev) => ({
      ...prev,
      projectId: generateProjectId(),
      accountId: accountId || "",
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  // Inside createProject.js

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log({ project });
    try {
        const response = await fetch(
            `/api/OnlyTaskApi/workspace/${workspaceId}/project`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(project),
            }
        );

        const data = await response.json(); // Parse the response JSON

        if (response.ok && data.success) {
            // Check if 'projects' is an array and has items
            if (
                Array.isArray(data.data.projects) &&
                data.data.projects.length > 0
            ) {
                const newProject = data.data.projects[data.data.projects.length - 1]; // Get the last added project
                const accountId = sessionStorage.getItem("accountId");
                setProject({
                    accountId: accountId,
                    projectId: generateProjectId(),
                    projectName: "",
                    description: "",
                    status: "",
                    statusList: [],
                    startDate: "",
                    endDate: "",
                });
                setSnackbarMessage("Project created successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
                console.log({ newProject });
                // Call the onProjectCreated function and pass the new project data
                if (onProjectCreated) {
                    onProjectCreated(newProject); // Use newProject instead of data.Projects
                }

                handleClose();

                // Redirect to the project edit page using the new project's ID
                router.push(`/post/OnlyTask/workspace/${workspaceId}/projects/${newProject._id}/edit`);
            } else {
                // Handle case where 'projects' array is empty or missing
                console.error(
                    "Unexpected response structure or empty projects array:",
                    data
                );
                setSnackbarMessage(
                    "Unexpected response structure. No projects found."
                );
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            }
        } else {
            console.error("Error saving project:", response.statusText);
            setSnackbarMessage("Failed to create project. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    } catch (error) {
        console.error("Network error:", error);
        setSnackbarMessage("An error occurred. Please try again.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
    }
};

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80vw",
            maxWidth: 800,
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: 3,
            p: 0,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#00264d",
              p: 1,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            <Typography
              variant="h6"
              component="h1"
              sx={{ color: "white", ml: 2 }}
            >
              Create New Project
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: "white", mr: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Grid container spacing={2} sx={{ p: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Project Name"
                name="projectName"
                value={project.projectName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Project Description"
                name="description"
                value={project.description}
                onChange={handleChange}
                required
              />
            </Grid>
            {/* Additional Fields */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Save Project
              </Button>
            </Grid>
          </Grid>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              variant="filled"
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarSeverity}
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default NewProject;
