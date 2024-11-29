import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../../../components/Layout';
import { Box, Typography, Paper, Button } from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import TaskIcon from '@mui/icons-material/Task';
import PeopleIcon from '@mui/icons-material/People';
import AlarmIcon from '@mui/icons-material/Alarm';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShieldIcon from '@mui/icons-material/Shield';
import TaskTab from '../../taskTab';
import Details from '../../projectUpdate';
import UserDataGrid from '../../stakeholdersTable';
import RaidTable from '../../raidTable';
import RequirementList from '../../RequirementTable';

const EditProjectPage = () => {
    const router = useRouter();
    const { id, section } = router.query; // Extract section from query parameters
    const [project, setProject] = useState(null);
    const [activeSection, setActiveSection] = useState('Details');

    useEffect(() => {
        if (id) {
            const fetchProject = async () => {
                const response = await fetch(`/api/project/${id}`);
                const data = await response.json();
                setProject(data.project);
            };
            fetchProject();
        }

        // Set active section from query parameter if available
        if (section) {
            setActiveSection(section);
        }
    }, [id, section]);

    if (!project) {
        return <Typography>Loading...</Typography>;
    }

    const renderContent = () => {
        switch (activeSection) {
            case 'Details':
                return <Details projectId={id} />;
            case 'Tasks':
                return <TaskTab projectId={id} />;
            case 'Stakeholders':
                return <UserDataGrid projectId={id} />;
            case 'Timecard':
                return (
                    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6">Timecard</Typography>
                        <Typography variant="body2">Time Entry 1: 01/01/2024 - 8 hours</Typography>
                        <Typography variant="body2">Time Entry 2: 01/02/2024 - 7.5 hours</Typography>
                    </Paper>
                );
            case 'Resources':
                return (
                    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6">Resources/Team</Typography>
                        <Typography variant="body2">Resource 1: Developer - Alice</Typography>
                        <Typography variant="body2">Resource 2: Tester - Bob</Typography>
                    </Paper>
                );
            case 'Requirements':
                return <RequirementList projectId={id} />;
            case 'RADI':
                return <RaidTable projectId={id} />;
            default:
                return null;
        }
    };

    const getButtonStyle = (section) => {
        return {
            backgroundColor: activeSection === section ? '#00264d' : '#ffffff',
            color: activeSection === section ? 'white' : 'black',
            borderRadius: '12px',
            marginBottom: '10px',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                backgroundColor: activeSection === section ? '#001a33' : '#e0e0e0',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
            },
            textTransform: 'none',
            padding: '10px 20px',
        };
    };

    const handleButtonClick = (section) => {
        setActiveSection(section);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, section }, // Update query parameter
        });
    };

    return (
        <Layout>
            <Box sx={{ display: 'flex', height: '100%' }}>
                <Box sx={{ flex: 1, p: 3, mt: -6, ml:-2 }}>
                    {renderContent()}
                </Box>
                <Box sx={{
                    width: '250px',
                    backgroundColor: '#f8f8f8',
                    p: 3,
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto',
                }}>
                    <Typography variant="h6" gutterBottom>Navigate</Typography>
                    {['Details', 'Tasks', 'Stakeholders', 'Timecard', 'Resources', 'Requirements', 'RADI'].map((section, index) => {
                        const icons = [<ListIcon />, <TaskIcon />, <PeopleIcon />, <AlarmIcon />, <Diversity3Icon />, <ListAltIcon />, <ShieldIcon />];
                        return (
                            <Button
                                key={section}
                                fullWidth
                                sx={{ justifyContent: 'flex-start', ...getButtonStyle(section) }}
                                onClick={() => handleButtonClick(section)}
                                startIcon={icons[index]}
                            >
                                {section}
                            </Button>
                        );
                    })}
                </Box>
            </Box>
        </Layout>
    );
};

export default EditProjectPage;
