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
  Alert,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { userAPI } from "../../services/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      const data = response.data?.data || response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setError("Không thể tải danh sách người dùng");
      setUsers([]);
    }
  };

  const handleOpen = (user = null) => {
    if (user) {
      setEditMode(true);
      setCurrentUser(user);
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
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        const { password, ...updateData } = currentUser;
        if (password) updateData.password = password;
        await userAPI.update(currentUser.id, updateData);
        setSuccess("Cập nhật thành công");
      } else {
        await userAPI.create(currentUser);
        setSuccess("Tạo người dùng thành công");
      }
      fetchUsers();
      handleClose();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await userAPI.delete(id);
        setSuccess("Xóa thành công");
        fetchUsers();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError("Lỗi khi xóa người dùng");
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Quản lý người dùng</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm người dùng
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {String(error)}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Quyền</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || user.username || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === "ADMIN" ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleOpen(user)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(user.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? "Sửa người dùng" : "Thêm người dùng mới"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Tên"
            fullWidth
            value={currentUser.name || ""}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={currentUser.email || ""}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, email: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Mật khẩu"
            type="password"
            fullWidth
            value={currentUser.password || ""}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, password: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Quyền"
            select
            fullWidth
            value={currentUser.role}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, role: e.target.value })
            }
            SelectProps={{ native: true }}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserList;
