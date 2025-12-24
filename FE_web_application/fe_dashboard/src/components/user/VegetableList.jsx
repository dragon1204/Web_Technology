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
  ShoppingCart as ImportIcon,
  Sell as SellIcon,
  AttachMoney as PriceIcon,
} from "@mui/icons-material";
import { vegetableAPI } from "../../services/api";

function VegetableList() {
  const [vegetables, setVegetables] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [updateType, setUpdateType] = useState("");
  const [currentVegetable, setCurrentVegetable] = useState({
    id: "",
    name: "",
    price: "",
    quantity: "",
    unit: "kg",
  });
  const [updateValue, setUpdateValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchVegetables();
  }, []);

  const fetchVegetables = async () => {
    try {
      const response = await vegetableAPI.getAll({ page: 1, limit: 100 });

      const resData = response.data?.data || response.data;
      const items = resData?.items || (Array.isArray(resData) ? resData : []);

      setVegetables(items);
    } catch (err) {
      console.error("Lỗi tải rau:", err);
      setError("Không thể tải danh sách rau. Lỗi hệ thống.");
    }
  };

  const handleCreate = async () => {
    try {
      const vegData = {
        ...currentVegetable,
        price: parseFloat(currentVegetable.price),
        quantity: parseFloat(currentVegetable.quantity),
      };
      await vegetableAPI.create(vegData);
      setSuccess("Đã thêm loại rau mới");
      fetchVegetables();
      setOpenCreate(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Lỗi khi thêm rau");
    }
  };

  const handleUpdate = async () => {
    try {
      const val = parseFloat(updateValue);
      if (updateType === "price")
        await vegetableAPI.updatePrice(currentVegetable.id, val);
      else if (updateType === "import")
        await vegetableAPI.updateImported(currentVegetable.id, val);
      else if (updateType === "sell")
        await vegetableAPI.updateSold(currentVegetable.id, val);

      setSuccess("Cập nhật thành công");
      fetchVegetables();
      setOpenUpdate(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Thất bại");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Quản lý rau củ</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          Thêm rau
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
              <TableCell>Tên rau</TableCell>
              <TableCell>Giá ($)</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(vegetables) && vegetables.length > 0 ? (
              vegetables.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <b>{v.name}</b>
                  </TableCell>
                  <TableCell>${v.price?.toFixed(2)}</TableCell>
                  <TableCell>
                    {v.quantity} {v.unit}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={v.quantity > 5 ? "Còn hàng" : "Sắp hết"}
                      color={v.quantity > 5 ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        setCurrentVegetable(v);
                        setUpdateType("price");
                        setUpdateValue("");
                        setOpenUpdate(true);
                      }}
                      color="primary"
                    >
                      <PriceIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setCurrentVegetable(v);
                        setUpdateType("import");
                        setUpdateValue("");
                        setOpenUpdate(true);
                      }}
                      color="success"
                    >
                      <ImportIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setCurrentVegetable(v);
                        setUpdateType("sell");
                        setUpdateValue("");
                        setOpenUpdate(true);
                      }}
                      color="warning"
                    >
                      <SellIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Chưa có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Thêm Rau */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Thêm loại rau mới</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Tên rau"
            fullWidth
            value={currentVegetable.name}
            onChange={(e) =>
              setCurrentVegetable({ ...currentVegetable, name: e.target.value })
            }
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Giá"
                type="number"
                fullWidth
                value={currentVegetable.price}
                onChange={(e) =>
                  setCurrentVegetable({
                    ...currentVegetable,
                    price: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                label="Số lượng"
                type="number"
                fullWidth
                value={currentVegetable.quantity}
                onChange={(e) =>
                  setCurrentVegetable({
                    ...currentVegetable,
                    quantity: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Hủy</Button>
          <Button onClick={handleCreate} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Cập nhật (Giá/Nhập/Bán) */}
      <Dialog
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{updateType.toUpperCase()}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>{currentVegetable.name}</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Số lượng/Giá mới"
            type="number"
            fullWidth
            value={updateValue}
            onChange={(e) => setUpdateValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdate(false)}>Hủy</Button>
          <Button onClick={handleUpdate} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VegetableList;
