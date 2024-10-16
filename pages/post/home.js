// pages/index.js
import React from 'react';
import Layout from '../../components/Layout';
import { Grid, Paper, Typography, List, ListItem, ListItemText, Box, IconButton } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';

const Dashboard = () => {
  return (
    <Layout>
      <Grid container spacing={3}>
        {/* Calendar */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">March 2022</Typography>
            <Box mt={2} style={{ height: '240px', backgroundColor: '#f4f4f4', borderRadius: '4px' }}>
              Calendar Component
            </Box>
          </Paper>
        </Grid>

        {/* My tasks */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">My tasks (05)</Typography>
            <List>
              {['Contract signing', 'Market overview keynote', 'Project research', 'Prepare invoices'].map((text, index) => (
                <ListItem key={index}>
                  <ListItemText primary={text} />
                  <Typography variant="caption" color="text.secondary">Today</Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* My tracking */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">My tracking</Typography>
            <List>
              {['Create wireframe', 'Slack logo design', 'Dashboard design', 'Create wireframe'].map((text, index) => (
                <ListItem key={index}>
                  <ListItemText primary={text} />
                  <Typography variant="caption" color="text.secondary">1h 25m 30s</Typography>
                  <IconButton size="small">
                    <PauseIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* New comments */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">New comments</Typography>
            <List>
              {['Market research', 'Market research'].map((text, index) => (
                <ListItem key={index}>
                  <ListItemText primary={text} secondary="Find my keynote attached..." />
                  <Typography variant="caption" color="text.secondary">Today</Typography>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;
