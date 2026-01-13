# Audit Log API - Tài liệu cho Frontend

## Tổng quan

Hệ thống Audit Log ghi lại **tất cả các hoạt động quan trọng** của người dùng trong hệ thống để:
- **Theo dõi**: Xem ai đã làm gì, khi nào, ở đâu
- **Bảo mật**: Phát hiện các hoạt động đáng ngờ
- **Tuân thủ**: Đáp ứng yêu cầu audit và compliance
- **Debug**: Tìm nguyên nhân lỗi thông qua request ID

**Base URL**: `http://localhost:3000` (hoặc domain production)

**Authentication**: Tất cả endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <access_token>
```

**Phân quyền**:
- **ADMIN**: Có thể xem tất cả audit logs
- **USER**: Chỉ có thể xem logs của chính mình

---

## Các loại hành động được log

| Action | Mô tả | Ví dụ |
|--------|-------|-------|
| `LOGIN` | Đăng nhập | Login thành công/thất bại, OAuth login |
| `LOGOUT` | Đăng xuất | User đăng xuất khỏi hệ thống |
| `REGISTER` | Đăng ký | Tạo tài khoản mới |
| `CREATE` | Tạo mới | Tạo garden, shop, product, etc. |
| `UPDATE` | Cập nhật | Cập nhật thông tin user, garden, shop, etc. |
| `DELETE` | Xóa | Xóa garden, shop, product, etc. |

---

## 1. Lấy danh sách logs gần đây (ADMIN only)

Lấy danh sách các audit logs gần đây nhất trong hệ thống.

### Endpoint
```
GET /audit/recent
```

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `limit` | number | No | Số lượng logs tối đa (mặc định: 100, tối đa: 1000) |

### Response

**Success (200 OK)**
```json
[
  {
    "id": 1,
    "action": "LOGIN",
    "entityType": "User",
    "entityId": "12",
    "userId": 12,
    "changes": {
      "email": "admin@example.com",
      "timestamp": "2026-01-13T10:00:00.000Z"
    },
    "requestId": "req-abc123",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "success": true,
    "errorMessage": null,
    "timestamp": "2026-01-13T10:00:00.000Z",
    "user": {
      "id": 12,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "ADMIN"
    }
  },
  {
    "id": 2,
    "action": "CREATE",
    "entityType": "Garden",
    "entityId": "5",
    "userId": 1,
    "changes": {
      "method": "POST",
      "url": "/garden",
      "body": { "name": "Vườn mới" },
      "response": 5,
      "duration": "45ms"
    },
    "requestId": "req-xyz789",
    "ipAddress": "192.168.1.101",
    "userAgent": "Mozilla/5.0...",
    "success": true,
    "errorMessage": null,
    "timestamp": "2026-01-13T09:55:00.000Z",
    "user": {
      "id": 1,
      "email": "user1@example.com",
      "name": "Nguyễn Văn A",
      "role": "USER"
    }
  },
  {
    "id": 3,
    "action": "LOGIN",
    "entityType": "User",
    "entityId": "2",
    "userId": 2,
    "changes": {
      "email": "user2@example.com"
    },
    "requestId": "req-def456",
    "ipAddress": "192.168.1.102",
    "userAgent": "Mozilla/5.0...",
    "success": false,
    "errorMessage": "Invalid password",
    "timestamp": "2026-01-13T09:50:00.000Z",
    "user": {
      "id": 2,
      "email": "user2@example.com",
      "name": "Trần Thị B",
      "role": "USER"
    }
  }
]
```

**Error (403 Forbidden)**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### Ví dụ sử dụng

```javascript
// services/auditService.js
const API_BASE_URL = 'http://localhost:3000';

export const getRecentLogs = async (limit = 100, token) => {
  const response = await fetch(`${API_BASE_URL}/audit/recent?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch recent logs');
  }

  return response.json();
};

// Component usage
import { getRecentLogs } from '../services/auditService';
import { useAuth } from '../contexts/AuthContext';

function RecentLogs() {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const fetchLogs = async () => {
        setLoading(true);
        try {
          const data = await getRecentLogs(50, token);
          setLogs(data);
        } catch (error) {
          console.error('Error fetching logs:', error);
          alert(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }
  }, [token, user]);

  return (
    <div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>User</th>
              <th>Hành động</th>
              <th>Entity</th>
              <th>IP</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                <td>{log.user?.email || 'N/A'}</td>
                <td>{log.action}</td>
                <td>{log.entityType} #{log.entityId}</td>
                <td>{log.ipAddress}</td>
                <td>
                  {log.success ? (
                    <span style={{ color: 'green' }}>✓ Thành công</span>
                  ) : (
                    <span style={{ color: 'red' }}>✗ Thất bại</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

## 2. Lấy logs của user hiện tại (với filter và pagination)

Lấy danh sách audit logs của chính user đang đăng nhập với hỗ trợ filter và pagination.

### Endpoint
```
GET /audit/my-logs
```

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `action` | string | No | Lọc theo action (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, REGISTER) |
| `entityType` | string | No | Lọc theo entity type (User, Garden, Shop, ShopProduct, etc.) |
| `success` | boolean | No | Lọc theo trạng thái thành công (`true`/`false`) |
| `startDate` | string | No | Ngày bắt đầu (ISO 8601 format: `2026-01-01T00:00:00.000Z`) |
| `endDate` | string | No | Ngày kết thúc (ISO 8601 format: `2026-01-31T23:59:59.999Z`) |
| `search` | string | No | Tìm kiếm trong action, entityType, entityId, ipAddress, errorMessage |
| `page` | number | No | Số trang (mặc định: 1) |
| `limit` | number | No | Số lượng mỗi trang (mặc định: 50) |

**Lưu ý**: Endpoint này tự động filter theo userId của user hiện tại, user chỉ có thể xem logs của chính mình.

### Response

**Success (200 OK)**
```json
{
  "data": [
    {
      "id": 10,
      "action": "LOGIN",
      "entityType": "User",
      "entityId": "1",
      "userId": 1,
      "changes": {
        "email": "user1@example.com",
        "timestamp": "2026-01-13T10:00:00.000Z"
      },
      "requestId": "req-abc123",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-13T10:00:00.000Z",
      "user": {
        "id": 1,
        "email": "user1@example.com",
        "name": "Nguyễn Văn A",
        "role": "USER"
      }
    },
    {
      "id": 9,
      "action": "CREATE",
      "entityType": "Garden",
      "entityId": "5",
      "userId": 1,
      "changes": {
        "after": { "name": "Vườn mới", "ownerId": 1 }
      },
      "requestId": "req-xyz789",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-13T09:55:00.000Z",
      "user": {
        "id": 1,
        "email": "user1@example.com",
        "name": "Nguyễn Văn A",
        "role": "USER"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

### Ví dụ sử dụng

```javascript
// services/auditService.js
export const getMyLogs = async (filters = {}, pagination = {}, token) => {
  const queryParams = new URLSearchParams();
  
  if (filters.action) queryParams.append('action', filters.action);
  if (filters.entityType) queryParams.append('entityType', filters.entityType);
  if (filters.success !== undefined) queryParams.append('success', filters.success);
  if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
  if (filters.search) queryParams.append('search', filters.search);
  if (pagination.page) queryParams.append('page', pagination.page);
  if (pagination.limit) queryParams.append('limit', pagination.limit);

  const url = `${API_BASE_URL}/audit/my-logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch my logs');
  }

  return response.json();
};

// Component usage với filter và pagination
function MyActivityLog() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    success: undefined,
    startDate: '',
    endDate: '',
    search: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const filterData = {
        ...filters,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        success: filters.success === '' ? undefined : filters.success === 'true',
      };
      
      const data = await getMyLogs(filterData, { page, limit: 50 }, token);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters]);

  return (
    <div>
      <h2>Lịch sử hoạt động của tôi</h2>
      
      {/* Filter UI */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
        >
          <option value="">Tất cả hành động</option>
          <option value="LOGIN">Đăng nhập</option>
          <option value="LOGOUT">Đăng xuất</option>
          <option value="REGISTER">Đăng ký</option>
          <option value="CREATE">Tạo mới</option>
          <option value="UPDATE">Cập nhật</option>
          <option value="DELETE">Xóa</option>
        </select>

        <select
          value={filters.entityType}
          onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
        >
          <option value="">Tất cả entity</option>
          <option value="User">User</option>
          <option value="Garden">Garden</option>
          <option value="Shop">Shop</option>
          <option value="ShopProduct">ShopProduct</option>
        </select>

        <select
          value={filters.success === undefined ? '' : filters.success ? 'true' : 'false'}
          onChange={(e) => setFilters({ ...filters, success: e.target.value })}
        >
          <option value="">Tất cả</option>
          <option value="true">Thành công</option>
          <option value="false">Thất bại</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Từ ngày"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="Đến ngày"
        />

        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Tìm kiếm..."
        />
      </div>

      {/* Logs List */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Thời gian</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Hành động</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Entity</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>IP</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Trạng thái</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <strong>{log.action}</strong>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {log.entityType} #{log.entityId}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {log.ipAddress || 'N/A'}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {log.success ? (
                      <span style={{ color: 'green' }}>✓ Thành công</span>
                    ) : (
                      <span style={{ color: 'red' }}>✗ {log.errorMessage || 'Thất bại'}</span>
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button onClick={() => console.log(log.changes)}>
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchLogs(pagination.page - 1)}
            >
              Trước
            </button>
            <span>
              Trang {pagination.page} / {pagination.totalPages} (Tổng: {pagination.total} logs)
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchLogs(pagination.page + 1)}
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 3. Tìm kiếm logs với filter và pagination

Tìm kiếm audit logs với nhiều filter và hỗ trợ pagination.

### Endpoint
```
GET /audit/search
```

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `action` | string | No | Lọc theo action (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, REGISTER) |
| `entityType` | string | No | Lọc theo entity type (User, Garden, Shop, ShopProduct, etc.) |
| `success` | boolean | No | Lọc theo trạng thái thành công (`true`/`false`) |
| `startDate` | string | No | Ngày bắt đầu (ISO 8601 format: `2026-01-01T00:00:00.000Z`) |
| `endDate` | string | No | Ngày kết thúc (ISO 8601 format: `2026-01-31T23:59:59.999Z`) |
| `search` | string | No | Tìm kiếm trong action, entityType, entityId, ipAddress, errorMessage |
| `page` | number | No | Số trang (mặc định: 1) |
| `limit` | number | No | Số lượng mỗi trang (mặc định: 50) |

**Lưu ý**: USER chỉ có thể xem logs của chính mình (tự động filter theo userId)

### Response

**Success (200 OK)**
```json
{
  "data": [
    {
      "id": 15,
      "action": "LOGIN",
      "entityType": "User",
      "entityId": "1",
      "userId": 1,
      "changes": {
        "email": "user1@example.com",
        "provider": "google",
        "isNewUser": false
      },
      "requestId": "req-abc123",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-13T10:00:00.000Z",
      "user": {
        "id": 1,
        "email": "user1@example.com",
        "name": "Nguyễn Văn A",
        "role": "USER"
      }
    },
    {
      "id": 14,
      "action": "CREATE",
      "entityType": "ShopProduct",
      "entityId": "3",
      "userId": 1,
      "changes": {
        "after": {
          "shopId": 1,
          "vegetableId": 2,
          "gardenId": 1,
          "price": 35000,
          "stock": 100
        }
      },
      "requestId": "req-xyz789",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-13T09:50:00.000Z",
      "user": {
        "id": 1,
        "email": "user1@example.com",
        "name": "Nguyễn Văn A",
        "role": "USER"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

### Ví dụ sử dụng

```javascript
// services/auditService.js
export const searchLogs = async (filters = {}, pagination = {}, token) => {
  const queryParams = new URLSearchParams();
  
  if (filters.action) queryParams.append('action', filters.action);
  if (filters.entityType) queryParams.append('entityType', filters.entityType);
  if (filters.success !== undefined) queryParams.append('success', filters.success);
  if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
  if (filters.search) queryParams.append('search', filters.search);
  if (pagination.page) queryParams.append('page', pagination.page);
  if (pagination.limit) queryParams.append('limit', pagination.limit);

  const url = `${API_BASE_URL}/audit/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search logs');
  }

  return response.json();
};

// Component usage
function AuditLogSearch() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    success: undefined,
    startDate: '',
    endDate: '',
    search: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const filterData = {
        ...filters,
        startDate: filters.startDate ? new Date(filters.startDate) : undefined,
        endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        success: filters.success === '' ? undefined : filters.success === 'true',
      };
      
      const data = await searchLogs(filterData, { page, limit: 50 }, token);
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error searching logs:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters]);

  return (
    <div>
      {/* Filter UI */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
        >
          <option value="">Tất cả hành động</option>
          <option value="LOGIN">Đăng nhập</option>
          <option value="LOGOUT">Đăng xuất</option>
          <option value="REGISTER">Đăng ký</option>
          <option value="CREATE">Tạo mới</option>
          <option value="UPDATE">Cập nhật</option>
          <option value="DELETE">Xóa</option>
        </select>

        <select
          value={filters.entityType}
          onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
        >
          <option value="">Tất cả entity</option>
          <option value="User">User</option>
          <option value="Garden">Garden</option>
          <option value="Shop">Shop</option>
          <option value="ShopProduct">ShopProduct</option>
        </select>

        <select
          value={filters.success === undefined ? '' : filters.success ? 'true' : 'false'}
          onChange={(e) => setFilters({ ...filters, success: e.target.value })}
        >
          <option value="">Tất cả</option>
          <option value="true">Thành công</option>
          <option value="false">Thất bại</option>
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Từ ngày"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="Đến ngày"
        />

        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Tìm kiếm..."
        />
      </div>

      {/* Logs List */}
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>User</th>
                <th>Hành động</th>
                <th>Entity</th>
                <th>IP</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                  <td>{log.user?.email || 'N/A'}</td>
                  <td>{log.action}</td>
                  <td>{log.entityType} #{log.entityId}</td>
                  <td>{log.ipAddress}</td>
                  <td>
                    {log.success ? (
                      <span style={{ color: 'green' }}>✓</span>
                    ) : (
                      <span style={{ color: 'red' }}>✗ {log.errorMessage}</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => console.log(log.changes)}>
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div>
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchLogs(pagination.page - 1)}
            >
              Trước
            </button>
            <span>
              Trang {pagination.page} / {pagination.totalPages} (Tổng: {pagination.total})
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchLogs(pagination.page + 1)}
            >
              Sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## 4. Lấy logs theo entity (ADMIN only)

Lấy danh sách audit logs của một entity cụ thể (ví dụ: tất cả logs liên quan đến Garden ID 5).

### Endpoint
```
GET /audit/by-entity
```

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `entityType` | string | Yes | Loại entity (User, Garden, Shop, ShopProduct, etc.) |
| `entityId` | string | Yes | ID của entity |
| `limit` | number | No | Số lượng logs tối đa (mặc định: 50) |

### Response

**Success (200 OK)**
```json
[
  {
    "id": 20,
    "action": "CREATE",
    "entityType": "Garden",
    "entityId": "5",
    "userId": 1,
    "changes": {
      "after": { "name": "Vườn mới", "ownerId": 1 }
    },
    "requestId": "req-xyz789",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "success": true,
    "errorMessage": null,
    "timestamp": "2026-01-13T09:55:00.000Z",
    "user": {
      "id": 1,
      "email": "user1@example.com",
      "name": "Nguyễn Văn A",
      "role": "USER"
    }
  },
  {
    "id": 25,
    "action": "UPDATE",
    "entityType": "Garden",
    "entityId": "5",
    "userId": 1,
    "changes": {
      "before": { "name": "Vườn mới" },
      "after": { "name": "Vườn đã đổi tên" }
    },
    "requestId": "req-abc456",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "success": true,
    "errorMessage": null,
    "timestamp": "2026-01-13T10:30:00.000Z",
    "user": {
      "id": 1,
      "email": "user1@example.com",
      "name": "Nguyễn Văn A",
      "role": "USER"
    }
  }
]
```

### Ví dụ sử dụng

```javascript
// services/auditService.js
export const getLogsByEntity = async (entityType, entityId, limit = 50, token) => {
  const response = await fetch(
    `${API_BASE_URL}/audit/by-entity?entityType=${entityType}&entityId=${entityId}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch logs by entity');
  }

  return response.json();
};

// Component usage
function EntityHistory({ entityType, entityId }) {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN' && entityType && entityId) {
      const fetchLogs = async () => {
        setLoading(true);
        try {
          const data = await getLogsByEntity(entityType, entityId, 100, token);
          setLogs(data);
        } catch (error) {
          console.error('Error fetching logs:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }
  }, [entityType, entityId, token, user]);

  return (
    <div>
      <h3>Lịch sử thay đổi: {entityType} #{entityId}</h3>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ul>
          {logs.map((log) => (
            <li key={log.id}>
              <strong>{log.action}</strong> bởi {log.user?.email} vào{' '}
              {new Date(log.timestamp).toLocaleString('vi-VN')}
              {log.changes && (
                <details>
                  <summary>Chi tiết</summary>
                  <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                </details>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 5. Lấy logs theo Request ID (ADMIN only)

Lấy tất cả audit logs của một request cụ thể (để debug hoặc trace toàn bộ flow của một request).

### Endpoint
```
GET /audit/by-request
```

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `requestId` | string | Yes | Request ID cần tìm |

### Response

**Success (200 OK)**
```json
[
  {
    "id": 30,
    "action": "LOGIN",
    "entityType": "User",
    "entityId": "1",
    "userId": 1,
    "changes": {
      "email": "user1@example.com",
      "timestamp": "2026-01-13T10:00:00.000Z"
    },
    "requestId": "req-abc123",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "success": true,
    "errorMessage": null,
    "timestamp": "2026-01-13T10:00:00.000Z",
    "user": {
      "id": 1,
      "email": "user1@example.com",
      "name": "Nguyễn Văn A",
      "role": "USER"
    }
  },
  {
    "id": 31,
    "action": "CREATE",
    "entityType": "Garden",
    "entityId": "5",
    "userId": 1,
    "changes": {
      "after": { "name": "Vườn mới" }
    },
    "requestId": "req-abc123",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "success": true,
    "errorMessage": null,
    "timestamp": "2026-01-13T10:00:05.000Z",
    "user": {
      "id": 1,
      "email": "user1@example.com",
      "name": "Nguyễn Văn A",
      "role": "USER"
    }
  }
]
```

### Ví dụ sử dụng

```javascript
// services/auditService.js
export const getLogsByRequestId = async (requestId, token) => {
  const response = await fetch(
    `${API_BASE_URL}/audit/by-request?requestId=${requestId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch logs by request ID');
  }

  return response.json();
};

// Component usage - Debug view
function RequestTrace({ requestId }) {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN' && requestId) {
      const fetchLogs = async () => {
        setLoading(true);
        try {
          const data = await getLogsByRequestId(requestId, token);
          setLogs(data);
        } catch (error) {
          console.error('Error fetching logs:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }
  }, [requestId, token, user]);

  return (
    <div>
      <h3>Request Trace: {requestId}</h3>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ol>
          {logs.map((log, index) => (
            <li key={log.id}>
              <strong>{index + 1}. {log.action}</strong> - {log.entityType} #{log.entityId}
              <br />
              <small>
                {new Date(log.timestamp).toLocaleString('vi-VN')} - 
                {log.success ? ' ✓' : ' ✗ ' + log.errorMessage}
              </small>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
```

---

## 6. Lấy thống kê audit logs

Lấy thống kê về audit logs (số lượng theo action, success/failure, entity type).

### Endpoint
```
GET /audit/statistics
```

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
| Tên | Type | Required | Mô tả |
|-----|------|----------|-------|
| `startDate` | string | No | Ngày bắt đầu (ISO 8601 format) |
| `endDate` | string | No | Ngày kết thúc (ISO 8601 format) |

**Lưu ý**: USER chỉ có thể xem statistics của chính mình

### Response

**Success (200 OK)**
```json
{
  "total": 150,
  "byAction": [
    {
      "action": "LOGIN",
      "count": 45
    },
    {
      "action": "CREATE",
      "count": 30
    },
    {
      "action": "UPDATE",
      "count": 50
    },
    {
      "action": "DELETE",
      "count": 10
    },
    {
      "action": "LOGOUT",
      "count": 15
    }
  ],
  "bySuccess": {
    "success": 140,
    "failed": 10
  },
  "byEntityType": [
    {
      "entityType": "User",
      "count": 60
    },
    {
      "entityType": "Garden",
      "count": 40
    },
    {
      "entityType": "Shop",
      "count": 30
    },
    {
      "entityType": "ShopProduct",
      "count": 20
    }
  ]
}
```

### Ví dụ sử dụng

```javascript
// services/auditService.js
export const getAuditStatistics = async (startDate, endDate, token) => {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate.toISOString());
  if (endDate) queryParams.append('endDate', endDate.toISOString());

  const url = `${API_BASE_URL}/audit/statistics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch statistics');
  }

  return response.json();
};

// Component usage
function AuditStatistics() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getAuditStatistics(dateRange.startDate, dateRange.endDate, token);
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  return (
    <div>
      <h2>Thống kê Audit Logs</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="date"
          value={dateRange.startDate.toISOString().split('T')[0]}
          onChange={(e) => setDateRange({ ...dateRange, startDate: new Date(e.target.value) })}
        />
        <input
          type="date"
          value={dateRange.endDate.toISOString().split('T')[0]}
          onChange={(e) => setDateRange({ ...dateRange, endDate: new Date(e.target.value) })}
        />
        <button onClick={fetchStats}>Làm mới</button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : stats ? (
        <div>
          <div>
            <h3>Tổng số logs: {stats.total}</h3>
          </div>

          <div>
            <h3>Theo hành động:</h3>
            <ul>
              {stats.byAction.map((item) => (
                <li key={item.action}>
                  {item.action}: {item.count}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Thành công / Thất bại:</h3>
            <p>Thành công: {stats.bySuccess.success}</p>
            <p>Thất bại: {stats.bySuccess.failed}</p>
          </div>

          <div>
            <h3>Theo Entity Type:</h3>
            <ul>
              {stats.byEntityType.map((item) => (
                <li key={item.entityType}>
                  {item.entityType}: {item.count}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

---

## Tổng hợp các Endpoints

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| GET | `/audit/recent` | Lấy logs gần đây | ADMIN |
| GET | `/audit/my-logs` | Lấy logs của user hiện tại (với filter/pagination) | USER, ADMIN |
| GET | `/audit/search` | Tìm kiếm logs với filter/pagination | USER, ADMIN |
| GET | `/audit/by-entity` | Lấy logs theo entity | ADMIN |
| GET | `/audit/by-request` | Lấy logs theo request ID | ADMIN |
| GET | `/audit/statistics` | Lấy thống kê logs | USER, ADMIN |

---

## Cấu trúc Audit Log Object

```typescript
interface AuditLog {
  id: number;
  action: string;              // LOGIN, LOGOUT, REGISTER, CREATE, UPDATE, DELETE
  entityType?: string;          // User, Garden, Shop, ShopProduct, etc.
  entityId?: string;           // ID của entity
  userId?: number;             // ID của user thực hiện hành động
  changes?: any;               // JSON object chứa thông tin thay đổi
  requestId?: string;          // Request ID để trace
  ipAddress?: string;          // IP address của user
  userAgent?: string;          // User agent string
  success: boolean;            // Thành công hay thất bại
  errorMessage?: string;       // Thông báo lỗi (nếu có)
  timestamp: string;           // ISO 8601 timestamp
  user?: {                     // Thông tin user (nếu có)
    id: number;
    email: string;
    name: string;
    role: string;
  };
}
```

---

## Các hành động được log tự động

### Authentication
- ✅ **LOGIN**: Đăng nhập thành công/thất bại (bao gồm OAuth)
- ✅ **LOGOUT**: Đăng xuất
- ✅ **REGISTER**: Đăng ký tài khoản mới

### CRUD Operations (tự động log qua AuditInterceptor)
- ✅ **CREATE**: Tạo mới entity (Garden, Shop, ShopProduct, etc.)
- ✅ **UPDATE**: Cập nhật entity
- ✅ **DELETE**: Xóa entity

### Các thao tác khác
- Các thao tác quan trọng khác có thể được log thủ công bằng `auditService.log()`

---

## Lưu ý quan trọng

1. **Authentication**: Tất cả endpoints yêu cầu JWT token

2. **Authorization**: 
   - ADMIN có thể xem tất cả logs
   - USER chỉ có thể xem logs của chính mình

3. **Pagination**: 
   - Endpoints `/audit/search` hỗ trợ pagination
   - Các endpoints khác dùng `limit` parameter

4. **Date Format**: 
   - Sử dụng ISO 8601 format: `2026-01-13T10:00:00.000Z`
   - Hoặc date string: `2026-01-13`

5. **Filter Search**: 
   - Tìm kiếm trong: `action`, `entityType`, `entityId`, `ipAddress`, `errorMessage`

6. **Performance**: 
   - Với lượng logs lớn, nên sử dụng filter và pagination
   - Không nên query quá nhiều logs cùng lúc (limit tối đa: 1000)

---

## Ví dụ workflow hoàn chỉnh

```javascript
// 1. User đăng nhập → tự động log LOGIN
// 2. User tạo garden → tự động log CREATE Garden
// 3. User cập nhật garden → tự động log UPDATE Garden
// 4. User xem logs của mình
const myLogs = await getMyLogs(100, token);

// 5. Admin xem tất cả logs gần đây
const recentLogs = await getRecentLogs(50, token);

// 6. Admin tìm kiếm logs với filter
const filteredLogs = await searchLogs({
  action: 'LOGIN',
  success: false,
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-01-31'),
}, { page: 1, limit: 50 }, token);

// 7. Admin xem lịch sử của một entity cụ thể
const entityLogs = await getLogsByEntity('Garden', '5', 100, token);

// 8. Admin trace một request
const requestLogs = await getLogsByRequestId('req-abc123', token);

// 9. Xem thống kê
const stats = await getAuditStatistics(
  new Date('2026-01-01'),
  new Date('2026-01-31'),
  token
);
```

---

## Best Practices cho Frontend

1. **Hiển thị logs theo thời gian thực**: 
   - Polling mỗi 30-60 giây để cập nhật logs mới
   - Hoặc sử dụng WebSocket nếu có

2. **Filter UI**: 
   - Cung cấp dropdown cho action, entityType
   - Date picker cho date range
   - Search box cho text search

3. **Pagination**: 
   - Hiển thị số trang và tổng số items
   - Cho phép chuyển trang dễ dàng

4. **Error Handling**: 
   - Hiển thị logs thất bại với màu đỏ
   - Hiển thị errorMessage khi có

5. **Performance**: 
   - Không load quá nhiều logs cùng lúc
   - Sử dụng virtual scrolling cho danh sách dài

6. **Security**: 
   - Không hiển thị sensitive data trong changes
   - Mask password fields nếu có

---

**Tài liệu này được cập nhật lần cuối: 2026-01-13**
