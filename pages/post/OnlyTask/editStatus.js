import React, { useState } from "react"; 
import CloseIcon from "@mui/icons-material/Close";
import { SketchPicker } from "react-color";
import {
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Button,
  Paper,
} from "@mui/material";
import axios from "axios";

const EditStatusModal = ({
  workspaceId,
  projectId,
  prevStatus,
  open,
  onClose,
  onStatusChange,
}) => {
  const [statusTitle, setStatusTitle] = useState(prevStatus?.title || '');
  const [statusColor, setStatusColor] = useState(prevStatus?.color || '');
  const [openPicker, setOpenPicker] = useState(false);

  // Function to handle status update
  const handleSubmit = async () => {
    const newStatusData = {
      prevValue: prevStatus?.value || '',
      value: statusTitle,
      title: statusTitle,
      color: statusColor,
    };

    try {
      // 1. Update the status in the status list
      const response = await axios.put(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/statusList`,
        newStatusData
      );

      if (response.status === 200) {
        onStatusChange('Status updated successfully', 'success');

        // 2. Update only the tasks with the previous status (e.g., "To Do")
        await updateAssociatedTaskStatuses(prevStatus.value, statusTitle);

        setStatusColor("");
        setStatusTitle("");
      } else {
        console.error("Failed to update status:", response.data.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
    onClose();
  };

  // Function to update only the tasks associated with the previous status
  const updateAssociatedTaskStatuses = async (prevStatus, newStatus) => {
    try {
      // Fetch tasks that are currently associated with the previous status (e.g., "To Do")
      const taskResponse = await axios.get(
        `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task?status=${prevStatus}`
      );

      const tasksToUpdate = taskResponse.data.tasks.filter(task => task.status === prevStatus); // Only get tasks with current status matching the previous status

      // Only update tasks that are currently in the previous status (e.g., "To Do")
      const updatePromises = tasksToUpdate.map((task) =>
        axios.put(
          `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${task._id}`,
          { ...task, status: newStatus } // Update only the status
        )
      );

      await Promise.all(updatePromises); // Wait for all tasks to be updated
      //alert(`All tasks with the status "${prevStatus}" have been updated to "${newStatus}".`);
    } catch (error) {
      console.error("Error updating task statuses:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle
        sx={{
          bgcolor: "#00264d",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">Edit Status</Typography>
        <IconButton onClick={onClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Status Title */}
        <Typography variant="subtitle1">Status Name</Typography>
        <TextField
          value={statusTitle}
          inputProps={{ maxLength: 15 }}
          placeholder="Add status (max 15 chars)"
          onChange={(event) => {
            setStatusTitle(event.target.value);
          }}
        />

        {/* Status Color */}
        <Typography variant="subtitle1">Status Color</Typography>
        <Box
          sx={{
            width: "100px",
            height: "50px",
            borderRadius: 1,
            bgcolor: statusColor,
            cursor: "pointer",
          }}
          onClick={() => setOpenPicker(true)}
        />
        {openPicker && (
          <Paper
            sx={{
              position: "fixed",
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
              }}
              onClick={() => setOpenPicker(false)}
            />
            <SketchPicker
              color={statusColor}
              onChangeComplete={(color) => {
                setStatusColor(color.hex);
              }}
            />
          </Paper>
        )}
      </DialogContent>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Box>
    </Dialog>
  );
};

export default EditStatusModal;
