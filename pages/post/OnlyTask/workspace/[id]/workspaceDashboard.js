import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Grid, Paper, Typography, Box, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Dashboard = ({ workspaceId }) => {  // Get workspaceId as a prop
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Only make the API call once the workspaceId is available
        if (workspaceId) {
            axios.get(`/api/OnlyTaskApi/workspace/${workspaceId}/project`)  // Use workspaceId in API call
                .then((response) => {
                    setProjects(response.data.data.projects);  // Assuming response.data contains an array of projects
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching projects:", error);
                    setLoading(false);
                });
        }
    }, [workspaceId]);  // Dependency on workspaceId to refetch when it changes

    if (loading) {
        return <CircularProgress />;
    }

    // Navigate to the project edit page
    const handleProjectClick = (projectId) => {
        router.push(`/post/OnlyTask/workspace/${workspaceId}/projects/${projectId}/edit`);
    };

    // Filter and categorize projects by priority
    const totalProjects = projects.length;
    const urgentProjects = projects.filter(project => project.priority === 'Urgent').length;
    const highProjects = projects.filter(project => project.priority === 'High').length;
    const mediumProjects = projects.filter(project => project.priority === 'Medium').length;
    const lowProjects = projects.filter(project => project.priority === 'Low').length;

    // Project completion data (if needed for pie chart)
    const completedProjects = projects.filter(project => project.statusList?.some(status => status.status === 'completed')).length;
    const incompleteProjects = totalProjects - completedProjects;

    // Prepare data for priority-based bar chart
    const projectPriorityData = {
        labels: ['Urgent', 'High', 'Medium', 'Low'],
        datasets: [
            {
                label: 'Projects by Priority',
                data: [urgentProjects, highProjects, mediumProjects, lowProjects],
                backgroundColor: ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a'],
            },
        ],
    };

       // Prepare data for tasks by project bar chart
       const projectNames = projects.map(project => project.projectName);
       const taskCounts = projects.map(project => project.tasks.length); // Count the number of tasks in each project
   
       const taskData = {
           labels: projectNames,  // Project names on the x-axis
           datasets: [
               {
                   label: 'Number of Tasks',
                   data: taskCounts, // Task counts on the y-axis
                   backgroundColor: '#42a5f5', // Bar color
               },
           ],
       };

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container spacing={2}>
                {/* Project List - Recent Projects */}
                <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ padding: 2, height: 400, overflowY: 'auto' }}>
                        <Typography variant="h6">Recent Projects</Typography>
                        <List>
                            {projects.map((project) => (
                                <ListItem button key={project._id} onClick={() => handleProjectClick(project._id)}>
                                    <ListItemText primary={project.projectName} secondary="in Projects" />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Tasks by Project (Bar Chart) */}
                <Grid item xs={12} md={6}> {/* Adjust the size to match project list */}
                    <Paper elevation={3} sx={{ padding: 2, height: 400 }}>
                        <Typography variant="h6">Tasks per Project</Typography>
                        <Bar data={taskData} options={{
                            responsive: true,
                            plugins: {
                                legend: { display: true, position: 'top' },  // Show legend
                                tooltip: { enabled: true },                  // Enable tooltips
                            },
                        }} />
                    </Paper>
                </Grid>

                {/* Projects by Priority (Bar Chart) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Projects by Priority</Typography>
                        <Bar data={projectPriorityData} />
                    </Paper>
                </Grid>

                {/* Project Completion Status (Pie Chart, if needed) */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 2, height: 390, display: 'flex', justifyContent: 'center', alignItems: 'center' }}> {/* Adjust Paper to center the chart */}
                        <Typography variant="h6" sx={{ marginBottom: 2 }}>Project Completion Status</Typography>
                        <Pie
                            data={{
                                labels: ['With Assigned Agent', 'Without Assigned Agent'], // Updated labels
                                datasets: [{
                                  data: [
                                    projects.filter(project => project.assignedAgent).length,  // Projects with assignedAgent
                                    projects.filter(project => !project.assignedAgent).length  // Projects without assignedAgent
                                  ],
                                  backgroundColor: ['#00264d', '#ccccb3'], // Colors for the pie chart
                                }]
                              }}
                            options={{
                                maintainAspectRatio: true, // Ensure it scales correctly
                                responsive: true,          // Make the chart responsive within the container
                                plugins: {
                                    legend: {
                                        position: 'top',       // Position the legend at the top
                                    },
                                },
                            }}
                        />
                    </Paper>
                </Grid>


                {/* Total Projects */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Total Projects</Typography>
                        <Typography variant="h4">{totalProjects}</Typography>
                    </Paper>
                </Grid>

                {/* Urgent Projects */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Urgent Projects</Typography>
                        <Typography variant="h4">{urgentProjects}</Typography>
                    </Paper>
                </Grid>

                {/* High Priority Projects */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">High Priority Projects</Typography>
                        <Typography variant="h4">{highProjects}</Typography>
                    </Paper>
                </Grid>

                {/* Medium Priority Projects */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6">Medium Priority Projects</Typography>
                        <Typography variant="h4">{mediumProjects}</Typography>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default Dashboard;
