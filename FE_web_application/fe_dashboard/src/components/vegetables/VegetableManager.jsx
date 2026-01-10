import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { vegetableAPI } from "../../services/api";
import { useApi } from "../../hooks/useApi";

const VegetableManager = () => {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [priceHistoryOpen, setPriceHistoryOpen] = useState(false);
  const [editingVegetable, setEditingVegetable] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedVegetable, setSelectedVegetable] = useState(null);

  const [vegetableForm, setVegetableForm] = useState({
    name: "",
    category: "",
    price: "",
    unit: "",
    description: "",
    nutritionalInfo: "",
    seasonality: "",
    storageInstructions: "",
  });

  useEffect(() => {
    loadVegetables();
  }, []);

  const loadVegetables = async () => {
    try {
      setLoading(true);
      const response = await vegetableAPI.getAll();
      setVegetables(response.data.data || response.data);
    } catch (error) {
      console.error("Error loading vegetables:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPriceHistory = async (vegetableId) => {
    try {
      const response = await vegetableAPI.getPriceHistory(vegetableId);
      setPriceHistory(response.data);
    } catch (error) {
      console.error("Error loading price history:", error);
    }
  };

  const handleCreateVegetable = async () => {
    try {
      await vegetableAPI.create({
        ...vegetableForm,
        price: parseFloat(vegetableForm.price),
      });
      setDialogOpen(false);
      resetForm();
      loadVegetables();
    } catch (error) {
      console.error("Error creating vegetable:", error);
    }
  };

  const handleUpdateVegetable = async () => {
    try {
      await vegetableAPI.update(editingVegetable.id, {
        ...vegetableForm,
        price: parseFloat(vegetableForm.price),
      });
      setDialogOpen(false);
      setEditingVegetable(null);
      resetForm();
      loadVegetables();
    } catch (error) {
      console.error("Error updating vegetable:", error);
    }
  };

  const handleDeleteVegetable = async (vegetableId) => {
    if (window.confirm("Are you sure you want to delete this vegetable?")) {
      try {
        await vegetableAPI.delete(vegetableId);
        loadVegetables();
      } catch (error) {
        console.error("Error deleting vegetable:", error);
      }
    }
  };

  const openDialog = (vegetable = null) => {
    if (vegetable) {
      setEditingVegetable(vegetable);
      setVegetableForm({
        name: vegetable.name || "",
        category: vegetable.category || "",
        price: vegetable.price?.toString() || "",
        unit: vegetable.unit || "",
        description: vegetable.description || "",
        nutritionalInfo: vegetable.nutritionalInfo || "",
        seasonality: vegetable.seasonality || "",
        storageInstructions: vegetable.storageInstructions || "",
      });
    } else {
      setEditingVegetable(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const openPriceHistory = async (vegetable) => {
    setSelectedVegetable(vegetable);
    await loadPriceHistory(vegetable.id);
    setPriceHistoryOpen(true);
  };

  const resetForm = () => {
    setVegetableForm({
      name: "",
      category: "",
      price: "",
      unit: "",
      description: "",
      nutritionalInfo: "",
      seasonality: "",
      storageInstructions: "",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Vegetable Management
      </Typography>

      {/* Header Actions */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6">
          Total Vegetables: {vegetables.length}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openDialog()}
        >
          Add Vegetable
        </Button>
      </Box>

      {/* Vegetables Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : vegetables.length === 0 ? (
            <Alert severity="info">
              No vegetables found. Click "Add Vegetable" to create your first
              vegetable.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Seasonality</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vegetables.map((vegetable) => (
                    <TableRow key={vegetable.id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {vegetable.name}
                        </Typography>
                        {vegetable.description && (
                          <Typography variant="caption" color="text.secondary">
                            {vegetable.description.substring(0, 50)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vegetable.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {formatPrice(vegetable.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>{vegetable.unit}</TableCell>
                      <TableCell>
                        {vegetable.seasonality && (
                          <Chip
                            label={vegetable.seasonality}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={vegetable.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={vegetable.isActive ? "success" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => openPriceHistory(vegetable)}
                          title="Price History"
                        >
                          <TrendingUpIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDialog(vegetable)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteVegetable(vegetable.id)}
                          title="Delete"
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
          )}
        </CardContent>
      </Card>

      {/* Vegetable Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingVegetable ? "Edit Vegetable" : "Add New Vegetable"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={vegetableForm.name}
                onChange={(e) =>
                  setVegetableForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={vegetableForm.category}
                onChange={(e) =>
                  setVegetableForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={vegetableForm.price}
                onChange={(e) =>
                  setVegetableForm((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit"
                value={vegetableForm.unit}
                onChange={(e) =>
                  setVegetableForm((prev) => ({
                    ...prev,
                    unit: e.target.value,
                  }))
                }
                placeholder="kg, piece, bunch"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={vegetableForm.description}
                onChange={(e) =>
                  setVegetableForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Seasonality"
                value={vegetableForm.seasonality}
                onChange={(e) =>
                  setVegetableForm((prev) => ({
                    ...prev,
                    seasonality: e.target.value,
                  }))
                }
                placeholder="Spring, Summer, Fall, Winter"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nutritional Info"
                value={vegetableForm.nutritionalInfo}
                onChange={(e) =>
                  setVegetableForm((prev) => ({
                    ...prev,
                    nutritionalInfo: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Storage Instructions"
                multiline
                rows={2}
                value={vegetableForm.storageInstructions}
                onChange={(e) =>
                  setVegetableForm((prev) => ({
                    ...prev,
                    storageInstructions: e.target.value,
                  }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={
              editingVegetable ? handleUpdateVegetable : handleCreateVegetable
            }
            variant="contained"
          >
            {editingVegetable ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price History Dialog */}
      <Dialog
        open={priceHistoryOpen}
        onClose={() => setPriceHistoryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Price History - {selectedVegetable?.name}</DialogTitle>
        <DialogContent>
          {priceHistory.length === 0 ? (
            <Alert severity="info">
              No price history available for this vegetable.
            </Alert>
          ) : (
            <Box sx={{ width: "100%", height: 300, mt: 2 }}>
              <ResponsiveContainer>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis tickFormatter={(value) => formatPrice(value)} />
                  <Tooltip
                    labelFormatter={formatDate}
                    formatter={(value) => [formatPrice(value), "Price"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceHistoryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VegetableManager;
