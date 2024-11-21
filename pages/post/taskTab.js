import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  Box,
  IconButton,
  Typography,
  Alert,
  Snackbar, CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import axios from 'axios';
import AddTask from './addTask'; // Adjust path accordingly
import KanbanView from './taskKanban'; // Adjust path accordingly
import SubtaskModal from './Subtask'; // Import the Subtask component
import GanttChartView from './taskGanttChartView'; // Import the Gantt chart component
import CalendarView from './taskCalendarView';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import TableViewIcon from '@mui/icons-material/ViewList'; // Import your icon for Table View
import KanbanIcon from '@mui/icons-material/ViewKanban'; // Import your icon for Kanban View
import GanttChartIcon from '@mui/icons-material/Timeline'; // Import icon for Gantt chart view
import AddIcon from '@mui/icons-material/Add';
import CalendarIcon from '@mui/icons-material/Event'; // Import icon for Calendar View

const TaskTab = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [view, setView] = useState('table'); // New state for managing current view
  const [expandedTaskIds, setExpandedTaskIds] = useState({});
  const [selectedSubtask, setSelectedSubtask] = useState(null); // New state to manage selected subtask
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false); // New state to control subtask modal
  const [alert, setAlert] = useState({ message: '', type: '', open: false }); // State for alert
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { taskId } = router.query; // Retrieve taskId from URL

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  useEffect(() => {
    // Automatically open the modal if taskId exists in the URL
    if (taskId && tasks.length > 0) {
      const task = tasks.find((t) => t._id === taskId);
      if (task) {
        handleModalOpen(task); // Open the modal with the task
      }
    }
  }, [taskId, tasks]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/project/${projectId}/task`);
      setTasks(response.data.tasks); // Ensure your response data matches this structure
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false); // Stop loading after request completes
    }
  };


  const handleModalOpen = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);

    // Update the URL with the task ID, keeping the current view
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, taskId: task ? task._id : 'new' }, // Use 'new' for adding a new task
      },
      undefined,
      { shallow: true }
    );
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);

    // Remove taskId from the URL when closing the modal
    const { taskId, ...restQuery } = router.query;
    router.push(
      {
        pathname: router.pathname,
        query: restQuery, // Keep other query params, but remove taskId
      },
      undefined,
      { shallow: true }
    );
  };

  const handleExpandClick = (taskId, event) => {
    // Prevent the click event from propagating to the row click
    event.stopPropagation();
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleSubtaskClick = (task, subtask) => {
    setSelectedTask(task); // Ensure the task is set
    setSelectedSubtask(subtask);
    setIsSubtaskModalOpen(true);
  };

  const handleSubtaskModalClose = () => {
    setIsSubtaskModalOpen(false);
    setSelectedSubtask(null);
  };

  // Handle view changes
  const handleChangeView = (newView) => {
    setView(newView);
  };

  // Function to handle task creation
  const handleTaskCreated = (message, type, taskData) => {
    setAlert({ message, type, open: true }); // Set the alert with message and type

    if (type === 'success') {
      fetchTasks(); // Refetch tasks after a successful creation
    }
  };

  // Function to handle task updates
  const handleTaskUpdated = (message, type, updatedTask) => {
    setAlert({ message, type, open: true }); // Set the alert with message and type
    if (type === 'success') {
      fetchTasks(); // Refetch tasks after a successful update
    }
  };

  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <div>
      <Box marginBottom={2}>
        <Button variant="text" startIcon={<AddIcon />} onClick={() => handleModalOpen(null)} style={{ marginRight: 10 }}>
          Add Task
        </Button>
        <Button
          variant="text"
          onClick={() => handleChangeView('table')}
          style={{ marginRight: 10 }}
          startIcon={<TableViewIcon />} // Add icon for Table View
        >
          Show Table View
        </Button>
        <Button
          variant="text"
          color="primary"
          onClick={() => handleChangeView('kanban')}
          startIcon={<KanbanIcon />} // Add icon for Kanban View
        >
          Show Kanban View
        </Button>
        <Button
          variant="text"
          color="secondary"
          onClick={() => handleChangeView('gantt')}
          startIcon={<GanttChartIcon />} // Add icon for Gantt chart View
        >
          Show Gantt Chart
        </Button>
        {/* <Button
          variant="text"
          color="secondary"
          onClick={() => handleChangeView('calendar')}
          startIcon={<CalendarIcon />}
        >
          Show Calendar View
        </Button> */}
      </Box>

      {/* Loading spinner */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" margin={2}>
          <CircularProgress /> {/* Show loading indicator */}
        </Box>
      ) : (
        view === 'kanban' ? (
          <KanbanView tasks={tasks} projectId={projectId} />
        ) : view === 'table' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead style={{ backgroundColor: '#00264d', color: 'white', position: 'sticky', top: 0, zIndex: 1 }}>
                <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  {/* <TableCell>Comments</TableCell> */}
                  <TableCell>Subtasks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <React.Fragment key={task._id}>
                    <TableRow onClick={() => handleModalOpen(task)}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {/* <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={(event) => handleExpandClick(task._id, event)}
                        >
                          {expandedTaskIds[task._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton> */}
                          {task.milestone && (
                            <StarIcon style={{ color: 'gold', marginRight: 8 }} />
                          )}
                          {task.name}
                        </Box>
                      </TableCell>
                      <TableCell>{task.assigneePrimary}</TableCell>
                      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      {/* <TableCell>{task.comments}</TableCell> */}
                      <TableCell>{task.subtasks ? task.subtasks.length : 0}</TableCell>
                    </TableRow>
                    {/* <TableRow>
                    <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
                      <Collapse in={expandedTaskIds[task._id]} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                          {task.subtasks && task.subtasks.length > 0 ? (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Subtask Name</TableCell>
                                  <TableCell>Assignee</TableCell>
                                  <TableCell>Due Date</TableCell>
                                  <TableCell>Priority</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Comments</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {task.subtasks.map((subtask, index) => (
                                  <TableRow key={index} onClick={() => handleSubtaskClick(task, subtask)}>
                                    <TableCell>{subtask.name}</TableCell>
                                    <TableCell>{subtask.assignee}</TableCell>
                                    <TableCell>{subtask.dueDate}</TableCell>
                                    <TableCell>{subtask.priority}</TableCell>
                                    <TableCell>{subtask.status}</TableCell>
                                    <TableCell>{subtask.comments}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <Typography>No subtasks available</Typography>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow> */}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : view === 'gantt' ? (
          <GanttChartView projectId={projectId} task={selectedTask} /> // Render the Gantt chart view
        ) : view === 'calendar' ? (
          <CalendarView projectId={projectId} task={selectedTask} />
        ) : null)}

      <Modal open={isModalOpen} onClose={handleModalClose}>
        <AddTask projectId={projectId} task={selectedTask} onClose={handleModalClose} onTaskCreated={handleTaskCreated} onTaskUpdated={handleTaskUpdated} />
      </Modal>

      <SubtaskModal
        open={isSubtaskModalOpen}
        onClose={handleSubtaskModalClose}
        projectId={projectId}
        taskId={selectedTask?._id} // Pass task ID
        subtask={selectedSubtask} // Pass selected subtask data
      />

      {/* Snackbar Alert for task creation success or error */}
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert variant="filled" onClose={handleAlertClose} severity={alert.type} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

TaskTab.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default TaskTab;
