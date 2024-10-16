import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react'; // Main FullCalendar component
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin for month view
import interactionPlugin from '@fullcalendar/interaction'; // Enables user interaction
import timeGridPlugin from '@fullcalendar/timegrid'; // Plugin for time grid views
import { Box, Typography } from '@mui/material';
import AddTaskModal from './addTask'; // Import your existing modal component

const CalendarView = ({ projectId, tasks }) => {
  const [events, setEvents] = useState([]); // State for calendar events
  const [selectedTask, setSelectedTask] = useState(null); // Task selected for editing
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  useEffect(() => {
    // Format tasks into events for the calendar
    const formattedEvents = tasks.map((task) => ({
      id: task._id,
      title: task.name || 'Unnamed Task',
      start: task.startDate,
      end: task.dueDate,
    }));
    setEvents(formattedEvents);
  }, [tasks]); // Re-run whenever tasks change

  const handleDateClick = (arg) => {
    // Open modal to create a new task
    setSelectedTask(null); // No task selected for creation
    setIsModalOpen(true); // Open the modal
  };

  const handleEventClick = (clickInfo) => {
    // Open modal to edit selected task
    const task = events.find((event) => event.id === clickInfo.event.id);
    setSelectedTask(task); // Set the selected task
    setIsModalOpen(true); // Open the modal
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedTask(null); // Clear selected task state
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Calendar View
      </Typography>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
      />

      {/* Integrate Existing Modal Component */}
      {isModalOpen && (
        <AddTaskModal
          open={isModalOpen}
          onClose={handleModalClose}
          projectId={projectId}
          task={selectedTask} // Pass selected task (if any)
        />
      )}
    </Box>
  );
};

export default CalendarView;
