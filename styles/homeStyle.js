import { styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import { blue } from '@mui/material/colors';

export const drawerWidth = 260;

export const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  '&.Mui-selected': {
    backgroundColor: '#333333', // Clicked button color(gray)
    color: 'white',
    borderRadius: '30px',
    
    '& .MuiListItemIcon-root': {
      color: 'inherit'  // Ensures icons use the same color as the text
    },

    '&:hover': {
      backgroundColor: blue[700], // Darken the blue on hover
    },
  },
  '&:hover': {
    backgroundColor: blue[100], // Light blue on hover for non-selected items
  },
  borderRadius: '30px', // Round corners for all list items
}));