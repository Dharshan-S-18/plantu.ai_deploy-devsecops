import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import plantoLogo from "../pages/post/image/plantuLogo.png";
import { styled, useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  CssBaseline,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  DialogActions,
  Typography,
  Modal,
  Fade,
  Backdrop,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Snackbar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import Animations from "../pages/animation/logoAnimation";
import ProjectPage from "../pages/post/project";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import WorkspaceForm from "../pages/post/OnlyTask/workspaceCreate";

const drawerWidth = 220;
const collapsedDrawerWidth = 55;

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha("#ffffff", 1),
  "&:hover": {
    backgroundColor: alpha("#ffffff", 0.95),
  },
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#000000",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(3)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

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

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: "100%",
  backgroundColor: "#ffffff",
}));

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

export default function Layout({ children }) {
  const theme = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [openInviteUser, setOpenInviteUser] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [accountId, setAccountId] = useState("");
  const [selected, setSelected] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [workspacMmodalOpen, setWorkspaceModalOpen] = useState(false);
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const { data: session, status } = useSession();
  const [userName, setUserName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false); // State to manage loading
  const [workspaces, setWorkspaces] = useState([]); // State to store workspaces
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [isProjectExpanded, setIsProjectExpanded] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(""); // Track which menu is expanded
  const [activeItem, setActiveItem] = useState(""); // Track the active menu item

  const handleMenuToggle = (menu) => {
    setExpandedMenu((prev) => (prev === menu ? "" : menu)); // Toggle the menu
  };

  const handleMenuItemClick = (item, path) => {
    setActiveItem(item); // Set the active item
    router.push(path); // Navigate to the corresponding path
  };

  useEffect(() => {
    const path = router.pathname;
    const menuItems = {
      "/post/projectDetails": { menu: "projects", item: "allProjects" },
      "/post/myProjects": { menu: "projects", item: "myProjects" },
      "/post/tasks": { menu: "projects", item: "tasks" },
      "/post/directProjectDetails/stakeholder": { menu: "projects", item: "stakeholders" },
      "/post/timecard": { menu: "projects", item: "timecard" },
      "/post/directProjectDetails/requirements": { menu: "projects", item: "requirements" },
      "/post/directProjectDetails/raid": { menu: "projects", item: "radi" },
    };

    if (menuItems[path]) {
      setExpandedMenu(menuItems[path].menu); // Expand the menu
      setActiveItem(menuItems[path].item); // Highlight the item
    }
  }, [router.pathname]);


  // Update selected state based on the current route
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (url.includes("/dashboard")) {
        setSelected("dashboard");
      } else if (url.includes("/OnlyTask")) {
        setSelected("notifications");
      } else if (url.includes("/userManagement")) {
        setSelected("agent");
      } else if (url.includes("/settings")) {
        setSelected("settings");
      } else if (url.includes("/projectDetails")) {
        setSelected("project");
      } else if (url.includes("/projects")) {
        setSelected("project");
      } else {
        setSelected("");
      }
    };

    // Initialize selected state based on the current path
    handleRouteChange(router.pathname);

    // Listen to route changes and update selected state
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.name) {
      setUserName(session.user.name);
      setOrgName(session.user.organizationName);
      setAccountId(session.user.accountId);
      sessionStorage.setItem("role", session.user.role);
      sessionStorage.setItem("accountId", session.user.accountId);
      sessionStorage.setItem("email", session.user.email);
      sessionStorage.setItem(
        "expireTime",
        new Date(session.expires).toString()
      );
    }
  }, [session, status]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleInviteAgent = () => {
    setOpenInviteUser(true);
  };

  const handleClose = () => {
    setAgentName("");
    setAgentEmail("");
    setOpenInviteUser(false);
  };

  const handleAddAgent = async () => {
    if (!agentName || !agentEmail) {
      setSnackbarMessage("Please fill all the required fields");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);
    const portNumber = window.location.port;
    const hostname = window.location.hostname;
    const extractedSubdomain = hostname.split(".")[0];

    try {
      const response = await fetch("/api/auth/addAgent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName,
          agentEmail,
          accountId,
          orgName,
          subdomain: extractedSubdomain,
          portNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage;
        switch (response.status) {
          case 409:
            errorMessage = data.errors
              ? Object.values(data.errors).join(", ")
              : data.error;
            break;
          case 404:
            errorMessage = data.error;
            break;
          default:
            errorMessage = "Failed to create account";
            break;
        }
        throw new Error(errorMessage);
      }

      setSnackbarMessage("Account created successfully!");
      setSnackbarSeverity("success");
      setAgentName("");
      setAgentEmail("");
      setOpen(false);
    } catch (error) {
      console.error("Error:", error.message);
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
    } finally {
      setIsLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleProjectMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProjectMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (viewName) => {
    if (viewName === "dashboard") {
      router.push("/post/dashboard");
    } else if (viewName === "notifications") {
      router.push("/post/OnlyTask/projectDetails");
    } else if (viewName === "agent") {
      router.push("/post/userManagement");
    } else if (viewName === "settings") {
      router.push("/post/settings/drawer"); //drawer.js
    } else if (viewName === "project") {
      router.push("/post/projectDetails");
    } else if (viewName === "requirements") {
      router.push("/post/directProjectDetails/requirements");
    } else if (viewName === "stakeholders") {
      router.push("/post/directProjectDetails/stakeholder");
    } else if (viewName === "radi") {
      router.push("/post/directProjectDetails/raid");
    }
  };

  const handleSignOut = async () => {
    setShowAnimation(true);
    const hostname = window.location.hostname;
    const portNumber = window.location.port;
    const redirectUrl =
      process.env.NODE_ENV === "development"
        ? `http://${hostname}:${portNumber}/login`
        : `https://${hostname}/login`;

    sessionStorage.removeItem("accountId");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("activeView");
    sessionStorage.removeItem("expireTime");
    setTimeout(async () => {
      await signOut({ redirect: false });
      router.push(redirectUrl);
    }, 2000);
  };

  const getInitials = (name) => {
    const nameArray = name.trim().split(" ");
    if (nameArray.length === 1) return nameArray[0].charAt(0).toUpperCase();
    return (
      nameArray[0].charAt(0).toUpperCase() +
      nameArray[nameArray.length - 1].charAt(0).toUpperCase()
    );
  };

  const fetchWorkspaces = async () => {
    setLoading(true);
    const accountId = sessionStorage.getItem("accountId");
    if (!accountId) {
      console.error("No accountId found in sessionStorage");
      return;
    }
    try {
      const response = await axios.get(
        `/api/OnlyTaskApi/workSpace?accountId=${accountId}`
      ); // Replace with your API endpoint
      setWorkspaces(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceClick = () => {
    fetchWorkspaces();
  };

  // Function to handle navigation to projectDetails page with workspace ID
  const handleWorkspaceNameClick = (workspaceId) => {
    router.push(`/post/OnlyTask/workspace/${workspaceId}/projectList`);
  };

  if (showAnimation) {
    return <Animations />;
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  const handleMenuClick = (event, workspaceId) => {
    setAnchorEl(event.currentTarget); // Set the anchor element for the menu
    setSelectedWorkspace(workspaceId); // Track the workspace to be deleted
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close the menu
    setSelectedWorkspace(null); // Reset selected workspace
  };

  const handleDelete = () => {
    handleWorkspaceDelete(selectedWorkspace); // Call the delete function
    handleMenuClose(); // Close the menu after deletion
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar
          variant="dense"
          sx={{
            minHeight: 50,
            padding: "0px 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IconButton
            size="small"
            edge="start"
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, padding: "4px" }}
          >
            <MenuIcon sx={{ fontSize: 20, color: "#333333" }} />
          </IconButton>

          <Image
            src={plantoLogo}
            alt="Company Logo"
            style={{ width: "9%", maxWidth: "200px", height: "auto" }}
          />

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon sx={{ fontSize: 20, color: "#00264d" }} />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search with AI…"
                inputProps={{
                  "aria-label": "search",
                  style: { fontWeight: "bold" },
                }}
                sx={{
                  fontSize: 14,
                  padding: "0px 5px",
                  color: "#00264d",
                  "&::placeholder": {
                    fontWeight: "bold",
                    color: "#00264d",
                  },
                }}
              />
            </Search>
          </Box>

          <Tooltip title="Invite Agent" placement="bottom">
            <IconButton>
              <PersonAddAltOutlinedIcon
                onClick={handleInviteAgent}
                sx={{ width: 25, height: 25, mr: 0 }}
              ></PersonAddAltOutlinedIcon>
            </IconButton>
          </Tooltip>

          <Dialog open={openInviteUser} onClose={handleClose}>
            <DialogTitle
              sx={{
                bgcolor: "#00264d",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              Invite Agent
            </DialogTitle>
            <DialogContent sx={{ mt: 3 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                type="text"
                fullWidth
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
              />
              <TextField
                margin="dense"
                label="Email"
                type="email"
                fullWidth
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
              />
            </DialogContent>
            <DialogActions sx={{ justifyContent: "flex-end" }}>
              <Button
                onClick={handleClose}
                color="primary"
                variant="outlined"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddAgent}
                color="primary"
                variant="contained"
                sx={{ backgroundColor: "#0077b3" }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : "Add Agent"}
              </Button>
            </DialogActions>
          </Dialog>

          <Avatar
            sx={{ bgcolor: "#00264d", width: 45, height: 45, mr: 0, ml: 2 }}
          >
            {getInitials(userName)}
          </Avatar>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        open={open}
        sx={{ "& .MuiDrawer-paper": { backgroundColor: "#00264d" } }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>

        {/* Use Box to create a flexible layout */}
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Top part of the Drawer */}
          <List>
            <Tooltip title="Dashboard" placement="right" arrow>
              <ListItem
                button
                onClick={() => handleNavigation("dashboard")}
                sx={{
                  bgcolor: selected === "dashboard" ? "#1976d2" : "transparent",
                  "&:hover": {
                    bgcolor: selected != "dashboard" ? "#ffffff33" : "#1976d2",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboard"
                  sx={{ color: "#ffffff", ml: -2 }}
                />
              </ListItem>
            </Tooltip>

            <List>
              {/* Parent Item for Projects */}
              <Tooltip title="Projects" placement="right" arrow>
                <ListItem
                  button
                  onClick={() => handleMenuToggle("projects")} // Toggle expansion
                  sx={{
                    bgcolor: expandedMenu === "projects" ? "#1976d2" : "transparent",
                    "&:hover": {
                      bgcolor: expandedMenu !== "projects" ? "#ffffff33" : "#1976d2",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#ffffff" }}>
                    <CheckCircleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Projects"
                    sx={{ color: "#ffffff", ml: -2 }}
                  />
                  <Tooltip title="Create Project" placement="right">
                    <IconButton
                      sx={{ color: "#ffffff" }}
                      onClick={() => setModalOpen(true)} // Handle opening the modal for creating a new project
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              </Tooltip>

              {/* Child Items for Projects */}
              {expandedMenu === "projects" && (
                <Box
                  sx={{
                    pl: 4,
                    maxHeight: "200px", // Set max height for scrolling
                    overflowY: "auto", // Enable vertical scrolling
                    scrollbarWidth: "thin", // Firefox-specific styling for scrollbar
                    "&::-webkit-scrollbar": {
                      width: "8px", // Custom scrollbar width for WebKit browsers
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "#0d1a33", // Track color
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#737e8c", // Thumb color
                      borderRadius: "10px", // Rounded scrollbar
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      backgroundColor: "#8c96a3", // Hover color
                    },
                  }}
                >
                  {[
                    { label: "All Projects", id: "allProjects", path: "/post/projectDetails" },
                    { label: "My Projects", id: "myProjects", path: "/post/myProjects" },
                    { label: "Tasks", id: "tasks", path: "/post/tasks" },
                    { label: "Stakeholders", id: "stakeholders", path: "/post/directProjectDetails/stakeholder" },
                    { label: "Timecard", id: "timecard", path: "/post/timecard" },
                    { label: "Requirements", id: "requirements", path: "/post/directProjectDetails/requirements" },
                    { label: "Radi", id: "radi", path: "/post/directProjectDetails/raid" },
                  ].map((item) => (
                    <ListItem
                      button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id, item.path)} // Handle item click
                      sx={{
                        bgcolor: activeItem === item.id ? "#1565c0" : "transparent",
                        "&:hover": {
                          bgcolor: activeItem !== item.id ? "#ffffff33" : "#1565c0",
                        },
                      }}
                    >
                      <ListItemText
                        primary={item.label}
                        sx={{ color: "#ffffff" }}
                      />
                    </ListItem>
                  ))}
                </Box>
              )}
            </List>


            {/* <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProjectMenuClose}
            >
              <MenuItem onClick={() => handleNavigation("project")}>
                All Projects
              </MenuItem>
              <MenuItem onClick={() => setModalOpen(true)}>
                My Projects
                <IconButton>
                  <AddIcon />
                </IconButton>
              </MenuItem>
            </Menu> */}

            <Tooltip title="User Management" placement="right" arrow>
              <ListItem
                button
                onClick={() => handleNavigation("agent")}
                sx={{
                  bgcolor: selected === "agent" ? "#1976d2" : "transparent",
                  "&:hover": {
                    bgcolor: selected != "agent" ? "#ffffff33" : "#1976d2",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <GroupAddIcon />
                </ListItemIcon>
                <ListItemText
                  primary="User Management"
                  sx={{ color: "#ffffff", ml: -2 }}
                />
              </ListItem>
            </Tooltip>

            {/* <Tooltip title="Task" placement="right" arrow>
              <ListItem
                button
                onClick={() => handleNavigation("notifications")}
                sx={{
                  bgcolor:
                    selected === "notifications" ? "#1976d2" : "transparent",
                  "&:hover": {
                    bgcolor:
                      selected != "notifications" ? "#ffffff33" : "#1976d2",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Task"
                  sx={{ color: "#ffffff", ml: -2 }}
                />
              </ListItem>
            </Tooltip> */}

            {/* Workspace Button */}
            <Tooltip
              title="Workspace"
              placement="right"
              arrow
              style={{
                display: "flex",
                backgroundColor:
                  selected === "workspace" ? "#1976d2" : "transparent",
                "&:hover": {
                  backgroundColor:
                    selected != "workspace" ? "#ffffff33" : "#1976d2",
                },
              }}
            >
              <ListItem
                button
                onClick={() => {
                  handleWorkspaceClick(); // Fetch the workspaces
                  // handleDrawerToggle(); // Toggle the drawer
                }}
                sx={{
                  "&:hover": {
                    bgcolor: selected != "workspace" ? "#ffffff33" : "#1976d2",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <WorkspacesIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Workspace"
                  sx={{ color: "#ffffff", ml: -2 }}
                />
              </ListItem>
              {/* Add Icon Button for creating new Workspace */}
              <Tooltip title="Create Workspace" placement="right" arrow>
                <IconButton
                  onClick={() => {
                    setWorkspaceModalOpen(true);
                  }}
                >
                  <AddIcon sx={{ color: "#ffffff" }} />
                </IconButton>
              </Tooltip>
            </Tooltip>
            <Box
              sx={{
                maxHeight: "300px", // Set a fixed height for the scrollable area (adjust as needed)
                overflowY: "auto", // Enables vertical scrolling
                scrollbarWidth: "thin", // For Firefox to control scrollbar width
                "&::-webkit-scrollbar": {
                  width: "8px", // Custom scrollbar width for WebKit browsers (Chrome, Safari)
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#0d1a33", // Dark blue background for the scrollbar track (similar to the image)
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#737e8c", // Grey color for the scrollbar thumb (similar to the image)
                  borderRadius: "10px", // Rounded scrollbar
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#8c96a3", // Slightly lighter grey when hovered
                },
              }}
            >
              {loading ? (
                <ListItem>
                  <CircularProgress
                    color="inherit"
                    size={24}
                    sx={{ ml: 2, color: "white" }}
                  />
                </ListItem>
              ) : (
                workspaces.map((workspace) => (
                  <Box
                    key={workspace._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      "&:hover .workspace-menu-icon": {
                        // Show icon on hover
                        opacity: 1,
                      },
                    }}
                  >
                    <ListItem
                      button
                      onClick={() => handleWorkspaceNameClick(workspace._id)}
                    >
                      <ListItemText
                        primary={workspace.name}
                        sx={{ color: "#ffffff" }}
                      />
                    </ListItem>
                    <IconButton
                      className="workspace-menu-icon"
                      sx={{
                        opacity: 0, // Hide icon by default
                        transition: "opacity 0.3s", // Smooth transition on hover
                      }}
                      onClick={(e) => handleMenuClick(e, workspace._id)} // Open menu on click
                    >
                      <MoreVertIcon sx={{ color: "#ffffff" }} />
                    </IconButton>
                  </Box>
                ))
              )}

              {/* Menu for delete option */}
              {/* <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu> */}
            </Box>
          </List>

          {/* Bottom part of the Drawer */}
          <Box sx={{ mt: "auto" }}>
            <Divider
              sx={{ backgroundColor: "#ffffff", height: "1px", ml: 0.7, mr: 1 }}
            />

            <Tooltip title="Settings" placement="right">
              <ListItem
                onClick={() => handleNavigation("settings")}
                button
                sx={{
                  bgcolor: selected === "settings" ? "#1976d2" : "transparent",
                  "&:hover": {
                    bgcolor: selected != "settings" ? "#ffffff33" : "#1976d2",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  sx={{ color: "#ffffff", ml: -2 }}
                />
              </ListItem>
            </Tooltip>

            <Tooltip title="Log Out" placement="right">
              <ListItem
                button
                onClick={() => setSignOutModalOpen(true)}
                sx={{
                  bgcolor: selected === "logout" ? "#1976d2" : "transparent",
                  "&:hover": {
                    bgcolor: selected != "logout" ? "#ffffff33" : "#1976d2",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#ffffff" }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Log out"
                  sx={{ color: "#ffffff", ml: -2 }}
                />
              </ListItem>
            </Tooltip>
          </Box>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>

      <Modal
        open={signOutModalOpen}
        onClose={() => setSignOutModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={signOutModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "30%",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 10,
            }}
          >
            <Typography variant="h6" component="h2">
              Confirm Sign Out
            </Typography>
            <Typography sx={{ mt: 2, mb: 2.5 }}>
              Are you sure you want to sign out?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "right" }}>
              <Button
                sx={{ mr: 1 }}
                onClick={() => setSignOutModalOpen(false)}
                variant="outlined"
                color="primary"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSignOut}
                variant="contained"
                color="primary"
              >
                Sign Out
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          variant="filled"
          severity={snackbarSeverity}
          onClose={handleSnackbarClose}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Project Modal */}
      <ProjectPage open={modalOpen} handleClose={() => setModalOpen(false)} />
      <WorkspaceForm
        open={workspacMmodalOpen}
        handleClose={() => setWorkspaceModalOpen(false)}
      />
    </Box>
  );
}
