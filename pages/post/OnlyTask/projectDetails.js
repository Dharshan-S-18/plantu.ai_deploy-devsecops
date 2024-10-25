import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Modal } from '@mui/material';
import Layout from '../../../components/Layout';
import styles from '../../../styles/Home.module.css';
import Board from 'react-trello';
import dynamic from 'next/dynamic';
import TableViewIcon from '@mui/icons-material/ViewList';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import AddIcon from '@mui/icons-material/Add';

// Import the NewProject component
const NewProject = dynamic(() => import('../../post/OnlyTask/createProject'), { ssr: false });

const ProjectTable = () => {
  const [projects, setProjects] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [isModalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const accountId = sessionStorage.getItem('accountId');
    const fetchProjects = async () => {
      try {
        const response = await fetch(`/api/OnlyTaskApi/project?accountId=${accountId}`);
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleRowClick = (id) => {
    router.push(`/post/OnlyTask/projects/${id}/edit`);
  };

  const handleCreateProjectClick = () => {
    setModalOpen(true); // Open the modal when the button is clicked
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === updatedProject._id ? { ...project, ...updatedProject } : project
        )
      );

      const response = await fetch(`/api/OnlyTaskApi/project/${updatedProject._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject),
      });

      if (!response.ok) {
        console.error('Failed to update project in MongoDB');
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project._id === updatedProject._id ? project : project
          )
        );
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    const newStatus = targetLaneId === 'todo' ? 'To Do' : targetLaneId === 'inprogress' ? 'In Progress' : 'Completed';
    const updatedProject = { _id: cardId, status: newStatus };

    await handleUpdateProject(updatedProject);
  };

  const getKanbanBoard = () => ({
    lanes: [
      {
        id: 'todo',
        title: 'To Do',
        style: { borderLeft: '4px solid orange' },
        cards: projects.filter((project) => project.status === 'To Do').map((project) => ({
          id: project._id,
          title: project.projectName,
          description: `Start Date: ${new Date(project.startDate).toLocaleDateString()}`,
        })),
      },
      {
        id: 'inprogress',
        title: 'In Progress',
        style: { borderLeft: '4px solid blue' },
        cards: projects.filter((project) => project.status === 'In Progress').map((project) => ({
          id: project._id,
          title: project.projectName,
          description: `Start Date: ${new Date(project.startDate).toLocaleDateString()}`,
        })),
      },
      {
        id: 'completed',
        title: 'Completed',
        style: { borderLeft: '4px solid green' },
        cards: projects.filter((project) => project.status === 'Completed').map((project) => ({
          id: project._id,
          title: project.projectName,
          description: `Start Date: ${new Date(project.startDate).toLocaleDateString()}`,
        })),
      },
    ],
  });

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead style={{ backgroundColor: '#00264d', color: 'white', position: 'sticky', top: 0, zIndex: 1 }}>
          <TableRow sx={{ '& th': { backgroundColor: '#00264d', color: 'white' } }}>
            <TableCell align="center">Project ID</TableCell>
            <TableCell align="center">Project Name</TableCell>
            {/* <TableCell align="center">Status</TableCell> */}
            {/* <TableCell align="center">Start Date</TableCell>
            <TableCell align="center">End Date</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project._id} onClick={() => handleRowClick(project._id)} style={{ cursor: 'pointer' }}>
              <TableCell align="center">{project.projectId}</TableCell>
              <TableCell align="center">{project.projectName}</TableCell>
              {/* <TableCell align="center">{project.status}</TableCell> */}
              {/* <TableCell align="center">{new Date(project.startDate).toLocaleDateString()}</TableCell>
              <TableCell align="center">{new Date(project.endDate).toLocaleDateString()}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderBoardView = () => (
    <Board
      data={getKanbanBoard()}
      draggable
      laneDraggable={false}
      cardDraggable
      style={{ backgroundColor: 'transparent' }}
      onCardMoveAcrossLanes={(fromLaneId, toLaneId, cardId, index) =>
        handleCardMove(cardId, fromLaneId, toLaneId)
      }
      onCardClick={(cardId) => router.push(`/post/projects/${cardId}/edit`)}
    />
  );

  const GridView = dynamic(() => import('../../post/projectGridView'), { ssr: false });

  const renderGridView = () => <GridView projects={projects} />;

  return (
    <Layout>
      <div className={styles['button-container']}>
        <Button variant="text"  onClick={() => setViewMode('table')}>
          {/* Table Row View */}
        </Button>
        {/* <Button variant="text" startIcon={<ViewKanbanIcon />} color="secondary" onClick={() => setViewMode('board')} style={{ marginLeft: '10px' }}>
          Board View
        </Button>
        <Button variant="text" startIcon={<Grid3x3Icon />} color="primary" onClick={() => setViewMode('grid')} style={{ marginLeft: '10px' }}>
          Grid View
        </Button> */}
        <Button variant="contained" startIcon={<AddIcon />} color="primary" onClick={handleCreateProjectClick} style={{ marginLeft: '10px', marginTop: 0, }}>
          Create Project
        </Button>
      </div>
      
      {/* Conditionally render the NewProject component as a modal */}
      <NewProject open={isModalOpen} handleClose={handleCloseModal} />

      {viewMode === 'table' && renderTableView()}
      {viewMode === 'board' && renderBoardView()}
      {viewMode === 'grid' && <GridView projects={projects} onUpdateProject={handleUpdateProject} />}
    </Layout>
  );
};

export default ProjectTable;
