// components/CalendarTab.js
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useRouter } from 'next/router';
import { Snackbar, Alert } from '@mui/material'; // Import Snackbar and Alert components
import { generateTaskNumber } from '../../../lib/generateTaskNumber';
import AddTaskModal from './addTask'; // Import the AddTaskModal component

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarTab = ({ workspaceId, projectId }) => {
  const [events, setEvents] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null); // State to hold the selected task
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal visibility
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' }); // Snackbar state for alerts
  const router = useRouter();

  // Fetch tasks from backend on component mount
  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task`);
      if (response.ok) {
        const data = await response.json();
        const calendarEvents = data.tasks.map((task) => ({
          ...task, // Include all task properties, including ID
          id: task._id, // Use the correct property name for the task ID
          title: task.name,
          start: new Date(task.startDate),
          end: new Date(task.dueDate),
        }));
        setEvents(calendarEvents);
      } else {
        console.error('Failed to fetch tasks:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleTaskCreate = async (newTask) => {
    try {
      const response = await fetch(`/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        const savedTask = await response.json(); // Get the saved task from the response
        setEvents((prevEvents) => [
          ...prevEvents,
          {
            ...savedTask,
            id: savedTask._id, // Ensure the ID is correctly set
            title: savedTask.name,
            start: new Date(savedTask.startDate),
            end: new Date(savedTask.dueDate),
          },
        ]);
        fetchTasks();
        // Show success alert
        setAlert({ open: true, message: 'Task created successfully', severity: 'success' });
      } else {
        console.error('Failed to create task:', response.statusText);
        setAlert({ open: true, message: 'Failed to create task', severity: 'error' });
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setAlert({ open: true, message: 'Error creating task', severity: 'error' });
    }
  };

  const handleSelectSlot = (slotInfo) => {
    const title = prompt('Enter Task Name:');
    if (title) {
      const taskNumber = generateTaskNumber();
      const newTask = {
        name: title,
        startDate: slotInfo.start,
        dueDate: slotInfo.end,
        progress: 0,
        status: 'To Do', // Default status for new tasks
        taskNumber: taskNumber,
      };
      handleTaskCreate(newTask); // Create the new task and update the calendar
    }
  };

  const handleSelectEvent = (task) => {
    setSelectedTask(task); // Set the selected task details
    setModalOpen(true); // Open the modal
    router.push(
      `/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit?tab=Calendar&taskId=${task.id}`
    );
  };

  const handleTaskChange = (message, severity) => {
    setAlert({ open: true, message, severity });
    fetchTasks(); // Refresh table after changes
  };

  // Close the alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent} // Open modal when a task is clicked
        style={{ height: 500 }}
      />
      {/* AddTaskModal to show task details */}
      {router.query.taskId ? (
        <AddTaskModal
        open={true}
          onClose={() => {
            setModalOpen(false);
            router.push(
              `/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit?tab=Calendar`
            );
          }}
          workspaceId={workspaceId}
          taskId={router.query.taskId}
          projectId={projectId}
          onTaskChange={handleTaskChange} // Pass handleTaskChange as a prop
        />
      ) : (
        <AddTaskModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          workspaceId={workspaceId}
          task={selectedTask}
          projectId={projectId}
          onTaskChange={handleTaskChange} // Pass handleTaskChange as a prop
        />
      )}

      {/* Snackbar for alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert variant="filled" onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CalendarTab;
