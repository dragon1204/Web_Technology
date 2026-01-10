import React, { useState, useEffect } from "react";
import { vegetableService } from "../services/vegetableService";
import toast from "react-hot-toast";

const PlantManagement = () => {
  const [vegetables, setVegetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingVegetable, setEditingVegetable] = useState(null);
  const [updateType, setUpdateType] = useState(""); // 'price', 'imported', 'sold'
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
  });
  const [updateData, setUpdateData] = useState({
    price: 0,
    imported: 0,
    sold: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVegetables();
  }, [pagination.page, searchTerm]);

  const fetchVegetables = async () => {
    try {
      setLoading(true);
      const response = await vegetableService.getVegetables({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: "name",
        sortOrder: "asc",
      });

      setVegetables(response.data || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      });
    } catch (error) {
      console.error("Error fetching vegetables:", error);
      toast.error("Lỗi khi tải danh sách rau củ");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      await vegetableService.createVegetable(formData);
      toast.success("Tạo rau củ thành công");
      setShowCreateModal(false);
      setFormData({ name: "", price: 0 });
      fetchVegetables();
    } catch (error) {
      console.error("Error creating vegetable:", error);
      toast.error("Lỗi khi tạo rau củ");
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
        await vegetableService.updateSold(editingVegetable.id, {
          sold: updateData.sold,
        });
        toast.success("Cập nhật số lượng bán thành công");
      }

      setShowUpdateModal(false);
      setEditingVegetable(null);
      setUpdateType("");
      setUpdateData({ price: 0, imported: 0, sold: 0 });
      fetchVegetables();
    } catch (error) {
      console.error("Error updating vegetable:", error);
      toast.error("Lỗi khi cập nhật rau củ");
    }
  };

  const handleUpdate = (vegetable, type) => {
    setEditingVegetable(vegetable);
    setUpdateType(type);

    if (type === "price") {
      setUpdateData({ ...updateData, price: vegetable.price });
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
      toast.error("Lỗi khi xóa rau củ");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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
      >
        <div
          style={{
            backgroundColor: "#1a2e1a",
            padding: "30px",
            borderRadius: "12px",
            width: "90%",
            maxWidth: "500px",
            border: "1px solid #28392e",
          }}
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
            Quản lý rau củ
          </h1>
          <p
            style={{
              color: "#a0a0a0",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Quản lý các loại rau củ và giá cả
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: "", price: 0 });
            setShowCreateModal(true);
          }}
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
          <span>+</span>
          Thêm rau củ mới
        </button>
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

      {/* Vegetables List */}
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
        <div
          style={{
            backgroundColor: "#1a2e1a",
            borderRadius: "12px",
            border: "1px solid #28392e",
            overflow: "hidden",
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

              <div>{vegetable.imported}</div>

              <div>{vegetable.sold}</div>

              <div
                style={{
                  fontWeight: "600",
                  color:
                    vegetable.imported - vegetable.sold > 0
                      ? "#10b981"
                      : "#dc2626",
                }}
              >
                {vegetable.imported - vegetable.sold}
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
      ) : (
        <div
          style={{
            backgroundColor: "#1a2e1a",
            padding: "60px 20px",
            borderRadius: "12px",
            border: "1px solid #28392e",
            textAlign: "center",
            color: "#a0a0a0",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🥬</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#e0e0e0" }}>
            Chưa có rau củ nào
          </h3>
          <p style={{ margin: 0 }}>Thêm rau củ đầu tiên để bắt đầu quản lý</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "30px",
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
                pagination.page >= pagination.totalPages ? "#a0a0a0" : "white",
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

      {/* Create Modal */}
      <Modal
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ name: "", price: 0 });
        }}
        title="Thêm rau củ mới"
      >
        <form onSubmit={handleCreateSubmit}>
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
                setFormData({ name: "", price: 0 });
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
    </div>
  );
};

export default PlantManagement;
