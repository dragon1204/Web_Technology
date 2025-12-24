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
} from "@mui/material";
import {
  Dashboard as DashIcon,
  People as PeopleIcon,
  Yard as YardIcon,
  Grass as GrassIcon,
  AttachMoney as MoneyIcon,
  ExitToApp as LogoutIcon,
} from "@mui/icons-material";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
      {/* Header với User Info */}
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

        <ListItem disablePadding sx={{ mb: 1 }}>
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
              "&:hover": {
                bgcolor:
                  location.pathname === "/revenue"
                    ? "rgba(59, 130, 246, 0.25)"
                    : "#1e293b",
              },
              "&.Mui-selected": {
                bgcolor: "rgba(59, 130, 246, 0.15)",
                borderLeft: "3px solid #3b82f6",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40, opacity: 0.9 }}>
              <MoneyIcon />
            </ListItemIcon>
            <ListItemText
              primary="Revenue"
              primaryTypographyProps={{
                fontWeight: location.pathname === "/revenue" ? 600 : 400,
                fontSize: "0.95rem",
              }}
            />
          </ListItemButton>
        </ListItem>
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
