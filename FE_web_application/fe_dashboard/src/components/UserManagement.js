import React, { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/UserManagement.css";

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN" || user?.data?.role === "ADMIN";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    }
  }, [isAdmin, navigate]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "USER",
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
      });

      setUsers(response.data || []);
      setPagination({
        ...pagination,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userService.createUser(formData);
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      await userService.updateUser(editingUser.id, updateData);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      setLoading(true);
      await userService.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "USER",
    });
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      fullName: user.fullName || "",
      role: user.role,
    });
  };

  if (!isAdmin) {
    return (
      <div className="user-management">
        <div className="error-message">
          Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý
          người dùng.
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="header">
        <h2>Quản Lý Người Dùng</h2>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Thêm Người Dùng
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Họ Tên</th>
                <th>Vai Trò</th>
                <th>2FA</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.fullName || "-"}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.twoFactorEnabled ? "✓" : "✗"}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => openEditModal(user)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={pagination.page === 1}
          onClick={() =>
            setPagination({ ...pagination, page: pagination.page - 1 })
          }
        >
          Trước
        </button>
        <span>
          Trang {pagination.page} / {pagination.totalPages}
        </span>
        <button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() =>
            setPagination({ ...pagination, page: pagination.page + 1 })
          }
        >
          Sau
        </button>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingUser ? "Sửa Người Dùng" : "Thêm Người Dùng"}</h3>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <input
                type="password"
                placeholder={
                  editingUser
                    ? "Mật khẩu mới (để trống nếu không đổi)"
                    : "Mật khẩu"
                }
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingUser}
              />
              <input
                type="text"
                placeholder="Họ tên"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingUser ? "Cập Nhật" : "Tạo"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
