// Inside projectList.js

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import {
  Tooltip,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Snackbar,
  Alert, // Import Alert for notifications
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import dynamic from 'next/dynamic';
import Layout from '../../../../../components/Layout';
import styles from '../../../../../styles/Home.module.css';
import AddIcon from '@mui/icons-material/Add';
import WorkspaceForm from '../../workspaceCreate'; // Import the WorkspaceForm component
import Dashboard from './workspaceDashboard';

// Import the NewProject component
const NewProject = dynamic(() => import('../../../OnlyTask/createProject'), { ssr: false });

const ProjectTable = () => {
  const [projects, setProjects] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [workspaceName, setWorkspaceName] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState(null); // Store workspace details for passing to the form
  const [isWorkspaceFormOpen, setWorkspaceFormOpen] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '', open: false }); // Alert state for notifications
  const router = useRouter();
  const [page, setPage] = useState(0); // State for the current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // State for rows per page
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { id: workspaceId } = router.query;

  useEffect(() => {
    if (workspaceId) {
      fetchProjects();
      fetchWorkspace();
    }
  }, [workspaceId]);

  // Function to fetch the workspace details
  const fetchWorkspace = async () => {
    try {
      const response = await fetch(`/api/OnlyTaskApi/workspace/${workspaceId}/workSpace`);
      const data = await response.json();
      console.log(data.data.name);
      if (data.success) {
        setWorkspaceName(data.data.name); // Set workspace name
        setWorkspaceDetails(data.data);
      } else {
        console.error("Error fetching workspace:", data.message);
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  // Close delete confirmation modal
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  // Delete workspace function
  const deleteWorkspace = async () => {
    // const confirmDelete = window.confirm("Are you sure you want to delete this workspace?");
    // if (!confirmDelete) return;

    try {
      const response = await axios.delete(`/api/OnlyTaskApi/workspace/${workspaceId}/workSpace`);
      if (response.data.success) {
        setAlert({ message: 'Workspace deleted successfully!', type: 'success', open: true });
        router.push('/'); // Redirect to another page after deletion
      }
    } catch (error) {
      setAlert({ message: `Error deleting workspace: ${error.message}`, type: 'error', open: true });
    }
  };

  // Function to fetch the projects list
  const fetchProjects = async () => {
    try {
      const response = await fetch(`/api/OnlyTaskApi/workspace/${workspaceId}/project`);
      const data = await response.json();
      console.log(data.data.projects);
      if (data.success) {
        setProjects(data.data.projects);
      } else {
        console.error("Error fetching projects:", data.message);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Function to handle new project creation
  const handleNewProjectCreated = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
    setAlert({ message: 'Project created successfully!', type: 'success', open: true });
  };

  // Function to close the alert
  const handleAlertClose = () => {
    setAlert({ ...alert, open: false });
  };

  // Handle row click
  const handleRowClick = (projectId) => {
    router.push(`/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit`);
  };

  // Handle page change for pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle change in rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page change
  };

  const handleWorkspaceNameClick = () => {
    setWorkspaceFormOpen(true); // Open the WorkspaceForm modal
  };

  const handleWorkspaceFormClose = () => {
    setWorkspaceFormOpen(false);
  };


  // Get projects to display based on pagination
  const projectsToDisplay = projects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Layout>
      <Box className={styles['workspace-name-container']} sx={{marginTop: -5,}}>
        {/* Workspace Name Display */}
        <h1 onClick={handleWorkspaceNameClick} style={{ cursor: 'pointer' }}>
          {workspaceName}
        </h1>

        {/* Delete Icon */}
        <Tooltip title="Delete WorkSpace" placement="right" arrow>
        <IconButton className={styles['delete-icon']} onClick={handleDeleteClick} aria-label="delete">
          <DeleteIcon color="error" />
        </IconButton>
        </Tooltip>
      </Box>
      <Box className={styles['button-container']}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          color="primary"
          onClick={() => setModalOpen(true)}
        //style={{ marginLeft: '10px' }}
        >
          Create Project
        </Button>
      </Box>

      {/* Alert for notifications */}
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert variant="filled" onClose={handleAlertClose} severity={alert.type} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Conditionally render the NewProject component as a modal */}
      <NewProject open={isModalOpen} handleClose={() => setModalOpen(false)} workspaceId={workspaceId} onProjectCreated={handleNewProjectCreated} />

      {/* Conditionally render the WorkspaceForm component as a modal */}
      {workspaceDetails && (
        <WorkspaceForm
          open={isWorkspaceFormOpen}
          handleClose={handleWorkspaceFormClose}
          workspaceId={workspaceId}
          isEditing={true} // Indicates that this is edit mode
          workspaceDetails={workspaceDetails} // Pass the workspace details directly to the form
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-confirm-dialog"
        aria-describedby="delete-confirm-description"
      >
        <DialogTitle id="delete-confirm-dialog" sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#00264d',
          p: 1,
          // borderTopLeftRadius: 0,
          // borderTopRightRadius: 0,
          color: 'white',
        }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-description">
            Are you sure you want to delete the workspace "{workspaceName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteWorkspace} color="error" autoFocus variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render the project table */}
      {/* <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table>
          <TableHead style={{ backgroundColor: '#00264d', color: 'white', position: 'sticky', top: 0, zIndex: 1 }}>
            <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
              <TableCell align="center">Project ID</TableCell>
              <TableCell align="center">Project Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectsToDisplay.map((project) => (
              <TableRow key={project._id} onClick={() => handleRowClick(project._id)} style={{ cursor: 'pointer' }}>
                <TableCell align="center">{project.projectId}</TableCell>
                <TableCell align="center">{project.projectName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination style={{ backgroundColor: '#00264d', color: 'white', position: 'sticky', bottom: 0 }}
          rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]} // Options for rows per page
          component="div"
          count={projects.length} // Total number of projects
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer> */}
      <Dashboard workspaceId={workspaceId} />
    </Layout>
  );
};

export default ProjectTable;
