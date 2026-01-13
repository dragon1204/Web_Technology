import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Chip,
  Collapse,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Yard as YardIcon,
  Grass as GrassIcon,
  Logout as LogoutIcon,
  AttachMoney as MoneyIcon,
  AccountCircle as AccountIcon,
  Security as SecurityIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { authAPI, gardenAPI } from "../services/api";
import toast from "react-hot-toast";

const drawerWidth = 240;

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [gardens, setGardens] = useState([]);
  const [gardensExpanded, setGardensExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchGardens();
  }, []);

  const fetchGardens = async () => {
    try {
      const response = await gardenAPI.getAll();
      const data = response.data?.data?.items || response.data?.items || response.data?.data || response.data || [];
      setGardens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching gardens:", error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  const handleSelectGarden = (garden) => {
    // Điều hướng đến dashboard của garden
    navigate(`/gardens/${garden.id}`);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Users", icon: <PeopleIcon />, path: "/users" },
    { text: "Gardens", icon: <YardIcon />, path: "/gardens" },
    { text: "Shop Products", icon: <StoreIcon />, path: "/shop-products" },
    { text: "Revenue", icon: <MoneyIcon />, path: "/revenue" },
    { text: "Notifications", icon: <DashboardIcon />, path: "/notifications" },
    { text: "Alerts", icon: <DashboardIcon />, path: "/alerts" },
  ];

  const customerMenuItems = [
    { text: "Danh sách Shop", icon: <StoreIcon />, path: "/customer/shops" },
    { text: "Sản phẩm", icon: <InventoryIcon />, path: "/customer/products" },
    { text: "Giỏ hàng", icon: <ShoppingCartIcon />, path: "/customer/cart" },
    { text: "Lịch sử đơn hàng", icon: <HistoryIcon />, path: "/customer/orders" },
  ];

  const bottomMenuItems = [
    { text: "Account", icon: <AccountIcon />, path: "/account" },
    { text: "Security", icon: <SecurityIcon />, path: "/security" },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Garden IOT
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemText 
            primary="Customer" 
            primaryTypographyProps={{
              variant: "subtitle2",
              sx: { 
                fontWeight: 600, 
                color: "primary.main",
                px: 2,
                py: 1
              }
            }}
          />
        </ListItem>
        {customerMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={
                location.pathname === item.path ||
                (item.path === "/customer/products" && location.pathname.startsWith("/customer/products")) ||
                (item.path === "/customer/orders" && location.pathname.startsWith("/customer/orders"))
              }
              onClick={() => navigate(item.path)}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
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
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Garden IOT Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
}

export default Layout;
