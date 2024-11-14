// AssigneeMenu.js
import React, { useEffect, useState } from 'react';
import { Menu, MenuItem, TextField, CircularProgress, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const AssigneeMenu = ({ anchorEl, open, onClose, onAssigneeSelect }) => {
    const [assigneeOptions, setAssigneeOptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAssignees = async () => {
            const hostname = window.location.hostname;
            const extractedSubdomain = hostname.split('.')[0];
            const accountId = sessionStorage.getItem('accountId');
            setLoading(true);
            try {
                const response = await fetch(`/api/auth/getAgents?accountId=${accountId}&subdomain=${extractedSubdomain}`); // Replace with your API endpoint
                const data = await response.json();
                setAssigneeOptions(data); // Adjust based on your API response structure
            } catch (error) {
                console.error('Error fetching assignees:', error);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchAssignees();
        }
    }, [open]);

    const filteredAssignees = assigneeOptions.filter(assignee =>
        assignee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <TextField
                placeholder="Search..."
                value={searchTerm} // Ensure this is correctly set
                onChange={(e) => setSearchTerm(e.target.value)} // Update the state on change
                sx={{
                    m: 1,
                    width: '90%',
                    borderRadius: '20px', // Make corners rounded
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '20px', // Make corners rounded for the input
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon /> {/* Add search icon */}
                        </InputAdornment>
                    ),
                }}
            />
             {/* Add the "None" option */}
             <MenuItem onClick={() => onAssigneeSelect(null)}>
             Unassigned
            </MenuItem>
            {loading ? (
                <MenuItem disabled>
                    <CircularProgress size={24} />
                </MenuItem>
            ) : (
                filteredAssignees.map((assignee) => (
                    <MenuItem key={assignee.id} onClick={() => onAssigneeSelect(assignee.name)}>
                        {assignee.name}
                    </MenuItem>
                ))
            )}
        </Menu>
    );
};

export default AssigneeMenu;
