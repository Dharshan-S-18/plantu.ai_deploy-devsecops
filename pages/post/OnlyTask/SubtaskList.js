// SubtaskList.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Typography,
    Tooltip,
    Popover,
    Avatar,
    TextField,
    Button,
} from '@mui/material';
import Textarea from '@mui/joy/Textarea';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers';
import AssigneeMenu from '../../../components/AssigneeMenu';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import axios from 'axios';
import Subtask from './Subtask';
import CloseIcon from '@mui/icons-material/Close';

dayjs.extend(relativeTime);

const SubtaskList = ({ workspaceId, projectId, taskId }) => {
    const [subtasks, setSubtasks] = useState([]);
    const router = useRouter();
    const [openSubtaskModal, setOpenSubtaskModal] = useState(false);
    const [selectedSubtask, setSelectedSubtask] = useState(null);
    const [dateAnchorEl, setDateAnchorEl] = useState(null);
    const [tempDate, setTempDate] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [hoveredSubtaskId, setHoveredSubtaskId] = useState(null);
    const [editingSubtaskId, setEditingSubtaskId] = useState(null);
    const [assigneeOptions, setAssigneeOptions] = useState([]);
    const [newSubtaskName, setNewSubtaskName] = useState('');
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);

    // Fetch subtasks from API
    useEffect(() => {
        const fetchSubtasks = async () => {
            try {
                const response = await axios.get(
                    `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/subtasks`
                );
                setSubtasks(response.data.subtasks);

                // Check if subtaskId exists in URL for deep linking
                const { subtaskId } = router.query;
                if (subtaskId) {
                    const matchedSubtask = response.data.subtasks.find(st => st._id === subtaskId);
                    if (matchedSubtask) {
                        setSelectedSubtask(matchedSubtask);
                        setOpenSubtaskModal(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching subtasks:', error);
            }
        };

        fetchSubtasks();
    }, [workspaceId, projectId, taskId, router.query]);

    const handleOpenSubtaskModal = (subtask) => {
        setSelectedSubtask(subtask);
        setOpenSubtaskModal(true);
        // Update URL with subtaskId
        router.push(
            {
                pathname: router.pathname,
                query: { ...router.query, subtaskId: subtask._id },
            },
            undefined,
            { shallow: true }
        );
    };

    const handleCloseSubtaskModal = () => {
        setSelectedSubtask(null);
        setOpenSubtaskModal(false);
        // Remove subtaskId from URL
        const { subtaskId, ...rest } = router.query;
        router.push(
            {
                pathname: router.pathname,
                query: rest,
            },
            undefined,
            { shallow: true }
        );
    };

    const handleEditSubtaskName = (subtaskId) => {
        setEditingSubtaskId(subtaskId);
    };

    const handleSubtaskNameChange = (event, subtaskId) => {
        const newName = event.target.value;
        setSubtasks((prevSubtasks) =>
            prevSubtasks.map((subtask) =>
                subtask._id === subtaskId ? { ...subtask, name: newName } : subtask
            )
        );
    };

    const handleSubtaskNameSave = async (subtaskId) => {
        const subtask = subtasks.find((subtask) => subtask._id === subtaskId);
        try {
            await axios.put(
                `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/subtasks/${subtaskId}`,
                { name: subtask.name }
            );
            setEditingSubtaskId(null);
        } catch (error) {
            console.error('Error updating subtask name:', error);
        }
    };

    const handleKeyPress = (event, subtaskId) => {
        if (event.key === 'Enter') {
            handleSubtaskNameSave(subtaskId);
        }
    };

    const handleDateIconClick = (event, subtask) => {
        setTempDate(dayjs(subtask.dueDate));
        setSelectedSubtask(subtask);
        setDateAnchorEl(event.currentTarget);
    };

    const handleDateChange = (newDate) => {
        setTempDate(newDate);
    };

    const handleDateConfirm = async () => {
        try {
            await axios.put(
                `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/subtasks/${selectedSubtask._id}`,
                { dueDate: tempDate }
            );
            setSubtasks((prevSubtasks) =>
                prevSubtasks.map((subtask) =>
                    subtask._id === selectedSubtask._id ? { ...subtask, dueDate: tempDate } : subtask
                )
            );
            setDateAnchorEl(null);
        } catch (error) {
            console.error('Error updating due date:', error);
        }
    };

    const handleDateCancel = () => {
        setDateAnchorEl(null);
    };

    const handleClick = (event, subtask) => {
        setSelectedSubtask(subtask);
        setAnchorEl(event.currentTarget);
    };

    const handleAssigneeSelect = async (assignee) => {
        try {
            await axios.put(
                `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/subtasks/${selectedSubtask._id}`,
                { assignee }
            );
            setSubtasks((prevSubtasks) =>
                prevSubtasks.map((subtask) =>
                    subtask._id === selectedSubtask._id ? { ...subtask, assignee } : subtask
                )
            );
            setAnchorEl(null);
        } catch (error) {
            console.error('Error updating assignee:', error);
        }
    };

    const formatDueDate = (date) => {
        if (!dayjs(date).isValid()) return 'No due date';

        const dueDate = dayjs(date);
        const now = dayjs();
        const isPast = dueDate.isBefore(now, 'day');
        const isCurrentYear = dueDate.year() === now.year();

        let formattedDate;
        if (isCurrentYear) {
            formattedDate = dueDate.format('MMM D'); // e.g., Oct 31
        } else {
            formattedDate = dueDate.format('MMM D, YYYY'); // e.g., Oct 31, 2025
        }

        return { formattedDate, isPast };
    };

    const handleAddSubtask = async () => {
        if (!newSubtaskName) return;

        try {
            const response = await axios.post(
                `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/subtasks`,
                { name: newSubtaskName }
            );
            setSubtasks((prevSubtasks) => [...prevSubtasks, response.data.subtask]);
            setNewSubtaskName('');
            setIsAddingSubtask(false);
        } catch (error) {
            console.error('Error adding subtask:', error);
        }
    };

    const handleStatusChange = async (subtask) => {
        const newStatus = subtask.status === 'Done' ? 'In Progress' : 'Done';
        try {
            await axios.put(
                `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/subtasks/${subtask._id}`,
                { status: newStatus }
            );
            setSubtasks((prevSubtasks) =>
                prevSubtasks.map((s) =>
                    s._id === subtask._id ? { ...s, status: newStatus } : s
                )
            );
        } catch (error) {
            console.error('Error updating subtask status:', error);
        }
    };

    return (
        <Box>
            <List>
                {subtasks.map((subtask) => {
                    const { formattedDate, isPast } = formatDueDate(subtask.dueDate);
                    return (
                        <ListItem
                            key={subtask._id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #e0e0e0',
                                paddingY: 1,
                                justifyContent: 'space-between',
                            }}
                            onMouseEnter={() => setHoveredSubtaskId(subtask._id)}
                            onMouseLeave={() => setHoveredSubtaskId(null)}
                        >
                            <Checkbox
                            icon={<RadioButtonUncheckedIcon />}
                            checkedIcon={<CheckCircleIcon />}
                            checked={subtask.status === 'Done'}
                            onChange={() => handleStatusChange(subtask)}
                            sx={{
                                color: subtask.status === 'Done' ? 'green' : 'default',
                                '&.Mui-checked': { color: 'green' },
                                padding: 0,
                                marginRight: 1,
                            }}
                        />

                            <ListItemText
                                primary={
                                    editingSubtaskId === subtask._id ? (
                                        <Textarea
                                            value={subtask.name}
                                            onChange={(e) => handleSubtaskNameChange(e, subtask._id)}
                                            onBlur={() => handleSubtaskNameSave(subtask._id)}
                                            onKeyPress={(e) => handleKeyPress(e, subtask._id)}
                                            autoFocus
                                            size="small"
                                            variant="standard"
                                            sx={{
                                                width: `${subtask.name.length + 1}ch`,
                                                minWidth: '50px',
                                                maxWidth: '100%',
                                            }}
                                        />
                                    ) : (
                                        <Typography
                                            onClick={() => handleEditSubtaskName(subtask._id)}
                                            sx={{
                                                cursor: 'pointer',
                                                textDecoration: subtask.status === 'Done' ? 'line-through' : 'none',
                                                color: subtask.status === 'Done' ? 'gray' : 'inherit',
                                            }}
                                        >
                                            {subtask.name}
                                        </Typography>
                                    )
                                }
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {subtask.dueDate ? (
                                    <Typography
                                        color={isPast ? 'red' : 'green'}
                                        variant="body2"
                                        onClick={(e) => handleDateIconClick(e, subtask)}
                                        sx={{ cursor: 'pointer', minWidth: '70px', mr: 1 }}
                                    >
                                        {formattedDate}
                                    </Typography>
                                ) : (
                                    hoveredSubtaskId === subtask._id && (
                                        <Tooltip title="Set Due Date">
                                            <IconButton
                                                onClick={(e) => handleDateIconClick(e, subtask)}
                                                sx={{
                                                    visibility: hoveredSubtaskId === subtask._id ? 'visible' : 'hidden',
                                                    width: 24,
                                                    height: 24,
                                                    mr: 2,
                                                }}
                                            >
                                                <CalendarMonthOutlinedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '40px' }}>
                                {subtask.assignee ? (
                                    <Avatar
                                        sx={{
                                            bgcolor: '#3f51b5',
                                            width: 24,
                                            height: 24,
                                            cursor: 'pointer',
                                            mr: 1,
                                            visibility: subtask.assignee || hoveredSubtaskId === subtask._id ? 'visible' : 'hidden',
                                        }}
                                        onClick={(e) => handleClick(e, subtask)}
                                    >
                                        {subtask.assignee[0].toUpperCase()}
                                    </Avatar>
                                ) : (
                                    hoveredSubtaskId === subtask._id && (
                                        <Tooltip title="Set Assignee">
                                            <IconButton onClick={(e) => handleClick(e, subtask)} sx={{ width: 24, height: 24 }}>
                                                <PersonOutlineOutlinedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                )}
                                {hoveredSubtaskId === subtask._id && (
                                    <Tooltip title="Open Subtask Modal">
                                        <IconButton
                                            onClick={() => handleOpenSubtaskModal(subtask)}
                                            sx={{
                                                visibility: hoveredSubtaskId === subtask._id ? 'visible' : 'hidden',
                                                width: 24,
                                                height: 24,
                                            }}
                                        >
                                            <ArrowForwardIosIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>

                            <AssigneeMenu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                                assigneeOptions={assigneeOptions}
                                onAssigneeSelect={handleAssigneeSelect}
                            />
                        </ListItem>
                    );
                })}
            </List>

            <Box mt={2}>
                {isAddingSubtask ? (
                    <Box display="flex" alignItems="center">
                        <TextField
                            value={newSubtaskName}
                            onChange={(e) => setNewSubtaskName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddSubtask();
                                }
                            }}
                            variant="outlined"
                            placeholder="New subtask name"
                            size="small"
                            sx={{ mr: 1 }}
                        />
                        <IconButton onClick={handleAddSubtask} disabled={!newSubtaskName}>
                            <CheckCircleIcon />
                        </IconButton>
                        <IconButton onClick={() => setIsAddingSubtask(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                ) : (
                    <Button variant="outlined" onClick={() => setIsAddingSubtask(true)} startIcon={<AddIcon />}>
                        Add Subtask
                    </Button>
                )}
            </Box>

            <Popover
                open={Boolean(dateAnchorEl)}
                anchorEl={dateAnchorEl}
                onClose={handleDateCancel}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                        displayStaticWrapperAs="desktop"
                        value={tempDate}
                        onChange={handleDateChange}
                    />
                </LocalizationProvider>
                <Box display="flex" justifyContent="flex-end" p={1}>
                    <IconButton onClick={handleDateCancel}>Cancel</IconButton>
                    <IconButton onClick={handleDateConfirm}>OK</IconButton>
                </Box>
            </Popover>

            {openSubtaskModal && selectedSubtask && (
                <Subtask
                    open={openSubtaskModal}
                    onClose={handleCloseSubtaskModal}
                    taskId={taskId}
                    projectId={projectId}
                    workspaceId={workspaceId}
                    subtaskId={selectedSubtask._id}
                    subtask={selectedSubtask}
                />
            )}
        </Box>
    );
};

export default SubtaskList;
