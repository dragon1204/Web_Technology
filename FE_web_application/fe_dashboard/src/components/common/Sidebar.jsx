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
    // Lấy thông tin user từ localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("📋 Sidebar - User info:", parsedUser);
        console.log("📋 Sidebar - Role:", parsedUser.role);
      } catch (error) {
        console.error("Lỗi parse user data:", error);
      }
    }
  }, []);

  // Kiểm tra role - CHỈ ADMIN mới thấy tab Users
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Box sx={{ width: 250, height: "100vh", borderRight: "1px solid #ddd" }}>
      <Typography
        variant="h6"
        sx={{ p: 3, fontWeight: "bold", color: "#2e7d32" }}
      >
        Garden IOT
      </Typography>
      <Divider />

      <List>
        {/* Dashboard - TẤT CẢ USER đều thấy */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/dashboard"
            selected={location.pathname === "/dashboard"}
          >
            <ListItemIcon>
              <DashIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        {/* Users - CHỈ ADMIN mới thấy */}
        {isAdmin && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/users"
              selected={location.pathname === "/users"}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
          </ListItem>
        )}

        {/* Gardens - TẤT CẢ USER đều thấy */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/gardens"
            selected={location.pathname === "/gardens"}
          >
            <ListItemIcon>
              <YardIcon />
            </ListItemIcon>
            <ListItemText primary="Gardens" />
          </ListItemButton>
        </ListItem>

        {/* Vegetables - TẤT CẢ USER đều thấy */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/vegetables"
            selected={location.pathname === "/vegetables"}
          >
            <ListItemIcon>
              <GrassIcon />
            </ListItemIcon>
            <ListItemText primary="Vegetables" />
          </ListItemButton>
        </ListItem>

        {/* Revenue - TẤT CẢ USER đều thấy */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/revenue"
            selected={location.pathname === "/revenue"}
          >
            <ListItemIcon>
              <MoneyIcon />
            </ListItemIcon>
            <ListItemText primary="Revenue" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Debug info - xóa sau khi test xong */}
      {user && (
        <Box sx={{ p: 2, fontSize: 12, color: "gray" }}>
          <Typography variant="caption">Logged in as: {user.email}</Typography>
          <br />
          <Typography variant="caption">Role: {user.role}</Typography>
        </Box>
      )}
    </Box>
  );
}

export default Sidebar;
