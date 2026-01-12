import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PersonOutline as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { userAPI } from "../../services/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      const data =
        response.data?.data?.items ||
        response.data?.items ||
        response.data?.data ||
        response.data ||
        [];
      setUsers(Array.isArray(data) ? data : []);
      setFilteredUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar(
        error.response?.data?.message || "Không thể tải danh sách người dùng",
        "error"
      );
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = () => {
    const errors = {};

    if (!currentUser.name?.trim()) {
      errors.name = "Tên không được để trống";
    }

    if (!currentUser.email?.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentUser.email)) {
      errors.email = "Email không hợp lệ";
    }

    if (!editMode && !currentUser.password?.trim()) {
      errors.password = "Mật khẩu không được để trống";
    } else if (!editMode && currentUser.password?.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!currentUser.role) {
      errors.role = "Vui lòng chọn vai trò";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpen = (user = null) => {
    if (user) {
      setEditMode(true);
      setCurrentUser({
        ...user,
        password: "", // Don't populate password for edit
      });
    } else {
      setEditMode(false);
      setCurrentUser({
        id: "",
        name: "",
        email: "",
        password: "",
        role: "USER",
      });
    }
    setFormErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
      };

      // Only include password if creating new user or if password is provided during edit
      if (!editMode || currentUser.password) {
        payload.password = currentUser.password;
      }

      if (editMode) {
        await userAPI.update(currentUser.id, payload);
        showSnackbar("Cập nhật người dùng thành công", "success");
      } else {
        await userAPI.create(payload);
        showSnackbar("Tạo người dùng mới thành công", "success");
      }

      fetchUsers();
      handleClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Thao tác thất bại";
      showSnackbar(errorMessage, "error");
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await userAPI.delete(userToDelete.id);
      showSnackbar("Xóa người dùng thành công", "success");
      fetchUsers();
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "Không thể xóa người dùng",
        "error"
      );
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const getRoleColor = (role) => {
    return role === "ADMIN" ? "error" : "primary";
  };

  const getRoleIcon = (role) => {
    return role === "ADMIN" ? <AdminIcon /> : <PersonIcon />;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Section */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#2e7d32",
              mb: 0.5,
            }}
          >
            Quản Lý Người Dùng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý tài khoản và phân quyền người dùng trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            bgcolor: "#4cbe00",
            "&:hover": { bgcolor: "#3da300" },
            px: 3,
            py: 1.2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Thêm Người Dùng
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Card sx={{ flex: "1 1 200px", minWidth: 200 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom variant="body2">
              Tổng Người Dùng
            </Typography>
            <Typography variant="h4" sx={{ color: "#2e7d32", fontWeight: 700 }}>
              {users.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: "1 1 200px", minWidth: 200 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom variant="body2">
              Admin
            </Typography>
            <Typography variant="h4" sx={{ color: "#d32f2f", fontWeight: 700 }}>
              {users.filter((u) => u.role === "ADMIN").length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: "1 1 200px", minWidth: 200 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom variant="body2">
              User
            </Typography>
            <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: 700 }}>
              {users.filter((u) => u.role === "USER").length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#4cbe00",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#4cbe00",
              },
            },
          }}
        />
      </Paper>

      {/* Users Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#4cbe00" }} />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <PersonIcon sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? "Không tìm thấy người dùng" : "Chưa có người dùng nào"}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tên</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Vai Trò</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Thao Tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    "&:hover": { bgcolor: "#f9f9f9" },
                    transition: "background-color 0.2s",
                  }}
                >
                  <TableCell>#{user.id}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {getRoleIcon(user.role)}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.name || user.username || "N/A"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                      icon={getRoleIcon(user.role)}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        onClick={() => handleOpen(user)}
                        sx={{
                          color: "#1976d2",
                          "&:hover": { bgcolor: "#e3f2fd" },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        onClick={() => handleDeleteClick(user)}
                        sx={{
                          color: "#d32f2f",
                          "&:hover": { bgcolor: "#ffebee" },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#4cbe00",
            color: "white",
            fontWeight: 600,
            fontSize: "1.25rem",
          }}
        >
          {editMode ? "Chỉnh Sửa Người Dùng" : "Thêm Người Dùng Mới"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            label="Tên"
            fullWidth
            required
            value={currentUser.name}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, name: e.target.value })
            }
            error={!!formErrors.name}
            helperText={formErrors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            required
            value={currentUser.email}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, email: e.target.value })
            }
            error={!!formErrors.email}
            helperText={formErrors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={editMode ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
            type="password"
            fullWidth
            required={!editMode}
            value={currentUser.password}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, password: e.target.value })
            }
            error={!!formErrors.password}
            helperText={formErrors.password || (editMode ? "Chỉ nhập nếu muốn thay đổi mật khẩu" : "Tối thiểu 6 ký tự")}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Vai Trò"
            select
            fullWidth
            required
            value={currentUser.role}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, role: e.target.value })
            }
            error={!!formErrors.role}
            helperText={formErrors.role || "Chọn quyền truy cập cho người dùng"}
            sx={{ mb: 1 }}
          >
            <MenuItem value="USER">
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon fontSize="small" />
                <Typography>USER - Người dùng thường</Typography>
              </Stack>
            </MenuItem>
            <MenuItem value="ADMIN">
              <Stack direction="row" spacing={1} alignItems="center">
                <AdminIcon fontSize="small" />
                <Typography>ADMIN - Quản trị viên</Typography>
              </Stack>
            </MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "#757575",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: "#4cbe00",
              "&:hover": { bgcolor: "#3da300" },
              px: 3,
            }}
          >
            {editMode ? "Cập Nhật" : "Tạo Mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: "#d32f2f", fontWeight: 600 }}>
          Xác Nhận Xóa
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Hành động này không thể hoàn tác!
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng{" "}
            <strong>{userToDelete?.name || userToDelete?.email}</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleDeleteCancel}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ px: 3 }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default UserList;
