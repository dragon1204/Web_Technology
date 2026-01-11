import { useState, useEffect } from "react";
import { vegetableService } from "../services/vegetableService";
import { gardenService } from "../services/gardenService";
import toast from "react-hot-toast";

// Modal component - moved outside to prevent re-render issues
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#1a2e1a",
          padding: "30px",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "500px",
          border: "1px solid #28392e",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              color: "#e0e0e0",
              fontSize: "20px",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#a0a0a0",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const VegetableList = () => {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [editingVegetable, setEditingVegetable] = useState(null);
  const [updateType, setUpdateType] = useState(""); // 'price', 'imported', 'sold'
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    imported: 0,
  });
  const [updateData, setUpdateData] = useState({
    price: 0,
    imported: 0,
    sold: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueFilters, setRevenueFilters] = useState({
    startDate: "",
    endDate: "",
    vegetableId: "",
    type: "month", // day, week, month
  });
  const [gardens, setGardens] = useState([]);
  const [selectedGarden, setSelectedGarden] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVegetables();
    fetchGardens();
  }, [pagination.page, searchTerm]);

  const fetchVegetables = async () => {
    try {
      setLoading(true);
      console.log("VegetableList: Fetching vegetables...");

      const response = await vegetableService.getVegetables({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: "name",
        sortOrder: "asc",
      });

      console.log("VegetableList: Response received:", response);

      // Handle the correct backend format: { HttpCode, success, data: { items: [...] } }
      let vegetablesData = [];
      let paginationData = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      if (
        response &&
        response.data &&
        response.data.items &&
        Array.isArray(response.data.items)
      ) {
        console.log("VegetableList: Found vegetables in response.data.items");
        vegetablesData = response.data.items;
        paginationData = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0,
        };
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log(
          "VegetableList: Found vegetables in response.data (direct array)"
        );
        vegetablesData = response.data;
      } else {
        console.log("VegetableList: No vegetables found in expected format");
        vegetablesData = [];
      }

      console.log("VegetableList: Setting vegetables:", vegetablesData);
      setVegetables(vegetablesData);
      setPagination(paginationData);
    } catch (error) {
      console.error("VegetableList: Error fetching vegetables:", error);
      toast.error("Lỗi khi tải danh sách rau củ: " + error.message);
      setVegetables([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGardens = async () => {
    try {
      console.log("VegetableList: Fetching gardens...");
      const response = await gardenService.getGardens({
        page: 1,
        limit: 100,
      });

      console.log("VegetableList: Gardens response:", response);

      let gardensData = [];
      if (
        response &&
        response.data &&
        response.data.items &&
        Array.isArray(response.data.items)
      ) {
        gardensData = response.data.items;
      } else if (response && response.data && Array.isArray(response.data)) {
        gardensData = response.data;
      }

      console.log("VegetableList: Setting gardens:", gardensData);
      setGardens(gardensData);

      // Auto-select first garden if available
      if (gardensData.length > 0 && !selectedGarden) {
        setSelectedGarden(gardensData[0]);
        console.log(
          "VegetableList: Auto-selected first garden:",
          gardensData[0]
        );
      }
    } catch (error) {
      console.error("VegetableList: Error fetching gardens:", error);
      setGardens([]);
    }
  };

  const handleCreateVegetable = async (e) => {
    e.preventDefault();

    try {
      // Ensure data types are correct - only send fields that have values
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price) || 0,
        imported: Number(formData.imported) || 0,
        sold: 0, // Always initialize sold to 0 for new vegetables
      };

      console.log("VegetableList: Creating vegetable with payload:", payload);

      await vegetableService.createVegetable(payload);
      toast.success("Tạo rau củ thành công");
      setShowCreateModal(false);
      setFormData({ name: "", price: 0, imported: 0 });
      fetchVegetables(); // Refresh list
    } catch (error) {
      console.error("Error creating vegetable:", error);
      toast.error("Lỗi khi tạo rau củ: " + error.message);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      if (updateType === "price") {
        await vegetableService.updatePrice(editingVegetable.id, {
          price: updateData.price,
        });
        toast.success("Cập nhật giá thành công");
      } else if (updateType === "imported") {
        await vegetableService.updateImported(editingVegetable.id, {
          imported: updateData.imported,
        });
        toast.success("Cập nhật số lượng nhập thành công");
      } else if (updateType === "sold") {
        // When selling, the API automatically records transaction with timestamp
        await vegetableService.updateSold(editingVegetable.id, {
          sold: updateData.sold,
        });
        toast.success(
          `Đã bán ${updateData.sold} ${
            editingVegetable.name
          } - Doanh thu: ${formatCurrency(
            updateData.sold * editingVegetable.price
          )}`
        );
      }

      setShowUpdateModal(false);
      setEditingVegetable(null);
      setUpdateType("");
      setUpdateData({ price: 0, imported: 0, sold: 0 });
      fetchVegetables();

      // Refresh revenue data if revenue modal is open
      if (showRevenueModal) {
        fetchRevenue();
      }
    } catch (error) {
      console.error("Error updating vegetable:", error);
      toast.error("Lỗi khi cập nhật rau củ: " + error.message);
    }
  };

  const handleUpdate = (vegetable, type) => {
    setEditingVegetable(vegetable);
    setUpdateType(type);

    if (type === "price") {
      setUpdateData({ ...updateData, price: vegetable.price || 0 });
    } else if (type === "imported") {
      setUpdateData({ ...updateData, imported: 0 });
    } else if (type === "sold") {
      setUpdateData({ ...updateData, sold: 0 });
    }

    setShowUpdateModal(true);
  };

  const handleDelete = async (vegetableId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa rau củ này?")) {
      return;
    }

    try {
      await vegetableService.deleteVegetable(vegetableId);
      toast.success("Xóa rau củ thành công");
      fetchVegetables();
    } catch (error) {
      console.error("Error deleting vegetable:", error);
      toast.error("Lỗi khi xóa rau củ: " + error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const fetchRevenue = async () => {
    try {
      if (!selectedGarden) {
        toast.error("Vui lòng chọn vườn để xem doanh thu");
        return;
      }

      console.log("Fetching revenue with filters:", revenueFilters);
      console.log("Selected garden:", selectedGarden);

      // Call the real revenue API
      const params = {
        type: revenueFilters.type || "month",
        page: 1,
        limit: 100,
      };

      if (revenueFilters.startDate) params.startDate = revenueFilters.startDate;
      if (revenueFilters.endDate) params.endDate = revenueFilters.endDate;
      if (revenueFilters.vegetableId)
        params.vegetableId = revenueFilters.vegetableId;

      console.log("Calling vegetableService.getRevenue with params:", params);

      // Fetch both revenue list and total
      const [revenueResponse, totalResponse] = await Promise.all([
        vegetableService.getRevenue(params),
        vegetableService.getTotalRevenue(params),
      ]);

      console.log("Revenue response:", revenueResponse);
      console.log("Total response:", totalResponse);

      // Parse revenue data
      let revenueItems = [];
      if (
        revenueResponse &&
        revenueResponse.data &&
        revenueResponse.data.items &&
        Array.isArray(revenueResponse.data.items)
      ) {
        revenueItems = revenueResponse.data.items;
      } else if (
        revenueResponse &&
        revenueResponse.data &&
        Array.isArray(revenueResponse.data)
      ) {
        revenueItems = revenueResponse.data;
      }

      // Parse total revenue
      let totalAmount = 0;
      if (totalResponse && totalResponse.data) {
        totalAmount =
          totalResponse.data.totalRevenue || totalResponse.data.total || 0;
      }

      console.log("Parsed revenue items:", revenueItems);
      console.log("Total revenue amount:", totalAmount);

      setRevenueData(revenueItems);
      setTotalRevenue(totalAmount);

      if (revenueItems.length > 0) {
        toast.success(
          `Đã tải ${revenueItems.length} giao dịch - Tổng: ${formatCurrency(
            totalAmount
          )}`
        );
      } else {
        toast("Chưa có giao dịch bán nào trong khoảng thời gian này");
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
      toast.error("Lỗi khi tải dữ liệu doanh thu: " + error.message);
      setRevenueData([]);
      setTotalRevenue(0);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getUpdateTitle = () => {
    if (updateType === "price") return "Cập nhật giá";
    if (updateType === "imported") return "Cập nhật số lượng nhập";
    if (updateType === "sold") return "Cập nhật số lượng bán";
    return "Cập nhật";
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              color: "#e0e0e0",
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 8px 0",
            }}
          >
            🌿 Quản lý cây trồng
          </h1>
          <p
            style={{
              color: "#a0a0a0",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Quản lý các loại rau củ, giá cả và doanh thu
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => {
              setShowRevenueModal(true);
              fetchRevenue();
            }}
            style={{
              backgroundColor: "#f59e0b",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📊 Doanh thu
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: "#4cbe00",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            + Thêm rau củ
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Tìm kiếm rau củ..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            width: "300px",
            padding: "12px",
            backgroundColor: "#28392e",
            border: "1px solid #3a4a3a",
            borderRadius: "8px",
            color: "#e0e0e0",
            fontSize: "14px",
          }}
        />
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            color: "#a0a0a0",
          }}
        >
          Đang tải...
        </div>
      ) : vegetables.length > 0 ? (
        <>
          {/* Vegetables Table */}
          <div
            style={{
              backgroundColor: "#1a2e1a",
              borderRadius: "12px",
              border: "1px solid #28392e",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 2fr",
                gap: "20px",
                padding: "20px",
                backgroundColor: "#28392e",
                color: "#a0a0a0",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              <div>Tên rau củ</div>
              <div>Giá (VND)</div>
              <div>Đã nhập</div>
              <div>Đã bán</div>
              <div>Tồn kho</div>
              <div>Thao tác</div>
            </div>

            {vegetables.map((vegetable, index) => (
              <div
                key={vegetable.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 2fr",
                  gap: "20px",
                  padding: "20px",
                  borderTop: index > 0 ? "1px solid #28392e" : "none",
                  color: "#e0e0e0",
                  fontSize: "14px",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    {vegetable.name}
                  </div>
                  <div style={{ color: "#a0a0a0", fontSize: "12px" }}>
                    ID: {vegetable.id}
                  </div>
                </div>

                <div style={{ fontWeight: "600", color: "#4cbe00" }}>
                  {formatCurrency(vegetable.price)}
                </div>

                <div>{vegetable.imported || 0}</div>

                <div>{vegetable.sold || 0}</div>

                <div
                  style={{
                    fontWeight: "600",
                    color:
                      (vegetable.imported || 0) - (vegetable.sold || 0) > 0
                        ? "#10b981"
                        : "#dc2626",
                  }}
                >
                  {(vegetable.imported || 0) - (vegetable.sold || 0)}
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleUpdate(vegetable, "price")}
                    style={{
                      backgroundColor: "#f59e0b",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Giá
                  </button>

                  <button
                    onClick={() => handleUpdate(vegetable, "imported")}
                    style={{
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Nhập
                  </button>

                  <button
                    onClick={() => handleUpdate(vegetable, "sold")}
                    style={{
                      backgroundColor: "#6366f1",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Bán
                  </button>

                  <button
                    onClick={() => handleDelete(vegetable.id)}
                    style={{
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page <= 1}
                style={{
                  backgroundColor: pagination.page <= 1 ? "#28392e" : "#4cbe00",
                  color: pagination.page <= 1 ? "#a0a0a0" : "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                }}
              >
                Trước
              </button>

              <span style={{ color: "#e0e0e0", fontSize: "14px" }}>
                Trang {pagination.page} / {pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page >= pagination.totalPages}
                style={{
                  backgroundColor:
                    pagination.page >= pagination.totalPages
                      ? "#28392e"
                      : "#4cbe00",
                  color:
                    pagination.page >= pagination.totalPages
                      ? "#a0a0a0"
                      : "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor:
                    pagination.page >= pagination.totalPages
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            backgroundColor: "#1a2e1a",
            border: "1px solid #28392e",
            borderRadius: "8px",
            padding: "40px",
            textAlign: "center",
            color: "#a0a0a0",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌿</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#e0e0e0" }}>
            Chưa có rau củ nào
          </h3>
          <p style={{ margin: 0 }}>Thêm rau củ đầu tiên để bắt đầu quản lý</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: "", price: 0, imported: 0 });
        }}
        title="Thêm rau củ mới"
      >
        <form onSubmit={handleCreateVegetable}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#e0e0e0",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              Tên rau củ *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              autoFocus
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#28392e",
                border: "1px solid #3a4a3a",
                borderRadius: "6px",
                color: "#e0e0e0",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Nhập tên rau củ"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#e0e0e0",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              Giá (VND) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              required
              min="0"
              step="1000"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#28392e",
                border: "1px solid #3a4a3a",
                borderRadius: "6px",
                color: "#e0e0e0",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Nhập giá"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#e0e0e0",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              Số lượng nhập ban đầu
            </label>
            <input
              type="number"
              value={formData.imported}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  imported: parseInt(e.target.value) || 0,
                })
              }
              min="0"
              step="1"
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#28392e",
                border: "1px solid #3a4a3a",
                borderRadius: "6px",
                color: "#e0e0e0",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Nhập số lượng (mặc định: 0)"
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setFormData({ name: "", price: 0, imported: 0 });
              }}
              style={{
                backgroundColor: "#28392e",
                color: "#e0e0e0",
                border: "1px solid #3a4a3a",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: "#4cbe00",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Thêm rau củ
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Modal */}
      <Modal
        show={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setEditingVegetable(null);
          setUpdateType("");
          setUpdateData({ price: 0, imported: 0, sold: 0 });
        }}
        title={`${getUpdateTitle()} - ${editingVegetable?.name}`}
      >
        <form onSubmit={handleUpdateSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#e0e0e0",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "8px",
              }}
            >
              {updateType === "price" && "Giá mới (VND) *"}
              {updateType === "imported" && "Số lượng nhập thêm *"}
              {updateType === "sold" && "Số lượng bán *"}
            </label>
            <input
              type="number"
              value={updateData[updateType]}
              onChange={(e) =>
                setUpdateData({
                  ...updateData,
                  [updateType]: parseFloat(e.target.value) || 0,
                })
              }
              required
              min="0"
              step={updateType === "price" ? "1000" : "1"}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#28392e",
                border: "1px solid #3a4a3a",
                borderRadius: "6px",
                color: "#e0e0e0",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder={
                updateType === "price"
                  ? "Nhập giá mới"
                  : updateType === "imported"
                  ? "Nhập số lượng nhập thêm"
                  : "Nhập số lượng bán"
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowUpdateModal(false);
                setEditingVegetable(null);
                setUpdateType("");
                setUpdateData({ price: 0, imported: 0, sold: 0 });
              }}
              style={{
                backgroundColor: "#28392e",
                color: "#e0e0e0",
                border: "1px solid #3a4a3a",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: "#4cbe00",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Cập nhật
            </button>
          </div>
        </form>
      </Modal>

      {/* Revenue Modal */}
      <Modal
        show={showRevenueModal}
        onClose={() => setShowRevenueModal(false)}
        title="📊 Báo cáo doanh thu"
      >
        <div>
          {/* Revenue Filters */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#e0e0e0",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={revenueFilters.startDate}
                  onChange={(e) =>
                    setRevenueFilters({
                      ...revenueFilters,
                      startDate: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#28392e",
                    border: "1px solid #3a4a3a",
                    borderRadius: "4px",
                    color: "#e0e0e0",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    color: "#e0e0e0",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={revenueFilters.endDate}
                  onChange={(e) =>
                    setRevenueFilters({
                      ...revenueFilters,
                      endDate: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#28392e",
                    border: "1px solid #3a4a3a",
                    borderRadius: "4px",
                    color: "#e0e0e0",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                Vườn *
              </label>
              <select
                value={selectedGarden?.id || ""}
                onChange={(e) => {
                  const garden = gardens.find(
                    (g) => g.id === parseInt(e.target.value)
                  );
                  setSelectedGarden(garden);
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#28392e",
                  border: "1px solid #3a4a3a",
                  borderRadius: "4px",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                <option value="">-- Chọn vườn --</option>
                {gardens.map((garden) => (
                  <option key={garden.id} value={garden.id}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                Loại báo cáo *
              </label>
              <select
                value={revenueFilters.type}
                onChange={(e) =>
                  setRevenueFilters({
                    ...revenueFilters,
                    type: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#28392e",
                  border: "1px solid #3a4a3a",
                  borderRadius: "4px",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                Rau củ cụ thể (tùy chọn)
              </label>
              <select
                value={revenueFilters.vegetableId}
                onChange={(e) =>
                  setRevenueFilters({
                    ...revenueFilters,
                    vegetableId: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#28392e",
                  border: "1px solid #3a4a3a",
                  borderRadius: "4px",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                <option value="">Tất cả rau củ</option>
                {vegetables.map((veg) => (
                  <option key={veg.id} value={veg.id}>
                    {veg.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchRevenue}
              style={{
                backgroundColor: "#4cbe00",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                fontSize: "14px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Cập nhật báo cáo
            </button>
          </div>

          {/* Total Revenue */}
          <div
            style={{
              backgroundColor: "#28392e",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#4cbe00",
                fontSize: "24px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              {formatCurrency(totalRevenue)}
            </div>
            <div
              style={{
                color: "#a0a0a0",
                fontSize: "14px",
              }}
            >
              Tổng doanh thu
            </div>
          </div>

          {/* Revenue List */}
          {revenueData.length > 0 ? (
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  color: "#a0a0a0",
                  fontSize: "12px",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                Danh sách giao dịch ({revenueData.length})
              </div>
              {revenueData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#28392e",
                    padding: "14px",
                    borderRadius: "8px",
                    marginBottom: "10px",
                    border: "1px solid #3a4a3a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "#e0e0e0",
                          fontWeight: "600",
                          marginBottom: "4px",
                          fontSize: "15px",
                        }}
                      >
                        {item.vegetableName || item.name || "N/A"}
                      </div>
                      <div
                        style={{
                          color: "#a0a0a0",
                          fontSize: "12px",
                          marginBottom: "2px",
                        }}
                      >
                        📦 Số lượng:{" "}
                        <strong>{item.quantity || item.sold || 0}</strong>
                      </div>
                      <div
                        style={{
                          color: "#a0a0a0",
                          fontSize: "12px",
                          marginBottom: "2px",
                        }}
                      >
                        💰 Đơn giá: {formatCurrency(item.price || 0)}
                      </div>
                      {item.createdAt && (
                        <div
                          style={{
                            color: "#a0a0a0",
                            fontSize: "11px",
                            marginTop: "4px",
                          }}
                        >
                          🕐 {formatDate(item.createdAt)}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <div
                        style={{
                          color: "#4cbe00",
                          fontWeight: "700",
                          fontSize: "16px",
                        }}
                      >
                        {formatCurrency(item.revenue || item.totalRevenue || 0)}
                      </div>
                      <div
                        style={{
                          color: "#a0a0a0",
                          fontSize: "11px",
                          marginTop: "2px",
                        }}
                      >
                        Doanh thu
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#a0a0a0",
                padding: "40px 20px",
                backgroundColor: "#28392e",
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>
              <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                Chưa có dữ liệu doanh thu
              </div>
              <div style={{ fontSize: "12px" }}>
                Chọn khoảng thời gian và nhấn "Cập nhật báo cáo"
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default VegetableList;
