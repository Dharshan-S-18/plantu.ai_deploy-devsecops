import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Table, TableBody, TableCell, TableContainer, Tooltip, TableHead, TableRow, Paper, TablePagination, Chip, Box, TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'; // Search icon
import AddIcon from "@mui/icons-material/Add";
import Layout from '../../components/Layout';
import ProjectPage from '../post/project';
import styles from '../../styles/Home.module.css';

const ProjectsDetails = () => {
  const [projects, setProjects] = useState([]); // All fetched projects
  const [filteredProjects, setFilteredProjects] = useState([]); // Projects filtered based on user selection and search
  const [viewMode, setViewMode] = useState('table'); // Table view mode
  const [page, setPage] = useState(0); // Current page (0-based index)
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page
  const [filterMode, setFilterMode] = useState('all'); // Filter mode ('all' or 'my')
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const [searchOpen, setSearchOpen] = useState(false); // State to toggle search field visibility
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch all projects when the component loads
    const fetchProjects = async () => {
      const accountId = sessionStorage.getItem('accountId');
      try {
        const response = await fetch(`/api/project?accountId=${accountId}`);
        const data = await response.json();
        setProjects(data.projects); // Save all projects in state
        setFilteredProjects(data.projects); // Initially show all projects
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects(); // Trigger fetching of projects
  }, []);

  useEffect(() => {
    // Get the filterMode from URL query parameters on page load
    const { filterMode } = router.query;
    if (filterMode) {
      setFilterMode(filterMode); // If URL has filterMode, set it in state
    }
  }, [router.query]); // Runs on initial load or if the URL query changes

  useEffect(() => {
    // Filter the projects based on filterMode ('my' or 'all')
    const email = sessionStorage.getItem('email'); // Get the logged-in user's email
    if (filterMode === 'my') {
      // Show only the projects that were created by the logged-in user
      setFilteredProjects(projects.filter((project) => project.createdBy === email));
    } else {
      // Show all projects
      setFilteredProjects(projects);
    }
  }, [filterMode, projects]); // Re-run when filterMode or projects change

  useEffect(() => {
    // Update URL query parameters whenever filterMode changes
    const queryParams = { filterMode };
    router.push({
      pathname: router.pathname,
      query: queryParams,
    }, undefined, { shallow: true }); // shallow routing avoids full page reload
  }, [filterMode]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    const email = sessionStorage.getItem('email'); // Get the logged-in user's email

    // Conditionally filter based on filterMode and search query
    let filtered = projects;

    if (filterMode === 'my') {
      // If "My Projects" is selected, only include projects created by the logged-in user
      filtered = projects.filter((project) => project.createdBy === email);
    }

    // Now filter the data based on the search query for project name
    filtered = filtered.filter((project) =>
      project.projectName.toLowerCase().includes(event.target.value.toLowerCase()) // Match project name
    );

    setFilteredProjects(filtered);
  };

  const renderTableView = () => {
    const startIndex = page * rowsPerPage;
    const currentProjects = filteredProjects.slice(startIndex, startIndex + rowsPerPage);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: '#00264d', color: 'white', position: 'sticky', top: 0, zIndex: 1 }}>
            <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
              <TableCell align="center">Project ID</TableCell>
              <TableCell align="center">Project Name</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Start Date</TableCell>
              <TableCell align="center">End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentProjects.map((project) => (
              <TableRow key={project._id} onClick={() => router.push(`/post/projects/${project._id}/edit`)} style={{ cursor: 'pointer' }}>
                <TableCell align="center">{project.projectId}</TableCell>
                <TableCell align="center">{project.projectName}</TableCell>
                <TableCell align="center">{project.status}</TableCell>
                <TableCell align="center">{new Date(project.startDate).toLocaleDateString()}</TableCell>
                <TableCell align="center">{new Date(project.endDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // Options for how many rows to display per page
          component="div"
          count={filteredProjects.length} // Total number of filtered items (projects)
          rowsPerPage={rowsPerPage} // Number of rows per page
          page={page} // Current page
          onPageChange={handleChangePage} // Handle page change
          onRowsPerPageChange={handleChangeRowsPerPage} // Handle rows per page change
        />
      </TableContainer>
    );
  };

  return (
    <Layout>
      <div className={styles['button-container']}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" gap={2}> {/* Using gap for spacing between chips */}
          <Tooltip title="Create Project" placement="top" arrow>
            <Chip
              // sx={{ ml:50 }}
              label="Create Project"
              variant="outlined"
              icon={<AddIcon />}
              onClick={() => setModalOpen(true)} // Handle opening the modal for creating a new project
            >
              
              {/* </IconButton> */}
            </Chip>
          </Tooltip>
          <Chip
            label="All Projects"
            variant="outlined"
            onClick={() => setFilterMode('all')}
            // sx={{ mr:80 }}
            style={{
              // marginRight: '-1000px',
              cursor: 'pointer',
              backgroundColor: filterMode === 'all' ? '#00796b' : '#e0e0e0', // Change color when selected
              color: filterMode === 'all' ? '#fff' : '#000',
            }}
          />
          <Chip
            label="My Projects"
            variant="outlined"
            onClick={() => setFilterMode('my')}
            style={{
              cursor: 'pointer',
              backgroundColor: filterMode === 'my' ? '#00796b' : '#e0e0e0', // Change color when selected
              color: filterMode === 'my' ? '#fff' : '#000',
            }}
          />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', mb: 1 }}>
            {/* Search Icon Button */}
            {!searchExpanded && (
              <IconButton onClick={() => setSearchExpanded(true)} sx={{ backgroundColor: '#ffffff', borderRadius: '50%', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', padding: '10px' }}>
                <SearchIcon sx={{ color: '#3b82f6', fontSize: '24px' }} />
              </IconButton>
            )}

            {/* Search Field */}
            {searchExpanded && (
              <TextField
                variant="outlined"
                placeholder="Search Projectr....."
                value={searchQuery}
                fullWidth
                autoFocus
                onChange={handleSearch}
                onBlur={() => setSearchExpanded(false)} // Close the field on blur
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#3b82f6' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  borderRadius: '50px',
                  backgroundColor: '#ffffff',
                  width: '300px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    paddingLeft: '8px',
                  },
                  '& input': {
                    padding: '10px',
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </div>
      <ProjectPage open={modalOpen} handleClose={() => setModalOpen(false)} />
      {viewMode === 'table' && renderTableView()}
    </Layout>
  );
};

export default ProjectsDetails;
