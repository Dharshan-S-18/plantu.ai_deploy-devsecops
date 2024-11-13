import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  TextField,
  Avatar,
  Paper,
  Tooltip,
  Chip,
  IconButton,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { styled } from "@mui/system";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChecklistIcon from "@mui/icons-material/Checklist"; // Import Add icon
import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from "@mui/icons-material/FilterList";
import { generateTaskNumber } from "../../../lib/generateTaskNumber";
import axios from "axios";
import AddTaskModal from "./addTask";
import EditStatusModal from "./editStatus";
import DynamicFilter from "./dynamicFilter"; // Import dynamic filter component

const columns = [
  { id: "To Do", label: "To Do", color: "#1976D2" },
  { id: "In Progress", label: "In Progress", color: "#FF9800" },
  { id: "Blocked", label: "Blocked", color: "#ff0000" },
  { id: "Completed", label: "Completed", color: "#009933" },
];

const Column = styled(Box)({
  width: "100%",
  padding: "8px", // Adjust padding to reduce spacing around each column
  borderRadius: "8px",
  backgroundColor: "#f5f5f5",
  marginRight: "16px",
  minWidth: "250px",
  minHeight: "300px",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  maxHeight: "calc(100vh - 100px)",
  overflowY: "auto",
});

const TaskCard = styled(Paper)({
  width: "100%", // Adjusted width as per previous step
  padding: "12px",
  marginBottom: "8px",
  //borderLeft: "4px solid teal",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
  position: "relative",
  height: "100px",
  transition: "border 0.3s ease, box-shadow 0.3s ease", // Smooth transition

  // Add hover effect
  "&:hover": {
    border: "1px solid teal", // Change border on hover
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)", // Add a bit more shadow
  },
});

const TaskCardHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const TaskCardFooter = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "auto", // Align footer at the bottom
});

const TaskSubtaskCount = styled(Box)({
  position: "absolute",
  bottom: "8px",
  right: "8px",
  fontSize: "12px",
  color: "#757575",
  display: "flex",
  alignItems: "center",
});

const BadgeWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "4px",
});

const ColumnHeader = styled(Box)(({ color }) => ({
  width: "100%",
  backgroundColor: color,
  padding: "8px 0",
  textAlign: "center",
  color: "#fff",
  fontWeight: "bold",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
  position: "relative",
  borderBottom: `4px solid ${color}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingRight: "50px",
  paddingLeft: "10px",
  position: "sticky", // Make the header sticky
  top: 0, // Stick to the top of the column
  zIndex: 1, // Ensure it stays above other content
}));

const ColumnTitle = styled(Box)({
  //width: "15ch",
  flexGrow: 1,
});

const KanbanView = ({ workspaceId, projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]); // State for filtered tasks
  const [newTasks, setNewTasks] = useState({
    "To Do": "",
    "In Progress": "",
    Blocked: "",
    Completed: "",
  });
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState("");
  const [agents, setAgents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [clickTimer, setClickTimer] = useState(null);
  const [showAddTaskField, setShowAddTaskField] = useState({
    "To Do": false,
    "In Progress": false,
    Blocked: false,
    Completed: false,
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State to manage loading state
  const [newStatus, setNewStatus] = useState("");
  const [statusList, setStatusList] = useState([]);
  const [showEditStatus, setShowEditStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [anchorEl, setAnchorEl] = useState(null); // For menu anchor
  const [activeFilterCount, setActiveFilterCount] = useState(0); // For active filter count
  const [appliedFilters, setAppliedFilters] = useState([]); // For applied filters
  const [anchorElColumn, setAnchorElColumn] = useState(null);
  const [selectedColumnId, setSelectedColumnId] = useState(null);

  // Function to fetch tasks
  const fetchTasks = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task`
      );
      const data = await response.json();
      setTasks(data.tasks);
      setFilteredTasks(data.tasks); // Initialize filteredTasks with all tasks
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  // Function to fetch status list
  const fetchStatusList = async () => {
    try {
      const response = await axios.get(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/statusList`
      );
      setStatusList(response.data.statusList);
    } catch (error) {
      console.error("Failed to fetch status list:", error);
    }
  };

  // Fetch tasks and status list when the component mounts or when the projectId changes
  useEffect(() => {
    fetchTasks();
    fetchStatusList();
  }, [projectId]);

  // Callback to trigger alerts
  const handleStatusChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchStatusList(); // Refresh table after changes
  };

  const handleColumnMenuClick = (event, columnId) => {
    setAnchorElColumn(event.currentTarget); // Set anchor element for menu
    setSelectedColumnId(columnId); // Store the column ID for which the menu is opened
  };

  const handleColumnMenuClose = () => {
    setAnchorElColumn(null); // Close the menu
    setSelectedColumnId(null); // Reset the selected column
  };

  const handleCreateTask = async (status) => {
    const taskName = newTasks[status];
    if (taskName.trim() === "") return;

    const taskNumber = generateTaskNumber(tasks);

    try {
      // Create a new task
      const response = await fetch(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: taskName,
            status,
            projectId,
            taskNumber,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      // Refresh the task list after creation
      await fetchTasks();

      setNewTasks({ ...newTasks, [status]: "" });
      setShowAddTaskField({ ...showAddTaskField, [status]: false });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleChange = (e, status) => {
    setNewTasks({ ...newTasks, [status]: e.target.value });
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return; // If dropped outside a droppable area
    if (source.droppableId === destination.droppableId) return; // If dropped in the same column

    const task = tasks.find((task) => task._id === result.draggableId);

    if (!task) {
      console.error("Task not found");
      return;
    }

    // Update the task's status
    const updatedTask = { ...task, status: destination.droppableId };

    try {
      const response = await fetch(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${task._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTask),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      // Refresh the task list after moving a task
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleSingleClick = (task) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
    }

    const timer = setTimeout(() => {
      setSelectedTask(task);
      router.push(
        `/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit?taskId=${task._id}`
      );
      setOpenTaskModal(true);
    }, 200);
    setClickTimer(timer);
  };

  const handleDoubleClick = (task) => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
    }
    setEditTaskId(task._id);
    setEditedTaskName(task.name);
  };

  const handleSaveTask = async (taskId) => {
    const updatedTask = tasks.find((task) => task._id === taskId);

    if (!updatedTask) {
      console.error("Task not found");
      return;
    }

    updatedTask.name = editedTaskName;

    await fetch(
      `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      }
    );

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
    setEditTaskId(null);
    setEditedTaskName("");
  };

  const handleBlur = (taskId) => {
    if (editTaskId === taskId) {
      handleSaveTask(taskId);
    }
  };

  const handleToggleAddTaskField = (status) => {
    setShowAddTaskField({
      ...showAddTaskField,
      [status]: !showAddTaskField[status],
    });
  };

  const handleToggleEditStatus = (status) => {
    setShowEditStatus(true);
    setSelectedStatus(statusList.find((t) => t.value === status));
  };

  const handleProjectAddStatus = async () => {
    const newStatusData = {
      title: newStatus,
      value: newStatus,
      color: "#111",
    };
    if (statusList.find((item) => item.value === newStatusData.value)) {
      alert("Status already present");
      setNewStatus("");
    } else {
      try {
        const response = await axios.post(
          `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/statusList`,
          newStatusData
        );
        if (response.status === 200) {
          setStatusList((prevStatusList) => [
            ...prevStatusList,
            newStatusData,
          ]);
          setNewStatus("");
        } else {
          console.error("Failed to add new status:", response.data.error);
        }
      } catch (error) {
        console.error("Error adding status:", error);
      }
    }
  };

  // Handle task change from the modal
  const handleTaskChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchTasks(); // Refresh table after changes
  };

  // Handle alert close
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  // Open filter menu
  const handleChipClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close filter menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Apply dynamic filter logic
  const applyDynamicFilters = (filterConditions, count) => {
    let filtered = tasks;
    setActiveFilterCount(count); // Update the count state
    setAppliedFilters(filterConditions); // Update the current filters

    // Process each filter condition
    filterConditions.forEach((filter) => {
      if (filter.field && filter.operator && filter.value) {
        switch (filter.operator) {
          case "is":
            filtered = filtered.filter((task) => task[filter.field] === filter.value);
            break;
          case "isNot":
            filtered = filtered.filter((task) => task[filter.field] !== filter.value);
            break;
          case "contains":
            filtered = filtered.filter((task) =>
              task[filter.field]?.toLowerCase().includes(filter.value.toLowerCase())
            );
            break;
          case "doesNotContain":
            filtered = filtered.filter(
              (task) =>
                !task[filter.field]?.toLowerCase().includes(filter.value.toLowerCase())
            );
            break;
          default:
            break;
        }
      }
    });

    setFilteredTasks(filtered);
    handleMenuClose(); // Close the menu after applying filters
  };

  // Get filtered tasks by status
  const getFilteredTasksByStatus = (status) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 3,
        }}
      >
        {/* Filter Chip */}
        <Chip
          icon={<FilterListIcon />}
          label={`Filter ${activeFilterCount > 0 ? `(${activeFilterCount})` : ""}`} // Show count
          onClick={handleChipClick}
          sx={{
            cursor: "pointer",
            backgroundColor: activeFilterCount > 0 ? "#1976D2" : "default", // Change color based on active filters
            color: activeFilterCount > 0 ? "#fff" : "default",
          }}
        />
        {/* Filter Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <DynamicFilter onApply={applyDynamicFilters} initialFilters={appliedFilters} /> {/* Pass current filters */}
        </Menu>
      </Box>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          {statusList.map((column) => (
            <Droppable key={column.value} droppableId={column.value}>
              {(provided) => (
                <Column ref={provided.innerRef} {...provided.droppableProps}>
                  <ColumnHeader color={column.color}>
                    <ColumnTitle>{column.title}</ColumnTitle>

                    {/* <IconButton
                    onClick={() => handleToggleAddTaskField(column.value)}
                    sx={{ color: "#fff" }}
                    size="small"
                  >
                    <AddIcon />
                  </IconButton> */}

                    {/* Three dots menu button in Column Header */}
                    <IconButton
                      onClick={(event) => handleColumnMenuClick(event, column.value)}
                      sx={{ color: "#fff", mr: -5 }} // White color for the icon
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>

                    {/* Menu for the ColumnHeader */}
                    <Menu
                      anchorEl={anchorElColumn}
                      open={Boolean(anchorElColumn && selectedColumnId === column.value)}
                      onClose={handleColumnMenuClose}
                    >
                      <MenuItem
                        onClick={() => {
                          handleToggleEditStatus(column.value); // Edit column action
                          handleColumnMenuClose();
                        }}
                      >
                        <EditIcon fontSize="small" />
                        Edit Status
                      </MenuItem>
                      {/* You can add more options here, like "Delete Column" */}
                    </Menu>


                  </ColumnHeader>
                  {/* {showAddTaskField[column.value] && ( */}
                  <TextField
                    label="Add Task"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={newTasks[column.value]}
                    onChange={(e) => handleChange(e, column.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreateTask(column.value)
                    }
                    sx={{ mt: 1 }}
                  />
                  {/* )} */}
                  <Box sx={{ mt: 2 }}>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      getFilteredTasksByStatus(column.value).map(
                        (task, index) => (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                          >
                            {(provided) => (
                              <TaskCard
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleSingleClick(task)}
                              onDoubleClick={() => handleDoubleClick(task)}
                            >
                              {/* Task Header with Task Name */}
                              <TaskCardHeader>
                                <Typography variant="body1" fontWeight="bold">
                                  {editTaskId === task._id ? (
                                    <TextField
                                      value={editedTaskName}
                                      onChange={(e) => setEditedTaskName(e.target.value)}
                                      size="small"
                                      onBlur={() => handleBlur(task._id)}
                                      autoFocus
                                    />
                                  ) : (
                                    task.name
                                  )}
                                </Typography>
                              </TaskCardHeader>
                            
                              {/* Task Footer with Assignee, Due Date, and Subtask Count */}
                              <TaskCardFooter>
                                <BadgeWrapper>
                                  <Tooltip title={task.assigneePrimary || "Unassigned"} arrow>
                                    <Avatar
                                      sx={{
                                        width: 24,
                                        height: 24,
                                        bgcolor: "#ff5722",
                                      }}
                                    >
                                      {task.assigneePrimary ? task.assigneePrimary[0] : "U"}
                                    </Avatar>
                                  </Tooltip>
                                  <Typography variant="body2" color="textSecondary" ml={0}>
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Due Date"}
                                  </Typography>
                                </BadgeWrapper>
                            
                                {/* Subtask Count Display with Icon */}
                                <TaskSubtaskCount>
                                  <ChecklistIcon fontSize="small" sx={{ mb: 0.5, color: "#757575" }} />
                                  <Typography variant="caption">
                                    {task.subtasks.length} Subtasks
                                  </Typography>
                                </TaskSubtaskCount>
                              </TaskCardFooter>
                            </TaskCard>
                            )}
                          </Draggable>
                        )
                      )
                    )}
                    {provided.placeholder}
                    {getFilteredTasksByStatus(column.value).length === 0 && (
                      <Typography
                        variant="body2"
                        align="center"
                        sx={{ color: "#757575" }}
                      >
                        Nothing here yet.
                      </Typography>
                    )}
                  </Box>
                </Column>
              )}
            </Droppable>
          ))}
          <Box sx={{ width: "200px", flexBasis: "100%" }}>
            <TextField
              id="outlined-basic"
              label="Add status"
              value={newStatus}
              onChange={(event) => setNewStatus(event.target.value)}
              inputProps={{ maxLength: 15 }}
              sx={{ mt: 2, position: "relative", float: "right" }}
            />
            {newStatus ? (
              <Button
                variant="contained"
                sx={{ mt: 1, float: "right" }}
                onClick={handleProjectAddStatus}
              >
                Add Status
              </Button>
            ) : null}
          </Box>
        </Box>
      </DragDropContext>

      {router.query.taskId && (
        <AddTaskModal
          projectId={projectId}
          workspaceId={workspaceId}
          taskId={router.query.taskId}
          onClose={() => {
            setOpenTaskModal(false);
            router.push(
              `/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit`
            );
          }}
          open={true}
          onTaskChange={handleTaskChange}
        />
      )}
      {showEditStatus && (
        <EditStatusModal
          open={showEditStatus}
          onClose={() => setShowEditStatus(false)}
          workspaceId={workspaceId}
          projectId={projectId}
          prevStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Snackbar for alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert variant="filled" onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default KanbanView;
