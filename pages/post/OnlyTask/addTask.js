import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Avatar,
  Button,
  MenuItem,
  Menu,
  Select,
  Paper,
  FormControl,
  Grid,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  InputBase,
  Tooltip,
  Chip,
  Popover,
  Checkbox,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { ChromePicker } from "react-color"; // Color picker library
import Textarea from "@mui/joy/Textarea";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import CloseIcon from "@mui/icons-material/Close";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ListIcon from "@mui/icons-material/List";
import LinkIcon from "@mui/icons-material/Link";
import ChecklistIcon from "@mui/icons-material/Checklist";
import EditIcon from "@mui/icons-material/Edit";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import RadioButtonCheckedOutlinedIcon from "@mui/icons-material/RadioButtonCheckedOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import MoreTimeOutlinedIcon from "@mui/icons-material/MoreTimeOutlined";
import AddIcon from "@mui/icons-material/Add";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import {
  AttachFile,
  Attachment,
  Cancel,
  Delete,
  LinkRounded,
  Person,
  UploadFile,
} from "@mui/icons-material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FlagIcon from "@mui/icons-material/Flag";
import axios from "axios";
import dayjs from "dayjs";
import Subtask from "./Subtask"; // Import the Subtask component
import relativeTime from "dayjs/plugin/relativeTime"; // Import the relativeTime plugin
import SaveIcon from "@mui/icons-material/Save";
import PaletteIcon from "@mui/icons-material/Palette"; // Color picker icon
import ClickAwayListener from "@mui/material/ClickAwayListener";
import AssigneeMenu from "../../../components/AssigneeMenu";
import SubtaskList from "../OnlyTask/SubtaskList";
import CommentSection from "../OnlyTask/CommentSection";
import { green } from "@mui/material/colors";

dayjs.extend(relativeTime); // Extend Day.js with the relativeTime plugin
const filter = createFilterOptions();

const AddTaskModal = ({
  workspaceId,
  projectId,
  taskId,
  onClose,
  open,
  onTaskChange,
}) => {
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    assigneePrimary: "",
    startDate: dayjs(), // Default to current date
    dueDate: dayjs().add(7, "day"), // Default to one week from current date
    status: "",
    priority: "Normal",
    relation: [],
    actualEffort: 0, // Default actual effort
    allocatedEffort: 0, // Default allocated effort
    subactions: [],
    labels: [],
    dependencies: [],
    checklist: [],
    comments: [],
    milestone: false,
  });

  const [task, setTask] = useState({});
  const router = useRouter();
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [newStatus, setNewStatus] = useState(""); // State for new status input
  const [selectedSubtask, setSelectedSubtask] = useState(null); // State to store the selected subtask data
  const [openSubtaskModal, setOpenSubtaskModal] = useState(false); // State to control subtask modal visibility
  const [statusList, setStatusList] = useState([]);
  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: "",
    description: "",
  });
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [anchorElStart, setAnchorElStart] = useState(null);
  const [anchorElDue, setAnchorElDue] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [anchorEl3, setAnchorEl3] = useState(null);
  const [openStatusPicker, setOpenStatusPicker] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null); // To handle opening/closing of priority menu
  const isPriorityMenuOpen = Boolean(priorityAnchorEl);
  const [editingField, setEditingField] = useState(null); // To track which field is in edit mode (e.g., 'actualEffort', 'allocatedEffort')
  const [labels, setLabels] = useState([]); // Store available labels for the project
  const [editLabelId, setEditLabelId] = useState(null); // Track which label is being edited
  const [editLabelData, setEditLabelData] = useState({ name: "", color: "" });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textFieldRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorElAllocatedEffort, setAnchorElAllocatedEffort] = useState(null);
  const [anchorElActualEffort, setAnchorElActualEffort] = useState(null);
  const fileInputRef = useRef(null);
  const [isAttachmentOpen, setAttachmentOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const [opened, setOpen] = useState(false);
  const [selectedFileKey, setSelectedFileKey] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // sucess or error
  const [Deleting, setDeleting] = useState(false);
  const [Fetching, setFetching] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      //Trigger the hidden file input check
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      //handle the file upload logic
    }
  };

  const handleCancelSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClickOpen = (fileKey) => {
    setSelectedFileKey(fileKey);
    setOpen(true);
  };
  const handleCloseAttachment = () => {
    setOpen(false);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    //Extract subdomain and accountId
    const hostname = window.location.hostname;
    const extractedSubdomain = hostname.split(".")[0];
    const accountId = sessionStorage.getItem("accountId");

    try {
      const response = await fetch(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/workSpaceTaskAttachment?accountId=${accountId}&subdomain=${extractedSubdomain}`,
        { method: "POST", body: formData }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded:", data.url);
        console.log("Unique file ID:", data.uploadfileId); // You can use this ID for further actions
        fetchAttachments(); // Refresh the list of files
        setSnackbarMessage("File uploaded successfully");
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
      handleCancelSelection(); // Cancel the selection of the file
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    setFetching(true);
    const hostname = window.location.hostname;
    const extractedSubdomain = hostname.split(".")[0];
    const accountId = sessionStorage.getItem("accountId");
    try {
      const response = await fetch(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/workSpaceTaskAttachment?accountId=${accountId}&subdomain=${extractedSubdomain}`
      );
      if (response.ok) {
        const data = await response.json();
        setAttachments(data); // Set the attachments
      } else {
        console.error("Error fetching attachments");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setFetching(false);
    }
  };

  //Delete Attachment handle
  const handleConfirmDelete = async () => {
    setDeleting(true);
    const hostname = window.location.hostname;
    const extractedSubdomain = hostname.split(".")[0];
    const accountId = sessionStorage.getItem("accountId");
    try {
      const res = await fetch(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/workSpaceTaskAttachment?accountId=${accountId}&subdomain=${extractedSubdomain}`,
        {
          method: "DELETE",
          body: JSON.stringify({ fileKey: selectedFileKey }),
        }
      );
      const data = await res.json();
      fetchAttachments(); // Refresh the list of files
      handleCloseAttachment(); // Close the confirmation dialog
      setSnackbarMessage("File deleted successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setSelectedFileKey(null); // Reset selected file key here
    } catch (error) {
      console.error("Error deleting file:", error);
      setSnackbarMessage("Error deleting file!");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setDeleting(false);
    }
  };

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

  const handleEffortChange = (field, value) => {
    setTaskData((prevData) => ({
      ...prevData,
      [field]: Number(value),
    }));
    setIsSaveButtonEnabled(true);
  };

  // Open menu handlers
  const handleAllocatedEffortClick = (event) => {
    setAnchorElAllocatedEffort(event.currentTarget);
  };
  const handleActualEffortClick = (event) => {
    setAnchorElActualEffort(event.currentTarget);
  };

  // Close menu handlers
  const handleAllocatedEffortClose = () => {
    setAnchorElAllocatedEffort(null);
  };
  const handleActualEffortClose = () => {
    setAnchorElActualEffort(null);
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

  const handleOpenSubtaskModal = (subtask) => {
    setSelectedSubtask(subtask);
    setOpenSubtaskModal(true);
  };

  const handleCloseSubtaskModal = () => {
    setSelectedSubtask(null);
    setOpenSubtaskModal(false);
  };

  // Filter tasks based on the search term
  const filteredTasks = tasks.filter((task) =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openStartDatePicker = Boolean(anchorElStart);
  const openDueDatePicker = Boolean(anchorElDue);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    if (taskId) {
      fetchTask(taskId);

      // Fetch subtasks and comments for the current task using the API
      // fetchSubtasks(taskId);
      fetchStatusList(projectId);
    } else {
      // This block is for when no taskId is provided, indicating task creation
      setTaskData({
        name: "",
        description: "",
        assigneePrimary: "",
        startDate: dayjs(), // Default to current date
        dueDate: dayjs().add(7, "day"), // Default to one week from current date
        status: "",
        priority: "Normal",
        relation: "",
        actualEffort: 0, // Default actual effort
        allocatedEffort: 0, // Default allocated effort
        subactions: [],
        labels: [],
        dependencies: [],
        comments: [],
        checklist: [],
        milestone: false,
      });
    }
  }, [taskId]);

  useEffect(() => {
    const fetchProjectLabels = async () => {
      try {
        const response = await axios.get(
          `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/labels`
        );
        setLabels(response.data.labels || []);
      } catch (error) {
        console.error("Failed to fetch project labels:", error);
      }
    };
    fetchProjectLabels();
  }, [projectId]);

  // Handle selecting multiple labels for the task

  const handleLabelChange = (labelId) => {
    setTaskData((prevData) => ({
      ...prevData,
      labels: prevData.labels.includes(labelId)
        ? prevData.labels
        : [...prevData.labels, labelId],
    }));
    setIsSaveButtonEnabled(true); // Enable save button for changes
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
    setEditLabelData({ name: label.name, color: label.color || "#111" }); // Initialize with current label data
  };

  // Save the edited label (both name and color)
  const handleSaveLabelEdit = async () => {
    try {
      await axios.put(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/labels`,
        {
          labelId: editLabelId,
          newLabelName: editLabelData.name,
          newLabelColor: editLabelData.color,
        }
      );
      setLabels((prevLabels) =>
        prevLabels.map((label) =>
          label._id === editLabelId
            ? { ...label, name: editLabelData.name, color: editLabelData.color }
            : label
        )
      );
      setEditLabelId(null); // Stop editing after saving
    } catch (error) {
      console.error("Failed to save label edit:", error);
    }
  };

  // Function to handle adding a checklist item
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
      setIsSaveButtonEnabled(true);
    }
  };

  // Fetch tasks for Relation dropdown
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task`
        );
        setTasks(response.data.tasks); // Assuming response contains tasks in `tasks` field
        console.log(response);
      } catch (error) {
        console.error("Failed to fetch tasks for Relation dropdown:", error);
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
        dueDate: task.dueDate ? dayjs(task.dueDate) : dayjs().add(7, "day"),
        milestone: task.milestone || false, // Set milestone from fetched data
      };
      setTaskData(updatedTaskData);
      setInitialValues({
        name: updatedTaskData.name,
        description: updatedTaskData.description,
      });
    } catch (error) {
      console.error("Failed to fetch task:", error);
    }
  };

  const fetchStatusList = async (projectId) => {
    try {
      const response = await axios.get(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/statusList`
      );
      setStatusList(response.data.statusList);
    } catch (error) {
      console.error("Failed to fetch status list:", error);
    }
  };

  const handleProjectAddStatus = async (newStatus) => {
    const newStatusData = {
      title: newStatus,
      value: newStatus,
      color: "#111",
    };
    try {
      const response = await axios.post(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/statusList`,
        newStatusData
      );
      if (response.status === 200) {
        setStatusList((prevStatusList) => [...prevStatusList, newStatusData]);
        setNewStatus("");
      } else {
        console.error("Failed to add new status:", response.data.error);
      }
    } catch (error) {
      console.error("Error adding status:", error);
    }
  };

  const handleStatusChange = (event, newValue) => {
    if (newValue && typeof newValue.value === "string") {
      handleInputChange("status", newValue.value);
    } else if (newValue && newValue.inputValue) {
      handleProjectAddStatus(newValue.inputValue);
      handleInputChange("status", newValue.inputValue);
    } else {
      handleInputChange("status", newValue);
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

  const handleInputChange = (field, value) => {
    setTaskData((prevData) => ({
      ...prevData,
      [field]: value, // For relation, value will be an array of selected task IDs
    }));
    //setIsSaveButtonEnabled(true);
    setTaskData((prevData) => ({ ...prevData, [field]: value }));

    // Enable save button if relevant fields are changed
    if (field !== "description") {
      setIsSaveButtonEnabled(true);
    }
    // Automatically save task name if it was changed
    if (field === "name") {
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
        const response = await axios.put(
          `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${task._id}`,
          taskData
        );

        if (response.status === 200) {
          console.log(response);
          setIsSaveButtonEnabled(false); // Reset after successful save
          onTaskChange("Task updated successfully", "success");
          //onClose();
        } else {
          onTaskChange("Failed to update Task");
        }
      } else {
        // Task creation logic
        const response = await axios.post(
          `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task`,
          taskData
        );

        if (response.status === 200) {
          setIsSaveButtonEnabled(false); // Reset after successful creation
          onTaskChange("Task created successfully", "success");
          onClose();
        } else {
          onTaskChange("Failed to create Task");
        }
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      onTaskChange("Error submitting Task");
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
      assigneePrimary: assignee || "Unassigned",
    }));
    setIsSaveButtonEnabled(true);
    handleClose(); // Close the menu after selection
  };

  const handleAddDependency = (id) => {
    setTaskData((prevData) => ({
      ...prevData,
      relation: prevData.relation.includes(id)
        ? prevData.relation
        : [...prevData.relation, id],
    }));
    setIsSaveButtonEnabled(true);
    setAnchorEl2(null); // Close the menu after adding
  };

  const handleDeleteDependency = (idToRemove) => {
    setTaskData((prevData) => ({
      ...prevData,
      relation: prevData.relation.filter((id) => id !== idToRemove),
    }));
    setIsSaveButtonEnabled(true);
  };

  // Function to handle task navigation
  const handleNavigateToTask = (taskId) => {
    //const taskUrl = `http://kakoli.localhost:3000/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit?taskId=${taskId}`;
    window.open(
      `/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit?taskId=${taskId}`,
      "_blank"
    ); // Navigate to the URL
  };

  const handleAddLabel = (id) => {
    setTaskData((prevData) => ({
      ...prevData,
      labels: prevData.labels.includes(id)
        ? prevData.labels
        : [...prevData.labels, id],
    }));
    setIsSaveButtonEnabled(true);
    setAnchorEl(null); // Close the menu after adding
  };

  const handleDeleteLabel = (idToRemove) => {
    setTaskData((prevData) => ({
      ...prevData,
      labels: prevData.labels.filter((id) => id !== idToRemove),
    }));
    setIsSaveButtonEnabled(true);
  };

  const getStatusColor = (status) => {
    const statusItem = statusList.find((item) => item.title === status);
    return statusItem ? statusItem.color : "#e0f7fa"; // Default color if no match
  };

  const handleMilestoneToggle = async (event) => {
    const newMilestoneValue = !taskData.milestone; // Get the checkbox value
    console.log("checkbox value :", newMilestoneValue);

    // Update the local state with the new value
    setTaskData((prevData) => ({
      ...prevData,
      milestone: newMilestoneValue,
    }));

    // Immediately save the new milestone status to the database
    try {
      const response = await axios.put(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}`,
        {
          ...taskData,
          milestone: newMilestoneValue,
        }
      );

      if (response.status === 200) {
        console.log("Milestone status updated successfully", response);
      } else {
        console.error("Failed to update milestone status");
      }
    } catch (error) {
      console.error("Error updating milestone status:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%", // Set the width of the dialog (80% of the viewport width)
          height: "90vh", // Set the height of the dialog (90% of the viewport height)
          maxWidth: "none", // Disable the default maxWidth behavior
          maxHeight: "none", // Disable the default maxHeight behavior
          //maxHeight: '90vh',
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 0,
        },
      }}
    >
      <DialogTitle
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
        <Box display="flex" alignItems="center">
          {/* Milestone Checkbox */}
          <Tooltip title="Milestone" arrow>
            <Checkbox
              checked={taskData.milestone} // Bind to the milestone state
              onChange={handleMilestoneToggle}
              icon={<StarBorderIcon sx={{ color: "#fff" }} />}
              checkedIcon={<StarIcon sx={{ color: "#ffcc00" }} />}
              sx={{ mr: 1 }}
            />
          </Tooltip>

          <Typography variant="h6" sx={{ color: "#fff", ml: 0 }}>
            {taskData.taskNumber}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          {/* Subtask icon to open subtask modal */}
          <Tooltip title="Subtasks" arrow>
            <IconButton
              onClick={handleOpenSubtaskModal}
              sx={{
                color: "#fff",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "rotate(20deg)",
                },
              }}
            >
              <AccountTreeIcon />
            </IconButton>
          </Tooltip>
          {/* Link icon to copy URL */}
          <Tooltip title="Copy Task Link" arrow>
            <IconButton
              onClick={() => {
                const taskUrl = `${window.location.origin}/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit?taskId=${taskId}`;
                navigator.clipboard.writeText(taskUrl); // Copy URL to clipboard
              }}
              sx={{
                color: "#fff",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "rotate(20deg)",
                },
              }}
            >
              <LinkIcon />
            </IconButton>
          </Tooltip>

          {/* Close icon */}
          <Tooltip title="Task Close" arrow>
            <IconButton
              onClick={onClose}
              sx={{
                color: "#fff",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "rotate(20deg)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "600px",
        }}
      >
        {/* Wrap the component with LocalizationProvider */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Left Column - Scrollable with Custom Scrollbar */}
          <Box
            sx={{
              overflowY: "auto",
              maxHeight: "100%",
              flex: "6",
              pr: 2,
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#dcd8f3",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f0f0f0",
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
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={handleTaskNameBlur} // Save on blur
                sx={{
                  mb: 1,
                  fontSize: "24px",
                  fontWeight: "bold",
                  width: "1000px",
                }}
              />

              {/* Status Chip */}
              <Tooltip title="Status" placement="bottom" arrow>
                <Chip
                  label={taskData.status || "Select Status"}
                  variant="outlined"
                  icon={
                    <RadioButtonCheckedOutlinedIcon sx={{ color: "#fff" }} />
                  }
                  onClick={() => setOpenStatusPicker(true)} // Opens the dialog when the chip is clicked
                  sx={{
                    cursor: "pointer",
                    bgcolor: getStatusColor(taskData.status),
                    color: "#404040", // Set text color to white for better contrast
                    mr: 2,
                  }}
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
                    filterOptions={(options, params) =>
                      handlefilterOptions(options, params)
                    }
                    displayEmpty
                    fullWidth
                    options={statusList}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") {
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
                      <TextField
                        {...params}
                        onFocus={() => setOpenStatusPicker(true)}
                        sx={{ width: "200px" }}
                      /> // Open on focus
                    )}
                  />
                </DialogContent>
              </Dialog>

              {/* Assignee Chip */}
              <Tooltip title="Assignee" placement="bottom" arrow>
                <Chip
                  label={taskData.assigneePrimary || "Unassigned"}
                  onClick={handleClick}
                  variant="outlined"
                  icon={<Person />}
                  sx={{
                    cursor: "pointer",
                    bgcolor: taskData.assigneePrimary ? "#e0f7fa" : "#f5f5f5",
                    mr: 2,
                  }}
                />
              </Tooltip>

              {/* Render the Assignee Menu */}
              <AssigneeMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                assigneeOptions={assigneeOptions}
                onAssigneeSelect={handleAssigneeSelect}
              />
            </Box>
            {/* Description */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ArticleOutlinedIcon sx={{ mr: 1 }} />{" "}
              {/* Adjust margin as needed */}
              <Typography
                variant="subtitle1"
                sx={{ fontSize: "13px", fontWeight: "600" }}
              >
                Description
              </Typography>
            </Box>
            <Textarea
              fullWidth
              variant="plain"
              placeholder="Add description"
              multiline
              minRows={2}
              value={taskData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              onBlur={handleDescriptionBlur} // Call onBlur to save on focus out
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", alignItems: "center", mb: 2, mt: 1 }}>
              {/* Priority Field (Chip style) */}
              {/* <Grid item xs={12} md={6}> */}
              <Tooltip title="Priority" placement="top" arrow>
                <Chip
                  label={taskData.priority}
                  variant="outlined"
                  icon={<FlagIcon />} // Example icon
                  onClick={handlePriorityClick} // Click to open the menu
                  sx={{ cursor: "pointer", bgcolor: "#e0f7fa", mr: 2 }} // Customize background color if desired
                />
              </Tooltip>

              {/* Priority Menu */}
              <Menu
                anchorEl={priorityAnchorEl}
                open={isPriorityMenuOpen}
                onClose={() => handlePriorityClose(null)} // Close without selection
              >
                <MenuItem onClick={() => handlePriorityClose("Urgent")}>
                  Urgent
                </MenuItem>
                <MenuItem onClick={() => handlePriorityClose("Medium")}>
                  Medium
                </MenuItem>
                <MenuItem onClick={() => handlePriorityClose("Low")}>
                  Low
                </MenuItem>
                <MenuItem onClick={() => handlePriorityClose("Normal")}>
                  Normal
                </MenuItem>
              </Menu>
              {/* </Grid> */}

              {/* Allocated Effort Chip */}
              <Tooltip title="Allocated Effort">
                <Chip
                  label={`${taskData.allocatedEffort} hours`}
                  onClick={handleAllocatedEffortClick}
                  icon={<MoreTimeOutlinedIcon />}
                  sx={{ cursor: "pointer", mr: 2 }}
                />
              </Tooltip>
              <Menu
                anchorEl={anchorElAllocatedEffort}
                open={Boolean(anchorElAllocatedEffort)}
                onClose={handleAllocatedEffortClose}
              >
                <Box sx={{ padding: 2 }}>
                  <TextField
                    label="Allocated Effort (hours)"
                    type="number"
                    value={taskData.allocatedEffort}
                    onChange={(e) =>
                      handleEffortChange("allocatedEffort", e.target.value)
                    }
                    fullWidth
                    autoFocus
                  />
                </Box>
              </Menu>

              {/* Actual Effort Chip */}
              {/* Actual Effort Chip */}
              <Tooltip title="Actual Effort">
                <Chip
                  label={`${taskData.actualEffort} hours`}
                  onClick={handleActualEffortClick}
                  icon={<MoreTimeOutlinedIcon />}
                  sx={{ cursor: "pointer", mr: 2 }}
                />
              </Tooltip>
              <Menu
                anchorEl={anchorElActualEffort}
                open={Boolean(anchorElActualEffort)}
                onClose={handleActualEffortClose}
              >
                <Box sx={{ padding: 2 }}>
                  <TextField
                    label="Actual Effort (hours)"
                    type="number"
                    value={taskData.actualEffort}
                    onChange={(e) =>
                      handleEffortChange("actualEffort", e.target.value)
                    }
                    fullWidth
                    autoFocus
                  />
                </Box>
              </Menu>

              {/* Start Date Chip */}
              <Tooltip title="Start Date" placement="top" arrow>
                <Chip
                  label={`${
                    taskData.startDate
                      ? taskData.startDate.format("DD/MM/YYYY")
                      : "Select Start Date"
                  }`}
                  variant="outlined"
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
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={taskData.startDate}
                    onChange={(newValue) =>
                      handleDateChange("startDate", newValue)
                    }
                    renderInput={(params) => <TextField {...params} />}
                    disablePast
                  />
                </LocalizationProvider>
              </Popover>

              {/* Due Date Chip */}
              <Tooltip title="Due Date" placement="top" arrow>
                <Chip
                  label={`${
                    taskData.dueDate
                      ? taskData.dueDate.format("DD/MM/YYYY")
                      : "Select Due Date"
                  }`}
                  variant="outlined"
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
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={taskData.dueDate}
                    onChange={(newValue) =>
                      handleDateChange("dueDate", newValue)
                    }
                    renderInput={(params) => <TextField {...params} />}
                    disablePast
                  />
                </LocalizationProvider>
              </Popover>
              <Tooltip title="Attachment" placement="top" arrow>
                <Chip
                  icon={<Attachment />}
                  label="Attachment"
                  variant="outlined"
                  onClick={() => setAttachmentOpen(true)}
                />
              </Tooltip>
            </Box>
            {/* ))} */}

            {/* workspace task attachment */}
            <Dialog
              open={isAttachmentOpen}
              onClose={() => setAttachmentOpen(false)}
            >
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
                      <Tooltip title="Cancel" arrow>
                        <Button onClick={handleCancelSelection}>
                          <Cancel color="error" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Upload" arrow>
                        <Button onClick={handleFileUpload} disabled={uploading}>
                          {uploading ? (
                            <CircularProgress
                              size={18}
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
                <Box>
                  {Fetching ? (
                    <CircularProgress
                      size={18}
                      sx={{
                        color: "green",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  ) : attachments.length === 0 ? (
                    <Typography>
                      No attachments found for this project.
                    </Typography>
                  ) : (
                    <Box>
                      {attachments.map((file, index) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <Typography sx={{ mr: 2 }}>
                            {file.key.split("-").pop()}{" "}
                            {/* Extracts the file name */}
                          </Typography>

                          <a
                            href={`https://${file.bucketName}.s3.${file.region}.amazonaws.com/${file.key}`}
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
                          <Dialog open={opened} onClose={handleCloseAttachment}>
                            <DialogTitle>{"Confirm Delete"}</DialogTitle>
                            <DialogContent>
                              <DialogContentText>
                                Are you sure you want to delete this file? This
                                action cannot be undone.
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleCloseAttachment}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleConfirmDelete}
                                color="error"
                              >
                                {Deleting ? (
                                  <CircularProgress
                                    size={18}
                                    sx={{ color: "green" }}
                                  />
                                ) : (
                                  // <Delete color="error" />
                                  <Typography>Delete</Typography>
                                )}
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </DialogContent>
            </Dialog>

            {/* Relation Field with Custom Layout */}
            <Box mt={2} sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mr: 2,
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <SwapHorizOutlinedIcon sx={{ marginRight: "8px" }} />{" "}
                Dependencies
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {taskData.relation.length > 0 ? (
                  taskData.relation.map((id) => {
                    const task = tasks.find((t) => t._id === id);
                    return (
                      <Box
                        key={id}
                        onClick={() => handleNavigateToTask(id)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          border: "1px solid #ddd",
                          borderRadius: "16px",
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        {/* <Checkbox checked size="small" /> */}
                        <Typography variant="body2">
                          {task?.name || "Unknown"}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mx: 0 }}
                        >
                          {dayjs(task?.startDate).format("MMM DD")} -{" "}
                          {dayjs(task?.dueDate).format("MMM DD")}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering handleNavigateToTask
                            handleDeleteDependency(id);
                          }}
                        >
                          <CloseIcon fontSize="small" sx={{ color: "red" }} />
                        </IconButton>
                      </Box>
                    );
                  })
                ) : (
                  <Typography
                    color="textSecondary"
                    onClick={(e) => setAnchorEl2(e.currentTarget)}
                  >
                    Add dependencies
                  </Typography>
                )}

                {/* Add icon to open menu */}
                <Tooltip title="Add another dependency" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl2(e.currentTarget)}
                  >
                    <AddIcon fontSize="small" sx={{ color: "green" }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Menu for adding dependencies */}
              <Menu
                anchorEl={anchorEl2}
                open={Boolean(anchorEl2)}
                onClose={() => setAnchorEl2(null)}
                PaperProps={{ style: { maxHeight: 300, overflowY: "auto" } }}
              >
                <MenuItem>
                  <InputBase
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: "100%", padding: "8px" }}
                  />
                </MenuItem>
                {filteredTasks.map((task) => (
                  <MenuItem
                    key={task._id}
                    onClick={() => handleAddDependency(task._id)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={taskData.relation.includes(task._id)}
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText primary={task.name} />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box mt={2} sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mr: 2,
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                <LabelOutlinedIcon sx={{ marginRight: "8px" }} /> Label
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {taskData.labels.length > 0 ? (
                  taskData.labels.map((id) => {
                    const label = labels.find((lbl) => lbl._id === id);
                    return (
                      <Box
                        key={id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          border: "1px solid #ddd",
                          borderRadius: "16px",
                          padding: "4px 8px",
                          backgroundColor: label ? label.color : "#ccc",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        <Typography variant="body2">
                          {label?.name || "Unknown"}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent dropdown opening
                            handleDeleteLabel(id);
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })
                ) : (
                  <Typography color="textSecondary">Add labels</Typography>
                )}

                {/* Add icon to open menu */}
                <Tooltip title="Add another label" arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl3(e.currentTarget)}
                  >
                    <AddIcon fontSize="small" sx={{ color: "green" }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Menu for adding labels */}
              <Menu
                anchorEl={anchorEl3}
                open={Boolean(anchorEl3)}
                onClose={() => setAnchorEl3(null)}
                PaperProps={{ style: { maxHeight: 300, overflowY: "auto" } }}
              >
                <MenuItem>
                  <InputBase
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: "100%", padding: "8px" }}
                  />
                </MenuItem>
                {labels.map((label) => (
                  <MenuItem
                    key={label._id}
                    value={label._id}
                    onClick={() => handleLabelChange(label._id)}
                  >
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
                        <IconButton
                          onClick={() => setShowColorPicker((prev) => !prev)}
                        >
                          <PaletteIcon />
                        </IconButton>
                        {/* Conditionally render the ChromePicker */}
                        {showColorPicker && (
                          <ClickAwayListener
                            onClickAway={() => setShowColorPicker(false)}
                          >
                            <Box position="absolute" zIndex={2} height="100%">
                              <ChromePicker
                                color={editLabelData.color}
                                onChangeComplete={(color) =>
                                  setEditLabelData((prev) => ({
                                    ...prev,
                                    color: color.hex,
                                  }))
                                }
                              />
                            </Box>
                          </ClickAwayListener>
                        )}
                        {/* Save button to save changes */}
                        <IconButton
                          onClick={handleSaveLabelEdit}
                          sx={{ ml: 2 }}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                      >
                        <Checkbox
                          checked={taskData.labels.includes(label._id)}
                          onChange={(e) => {
                            e.stopPropagation(); // Prevent MenuItem click event from firing
                            handleLabelChange(label._id);
                          }}
                        />
                        <ListItemText
                          primary={label.name}
                          style={{ color: label.color }}
                        />
                        <IconButton onClick={() => handleEditLabel(label)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Checklist Section */}
            <Box sx={{ display: "flex", alignItems: "center", mt: 3 }}>
              <ChecklistIcon sx={{ mr: 1 }} />
              <Typography
                variant="subtitle1"
                sx={{ fontSize: "13px", fontWeight: "600" }}
              >
                Checklist
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              {taskData.checklist.map((item, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <Checkbox
                    checked={item.completed}
                    onChange={() => handleToggleChecklistItem(index)}
                  />
                  <Typography
                    sx={{
                      textDecoration: item.completed ? "line-through" : "none",
                    }}
                  >
                    {item.text}
                  </Typography>
                  <IconButton onClick={() => handleRemoveChecklistItem(index)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              ))}
              {/* Input for adding new checklist item */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  size="small"
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ListIcon sx={{ mr: 1 }} />
              <Typography
                variant="subtitle1"
                sx={{ fontSize: "13px", fontWeight: "600" }}
              >
                Subtask
              </Typography>
            </Box>
            {/* <Button startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => handleOpenSubtaskModal({})}>
              New subtask
            </Button> */}
            <SubtaskList
              workspaceId={workspaceId}
              projectId={projectId}
              taskId={taskId}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!isSaveButtonEnabled}
              sx={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                mt: 2,
              }}
            >
              Save Changes
            </Button>
          </Box>

          <Divider orientation="vertical" variant="middle" flexItem />
          {/* Right Column - Sticky */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              flex: "4",
              alignSelf: "flex-start",
              minWidth: "200px",
              maxWidth: "550px",
              bgcolor: "background.paper",
              pl: 2,
              //borderLeft: '1px solid #ddd',
            }}
          >
            {/* Comments */}
            <CommentSection
              workspaceId={workspaceId}
              projectId={projectId}
              taskId={taskId}
            />
          </Box>
        </LocalizationProvider>
      </DialogContent>

      {openSubtaskModal && selectedSubtask && (
        <Subtask
          open={openSubtaskModal}
          onClose={handleCloseSubtaskModal}
          taskId={task._id}
          projectId={projectId}
          workspaceId={workspaceId}
          // subtaskId={selectedSubtask._id}
          // subtask={selectedSubtask}
          // onSubtaskChange={handleSubtaskChange}
        />
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
    </Dialog>
  );
};

export default AddTaskModal;
