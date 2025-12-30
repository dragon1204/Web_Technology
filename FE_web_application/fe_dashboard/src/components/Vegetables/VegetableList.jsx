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
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  ShoppingCart as ImportIcon,
  Sell as SellIcon,
  AttachMoney as PriceIcon,
} from "@mui/icons-material";
import { vegetableAPI } from "../../services/api";

function VegetableList() {
  const [vegetables, setVegetables] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateType, setUpdateType] = useState(""); // 'price', 'import', 'sell'
  const [currentVegetable, setCurrentVegetable] = useState({
    id: "",
    name: "",
    price: "",
    quantity: "",
    unit: "",
  });
  const [updateValue, setUpdateValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchVegetables();
  }, []);

  const fetchVegetables = async () => {
    try {
      const response = await vegetableAPI.getAll();
      console.log("Vegetable API Response:", response);
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
      
      setVegetables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vegetables:", error);
      setError(error.response?.data?.message || "Failed to fetch vegetables");
      setVegetables([]); // Ensure vegetables is always an array
    }
  };

  const handleOpenCreate = () => {
    setCurrentVegetable({
      id: "",
      name: "",
      price: "",
      quantity: "",
      unit: "kg",
    });
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setError("");
  };

  const handleCreate = async () => {
    try {
      const vegData = {
        ...currentVegetable,
        price: parseFloat(currentVegetable.price),
        quantity: parseFloat(currentVegetable.quantity),
      };
      await vegetableAPI.create(vegData);
      setSuccess("Vegetable created successfully");
      fetchVegetables();
      handleCloseCreate();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed");
    }
  };

  const handleOpenUpdate = (vegetable, type) => {
    setCurrentVegetable(vegetable);
    setUpdateType(type);
    setUpdateValue("");
    setOpenUpdate(true);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setError("");
  };

  const handleUpdate = async () => {
    try {
      const value = parseFloat(updateValue);

      switch (updateType) {
        case "price":
          await vegetableAPI.updatePrice(currentVegetable.id, value);
          setSuccess("Price updated successfully");
          break;
        case "import":
          await vegetableAPI.updateImported(currentVegetable.id, value);
          setSuccess("Quantity imported successfully");
          break;
        case "sell":
          await vegetableAPI.updateSold(currentVegetable.id, value);
          setSuccess("Quantity sold successfully");
          break;
        default:
          break;
      }

      fetchVegetables();
      handleCloseUpdate();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed");
    }
  };

  const getUpdateDialogTitle = () => {
    switch (updateType) {
      case "price":
        return "Update Price";
      case "import":
        return "Import Stock";
      case "sell":
        return "Sell Stock";
      default:
        return "";
    }
  };

  const getUpdateDialogLabel = () => {
    switch (updateType) {
      case "price":
        return "New Price ($)";
      case "import":
        return `Quantity to Import (${currentVegetable.unit})`;
      case "sell":
        return `Quantity to Sell (${currentVegetable.unit})`;
      default:
        return "";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Vegetables Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          Add Vegetable
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
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vegetables.map((vegetable) => {
              // Calculate quantity from imported and sold (inventory = imported - sold)
              const quantity = vegetable.quantity ?? (vegetable.imported ?? 0) - (vegetable.sold ?? 0);
              const imported = vegetable.imported ?? 0;
              const sold = vegetable.sold ?? 0;
              
              return (
              <TableRow key={vegetable.id}>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {vegetable.name}
                  </Typography>
                </TableCell>
                <TableCell>${vegetable.price?.toFixed(2) || "0.00"}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{quantity}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      (Imported: {imported}, Sold: {sold})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{vegetable.unit || "kg"}</TableCell>
                <TableCell>
                  <Chip
                    label={quantity > 10 ? "In Stock" : "Low Stock"}
                    color={quantity > 10 ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenUpdate(vegetable, "price")}
                    color="primary"
                    size="small"
                    title="Update Price"
                  >
                    <PriceIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenUpdate(vegetable, "import")}
                    color="success"
                    size="small"
                    title="Import Stock"
                  >
                    <ImportIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenUpdate(vegetable, "sell")}
                    color="warning"
                    size="small"
                    title="Sell Stock"
                  >
                    <SellIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog
        open={openCreate}
        onClose={handleCloseCreate}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Vegetable</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Vegetable Name"
            fullWidth
            value={currentVegetable.name}
            onChange={(e) =>
              setCurrentVegetable({ ...currentVegetable, name: e.target.value })
            }
            required
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Price ($)"
                type="number"
                fullWidth
                value={currentVegetable.price}
                onChange={(e) =>
                  setCurrentVegetable({
                    ...currentVegetable,
                    price: e.target.value,
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Initial Quantity"
                type="number"
                fullWidth
                value={currentVegetable.quantity}
                onChange={(e) =>
                  setCurrentVegetable({
                    ...currentVegetable,
                    quantity: e.target.value,
                  })
                }
                required
              />
            </Grid>
          </Grid>
          <TextField
            margin="dense"
            label="Unit"
            fullWidth
            value={currentVegetable.unit}
            onChange={(e) =>
              setCurrentVegetable({ ...currentVegetable, unit: e.target.value })
            }
            placeholder="kg, lb, piece, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Dialog */}
      <Dialog
        open={openUpdate}
        onClose={handleCloseUpdate}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{getUpdateDialogTitle()}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {currentVegetable.name}
          </Typography>
          {updateType === "price" && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Current Price: ${currentVegetable.price?.toFixed(2)}
            </Typography>
          )}
          {(updateType === "import" || updateType === "sell") && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Current Stock: {currentVegetable.quantity ?? ((currentVegetable.imported ?? 0) - (currentVegetable.sold ?? 0))} {currentVegetable.unit || "kg"}
              <br />
              <Typography variant="caption" color="textSecondary">
                (Imported: {currentVegetable.imported ?? 0}, Sold: {currentVegetable.sold ?? 0})
              </Typography>
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={getUpdateDialogLabel()}
            type="number"
            fullWidth
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdate}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VegetableList;
