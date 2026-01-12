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
} from "@mui/icons-material";
import { gardenAPI } from "../../services/api";

function GardenList() {
  const [gardens, setGardens] = useState([]);
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
        location: "",
        area: "",
        description: "",
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
      const gardenData = {
        ...currentGarden,
        area: parseFloat(currentGarden.area),
      };

      if (editMode) {
        await gardenAPI.update(currentGarden.id, gardenData);
        setSuccess("Garden updated successfully");
      } else {
        await gardenAPI.create(gardenData);
        setSuccess("Garden created successfully");
      }
      fetchGardens();
      handleClose();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed");
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
              <TableCell>Location</TableCell>
              <TableCell>Area (m²)</TableCell>
              <TableCell>Description</TableCell>
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
                  <TableCell sx={{ color: "#f0f0f0" }}>
                    {garden.location || "N/A"}
                  </TableCell>
                  <TableCell sx={{ color: "#f0f0f0", fontWeight: 500 }}>
                    {garden.area || "N/A"} m²
                  </TableCell>
                  <TableCell sx={{ color: "#d0d0d0", maxWidth: 200 }}>
                    {garden.description || "N/A"}
                  </TableCell>
                  <TableCell align="right">
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
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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
          <TextField
            margin="normal"
            label="Location"
            fullWidth
            value={currentGarden.location}
            onChange={(e) =>
              setCurrentGarden({ ...currentGarden, location: e.target.value })
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
          <TextField
            margin="normal"
            label="Area (m²)"
            type="number"
            fullWidth
            value={currentGarden.area}
            onChange={(e) =>
              setCurrentGarden({ ...currentGarden, area: e.target.value })
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
          <TextField
            margin="normal"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={currentGarden.description}
            onChange={(e) =>
              setCurrentGarden({
                ...currentGarden,
                description: e.target.value,
              })
            }
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
    </Box>
  );
}

export default GardenList;
