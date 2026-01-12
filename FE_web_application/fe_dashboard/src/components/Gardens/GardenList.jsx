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
  Grass as GrassIcon,
  Settings as SettingsIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";
import { gardenAPI } from "../../services/api";
import PairDeviceModal from "./PairDeviceModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function GardenList() {
  const navigate = useNavigate();
  const [gardens, setGardens] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentGarden, setCurrentGarden] = useState({
    id: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pairDialogOpen, setPairDialogOpen] = useState(false);
  const [pairingGardenId, setPairingGardenId] = useState(null);

  useEffect(() => {
    fetchGardens();
  }, []);

  const fetchGardens = async () => {
    try {
      const response = await gardenAPI.getAll();
      console.log("Garden API Response:", response);
      console.log("Response.data:", response.data);
      console.log("Response.data.data:", response.data?.data);
      console.log("Response.data.data.items:", response.data?.data?.items);

      // Handle pagination response structure: 
      // Axios response: response.data = { HttpCode, success, data: { items: [...], total, page, ... } }
      // So we need: response.data.data.items
      const data = response.data?.data?.items || response.data?.items || response.data?.data || response.data || [];
      console.log("Extracted data:", data);
      console.log("Is array?", Array.isArray(data));
      console.log("Data length:", Array.isArray(data) ? data.length : 0);

      setGardens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching gardens:", error);
      setError(error.response?.data?.message || "Failed to fetch gardens");
      setGardens([]); // Ensure gardens is always an array
    }
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
        const gardenData = {
          name: currentGarden.name,
        };
        await gardenAPI.update(currentGarden.id, gardenData);
        setSuccess("Garden updated successfully");
      } else {
        // Khi tạo mới, loại bỏ id và chỉ gửi các field cần thiết
        const gardenData = {
          name: currentGarden.name,
        };
        await gardenAPI.create(gardenData);
        setSuccess("Garden created successfully");
      }
      fetchGardens();
      handleClose();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving garden:", error);
      const errorMessage = error.response?.data?.message || error.message || "Operation failed";
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this garden?")) {
      try {
        await gardenAPI.delete(id);
        setSuccess("Garden deleted successfully");
        fetchGardens();
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        setError("Failed to delete garden");
      }
    }
  };

  const handleSelectGarden = (garden) => {
    // Điều hướng đến dashboard của garden
    navigate(`/gardens/${garden.id}`);
  };

  const handleAddDevice = (garden) => {
    setPairingGardenId(garden.id);
    setPairDialogOpen(true);
  };

  const handlePairSuccess = async (gardenId, deviceMac) => {
    try {
      // Refresh garden list để lấy deviceMac mới
      await fetchGardens();
      toast.success(`Đã thêm thiết bị ${deviceMac} vào garden thành công!`);
      setPairDialogOpen(false);

      // Tự động điều hướng đến dashboard của garden sau khi pair thành công
      navigate(`/gardens/${gardenId}`);
    } catch (error) {
      console.error("Error refreshing gardens:", error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 2,
          borderBottom: "2px solid",
          borderColor: "primary.main",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GrassIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#ffffff" }}>
            Gardens Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          size="large"
          sx={{
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          ADD GARDEN
        </Button>
      </Box>

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            backgroundColor: "#d4edda",
            color: "#155724",
          }}
        >
          {success}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            backgroundColor: "#f8d7da",
            color: "#721c24",
          }}
        >
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#1a3a3a",
                "& th": {
                  backgroundColor: "#1a3a3a",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  padding: "16px",
                },
              }}
            >
              <TableCell>Name</TableCell>
              <TableCell>Device MAC</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gardens && gardens.length > 0 ? (
              gardens.map((garden) => (
                <TableRow
                  key={garden.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                    "& td": {
                      padding: "16px",
                      borderBottom: "1px solid #e0e0e0",
                    },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={garden.name}
                      color="primary"
                      variant="filled"
                      sx={{
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {garden.deviceMac ? (
                      <Chip
                        label={garden.deviceMac}
                        color="success"
                        size="small"
                        sx={{
                          fontFamily: "monospace",
                        }}
                      />
                    ) : (
                      <Chip
                        label="Chưa có thiết bị"
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {garden.deviceMac ? (
                      <Tooltip title="Xem chi tiết và điều khiển">
                        <IconButton
                          onClick={() => handleSelectGarden(garden)}
                          color="primary"
                          size="small"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(76, 190, 0, 0.08)",
                            },
                          }}
                        >
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Thêm thiết bị">
                        <IconButton
                          onClick={() => handleAddDevice(garden)}
                          color="success"
                          size="small"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(76, 190, 0, 0.08)",
                            },
                          }}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit Garden">
                      <IconButton
                        onClick={() => handleOpen(garden)}
                        color="primary"
                        size="small"
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(76, 190, 0, 0.08)",
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Garden">
                      <IconButton
                        onClick={() => handleDelete(garden.id)}
                        color="error"
                        size="small"
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(220, 38, 38, 0.08)",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No gardens found. Create one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            backgroundColor: "#1a3a3a",
            color: "white",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          {editMode ? "Edit Garden" : "Add New Garden"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            margin="normal"
            label="Garden Name"
            fullWidth
            value={currentGarden.name}
            onChange={(e) =>
              setCurrentGarden({ ...currentGarden, name: e.target.value })
            }
            required
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              backgroundColor: "primary.main",
            }}
          >
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pair Device Modal */}
      <PairDeviceModal
        open={pairDialogOpen}
        onClose={() => {
          setPairDialogOpen(false);
          setPairingGardenId(null);
        }}
        gardenId={pairingGardenId}
        onPairSuccess={handlePairSuccess}
      />
    </Box>
  );
}

export default GardenList;
