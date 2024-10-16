import React, { useState, useCallback } from "react";
import {
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { Select, MenuItem, TextField, Button, Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

const GridView = ({ projects, onUpdateProject }) => {
  // Ensuring projects is an array before spreading into state
  const [rows, setRows] = useState([...(projects || [])]); // Fallback to empty array if projects is undefined
  const [nextId, setNextId] = useState(
    (projects && projects.length ? projects.length : 0) + 1
  ); // Adjusting nextId calculation
  const [editRowId, setEditRowId] = useState(null); // Track the ID of the row being edited

  // Handle cell edits
  const handleCellChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row._id === id ? { ...row, [field]: value } : row))
    );
  };

  // Save edited row
  const handleSaveRow = (id) => {
    const updatedRow = rows.find((row) => row._id === id);
    onUpdateProject(updatedRow); // Call the update function
    setEditRowId(null); // Exit editing mode
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditRowId(null); // Exit editing mode without saving
  };

  // Delete a row
  const handleDeleteRow = (id) => {
    const updatedRows = rows.filter((row) => row._id !== id);
    setRows(updatedRows);
  };

  // Add a new row
  const handleAddRow = () => {
    const newRow = {
      id: `new-${nextId}`, // Temporary ID for new rows
      _id: `new-${nextId}`, // Match temporary ID format
      projectName: "",
      description: "",
      startDate: "",
      endDate: "",
      status: "To Do", // Default status
    };
    setRows((prevRows) => [...prevRows, newRow]);
    setNextId((prevId) => prevId + 1); // Increment next ID
    setEditRowId(`new-${nextId}`); // Automatically enable editing mode for the new row
  };

  // Custom toolbar with Add button
  const CustomToolbar = () => (
    <GridToolbarContainer>
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddRow}
        sx={{ marginBottom: 1 }}
      >
        Add Record
      </Button>
    </GridToolbarContainer>
  );

  // Handle double-click event to enable row editing
  const handleRowDoubleClick = (params) => {
    setEditRowId(params.id); // Enable editing mode for the double-clicked row
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1,
      renderCell: (params) =>
        editRowId === params.id ? (
          <TextField
            value={params.row.projectName || ""}
            sx={{
              "& fieldset": { border: "none" },
              "& input": { paddingLeft: "0", paddingRight: "0" },
            }}
            onChange={(e) =>
              handleCellChange(params.id, "projectName", e.target.value)
            }
            fullWidth
          />
        ) : (
          params.value
        ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      renderCell: (params) =>
        editRowId === params.id ? (
          <TextField
            value={params.row.description || ""}
            sx={{
              "& fieldset": { border: "none" },
              "& input": { paddingLeft: "0", paddingRight: "0" },
            }}
            onChange={(e) =>
              handleCellChange(params.id, "description", e.target.value)
            }
            fullWidth
          />
        ) : (
          params.value
        ),
    },
    {
      field: "startDate",
      headerName: "Start Date",
      type: "date",
      flex: 1,
      valueGetter: (params) => (params.value ? new Date(params.value) : null),
      renderCell: (params) =>
        editRowId === params.id ? (
          <TextField
            type="date"
            value={
              params.row.startDate ? params.row.startDate.split("T")[0] : ""
            }
            sx={{
              "& fieldset": { border: "none" },
              "& input": { paddingLeft: "0", paddingRight: "0" },
            }}
            onChange={(e) =>
              handleCellChange(params.id, "startDate", e.target.value)
            }
            fullWidth
          />
        ) : params.row.startDate ? (
          new Date(params.row.startDate.split("T")[0]).toLocaleDateString()
        ) : (
          ""
        ),
    },
    {
      field: "endDate",
      headerName: "Due Date",
      type: "date",
      flex: 1,
      valueGetter: (params) => (params.value ? new Date(params.value) : null),
      renderCell: (params) =>
        editRowId === params.id ? (
          <TextField
            type="date"
            sx={{
              "& fieldset": { border: "none" },
              "& input": { paddingLeft: "0", paddingRight: "0" },
            }}
            value={params.row.endDate ? params.row.endDate.split("T")[0] : ""}
            onChange={(e) =>
              handleCellChange(params.id, "endDate", e.target.value)
            }
            fullWidth
          />
        ) : params.row.endDate ? (
          new Date(params.row.endDate.split("T")[0]).toLocaleDateString()
        ) : (
          ""
        ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) =>
        editRowId === params.id ? (
          <Select
            value={params.row.status || ""}
            onChange={(e) =>
              handleCellChange(params.id, "status", e.target.value)
            }
            fullWidth
            sx={{
              "& fieldset": { border: "none" },
              "& div": { paddingLeft: "0", paddingRight: "0" },
            }}
          >
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        ) : (
          params.value
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      type: "actions",
      getActions: (params) => [
        editRowId === params.id ? (
          <>
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={() => handleSaveRow(params.id)}
            />
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelEdit}
            />
          </>
        ) : (
          <>
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              onClick={() => setEditRowId(params.id)}
            />
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={() => handleDeleteRow(params.id)}
            />
          </>
        ),
      ],
    },
  ];

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={rows.map((project) => ({ id: project._id, ...project }))}
        columns={columns}
        components={{
          Toolbar: CustomToolbar, // Correctly include the custom toolbar
        }}
        pageSize={5}
        disableSelectionOnClick
        onRowDoubleClick={handleRowDoubleClick} // Handle double-click to enable editing
      />
    </Box>
  );
};

export default GridView;
