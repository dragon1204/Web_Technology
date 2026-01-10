import React, { useState, useEffect } from "react";
import { gardenService } from "../services/gardenService";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const GardenView = () => {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGarden, setEditingGarden] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    fetchGardens();
  }, [pagination.page, searchTerm]);

  const fetchGardens = async () => {
    try {
      setLoading(true);
      console.log("GardenView: Fetching gardens...");

      const response = await gardenService.getGardens({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      });

      console.log("GardenView: Response received:", response);
      console.log("GardenView: Response type:", typeof response);
      console.log("GardenView: Response keys:", Object.keys(response || {}));

      // Handle different response formats
      let gardensData = [];
      let paginationData = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      // Log all possible data locations
      console.log("GardenView: response.data:", response.data);
      console.log("GardenView: response.items:", response.items);
      console.log(
        "GardenView: response itself is array:",
        Array.isArray(response)
      );

      if (response.data && Array.isArray(response.data)) {
        // Format: { data: [...], page, limit, total, totalPages }
        console.log("GardenView: Using response.data format");
        gardensData = response.data;
        paginationData = {
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages:
            response.totalPages ||
            Math.ceil((response.total || 0) / (response.limit || 10)),
        };
      } else if (Array.isArray(response)) {
        // Format: [...]
        console.log("GardenView: Using direct array format");
        gardensData = response;
        paginationData = {
          page: 1,
          limit: 10,
          total: response.length,
          totalPages: 1,
        };
      } else if (response.items && Array.isArray(response.items)) {
        // Format: { items: [...], ... }
        console.log("GardenView: Using response.items format");
        gardensData = response.items;
        paginationData = {
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages:
            response.totalPages ||
            Math.ceil((response.total || 0) / (response.limit || 10)),
        };
      } else {
        // Try to find any array in the response
        console.log("GardenView: Searching for arrays in response...");
        for (const [key, value] of Object.entries(response || {})) {
          console.log(
            `GardenView: ${key}:`,
            value,
            "is array:",
            Array.isArray(value)
          );
          if (Array.isArray(value)) {
            console.log(`GardenView: Found array in ${key}, using it`);
            gardensData = value;
            break;
          }
        }
      }

      console.log("GardenView: Parsed gardens:", gardensData);
      console.log("GardenView: Parsed pagination:", paginationData);

      setGardens(gardensData);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error fetching gardens:", error);
      toast.error("Lỗi khi tải danh sách vườn: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingGarden) {
        await gardenService.updateGarden(editingGarden.id, formData);
        toast.success("Cập nhật vườn thành công");
      } else {
        await gardenService.createGarden(formData);
        toast.success("Tạo vườn thành công");
      }

      setShowCreateModal(false);
      setEditingGarden(null);
      setFormData({ name: "" });
      fetchGardens();
    } catch (error) {
      console.error("Error saving garden:", error);
      toast.error(editingGarden ? "Lỗi khi cập nhật vườn" : "Lỗi khi tạo vườn");
    }
  };

  const handleEdit = (garden) => {
    setEditingGarden(garden);
    setFormData({
      name: garden.name,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (gardenId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vườn này?")) {
      return;
    }

    try {
      await gardenService.deleteGarden(gardenId);
      toast.success("Xóa vườn thành công");
      fetchGardens();
    } catch (error) {
      console.error("Error deleting garden:", error);
      toast.error("Lỗi khi xóa vườn");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
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
            Quản lý vườn
          </h1>
          <p
            style={{
              color: "#a0a0a0",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Quản lý các vườn trong hệ thống
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGarden(null);
            setFormData({ name: "" });
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
          Tạo vườn mới
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Tìm kiếm vườn..."
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

      {/* Gardens List */}
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
      ) : gardens.length > 0 ? (
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
              gridTemplateColumns: "1fr 200px 150px 120px",
              gap: "20px",
              padding: "20px",
              backgroundColor: "#28392e",
              color: "#a0a0a0",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            <div>Tên vườn</div>
            <div>Chủ sở hữu</div>
            <div>Ngày tạo</div>
            <div>Thao tác</div>
          </div>

          {gardens.map((garden, index) => (
            <div
              key={garden.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 200px 150px 120px",
                gap: "20px",
                padding: "20px",
                borderTop: index > 0 ? "1px solid #28392e" : "none",
                color: "#e0e0e0",
                fontSize: "14px",
              }}
            >
              <div>
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                  {garden.name}
                </div>
                <div style={{ color: "#a0a0a0", fontSize: "12px" }}>
                  ID: {garden.id}
                </div>
              </div>

              <div>{garden.owner?.name || "N/A"}</div>

              <div>
                {garden.createdAt
                  ? new Date(garden.createdAt).toLocaleDateString("vi-VN")
                  : "N/A"}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleEdit(garden)}
                  style={{
                    backgroundColor: "#6366f1",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Sửa
                </button>

                {(user?.role === "ADMIN" || garden.ownerId === user?.id) && (
                  <button
                    onClick={() => handleDelete(garden.id)}
                    style={{
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Xóa
                  </button>
                )}
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌱</div>
          <h3 style={{ margin: "0 0 8px 0", color: "#e0e0e0" }}>
            Chưa có vườn nào
          </h3>
          <p style={{ margin: 0 }}>Tạo vườn đầu tiên để bắt đầu quản lý</p>
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

      {/* Create/Edit Modal */}
      <Modal
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingGarden(null);
          setFormData({ name: "" });
        }}
        title={editingGarden ? "Chỉnh sửa vườn" : "Tạo vườn mới"}
      >
        <form onSubmit={handleSubmit}>
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
              Tên vườn *
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
              placeholder="Nhập tên vườn"
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
                setEditingGarden(null);
                setFormData({ name: "" });
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
              {editingGarden ? "Cập nhật" : "Tạo vườn"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GardenView;
