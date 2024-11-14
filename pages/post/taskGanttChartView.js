import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from "next/router";
import { IconButton, Box, Typography, Snackbar, Alert, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddTaskModal from './addTask'; // Import the AddTaskModal component
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { generateTaskNumber } from '../../lib/generateTaskNumber'; // Import the utility function

// Dynamically import 'dhtmlx-gantt' only on the client-side
const GanttChart = dynamic(
  () => import('dhtmlx-gantt').then((module) => module),
  { ssr: false }
);

const GanttChartView = ({ workspaceId, projectId }) => {
  const ganttContainer = useRef(null);
  const isInitialized = useRef(false); // To ensure single initialization
  const taskCreationRef = useRef(null); // Ref to track ongoing task creation
  const [openTaskModal, setOpenTaskModal] = useState(false); // State to control modal visibility
  const [selectedTask, setSelectedTask] = useState(null); // State to store the selected task
  const [tasks, setTasks] = useState([]); // State to keep track of tasks
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const router = useRouter();
  const taskId = router.query.taskId || null; // Extract taskId from the URL
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initializeGantt = async () => {
    if (typeof window !== 'undefined' && !isInitialized.current) {
      const gantt = (await import('dhtmlx-gantt')).default;

      // Configure the columns
      gantt.config.columns = [
        { name: "text", label: "Task name", width: "*", tree: true },
        { name: "start_date", label: "Start time", align: "center" },
        { name: "duration", label: "Duration", align: "center" },
        { name: "add", label: "", width: 44 } // Default add button width in header
      ];

      gantt.init(ganttContainer.current);

      // Apply CSS to hide the 'Plus' icon in the task rows, but not in the header
      const style = document.createElement('style');
      style.innerHTML = `
      /* Hide the 'Plus' icon in task rows */
      .gantt_row .gantt_add {
        display: none !important;
      }
      /* Keep the 'Plus' icon visible in the header */
      .gantt_grid_head_cell .gantt_add {
        display: inline-block !important;
      }
    `;
      document.head.appendChild(style);



      fetchTasks();

      // Attach event handlers only once
      gantt.attachEvent('onAfterTaskAdd', (id, task) => {
        if (taskCreationRef.current) return;

        taskCreationRef.current = true; // Mark task creation as in progress

        // Generate the task number on the frontend
        const taskNumber = generateTaskNumber(tasks);

        const newTask = {
          name: task.text,
          startDate: task.start_date,
          dueDate: task.end_date,
          status: 'To Do', // Default status for new tasks
          projectId,
          taskNumber, // Include the generated task number
        };

        fetch(`/api/project/${projectId}/task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data && data.task && data.task._id) {
              gantt.changeTaskId(id, data.task._id);
              gantt.message({ text: 'New task created!', type: 'success' });
              setTasks((prevTasks) => [...prevTasks, data.task]); // Update state with new task
            } else {
              console.error('Invalid task creation response:', data);
            }
          })
          .catch((error) => console.error('Failed to create new task:', error))
          .finally(() => {
            taskCreationRef.current = false; // Reset task creation status
          });
      });

      gantt.attachEvent('onAfterTaskUpdate', (id, task) => {
        const updatedTask = {
          name: task.text,
          startDate: task.start_date,
          dueDate: task.end_date,
          status: task.status || 'To Do', // Include status in task update
        };

        fetch(`/api/project/${projectId}/task/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        })
          .then(() => {
            gantt.message({ text: 'Task updated!', type: 'success' });
          })
          .catch((error) => console.error('Error updating task:', error));
      });

      // Attach click event handler to tasks
      gantt.attachEvent('onTaskClick', (id) => {
        const task = gantt.getTask(id); // Get the clicked task
        console.log(task);
        setSelectedTask({
          _id: task.id, // Correctly set the task ID with underscore to match MongoDB format
          name: task.text,
          description: task.description,
          assigneePrimary: task.assigneePrimary,
          startDate: task.start_date,
          dueDate: task.end_date,
          status: task.status,
          projectId: task.project, // Include project ID
          taskNumber: task.taskNumber, // Include task number
          checklist: task.checklist,
          comments: task.comments,
          allocatedEffort: task.allocatedEffort,
          actualEffort: task.actualEffort,
          priority: task.priority,
          dependencies: task.dependencies,
        }); // Set the selected task to state
        // Update URL with the task ID
        router.push(
          {
            pathname: router.pathname,
            query: { ...router.query, taskId: id }, // Add taskId to the query params
          },
          undefined,
          { shallow: true } // Use shallow routing to avoid a full page reload
        );
        setIsModalOpen(true); // Open the AddTaskModal
        // router.push(
        //   `/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit?tab=Gantt&taskId=${id}`
        // );
        return true; // Allow the default click behavior
      });

      isInitialized.current = true; // Mark initialization complete
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/project/${projectId}/task`);
      const data = await response.json();
      console.log(data);

      const tasks = data.tasks.map((task) => ({
        id: task._id,
        text: task.name || 'Unnamed Task',
        start_date: task.startDate ? new Date(task.startDate) : new Date(),
        end_date: task.dueDate ? new Date(task.dueDate) : new Date(),
        progress: task.progress || 0,
        status: task.status || 'To Do', // Include status in task object
        project: projectId,
        taskNumber: task.taskNumber, // Include task number for display
        description: task.description,
        assigneePrimary: task.assigneePrimary,
        checklist: task.checklist,
        comments: task.comments,
        allocatedEffort: task.allocatedEffort,
        actualEffort: task.actualEffort,
        priority: task.priority,
        dependencies: task.dependencies,
      }));
      console.log(tasks);

      setTasks(data.tasks); // Update state with fetched tasks
      gantt.clearAll();
      gantt.parse({ data: tasks });
    } catch (error) {
      console.error('Failed to fetch tasks for Gantt chart:', error);
    }
  };

  useEffect(() => {
    initializeGantt();
  }, [projectId]);

  const handleAddTask = () => {
    // Add logic for adding a new task
    const newTask = {
      text: 'New Task',
      start_date: new Date(),
      end_date: new Date(),
      status: 'To Do',
      projectId,
    };

    fetch(`/api/project/${projectId}/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.task && data.task._id) {
          gantt.message({ text: 'New task created!', type: 'success' });
        } else {
          console.error('Invalid task creation response:', data);
        }
      })
      .catch((error) => console.error('Failed to create new task:', error));
  };

  const handleCloseTaskModal = () => {
    setOpenTaskModal(false); // Close the modal
    // Remove taskId from the URL when closing the modal
    const { taskId, ...restQuery } = router.query;
    router.push(
      {
        pathname: router.pathname,
        query: restQuery,
      },
      undefined,
      { shallow: true } // Shallow routing to avoid a page reload
    );
    setSelectedTask(null); // Clear the selected task
  };

  // Callback to trigger alerts
  const handleTaskChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchTasks(); // Refresh table after changes
  };

  // Close the alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <>
      {/* Gantt Chart Container */}
      <div ref={ganttContainer} style={{ width: '100%', height: '400px' }} />

      {/* AddTaskModal for Editing Task */}
      {openTaskModal && (
        <Modal open={openTaskModal} onClose={handleCloseTaskModal}>
          <AddTaskModal
            projectId={projectId}
            task={selectedTask}
            onClose={handleCloseTaskModal}
          />
        </Modal>
      )}
      <Modal open={Boolean(taskId)} onClose={() => setIsModalOpen(false)}>
        <AddTaskModal
          projectId={projectId}
          task={selectedTask} // Pass the full task object only if it exists
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
      {/* Snackbar for alerts */}
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleAlertClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert variant="filled" onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>

    </>
  );
};

export default GanttChartView;
