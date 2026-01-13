import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Avatar,
  Alert,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import shopService from "../../services/shopService";
import { vegetableService } from "../../services/vegetableService";
import { gardenService } from "../../services/gardenService";
import toast from "react-hot-toast";
import "../../styles/ShopProductManagement.css";

function ShopProductManagement() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [availableVegetables, setAvailableVegetables] = useState([]);
  const [allVegetables, setAllVegetables] = useState([]); // Tất cả vegetables trong hệ thống
  const [userGardens, setUserGardens] = useState([]); // Danh sách gardens của user
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addProductTab, setAddProductTab] = useState(0); // 0: Chọn có sẵn, 1: Tạo mới
  const [creatingVegetable, setCreatingVegetable] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [filterAvailable, setFilterAvailable] = useState("all");
  const searchTimeoutRef = useRef(null);

  // Form data for add product
  const [addForm, setAddForm] = useState({
    vegetableId: "",
    gardenId: "",
    price: "",
    stock: "",
    isAvailable: true,
  });

  // Form data for creating new vegetable
  const [newVegetableForm, setNewVegetableForm] = useState({
    name: "",
    category: "",
    description: "",
    gardenId: "", // Garden để thêm rau vào
    quantity: "", // Số lượng trong garden
  });

  // Form data for edit product
  const [editForm, setEditForm] = useState({
    price: "",
    stock: "",
    isAvailable: true,
  });

  const fetchMyShops = useCallback(async () => {
    setLoading(true);
    try {
      const data = await shopService.getMyShops();
      setShops(data || []);
      if (data && data.length > 0) {
        setSelectedShop(data[0]);
      } else {
        toast.error("Bạn chưa có shop nào. Vui lòng tạo shop trước.");
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      toast.error(error.message || "Không thể tải danh sách shop");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyShops();
  }, [fetchMyShops]);

  const fetchShopProducts = useCallback(async () => {
    if (!selectedShop) return;

    setLoading(true);
    try {
      const filters = {
        search: debouncedSearchText || undefined,
        isAvailable: filterAvailable === "all" ? undefined : filterAvailable === "true",
      };

      const pagination = {
        page: page + 1,
        limit: rowsPerPage,
      };

      const response = await shopService.getShopProducts(
        selectedShop.id,
        filters,
        pagination
      );

      setProducts(response.data || []);
      setTotalProducts(response.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [selectedShop, page, rowsPerPage, debouncedSearchText, filterAvailable]);

  // Debounce search text
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setPage(0); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  useEffect(() => {
    if (selectedShop) {
      fetchShopProducts();
    }
  }, [selectedShop, fetchShopProducts]);

  const fetchAvailableVegetables = useCallback(async () => {
    if (!selectedShop) return;

    try {
      const data = await shopService.getAvailableVegetables(selectedShop.id);
      setAvailableVegetables(data || []);
    } catch (error) {
      console.error("Error fetching available vegetables:", error);
      toast.error(error.message || "Không thể tải danh sách rau");
    }
  }, [selectedShop]);

  // Lấy tất cả vegetables trong hệ thống
  const fetchAllVegetables = useCallback(async () => {
    try {
      const response = await vegetableService.getVegetables({ page: 1, limit: 1000 });
      const data = response?.data?.items || response?.data || response || [];
      setAllVegetables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching all vegetables:", error);
      setAllVegetables([]);
    }
  }, []);

  // Lấy danh sách gardens của user
  const fetchUserGardens = useCallback(async () => {
    try {
      const response = await gardenService.getGardens({ page: 1, limit: 100 });
      const data = response?.data?.items || response?.data || response || [];
      setUserGardens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching gardens:", error);
      setUserGardens([]);
    }
  }, []);

  const handleOpenAddDialog = useCallback(() => {
    if (selectedShop) {
      fetchAvailableVegetables();
      fetchAllVegetables();
      fetchUserGardens();
    }
    setOpenAddDialog(true);
  }, [selectedShop, fetchAvailableVegetables, fetchAllVegetables, fetchUserGardens]);

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setAddProductTab(0);
    setAddForm({
      vegetableId: "",
      gardenId: "",
      price: "",
      stock: "",
      isAvailable: true,
    });
    setNewVegetableForm({
      name: "",
      category: "",
      description: "",
      gardenId: "",
      quantity: "",
    });
  };

  const handleCreateVegetable = async () => {
    if (!newVegetableForm.name) {
      toast.error("Vui lòng nhập tên loại rau");
      return;
    }

    setCreatingVegetable(true);
    try {
      const vegetableData = {
        name: newVegetableForm.name,
        ...(newVegetableForm.category && { category: newVegetableForm.category }),
        ...(newVegetableForm.description && { description: newVegetableForm.description }),
      };

      const result = await vegetableService.createVegetable(vegetableData);
      // Xử lý nhiều cấu trúc response có thể có
      const newVegetableId =
        result?.data?.data?.id ||
        result?.data?.id ||
        result?.id ||
        result?.data?.data?.data?.id;
      
      if (newVegetableId) {
        toast.success("Tạo loại rau mới thành công!");
        // Refresh danh sách vegetables
        await fetchAllVegetables();
        await fetchAvailableVegetables();
        // Tự động chuyển sang tab chọn có sẵn và điền vegetableId
        setAddForm((prev) => ({ ...prev, vegetableId: String(newVegetableId) }));
        setAddProductTab(0);
      } else {
        console.error("Response structure:", result);
        toast.error("Không thể lấy ID loại rau mới tạo. Vui lòng kiểm tra console.");
      }
    } catch (error) {
      console.error("Error creating vegetable:", error);
      toast.error(error.message || "Không thể tạo loại rau mới");
    } finally {
      setCreatingVegetable(false);
    }
  };

  const handleAddProduct = async () => {
    // Validation
    if (!addForm.vegetableId) {
      toast.error("Vui lòng chọn loại rau");
      return;
    }
    if (!addForm.gardenId) {
      toast.error("Vui lòng chọn vườn");
      return;
    }
    if (!addForm.price || parseFloat(addForm.price) <= 0) {
      toast.error("Vui lòng nhập giá bán hợp lệ (lớn hơn 0)");
      return;
    }
    if (!addForm.stock || parseInt(addForm.stock) <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ (lớn hơn 0)");
      return;
    }

    // Kiểm tra số lượng không vượt quá số lượng có sẵn trong vườn
    const vegetableData = selectedVegetableData;
    if (vegetableData) {
      const selectedGarden = vegetableData.gardens.find(
        (g) => g.gardenId === parseInt(addForm.gardenId)
      );
      if (selectedGarden && parseInt(addForm.stock) > selectedGarden.quantity) {
        toast.error(
          `Số lượng không được vượt quá ${selectedGarden.quantity} kg có sẵn trong vườn "${selectedGarden.gardenName}"`
        );
        return;
      }
    }

    try {
      const productData = {
        vegetableId: parseInt(addForm.vegetableId),
        gardenId: parseInt(addForm.gardenId),
        price: parseFloat(addForm.price),
        stock: parseInt(addForm.stock),
        isAvailable: addForm.isAvailable,
      };

      await shopService.addProductToShop(selectedShop.id, productData);
      toast.success("Thêm sản phẩm thành công!");
      handleCloseAddDialog();
      fetchShopProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Không thể thêm sản phẩm");
    }
  };

  const handleOpenEditDialog = (product) => {
    setSelectedProduct(product);
    setEditForm({
      price: product.price,
      stock: product.stock,
      isAvailable: product.isAvailable,
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedProduct(null);
    setEditForm({
      price: "",
      stock: "",
      isAvailable: true,
    });
  };

  const handleEditProduct = async () => {
    if (!editForm.price || !editForm.stock) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const updateData = {
        price: parseFloat(editForm.price),
        stock: parseInt(editForm.stock),
        isAvailable: editForm.isAvailable,
      };

      await shopService.updateShopProduct(
        selectedShop.id,
        selectedProduct.id,
        updateData
      );
      toast.success("Cập nhật sản phẩm thành công!");
      handleCloseEditDialog();
      fetchShopProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Không thể cập nhật sản phẩm");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      await shopService.deleteShopProduct(selectedShop.id, productId);
      toast.success("Xóa sản phẩm thành công!");
      fetchShopProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Không thể xóa sản phẩm");
    }
  };

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
    // Page reset is handled by debounce effect
  }, []);

  const handleFilterChange = useCallback((event) => {
    setFilterAvailable(event.target.value);
    setPage(0);
  }, []);

  // Memoize selectedVegetableData để tránh tính toán lại mỗi lần render
  const selectedVegetableData = useMemo(() => {
    if (!addForm.vegetableId || !availableVegetables.length) {
      return null;
    }
    const vegetableId = parseInt(addForm.vegetableId);
    if (isNaN(vegetableId)) {
      return null;
    }
    return availableVegetables.find((v) => v.vegetable.id === vegetableId) || null;
  }, [addForm.vegetableId, availableVegetables]);

  // Reset gardenId khi vegetableId thay đổi
  useEffect(() => {
    if (addForm.vegetableId) {
      // Kiểm tra xem gardenId hiện tại có còn hợp lệ với vegetableId mới không
      const vegetableData = selectedVegetableData;
      if (vegetableData) {
        const isValidGarden = vegetableData.gardens.some(
          (g) => g.gardenId === parseInt(addForm.gardenId)
        );
        if (!isValidGarden) {
          setAddForm((prev) => ({ ...prev, gardenId: "" }));
        }
      } else {
        setAddForm((prev) => ({ ...prev, gardenId: "" }));
      }
    }
  }, [addForm.vegetableId, selectedVegetableData]);

  return (
    <Box className="shop-product-management">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <StoreIcon sx={{ fontSize: 35 }} />
          Quản Lý Sản Phẩm Shop
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý các sản phẩm rau trong shop của bạn
        </Typography>
      </Box>

      {/* Shop Selection */}
      {shops.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Chọn Shop</InputLabel>
                  <Select
                    value={selectedShop?.id || ""}
                    onChange={(e) => {
                      const shop = shops.find((s) => s.id === e.target.value);
                      setSelectedShop(shop);
                      setPage(0);
                    }}
                    label="Chọn Shop"
                  >
                    {shops.map((shop) => (
                      <MenuItem key={shop.id} value={shop.id}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <StoreIcon />
                          <Box>
                            <Typography variant="body1">{shop.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {shop._count?.products || 0} sản phẩm
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {selectedShop && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Chip
                      icon={<InventoryIcon />}
                      label={`${selectedShop._count?.products || 0} Sản phẩm`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={selectedShop.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                      label={selectedShop.isActive ? "Đang hoạt động" : "Không hoạt động"}
                      color={selectedShop.isActive ? "success" : "default"}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {selectedShop ? (
        <>
          {/* Filters and Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchText}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={filterAvailable}
                      onChange={handleFilterChange}
                      label="Trạng thái"
                    >
                      <MenuItem value="all">Tất cả</MenuItem>
                      <MenuItem value="true">Có sẵn</MenuItem>
                      <MenuItem value="false">Không có sẵn</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={5} sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchShopProducts}
                  >
                    Làm mới
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddDialog}
                  >
                    Thêm sản phẩm
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Hình ảnh</TableCell>
                    <TableCell>Tên rau</TableCell>
                    <TableCell>Vườn</TableCell>
                    <TableCell align="right">Giá bán</TableCell>
                    <TableCell align="center">Tồn kho</TableCell>
                    <TableCell align="center">Trạng thái</TableCell>
                    <TableCell align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Chưa có sản phẩm nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Avatar
                            src={product.vegetable?.image}
                            alt={product.vegetable?.name}
                            variant="rounded"
                            sx={{ width: 50, height: 50 }}
                          >
                            <InventoryIcon />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body1" fontWeight={600}>
                            {product.vegetable?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.vegetable?.category}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {product.garden?.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight={600} color="primary">
                            {product.price?.toLocaleString("vi-VN")} ₫
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={product.stock}
                            size="small"
                            color={product.stock > 10 ? "success" : product.stock > 0 ? "warning" : "error"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={product.isAvailable ? <CheckCircleIcon /> : <CancelIcon />}
                            label={product.isAvailable ? "Có sẵn" : "Hết hàng"}
                            size="small"
                            color={product.isAvailable ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditDialog(product)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalProducts}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} trong ${count}`
              }
            />
          </Card>
        </>
      ) : (
        <Alert severity="info">
          Vui lòng chọn một shop để quản lý sản phẩm
        </Alert>
      )}

      {/* Add Product Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AddIcon />
            Thêm sản phẩm vào shop
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Tabs
              value={addProductTab}
              onChange={(e, newValue) => setAddProductTab(newValue)}
              sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Chọn loại rau có sẵn" />
              <Tab label="Tạo loại rau mới" />
            </Tabs>

            {addProductTab === 0 ? (
              // Tab: Chọn loại rau có sẵn
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Bước 1: Chọn loại rau */}
                <FormControl fullWidth required>
                  <InputLabel>Chọn loại rau *</InputLabel>
                  <Select
                    value={addForm.vegetableId || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAddForm((prev) => ({ 
                        ...prev, 
                        vegetableId: value,
                        gardenId: "" // Reset gardenId khi đổi rau
                      }));
                    }}
                    label="Chọn loại rau *"
                    displayEmpty
                  >
                    {allVegetables.length === 0 ? (
                      <MenuItem disabled value="">
                        <Typography variant="body2" color="text.secondary">
                          Đang tải danh sách rau...
                        </Typography>
                      </MenuItem>
                    ) : (
                      allVegetables.map((vegetable) => {
                        // Tìm xem rau này có trong availableVegetables không
                        const availableData = availableVegetables.find(
                          (item) => item.vegetable.id === vegetable.id
                        );
                        return (
                          <MenuItem key={vegetable.id} value={String(vegetable.id)}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                              <Avatar
                                src={vegetable.image}
                                alt={vegetable.name}
                                variant="rounded"
                                sx={{ width: 40, height: 40 }}
                              >
                                <InventoryIcon />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight={600}>
                                  {vegetable.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {vegetable.category || "Chưa phân loại"}
                                  {availableData ? (
                                    ` • ${availableData.gardens.length} vườn có sẵn`
                                  ) : (
                                    " • Chưa có trong vườn"
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Bạn có thể chọn bất kỳ loại rau nào trong hệ thống. Nếu rau chưa có trong vườn, bạn sẽ cần chọn vườn ở bước tiếp theo.
                  </Typography>
                </FormControl>

                {/* Hiển thị thông tin rau đã chọn */}
                {selectedVegetableData && (
                  <Alert severity="info" icon={false}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {selectedVegetableData.vegetable.image && (
                        <Avatar
                          src={selectedVegetableData.vegetable.image}
                          alt={selectedVegetableData.vegetable.name}
                          variant="rounded"
                          sx={{ width: 50, height: 50 }}
                        >
                          <InventoryIcon />
                        </Avatar>
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedVegetableData.vegetable.name}
                        </Typography>
                        {selectedVegetableData.vegetable.description && (
                          <Typography variant="caption" color="text.secondary">
                            {selectedVegetableData.vegetable.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Alert>
                )}

                {/* Bước 2: Chọn vườn */}
                {addForm.vegetableId && (
                  <>
                    {selectedVegetableData && selectedVegetableData.gardens.length > 0 ? (
                      <FormControl fullWidth required>
                        <InputLabel>Chọn vườn *</InputLabel>
                        <Select
                          value={addForm.gardenId || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setAddForm((prev) => ({ ...prev, gardenId: value }));
                          }}
                          label="Chọn vườn *"
                          displayEmpty
                        >
                          <MenuItem disabled value="">
                            <Typography variant="body2" color="text.secondary">
                              Chọn vườn có loại rau này
                            </Typography>
                          </MenuItem>
                          {selectedVegetableData.gardens.map((garden) => (
                            <MenuItem key={garden.gardenId} value={String(garden.gardenId)}>
                              <Box>
                                <Typography variant="body1">{garden.gardenName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Số lượng có sẵn: {garden.quantity} kg
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <FormControl fullWidth required>
                        <InputLabel>Chọn vườn *</InputLabel>
                        <Select
                          value={addForm.gardenId || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setAddForm((prev) => ({ ...prev, gardenId: value }));
                          }}
                          label="Chọn vườn *"
                          displayEmpty
                        >
                          {userGardens.length === 0 ? (
                            <MenuItem disabled value="">
                              <Typography variant="body2" color="text.secondary">
                                Bạn chưa có vườn nào
                              </Typography>
                            </MenuItem>
                          ) : (
                            <>
                              <MenuItem disabled value="">
                                <Typography variant="body2" color="text.secondary">
                                  Chọn vườn để thêm loại rau này
                                </Typography>
                              </MenuItem>
                              {userGardens.map((garden) => (
                                <MenuItem key={garden.id} value={String(garden.id)}>
                                  <Typography variant="body1">{garden.name}</Typography>
                                </MenuItem>
                              ))}
                            </>
                          )}
                        </Select>
                        <Alert severity="info" sx={{ mt: 1 }}>
                          Loại rau này chưa có trong vườn nào. Bạn có thể chọn một vườn để thêm vào shop.
                          Lưu ý: Backend sẽ tự động thêm rau vào vườn khi bạn thêm vào shop.
                        </Alert>
                      </FormControl>
                    )}
                  </>
                )}

                {/* Bước 3: Nhập thông tin sản phẩm */}
                {selectedVegetableData && addForm.gardenId && (
                  <>
                    <TextField
                      fullWidth
                      label="Giá bán (VNĐ) *"
                      type="number"
                      value={addForm.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAddForm((prev) => ({ ...prev, price: value }));
                      }}
                      inputProps={{ min: 0, step: 1000 }}
                      required
                      helperText="Nhập giá bán cho sản phẩm này"
                    />

                    <TextField
                      fullWidth
                      label="Số lượng (kg) *"
                      type="number"
                      value={addForm.stock}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAddForm((prev) => ({ ...prev, stock: value }));
                      }}
                      inputProps={{ 
                        min: 0,
                        max: selectedVegetableData.gardens.find(
                          g => g.gardenId === parseInt(addForm.gardenId)
                        )?.quantity || undefined
                      }}
                      required
                      helperText={
                        selectedVegetableData.gardens.find(
                          g => g.gardenId === parseInt(addForm.gardenId)
                        )
                          ? `Tối đa: ${selectedVegetableData.gardens.find(
                              g => g.gardenId === parseInt(addForm.gardenId)
                            )?.quantity} kg`
                          : "Nhập số lượng sản phẩm"
                      }
                    />
                  </>
                )}

                {/* Bước 4: Trạng thái sản phẩm */}
                {selectedVegetableData && addForm.gardenId && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={addForm.isAvailable}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAddForm((prev) => ({ ...prev, isAvailable: checked }));
                        }}
                      />
                    }
                    label="Có sẵn để bán"
                  />
                )}

                {/* Hướng dẫn */}
                {!selectedVegetableData && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Hướng dẫn:</strong>
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                      1. Chọn loại rau từ danh sách (có thể chọn bất kỳ loại rau nào trong hệ thống)<br />
                      2. Chọn vườn (nếu rau đã có trong vườn thì chọn từ danh sách, nếu chưa có thì chọn vườn bất kỳ)<br />
                      3. Nhập giá bán và số lượng<br />
                      4. Bật/tắt trạng thái "Có sẵn để bán"<br />
                      5. Nhấn "Thêm sản phẩm" để hoàn tất
                    </Typography>
                  </Alert>
                )}
              </Box>
            ) : (
              // Tab: Tạo loại rau mới
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Tạo loại rau mới
                </Typography>
                
                <TextField
                  fullWidth
                  label="Tên loại rau *"
                  value={newVegetableForm.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewVegetableForm((prev) => ({ ...prev, name: value }));
                  }}
                  required
                  helperText="Nhập tên loại rau (bắt buộc)"
                />

                <FormControl fullWidth>
                  <InputLabel>Loại rau</InputLabel>
                  <Select
                    value={newVegetableForm.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewVegetableForm((prev) => ({ ...prev, category: value }));
                    }}
                    label="Loại rau"
                  >
                    <MenuItem value="leafy">Rau lá (Leafy)</MenuItem>
                    <MenuItem value="root">Rau củ (Root)</MenuItem>
                    <MenuItem value="fruit">Rau quả (Fruit)</MenuItem>
                    <MenuItem value="herb">Rau thơm (Herb)</MenuItem>
                    <MenuItem value="legume">Đậu (Legume)</MenuItem>
                    <MenuItem value="other">Khác</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Mô tả"
                  multiline
                  rows={3}
                  value={newVegetableForm.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewVegetableForm((prev) => ({ ...prev, description: value }));
                  }}
                  helperText="Mô tả về loại rau (tùy chọn)"
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Thông tin quan trọng
                </Typography>
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    <strong>Lưu ý về logic:</strong>
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    • Sau khi tạo loại rau mới, bạn sẽ được chuyển sang tab "Chọn loại rau có sẵn"<br />
                    • Ở tab đó, bạn có thể chọn <strong>bất kỳ loại rau nào</strong> trong hệ thống (không chỉ từ vườn của bạn)<br />
                    • Nếu loại rau chưa có trong vườn, bạn vẫn có thể chọn một vườn để thêm vào shop<br />
                    • Backend sẽ tự động xử lý việc liên kết rau với vườn khi bạn thêm vào shop
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Hủy</Button>
          {addProductTab === 0 ? (
            <Button
              onClick={handleAddProduct}
              variant="contained"
              disabled={
                !addForm.vegetableId ||
                !addForm.gardenId ||
                !addForm.price ||
                !addForm.stock ||
                parseFloat(addForm.price) <= 0 ||
                parseInt(addForm.stock) <= 0
              }
            >
              Thêm sản phẩm
            </Button>
          ) : (
            <Button
              onClick={handleCreateVegetable}
              variant="contained"
              disabled={!newVegetableForm.name || creatingVegetable}
            >
              {creatingVegetable ? <CircularProgress size={20} /> : "Tạo loại rau mới"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon />
            Chỉnh sửa sản phẩm
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar
                  src={selectedProduct.vegetable?.image}
                  variant="rounded"
                  sx={{ width: 60, height: 60 }}
                >
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedProduct.vegetable?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedProduct.garden?.name}
                  </Typography>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Giá bán (VNĐ)"
                type="number"
                value={editForm.price}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditForm((prev) => ({ ...prev, price: value }));
                }}
                inputProps={{ min: 0 }}
              />

              <TextField
                fullWidth
                label="Số lượng"
                type="number"
                value={editForm.stock}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditForm((prev) => ({ ...prev, stock: value }));
                }}
                inputProps={{ min: 0 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.isAvailable}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditForm((prev) => ({ ...prev, isAvailable: checked }));
                    }}
                  />
                }
                label="Có sẵn để bán"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button onClick={handleEditProduct} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ShopProductManagement;
