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
      setGardens(response.data);
    } catch (error) {
      setError("Failed to fetch gardens");
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
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Gardens Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Garden
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Area (m²)</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gardens.map((garden) => (
              <TableRow key={garden.id}>
                <TableCell>
                  <Chip
                    label={garden.name}
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{garden.location}</TableCell>
                <TableCell>{garden.area} m²</TableCell>
                <TableCell>{garden.description || "N/A"}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpen(garden)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(garden.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Garden" : "Add New Garden"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Garden Name"
            fullWidth
            value={currentGarden.name}
            onChange={(e) =>
              setCurrentGarden({ ...currentGarden, name: e.target.value })
            }
            required
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={currentGarden.location}
            onChange={(e) =>
              setCurrentGarden({ ...currentGarden, location: e.target.value })
            }
            required
          />
          <TextField
            margin="dense"
            label="Area (m²)"
            type="number"
            fullWidth
            value={currentGarden.area}
            onChange={(e) =>
              setCurrentGarden({ ...currentGarden, area: e.target.value })
            }
            required
          />
          <TextField
            margin="dense"
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GardenList;
