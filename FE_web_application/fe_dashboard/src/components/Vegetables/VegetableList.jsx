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
  LocalFlorist as VegetableIcon,
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
          <VegetableIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#ffffff" }}>
            Vegetables Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          size="large"
          sx={{
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          ADD VEGETABLE
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
          backgroundColor: "#ffffff",
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#1a3a3a",
                "& th": {
                  backgroundColor: "#1a3a3a",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "16px",
                  border: "none",
                  padding: "16px",
                  letterSpacing: "0.5px",
                },
              }}
            >
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vegetables && vegetables.length > 0 ? (
              vegetables.map((vegetable) => {
                const quantity = vegetable.quantity ?? (vegetable.imported ?? 0) - (vegetable.sold ?? 0);
                const imported = vegetable.imported ?? 0;
                const sold = vegetable.sold ?? 0;
                
                return (
                  <TableRow
                    key={vegetable.id}
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
                    <TableCell sx={{ fontWeight: 600, color: "#212121", fontSize: "15px" }}>
                      {vegetable.name || "-"}
                    </TableCell>
                    <TableCell sx={{ color: "#212121", fontWeight: 600, fontSize: "15px" }}>
                      ${vegetable.price?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#212121", fontSize: "15px" }}>
                          {quantity}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#666666", fontSize: "12px" }}>
                          (Imported: {imported}, Sold: {sold})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "#212121", fontWeight: 500, fontSize: "15px" }}>
                      {vegetable.unit || "kg"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={quantity > 10 ? "In Stock" : "Low Stock"}
                        color={quantity > 10 ? "success" : "warning"}
                        variant="filled"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                        <IconButton
                          onClick={() => handleOpenUpdate(vegetable, "price")}
                          color="primary"
                          size="small"
                          title="Update Price"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(76, 190, 0, 0.08)",
                            },
                          }}
                        >
                          <PriceIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenUpdate(vegetable, "import")}
                          color="info"
                          size="small"
                          title="Import Stock"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(3, 155, 229, 0.08)",
                            },
                          }}
                        >
                          <ImportIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenUpdate(vegetable, "sell")}
                          color="success"
                          size="small"
                          title="Sell Stock"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.08)",
                            },
                          }}
                        >
                          <SellIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: "#666666", fontSize: "16px" }}>
                    No vegetables found. Create one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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
        <DialogTitle
          sx={{
            backgroundColor: "#1a3a3a",
            color: "white",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          Add New Vegetable
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            margin="normal"
            label="Vegetable Name"
            fullWidth
            value={currentVegetable.name}
            onChange={(e) =>
              setCurrentVegetable({ ...currentVegetable, name: e.target.value })
            }
            required
            variant="outlined"
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
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
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
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
                variant="outlined"
              />
            </Grid>
          </Grid>
          <TextField
            margin="normal"
            label="Unit"
            fullWidth
            value={currentVegetable.unit}
            onChange={(e) =>
              setCurrentVegetable({ ...currentVegetable, unit: e.target.value })
            }
            placeholder="kg, lb, piece, etc."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCreate} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            sx={{
              backgroundColor: "primary.main",
            }}
          >
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
        <DialogTitle
          sx={{
            backgroundColor: "#1a3a3a",
            color: "white",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          {getUpdateDialogTitle()}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
            {currentVegetable.name}
          </Typography>
          {updateType === "price" && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Current Price: <strong>${currentVegetable.price?.toFixed(2)}</strong>
            </Typography>
          )}
          {(updateType === "import" || updateType === "sell") && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Current Stock: <strong>{currentVegetable.quantity ?? ((currentVegetable.imported ?? 0) - (currentVegetable.sold ?? 0))} {currentVegetable.unit || "kg"}</strong>
              <br />
              <Typography variant="caption" sx={{ color: "#999" }}>
                (Imported: {currentVegetable.imported ?? 0}, Sold: {currentVegetable.sold ?? 0})
              </Typography>
            </Typography>
          )}
          <TextField
            autoFocus
            margin="normal"
            label={getUpdateDialogLabel()}
            type="number"
            fullWidth
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
            required
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseUpdate} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            sx={{
              backgroundColor: "primary.main",
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VegetableList;
