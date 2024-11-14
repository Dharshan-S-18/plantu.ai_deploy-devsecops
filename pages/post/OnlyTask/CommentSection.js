import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Divider, Button, Tooltip, Popover } from '@mui/material';
import { FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, InsertLink } from '@mui/icons-material';
import MapsUgcRoundedIcon from '@mui/icons-material/MapsUgcRounded';
import EmojiPicker from 'emoji-picker-react';
import dayjs from 'dayjs';
import axios from 'axios';

const CommentSection = ({ taskId, workspaceId, projectId }) => {
    const [comments, setComments] = useState([]);
    const [isPostDisabled, setIsPostDisabled] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(null); // Use null for Popover anchor
    const commentRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(
                `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/comments`
            );
            setComments(response.data.comments.reverse());
            commentRef.current.innerHTML = '';
            setIsPostDisabled(true);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const handleAddComment = async () => {
        const commentHTML = commentRef.current.innerHTML.trim();
        if (!commentHTML) return;

        const newCommentData = {
            text: commentHTML,
            user: sessionStorage.getItem('email'),
            timestamp: new Date(),
        };

        try {
            const response = await axios.post(
                `/api/OnlyTaskApi/workspace/${workspaceId}/project/${projectId}/task/${taskId}/comments`,
                newCommentData
            );
            if (response.status === 200) {
                setComments((prev) => [newCommentData, ...prev]);
                commentRef.current.innerHTML = '';
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const applyTextFormat = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const addEmoji = (emoji) => {
        commentRef.current.innerHTML += emoji.emoji; // Append emoji to the comment
        setShowEmojiPicker(null); // Close the Popover after emoji selection
        setIsPostDisabled(!commentRef.current.innerHTML.trim());
    };

    const toggleEmojiPicker = (event) => {
        setShowEmojiPicker(showEmojiPicker ? null : event.currentTarget); // Toggle Popover anchor
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <MapsUgcRoundedIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontSize: '16px', fontWeight: '600' }}>Comments</Typography>
            </Box>
            <Box sx={{
                mt: 2,
                mb: 2,
                maxHeight: '320px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: '#f0f0f0' },
                '&::-webkit-scrollbar-thumb': { background: '#b0b0b0', borderRadius: '4px' },
                scrollbarWidth: 'thin',
                scrollbarColor: '#b0b0b0 #f0f0f0',
            }}>
                {comments.slice().reverse().map((comment, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Avatar sx={{ mr: 2 }}>
                            {comment.user ? comment.user.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: '600' }}>
                                {comment.user || 'Unknown User'} {comment.timestamp ? dayjs(comment.timestamp).fromNow() : ''}
                            </Typography>
                            <Typography variant="body2" dangerouslySetInnerHTML={{ __html: comment.text }} />
                        </Box>
                    </Box>
                ))}
            </Box>
            <Divider variant="middle" />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Bold"><IconButton onClick={() => applyTextFormat('bold')}><FormatBold /></IconButton></Tooltip>
                <Tooltip title="Italic"><IconButton onClick={() => applyTextFormat('italic')}><FormatItalic /></IconButton></Tooltip>
                <Tooltip title="Bulleted List"><IconButton onClick={() => applyTextFormat('insertUnorderedList')}><FormatListBulleted /></IconButton></Tooltip>
                <Tooltip title="Numbered List"><IconButton onClick={() => applyTextFormat('insertOrderedList')}><FormatListNumbered /></IconButton></Tooltip>
                <Tooltip title="Link"><IconButton onClick={() => {
                    const url = prompt('Enter the URL', 'http://');
                    if (url) applyTextFormat('createLink', url);
                }}><InsertLink /></IconButton></Tooltip>
                <IconButton onClick={toggleEmojiPicker}>😊</IconButton>
                </Box>
                <Popover
                    open={Boolean(showEmojiPicker)}
                    anchorEl={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(null)}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <EmojiPicker onEmojiClick={addEmoji} />
                </Popover>
                </Box>
                <Box
                    ref={commentRef}
                    contentEditable
                    placeholder="Add a comment..."
                    sx={{
                        ml: 1,
                        flex: 1,
                        p: 1,
                        minHeight: '40px',
                        borderRadius: '4px',
                        outline: 'none',
                        '&:empty:before': { content: 'attr(placeholder)', color: '#9e9e9e' },
                    }}
                    onInput={() => setIsPostDisabled(!commentRef.current.innerHTML.trim())}
                />
                <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={isPostDisabled}
                    sx={{ ml: 2, mt: 2 }}
                >
                    Post
                </Button>
            
        </Box>
    );
};

export default CommentSection;
