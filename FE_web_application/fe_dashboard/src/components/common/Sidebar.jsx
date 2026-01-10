import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Chip,
  Avatar,
  Collapse,
} from "@mui/material";
import {
  Dashboard as DashIcon,
  People as PeopleIcon,
  Yard as YardIcon,
  Grass as GrassIcon,
  AttachMoney as MoneyIcon,
  ExitToApp as LogoutIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  Warning as AlertIcon,
  History as AuditIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import NotificationCenter from "../notifications/NotificationCenter";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    console.log("📋 Sidebar - Raw userData:", userData);

    if (userData && userData !== "undefined" && userData !== "null") {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("📋 Sidebar - Parsed user:", parsedUser);
        console.log("📋 Sidebar - Role:", parsedUser.role);
        setUser(parsedUser);
      } catch (error) {
        console.error("❌ Sidebar - Lỗi parse user:", error);
      }
    }
  }, [location]);

  const isAdmin = user?.role === "ADMIN";
  console.log("🔐 Sidebar - Is Admin:", isAdmin);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isAnalyticsPath = ["/analytics", "/revenue"].includes(
    location.pathname
  );
  const isManagementPath = [
    "/vegetable-manager",
    "/alerts",
    "/audit-logs",
  ].includes(location.pathname);

  return (
    <Box
      sx={{
        width: 250,
        height: "100vh",
        bgcolor: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            🌱
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Garden IOT
          </Typography>
          <NotificationCenter />
        </Box>

        {user && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              backdropFilter: "blur(10px)",
            }}
          >
            <Avatar
              sx={{
                width: 35,
                height: 35,
                bgcolor: "rgba(255,255,255,0.3)",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              {user.username?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.username}
              </Typography>
              <Chip
                label={user.role}
                size="small"
                sx={{
                  mt: 0.5,
                  height: 18,
                  fontSize: "0.65rem",
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "white",
                  fontWeight: 700,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 2, pt: 2, flex: 1 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            component={Link}
            to="/dashboard"
            selected={location.pathname === "/dashboard"}
            sx={{
              borderRadius: 2,
              color: location.pathname === "/dashboard" ? "white" : "#94a3b8",
              bgcolor:
                location.pathname === "/dashboard"
                  ? "rgba(102, 126, 234, 0.15)"
                  : "transparent",
              "&:hover": {
                bgcolor:
                  location.pathname === "/dashboard"
                    ? "rgba(102, 126, 234, 0.25)"
                    : "#1e293b",
              },
              "&.Mui-selected": {
                bgcolor: "rgba(102, 126, 234, 0.15)",
                borderLeft: "3px solid #667eea",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40, opacity: 0.9 }}>
              <DashIcon />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{
                fontWeight: location.pathname === "/dashboard" ? 600 : 400,
                fontSize: "0.95rem",
              }}
            />
          </ListItemButton>
        </ListItem>

        {isAdmin && (
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to="/users"
              selected={location.pathname === "/users"}
              sx={{
                borderRadius: 2,
                color: location.pathname === "/users" ? "white" : "#94a3b8",
                bgcolor:
                  location.pathname === "/users"
                    ? "rgba(239, 68, 68, 0.15)"
                    : "transparent",
                "&:hover": {
                  bgcolor:
                    location.pathname === "/users"
                      ? "rgba(239, 68, 68, 0.25)"
                      : "#1e293b",
                },
                "&.Mui-selected": {
                  bgcolor: "rgba(239, 68, 68, 0.15)",
                  borderLeft: "3px solid #ef4444",
                },
              }}
            >
              <ListItemIcon
                sx={{ color: "inherit", minWidth: 40, opacity: 0.9 }}
              >
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText
                primary="Users"
                primaryTypographyProps={{
                  fontWeight: location.pathname === "/users" ? 600 : 400,
                  fontSize: "0.95rem",
                }}
              />
              <Chip
                label="Admin"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  bgcolor: "rgba(239, 68, 68, 0.2)",
                  color: "#fca5a5",
                  fontWeight: 700,
                }}
              />
            </ListItemButton>
          </ListItem>
        )}

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            component={Link}
            to="/gardens"
            selected={location.pathname === "/gardens"}
            sx={{
              borderRadius: 2,
              color: location.pathname === "/gardens" ? "white" : "#94a3b8",
              bgcolor:
                location.pathname === "/gardens"
                  ? "rgba(16, 185, 129, 0.15)"
                  : "transparent",
              "&:hover": {
                bgcolor:
                  location.pathname === "/gardens"
                    ? "rgba(16, 185, 129, 0.25)"
                    : "#1e293b",
              },
              "&.Mui-selected": {
                bgcolor: "rgba(16, 185, 129, 0.15)",
                borderLeft: "3px solid #10b981",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40, opacity: 0.9 }}>
              <YardIcon />
            </ListItemIcon>
            <ListItemText
              primary="Gardens"
              primaryTypographyProps={{
                fontWeight: location.pathname === "/gardens" ? 600 : 400,
                fontSize: "0.95rem",
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            component={Link}
            to="/vegetables"
            selected={location.pathname === "/vegetables"}
            sx={{
              borderRadius: 2,
              color: location.pathname === "/vegetables" ? "white" : "#94a3b8",
              bgcolor:
                location.pathname === "/vegetables"
                  ? "rgba(34, 197, 94, 0.15)"
                  : "transparent",
              "&:hover": {
                bgcolor:
                  location.pathname === "/vegetables"
                    ? "rgba(34, 197, 94, 0.25)"
                    : "#1e293b",
              },
              "&.Mui-selected": {
                bgcolor: "rgba(34, 197, 94, 0.15)",
                borderLeft: "3px solid #22c55e",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40, opacity: 0.9 }}>
              <GrassIcon />
            </ListItemIcon>
            <ListItemText
              primary="Vegetables"
              primaryTypographyProps={{
                fontWeight: location.pathname === "/vegetables" ? 600 : 400,
                fontSize: "0.95rem",
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* Analytics Section */}
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton
            onClick={() => setAnalyticsOpen(!analyticsOpen)}
            sx={{
              borderRadius: 2,
              color: isAnalyticsPath ? "white" : "#94a3b8",
              bgcolor: isAnalyticsPath
                ? "rgba(59, 130, 246, 0.15)"
                : "transparent",
              "&:hover": {
                bgcolor: isAnalyticsPath
                  ? "rgba(59, 130, 246, 0.25)"
                  : "#1e293b",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40, opacity: 0.9 }}>
              <AnalyticsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Analytics"
              primaryTypographyProps={{
                fontWeight: isAnalyticsPath ? 600 : 400,
                fontSize: "0.95rem",
              }}
            />
            {analyticsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={analyticsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem disablePadding sx={{ pl: 4, mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to="/analytics"
                selected={location.pathname === "/analytics"}
                sx={{
                  borderRadius: 2,
                  color:
                    location.pathname === "/analytics" ? "white" : "#94a3b8",
                  bgcolor:
                    location.pathname === "/analytics"
                      ? "rgba(59, 130, 246, 0.15)"
                      : "transparent",
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 35 }}>
                  <TrendingUpIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Revenue Analytics"
                  primaryTypographyProps={{ fontSize: "0.85rem" }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ pl: 4, mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to="/revenue"
                selected={location.pathname === "/revenue"}
                sx={{
                  borderRadius: 2,
                  color: location.pathname === "/revenue" ? "white" : "#94a3b8",
                  bgcolor:
                    location.pathname === "/revenue"
                      ? "rgba(59, 130, 246, 0.15)"
                      : "transparent",
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 35 }}>
                  <MoneyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Revenue Reports"
                  primaryTypographyProps={{ fontSize: "0.85rem" }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>

        {/* Management Section */}
        {isAdmin && (
          <>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => setManagementOpen(!managementOpen)}
                sx={{
                  borderRadius: 2,
                  color: isManagementPath ? "white" : "#94a3b8",
                  bgcolor: isManagementPath
                    ? "rgba(168, 85, 247, 0.15)"
                    : "transparent",
                  "&:hover": {
                    bgcolor: isManagementPath
                      ? "rgba(168, 85, 247, 0.25)"
                      : "#1e293b",
                  },
                }}
              >
                <ListItemIcon
                  sx={{ color: "inherit", minWidth: 40, opacity: 0.9 }}
                >
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Management"
                  primaryTypographyProps={{
                    fontWeight: isManagementPath ? 600 : 400,
                    fontSize: "0.95rem",
                  }}
                />
                <Chip
                  label="Admin"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    bgcolor: "rgba(168, 85, 247, 0.2)",
                    color: "#c4b5fd",
                    fontWeight: 700,
                    mr: 1,
                  }}
                />
                {managementOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={managementOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding sx={{ pl: 4, mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to="/vegetable-manager"
                    selected={location.pathname === "/vegetable-manager"}
                    sx={{
                      borderRadius: 2,
                      color:
                        location.pathname === "/vegetable-manager"
                          ? "white"
                          : "#94a3b8",
                      bgcolor:
                        location.pathname === "/vegetable-manager"
                          ? "rgba(168, 85, 247, 0.15)"
                          : "transparent",
                      "&:hover": { bgcolor: "#1e293b" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 35 }}>
                      <InventoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Vegetable Manager"
                      primaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ pl: 4, mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to="/alerts"
                    selected={location.pathname === "/alerts"}
                    sx={{
                      borderRadius: 2,
                      color:
                        location.pathname === "/alerts" ? "white" : "#94a3b8",
                      bgcolor:
                        location.pathname === "/alerts"
                          ? "rgba(168, 85, 247, 0.15)"
                          : "transparent",
                      "&:hover": { bgcolor: "#1e293b" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 35 }}>
                      <AlertIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Alerts"
                      primaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding sx={{ pl: 4, mb: 0.5 }}>
                  <ListItemButton
                    component={Link}
                    to="/audit-logs"
                    selected={location.pathname === "/audit-logs"}
                    sx={{
                      borderRadius: 2,
                      color:
                        location.pathname === "/audit-logs"
                          ? "white"
                          : "#94a3b8",
                      bgcolor:
                        location.pathname === "/audit-logs"
                          ? "rgba(168, 85, 247, 0.15)"
                          : "transparent",
                      "&:hover": { bgcolor: "#1e293b" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 35 }}>
                      <AuditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Audit Logs"
                      primaryTypographyProps={{ fontSize: "0.85rem" }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>
          </>
        )}
      </List>

      {/* Logout */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: "#1e293b", mb: 2 }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: "#f87171",
            bgcolor: "rgba(239, 68, 68, 0.1)",
            "&:hover": {
              bgcolor: "rgba(239, 68, 68, 0.2)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontWeight: 600, fontSize: "0.95rem" }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default Sidebar;
