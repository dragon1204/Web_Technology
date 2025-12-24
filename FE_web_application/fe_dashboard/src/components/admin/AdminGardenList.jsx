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
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { gardenAPI, userAPI } from "../../services/api";

function GardenList() {
  const [gardens, setGardens] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentGarden, setCurrentGarden] = useState({
    id: "",
    name: "",
    location: "",
    area: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "ADMIN";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError("");

      const params = { page: 1, limit: 100 };
      const [gardenRes, userRes] = await Promise.all([
        gardenAPI.getAll(params),
        isAdmin ? userAPI.getAll(params) : Promise.resolve({ data: [] }),
      ]);
      const gardenItems =
        gardenRes.data?.data?.items || gardenRes.data?.data || gardenRes.data;
      const userItems =
        userRes.data?.data?.items || userRes.data?.data || userRes.data;

      setGardens(Array.isArray(gardenItems) ? gardenItems : []);
      setUsers(Array.isArray(userItems) ? userItems : []);
    } catch (error) {
      console.error("Fetch Error:", error.response?.data || error.message);
      setError(
        "Không thể tải dữ liệu: " +
          (error.response?.data?.message || "Lỗi hệ thống")
      );
      setGardens([]);
    }
  };

  const getOwnerInfo = (ownerId) => {
    if (!ownerId) return "N/A";
    const foundUser = users.find((u) => u.id === ownerId);
    return foundUser
      ? `${foundUser.name || foundUser.username} (${foundUser.email})`
      : `ID: ${ownerId}`;
  };

  const handleOpen = (garden = null) => {
    if (garden) {
      setEditMode(true);
      setCurrentGarden(garden);
    } else {
      setEditMode(false);
      setCurrentGarden({
        id: "",
        name: "",
        location: "",
        area: "",
        description: "",
      });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const gardenData = {
        ...currentGarden,
        area: parseFloat(currentGarden.area),
      };
      if (editMode) {
        (await gardenAPI.adminUpdate?.(currentGarden.id, gardenData)) ||
          (await gardenAPI.update?.(currentGarden.id, gardenData));
        setSuccess("Cập nhật vườn thành công");
      } else {
        await gardenAPI.create(gardenData);
        setSuccess("Tạo vườn thành công");
      }
      fetchData();
      setOpen(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa vườn này?")) {
      try {
        (await gardenAPI.adminDelete?.(id)) || (await gardenAPI.delete?.(id));
        setSuccess("Đã xóa vườn");
        fetchData();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError("Lỗi khi xóa");
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý vườn{" "}
          {isAdmin && (
            <Chip
              label="ADMIN MODE"
              color="error"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          THÊM VƯỜN
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

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell>
                <b>Tên vườn</b>
              </TableCell>
              <TableCell>
                <b>Vị trí</b>
              </TableCell>
              <TableCell>
                <b>Diện tích</b>
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <b>Chủ sở hữu</b>
                </TableCell>
              )}
              <TableCell align="right">
                <b>Hành động</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gardens.length > 0 ? (
              gardens.map((garden) => (
                <TableRow key={garden.id} hover>
                  <TableCell>
                    <Chip
                      label={garden.name}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{garden.location || "Chưa xác định"}</TableCell>
                  <TableCell>{garden.area || 0} m²</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PersonIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {getOwnerInfo(garden.ownerId || garden.userId)}
                        </Typography>
                      </Box>
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <Tooltip title="Sửa">
                      <IconButton
                        onClick={() => handleOpen(garden)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        onClick={() => handleDelete(garden.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  align="center"
                  sx={{ py: 3 }}
                >
                  Chưa có vườn nào được tìm thấy
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editMode ? "Sửa thông tin vườn" : "Thêm vườn mới"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Tên vườn"
            fullWidth
            value={currentGarden.name || ""}
            onChange={(e) =>
              setCurrentGarden({ ...currentGarden, name: e.target.value })
            }
            required
          />
          <TextField
            margin="dense"
            label="Vị trí"
            fullWidth
            value={currentGarden.location || ""}
            onChange={(e) =>
              setCurrentGarden({ ...currentGarden, location: e.target.value })
            }
            required
          />
          <TextField
            margin="dense"
            label="Diện tích (m²)"
            type="number"
            fullWidth
            value={currentGarden.area || ""}
            onChange={(e) =>
              setCurrentGarden({ ...currentGarden, area: e.target.value })
            }
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" color="success">
            {editMode ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GardenList;
