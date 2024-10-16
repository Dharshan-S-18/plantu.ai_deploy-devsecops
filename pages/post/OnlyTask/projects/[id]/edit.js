import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../../../../components/Layout';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Divider,
} from '@mui/material';
import KanbanView from '../../kanbanTask'; // Assume you have these components created
import GanttChartView from '../../taskGanttChart';
// import TableTab from '../../../tableTab';
import CalendarTab from '../../taskCalendar';

const EditProjectPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [project, setProject] = useState(null);
    const [activeSection, setActiveSection] = useState('Status');

    useEffect(() => {
        if (id) {
            const fetchProject = async () => {
                const response = await fetch(`/api/OnlyTaskApi/project/${id}`);
                const data = await response.json();
                setProject(data.project);
            };
            fetchProject();
        }
    }, [id]);

    if (!project) {
        return <Typography>Loading...</Typography>;
    }

    const renderContent = () => {
        switch (activeSection) {
            case 'Status':
                return (
                    <>
            {/* Kanban View below the Status Tab */}
            <KanbanView projectId={id} />
          </>
                );
            case 'Gantt':
                return (
                    <>
                        {/* Gantt Chart View below the Gantt Tab */}
                        <GanttChartView projectId={id} />
                    </>
                );
            case 'Table':
                return (
                    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6">Timecard</Typography>
                        <Typography variant="body2">Time Entry 1: 01/01/2024 - 8 hours</Typography>
                        <Typography variant="body2">Time Entry 2: 01/02/2024 - 7.5 hours</Typography>
                    </Paper>
                );
            case 'Calendar':
                return <CalendarTab projectId={id}  />;
            default:
                return null;
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveSection(newValue);
    };

    return (
        <Layout>
            <Box sx={{ width: '100%', p: 3 }}>
            {/* Project Name */}
            <Typography variant="h4" gutterBottom>
                    {project.projectName}
                </Typography>

                <Divider />

                {/* Tab Navigation */}
                <Tabs
                    value={activeSection}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    aria-label="project sections"
                >
                    <Tab label="Kanban" value="Status" />
                    <Tab label="Gantt" value="Gantt" />
                    {/* <Tab label="Table" value="Table" /> */}
                    <Tab label="Calendar" value="Calendar" />
                </Tabs>

                {/* Content Area */}
                <Box sx={{ mt: 3 }}>
                    {renderContent()}
                </Box>
            </Box>
        </Layout>
    );
};

export default EditProjectPage;
