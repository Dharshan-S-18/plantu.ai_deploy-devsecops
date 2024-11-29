// kanbanTask.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, TextField, Avatar, Paper, Tooltip, Chip, IconButton, CircularProgress, Modal } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ChecklistIcon from "@mui/icons-material/Checklist"; // Import Add icon
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import { generateTaskNumber } from '../../lib/generateTaskNumber';
import AddTask from '../post/addTask'; // Assuming AddTaskModal is now AddTask

const columns = [
  { id: 'To Do', label: 'To Do', color: '#1976D2' },
  { id: 'In Progress', label: 'In Progress', color: '#FF9800' },
  { id: 'Blocked', label: 'Blocked', color: '#ff0000' },
  { id: 'Completed', label: 'Completed', color: '#009933' },
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

const TaskCard = styled(Paper)(({ theme }) => ({
  width: "100%", // Adjusted width as per previous step
  padding: "12px",
  marginBottom: "8px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.2)",
  position: "relative",
  height: "auto",  // This will allow the height to adjust based on content
  minHeight: "100px",  // Minimum height if the content is small
  transition: "border 0.3s ease, box-shadow 0.3s ease", // Smooth transition

  // Add hover effect
  "&:hover": {
    border: "1px solid teal", // Change border on hover
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)", // Add a bit more shadow
  },
}));

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
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const ColumnHeader = styled(Box)(({ color }) => ({
  width: '100%',
  backgroundColor: color,
  padding: '8px 0',
  textAlign: 'center',
  color: '#fff',
  fontWeight: 'bold',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  position: 'relative',
  borderBottom: `4px solid ${color}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingRight: '8px',
  paddingLeft: '10px',
}));

const KanbanView = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [newTasks, setNewTasks] = useState({
    'To Do': '',
    'In Progress': '',
    'Blocked': '',
    'Completed': '',
  });
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTaskName, setEditedTaskName] = useState('');
  const [selectedTask, setSelectedTask] = useState(null); // Selected task for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [clickTimer, setClickTimer] = useState(null);
  const [showAddTaskField, setShowAddTaskField] = useState({
    'To Do': false,
    'In Progress': false,
    'Blocked': false,
    'Completed': false,
  });
  const [loading, setLoading] = useState(false); // State to manage loading
  const router = useRouter();
  const taskId = router.query.taskId || null;

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/project/${projectId}/task`);
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleCreateTask = async (status) => {
    const taskName = newTasks[status];
    if (taskName.trim() === '') return;

    const taskNumber = generateTaskNumber(tasks);

    try {
      const response = await fetch(`/api/project/${projectId}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: taskName, status, projectId, taskNumber }),
      });

      if (!response.ok) throw new Error('Failed to create task');

      await fetchTasks(); // Refresh tasks after creation
      setNewTasks({ ...newTasks, [status]: '' });
      setShowAddTaskField({ ...showAddTaskField, [status]: false });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleChange = (e, status) => {
    setNewTasks({ ...newTasks, [status]: e.target.value });
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination || source.droppableId === destination.droppableId) return;

    const task = tasks.find((task) => task._id === result.draggableId);
    if (!task) return;

    const updatedTask = { ...task, status: destination.droppableId };

    try {
      const response = await fetch(`/api/project/${projectId}/task/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) throw new Error('Failed to update task status');

      await fetchTasks(); // Refresh tasks after status change
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Single-click to open modal for editing
  const handleSingleClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);

    // Update the URL with task ID without reloading the page
    router.push({
      pathname: router.pathname,
      query: { ...router.query, taskId: task._id },
    }, undefined, { shallow: true }); // `shallow: true` to prevent page reload
  };

  // Handle closing modal and remove taskId from the URL
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);

    // Remove the task ID from the URL when the modal is closed
    const { taskId, ...restQuery } = router.query; // Destructure to remove taskId
    router.push({
      pathname: router.pathname,
      query: { ...restQuery },
    }, undefined, { shallow: true });
  };

  const handleDoubleClick = (task) => {
    setEditTaskId(task._id);
    setEditedTaskName(task.name);
  };

  const handleSaveTask = async (taskId) => {
    const updatedTask = tasks.find((task) => task._id === taskId);
    if (!updatedTask) return;

    updatedTask.name = editedTaskName;

    await fetch(`/api/project/${projectId}/task/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
    setEditTaskId(null);
    setEditedTaskName('');
  };

  const handleBlur = (taskId) => {
    if (editTaskId === taskId) handleSaveTask(taskId);
  };

  const handleToggleAddTaskField = (status) => {
    setShowAddTaskField({ ...showAddTaskField, [status]: !showAddTaskField[status] });
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <Column ref={provided.innerRef} {...provided.droppableProps}>
                  <ColumnHeader color={column.color}>
                    {column.label}
                    <IconButton
                      onClick={() => handleToggleAddTaskField(column.id)}
                      sx={{ color: '#fff' }}
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                  </ColumnHeader>
                  {showAddTaskField[column.id] && (
                    <TextField
                      label="Add Task"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={newTasks[column.id]}
                      onChange={(e) => handleChange(e, column.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(column.id)}
                      sx={{ mt: 1 }}
                    />
                  )}
                  <Box sx={{ mt: 2 }}>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      tasks
                        .filter((task) => task.status === column.id)
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
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
                                  {editTaskId === task._id ? (
                                    <TextField
                                      value={editedTaskName}
                                      onChange={(e) => setEditedTaskName(e.target.value)}
                                      size="small"
                                      onBlur={() => handleBlur(task._id)}
                                      autoFocus
                                    />
                                  ) : (
                                    <Typography variant="subtitle2" sx={{ display: 'block' }}>
                                      {task.name}
                                    </Typography>
                                  )}
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
                                       {task.assigneePrimary
      ? (String(task.assigneePrimary).split(' ')[0][0]) // Convert to string, then take first letter of the first word
      : "U"} {/* If unassigned, show 'U' */}
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
                        ))
                    )}
                    {provided.placeholder}
                    {tasks.filter((task) => task.status === column.id).length === 0 && (
                      <Typography variant="body2" align="center" sx={{ color: '#757575' }}>
                        Nothing here yet.
                      </Typography>
                    )}
                  </Box>
                </Column>
              )}
            </Droppable>
          ))}
        </Box>
      </DragDropContext>

      {/* AddTask Modal */}
      <Modal open={Boolean(taskId)} onClose={() => setIsModalOpen(false)}>

        <AddTask
          projectId={projectId}
          task={selectedTask} // Pass selected task or null for new task
          onClose={handleCloseModal}
        />

      </Modal>
    </>
  );
};

export default KanbanView;
