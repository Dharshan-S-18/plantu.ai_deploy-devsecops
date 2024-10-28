import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import { Menu, AttachFileSharp, Settings } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GeneralSettingPage from "./generalsetting";
import SetupS3BucketPage from "./clientS3";

// Drawer Width
const drawerWidth = 220;
const collapsedDrawerWidth = 55;
// Mixin for opened and closed drawers
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `${collapsedDrawerWidth}px`, // Adjust this width to desired collapsed width
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// Styled Drawer Component
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const SettingDrawer = () => {
  const theme = useTheme();
  const router = useRouter();
  const { section } = router.query; // Extract section from query parameters
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("GeneralSetting");

  useEffect(() => {
    // Set active section from query parameter if available
    if (section) {
      setActiveSection(section);
    }
  }, [section]);

  // Toggle drawer state
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handlebackbutton = () => {
    router.push("/post/home");
  };

  // Function to render content based on the active section
  const renderContent = () => {
    switch (activeSection) {
      case "GeneralSetting":
        return <GeneralSettingPage />;
      case "SetupS3Bucket":
        return <SetupS3BucketPage />;
      default:
        return <GeneralSettingPage />;
    }
  };

  // Handle navigation between sections
  const handleButtonClick = (newSection) => {
    setActiveSection(newSection);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, section: newSection }, // Update query parameter
    });
  };

  return (
    <>
      <Drawer
        variant="permanent"
        anchor="left"
        open={open}
        sx={{ "& .MuiDrawer-paper": { backgroundColor: "#00264d" } }}
      >
        <Button
          onClick={toggleDrawer}
          sx={{
            color: "#FFFFFF",
            "&:hover": { bgcolor: open ? "#ffffff33" : "#ffffff33" },
          }}
        >
          <Menu />
        </Button>

        <List>
          <ListItem
            button
            onClick={() => handlebackbutton()}
            sx={{
              "&:hover": {
                bgcolor: activeSection !== "Back" ? "#ffffff33" : "#1976d2",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <ArrowBackIcon />
            </ListItemIcon>
            <ListItemText primary="Back To Home" sx={{ color: "white" }} />
          </ListItem>
          <ListItem
            button
            onClick={() => handleButtonClick("GeneralSetting")}
            sx={{
              bgcolor:
                activeSection === "GeneralSetting" ? "#1976d2" : "transparent",
              "&:hover": {
                bgcolor:
                  activeSection !== "GeneralSetting" ? "#ffffff33" : "#1976d2",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="General Setting" sx={{ color: "white" }} />
          </ListItem>

          <ListItem
            button
            onClick={() => handleButtonClick("SetupS3Bucket")}
            sx={{
              bgcolor:
                activeSection === "SetupS3Bucket" ? "#1976d2" : "transparent",
              "&:hover": {
                bgcolor:
                  activeSection !== "SetupS3Bucket" ? "#ffffff33" : "#1976d2",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <AttachFileSharp />
            </ListItemIcon>
            <ListItemText primary="Setup S3 Bucket" sx={{ color: "white" }} />
          </ListItem>
        </List>
      </Drawer>

      <Box
        sx={{
          flexDirection: "column",
          ml: open ? 30 : 6.5,
          transition: "margin-left 0.3s ease",
          p: 2,
        }}
      >
        {renderContent()} {/* Render content based on active section */}
      </Box>
    </>
  );
};

export default SettingDrawer;
