import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FormControl, FormLabel, Input, Select, Option, Textarea } from '@mui/joy';
import {
    IconButton,
    Typography,
    Box,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const generateSequentialId = (lastId) => {
    const baseId = "RQ";
    const lastNumber = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000 and 9999
    return `${baseId}${lastNumber}`;
};

const RequirementForm = ({ projectId, requirementId, onClose, onRequirementChange }) => {
    const [requirement, setRequirement] = useState({
        requirementNo: '',
        description: '',
        shortDescription: '',
        assignedTo: '',
        createdBy: '',
        status: 'Open', // Default value for status
    });
    const [message, setMessage] = useState('');
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        if (requirementId) {
            // If a requirementId is provided, populate the form for editing
            setRequirement({
                requirementNo: requirementId.requirementNo || '',  // Ensure raidId is a string
                description: requirementId.description || '',
                shortDescription: requirementId.shortDescription || '',
                assignedTo: requirementId.assignedTo || '',
                createdBy: requirementId.createdBy || '',
                status: requirementId.status || ''
            });
            setEditMode(true);
        } else {
            // Generate a new RAID ID locally if not in edit mode
            const newId = generateSequentialId();
            setRequirement((prevData) => ({ ...prevData, requirementNo: newId }));
        }
    }, [projectId, requirementId]);

    // Generate Requirement Number
    // useEffect(() => {
    //     const generateRequirementNo = () =>
    //         `RN${Math.floor(Math.random() * 10000)
    //             .toString()
    //             .padStart(4, '0')}`;
    //     setRequirement((prev) => ({ ...prev, requirementNo: generateRequirementNo() }));
    // }, []);

    // Retrieve email from sessionStorage
    useEffect(() => {
        const email = sessionStorage.getItem('email') || '';
        setRequirement((prev) => ({ ...prev, createdBy: email }));
    }, []);

    // General handler for input changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        setRequirement((prevData) => ({ ...prevData, [name]: value }));
    };

    // Specific handler for Select components
    const handleSelectChange = (name) => (event, newValue) => {
        setRequirement((prevData) => ({ ...prevData, [name]: newValue }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (editMode) {
                // Update existing RAID data
                await axios.put(`/api/project/${projectId}/requirement/${requirementId._id}`, requirement);
                onRequirementChange('Requirement updated successfully', 'success');
            } else {
                // Create new RAID data
                await axios.post(`/api/project/${projectId}/requirement`, requirement);
                onRequirementChange('Requirement created successfully', 'success');
            }
            // onRequirementChange(); // Call to refresh the list
            onClose(); // Close the form after submission
        } catch (error) {
            console.error('Error saving data:', error);
            onRequirementChange('Error saving requirement', 'error');
        }
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 2,
                p: 3,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: '#00264d',
                    p: 2,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                }}
            >
                <Typography variant="h6" component="div" sx={{ color: '#fff' }}>
                    {editMode ? 'Edit Requirement Details' : 'Add Requirement Details'}
                </Typography>
                <IconButton onClick={onClose} sx={{ color: '#fff' }}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Requirement No</FormLabel>
                        <Input value={requirement.requirementNo} readOnly />
                    </FormControl>

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            name="description"
                            placeholder="Enter description"
                            value={requirement.description}
                            onChange={handleChange}
                            minRows={3}
                        />
                    </FormControl>

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Short Description</FormLabel>
                        <Input
                            name="shortDescription"
                            placeholder="Enter short description"
                            value={requirement.shortDescription}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Assigned To</FormLabel>
                        <Select
                            name="assignedTo"
                            value={requirement.assignedTo}
                            onChange={handleSelectChange('assignedTo')}
                            placeholder="Select user"
                        >
                            <Option value="user1">User 1</Option>
                            <Option value="user2">User 2</Option>
                            <Option value="user3">User 3</Option>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Created By</FormLabel>
                        <Input value={requirement.createdBy} readOnly />
                    </FormControl>

                    <FormControl sx={{ mb: 2 }}>
                        <FormLabel>Status</FormLabel>
                        <Select
                            name="status"
                            value={requirement.status}
                            onChange={handleSelectChange('status')}
                            placeholder="Select status"
                        >
                            <Option value="Open">Open</Option>
                            <Option value="In Progress">In Progress</Option>
                            <Option value="Resolved">Resolved</Option>
                            <Option value="Closed">Closed</Option>
                        </Select>
                    </FormControl>

                    {/* Submit Button */}
                    <Button type="submit" variant="contained" color="primary">
                        {editMode ? 'Update' : 'Submit'}
                    </Button>

                    {message && <p>{message}</p>}
                </Box>
            </Box>
        </Box>
    );
};

export default RequirementForm;
