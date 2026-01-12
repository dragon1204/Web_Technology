import React, { useState, useEffect } from "react";
import { auditService } from "../services/auditService";
import { useAuth } from "../contexts/AuthContext";
import "../styles/AuditLogs.css";

const AuditLogs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.data?.role === "ADMIN";

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(isAdmin ? "recent" : "my");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    entityId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [activeTab, pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      // Only add filters if they have values
      if (filters.action) params.action = filters.action;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      // For entity tab
      if (activeTab === "entity") {
        if (filters.entityType) params.entityType = filters.entityType;
        if (filters.entityId) params.entityId = filters.entityId;
      }

      console.log(
        "AuditLogs: Fetching with params:",
        params,
        "Tab:",
        activeTab
      );

      switch (activeTab) {
        case "recent":
          response = await auditService.getRecentLogs(params);
          break;
        case "my":
          response = await auditService.getMyLogs(params);
          break;
        case "entity":
          response = await auditService.getLogsByEntity(params);
          break;
        default:
          response = await auditService.getMyLogs(params);
      }

      console.log("AuditLogs: Response:", response);

      // Handle different response formats
      const logsData = response.data || response.logs || response || [];
      console.log("AuditLogs: Extracted logs data:", logsData);
      console.log("AuditLogs: Is array?", Array.isArray(logsData));
      console.log("AuditLogs: First log:", logsData[0]);

      setLogs(Array.isArray(logsData) ? logsData : []);

      setPagination({
        ...pagination,
        total: response.total || response.count || logsData.length || 0,
        totalPages:
          response.totalPages ||
          Math.ceil((response.total || logsData.length) / pagination.limit) ||
          1,
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching audit logs:", err);
      // Set empty data on error
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getActionBadgeClass = (action) => {
    const actionMap = {
      CREATE: "success",
      UPDATE: "warning",
      DELETE: "danger",
      LOGIN: "info",
      LOGOUT: "info",
    };
    return actionMap[action] || "default";
  };

  return (
    <div className="audit-logs">
      <div className="header">
        <h2>Nhật Ký Hoạt Động</h2>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {isAdmin && (
          <button
            className={activeTab === "recent" ? "active" : ""}
            onClick={() => setActiveTab("recent")}
          >
            Gần Đây
          </button>
        )}
        <button
          className={activeTab === "my" ? "active" : ""}
          onClick={() => setActiveTab("my")}
        >
          Của Tôi
        </button>
        {isAdmin && (
          <button
            className={activeTab === "entity" ? "active" : ""}
            onClick={() => setActiveTab("entity")}
          >
            Theo Đối Tượng
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <select
          value={filters.action}
          onChange={(e) => {
            setFilters({ ...filters, action: e.target.value });
            setPagination({ ...pagination, page: 1 }); // Reset to page 1
          }}
        >
          <option value="">Tất cả hành động</option>
          <option value="CREATE">Tạo</option>
          <option value="UPDATE">Cập nhật</option>
          <option value="DELETE">Xóa</option>
          <option value="LOGIN">Đăng nhập</option>
          <option value="LOGOUT">Đăng xuất</option>
          <option value="READ">Xem</option>
        </select>

        {activeTab === "entity" && (
          <>
            <input
              type="text"
              placeholder="Loại đối tượng (VD: Garden, Vegetable)"
              value={filters.entityType}
              onChange={(e) =>
                setFilters({ ...filters, entityType: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="ID đối tượng"
              value={filters.entityId}
              onChange={(e) =>
                setFilters({ ...filters, entityId: e.target.value })
              }
            />
          </>
        )}

        <input
          type="date"
          placeholder="Từ ngày"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
        />
        <input
          type="date"
          placeholder="Đến ngày"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />

        <button
          className="btn-primary"
          onClick={() => {
            setPagination({ ...pagination, page: 1 });
            fetchLogs();
          }}
        >
          🔍 Lọc
        </button>

        <button
          className="btn-secondary"
          onClick={() => {
            setFilters({
              action: "",
              entityType: "",
              entityId: "",
              startDate: "",
              endDate: "",
            });
            setPagination({ ...pagination, page: 1 });
          }}
        >
          🔄 Đặt lại
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Debug info */}
      <div
        style={{
          padding: "10px",
          background: "#f0f0f0",
          marginBottom: "10px",
          fontSize: "12px",
        }}
      >
        <strong>Debug:</strong> Logs count: {logs.length}, Loading:{" "}
        {loading ? "Yes" : "No"}
        {logs.length > 0 && <div>First log: {JSON.stringify(logs[0])}</div>}
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div
          className="logs-table"
          style={{ width: "100%", overflowX: "auto" }}
        >
          <table style={{ width: "100%", minWidth: "900px" }}>
            <thead>
              <tr>
                <th style={{ minWidth: "150px" }}>Thời Gian</th>
                <th style={{ minWidth: "120px" }}>Người Dùng</th>
                <th style={{ minWidth: "100px" }}>Hành Động</th>
                <th style={{ minWidth: "120px" }}>Đối Tượng</th>
                <th style={{ minWidth: "120px" }}>IP</th>
                <th style={{ minWidth: "80px" }}>Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id || index}>
                    <td>{formatDate(log.timestamp || log.createdAt)}</td>
                    <td>
                      {log.username ||
                        log.user?.name ||
                        log.user?.email ||
                        log.userId ||
                        "-"}
                    </td>
                    <td>
                      <span
                        className={`action-badge ${getActionBadgeClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      {(log.entityType || log.entity) && (
                        <span>
                          {log.entityType || log.entity}
                          {log.entityId && ` #${log.entityId}`}
                        </span>
                      )}
                      {!log.entityType && !log.entity && "-"}
                    </td>
                    <td>{log.ipAddress || log.ip || "-"}</td>
                    <td>
                      {log.details || log.metadata ? (
                        <details>
                          <summary>Xem</summary>
                          <pre>
                            {JSON.stringify(
                              log.details || log.metadata,
                              null,
                              2
                            )}
                          </pre>
                        </details>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1 || loading}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
          >
            ← Trước
          </button>
          <span>
            Trang {pagination.page} / {pagination.totalPages || 1}
            {pagination.total > 0 && ` (Tổng: ${pagination.total} logs)`}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
