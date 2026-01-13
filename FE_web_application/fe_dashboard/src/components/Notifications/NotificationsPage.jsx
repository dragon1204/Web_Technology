import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Toolbar,
  Button,
  Stack,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  DoneAll as DoneAllIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { notificationAPI } from "../../services/api";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAll();
  }, [filter]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [listRes, countRes] = await Promise.all([
        notificationAPI.list(filter === "all" ? {} : { isRead: filter === "read" }),
        notificationAPI.unreadCount(),
      ]);
      
      // Handle pagination response structure: 
      // Axios response: response.data = { HttpCode, success, data: { items: [...], total, page, ... } }
      // So we need: response.data.data.items
      const data = listRes.data?.data?.items || listRes.data?.items || listRes.data?.data || listRes.data || [];
      setNotifications(Array.isArray(data) ? data : []);
      
      // Handle unread count response structure
      const count = countRes.data?.data?.count || countRes.data?.count || 0;
      setUnreadCount(count);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || "Failed to load notifications");
      setNotifications([]); // Ensure notifications is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setSuccess("Marked as read");
      fetchAll();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark read");
    }
  };

  const handleMarkAll = async () => {
    try {
      await notificationAPI.markAllRead();
      setSuccess("All notifications marked as read");
      fetchAll();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to mark all as read");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await notificationAPI.delete(id);
      setSuccess("Deleted");
      fetchAll();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete");
    }
  };

  return (
    <Box>
      <Toolbar disableGutters sx={{ mb: 2, justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 700 }}>Notifications</Typography>
          <Typography variant="body2" sx={{ color: "#e0e0e0" }}>
            Unread: {unreadCount}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="unread">Unread</MenuItem>
              <MenuItem value="read">Read</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAll}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAll}
          >
            Mark all read
          </Button>
        </Stack>
      </Toolbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((item) => (
                <TableRow key={item.id || item._id} hover>
                  <TableCell>{item.title || "(No title)"}</TableCell>
                  <TableCell>{item.message || item.content || ""}</TableCell>
                  <TableCell>
                    <Chip label={item.type || "info"} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={item.isRead ? "default" : "primary"}
                      label={item.isRead ? "Read" : "Unread"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell align="right">
                    {!item.isRead && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleMarkRead(item.id || item._id)}
                        title="Mark as read"
                      >
                        <CheckIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.id || item._id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!notifications.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No notifications
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default NotificationsPage;
