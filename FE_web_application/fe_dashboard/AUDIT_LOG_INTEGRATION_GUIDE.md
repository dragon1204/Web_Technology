# Hướng Dẫn Tích Hợp Audit Log (Nhật Ký Hoạt Động)

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [API Endpoints](#api-endpoints)
3. [Data Structure](#data-structure)
4. [Implementation Guide](#implementation-guide)
5. [Code Examples](#code-examples)
6. [Filtering & Pagination](#filtering--pagination)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## 📖 Tổng Quan

Audit Log (Nhật Ký Hoạt Động) là hệ thống ghi lại tất cả các hành động quan trọng của người dùng trong hệ thống để:
- **Theo dõi**: Xem ai đã làm gì, khi nào, ở đâu
- **Bảo mật**: Phát hiện các hoạt động đáng ngờ
- **Tuân thủ**: Đáp ứng yêu cầu audit và compliance
- **Debug**: Tìm nguyên nhân lỗi thông qua request ID

### Các Loại Hành Động (Actions):
- `CREATE` - Tạo mới entity
- `UPDATE` - Cập nhật entity
- `DELETE` - Xóa entity
- `LOGIN` - Đăng nhập
- `LOGOUT` - Đăng xuất
- `READ` - Xem/Đọc dữ liệu (tùy chọn)

### Phân Quyền:
- **ADMIN**: Có thể xem tất cả audit logs (recent, by-entity, by-request)
- **USER**: Chỉ có thể xem logs của chính mình (my-logs)

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/audit
```

### 1. Get Recent Audit Logs (ADMIN only)
**Endpoint:** `GET /audit/recent`

**Authentication:** Required (Bearer Token)

**Authorization:** ADMIN role only

**Description:** Lấy danh sách các audit logs gần đây nhất trong hệ thống

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 100 | Số lượng logs tối đa trả về |

**Request:**
```http
GET /audit/recent?limit=50
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "LOGIN",
      "entityType": "User",
      "entityId": "4",
      "userId": 4,
      "changes": {
        "email": "admin@example.com",
        "timestamp": "2026-01-12T07:00:00.000Z"
      },
      "requestId": "req-123456",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-12T07:00:00.000Z"
    },
    {
      "id": 2,
      "action": "CREATE",
      "entityType": "Vegetable",
      "entityId": "5",
      "userId": 4,
      "changes": {
        "after": {
          "name": "Tomato",
          "price": 30000,
          "quantity": 100
        }
      },
      "requestId": "req-123457",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-12T06:55:00.000Z"
    }
  ],
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Token không hợp lệ hoặc đã hết hạn
- `403 Forbidden`: User không có quyền ADMIN
- `500 Internal Server Error`: Lỗi server

---

### 2. Get My Audit Logs
**Endpoint:** `GET /audit/my-logs`

**Authentication:** Required (Bearer Token)

**Authorization:** All authenticated users

**Description:** Lấy danh sách audit logs của user hiện tại

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 50 | Số lượng logs tối đa trả về |

**Request:**
```http
GET /audit/my-logs?limit=20
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": [
    {
      "id": 11,
      "action": "LOGIN",
      "entityType": "User",
      "entityId": "4",
      "userId": 4,
      "changes": {
        "email": "admin@example.com",
        "timestamp": "2026-01-12T07:17:21.217Z"
      },
      "requestId": "req-789012",
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-12T07:17:21.217Z"
    }
  ],
  "timestamp": "2026-01-12T07:17:21.217Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Token không hợp lệ
- `500 Internal Server Error`: Lỗi server

---

### 3. Get Audit Logs by Entity (ADMIN only)
**Endpoint:** `GET /audit/by-entity`

**Authentication:** Required (Bearer Token)

**Authorization:** ADMIN role only

**Description:** Lấy audit logs theo entity type và entity ID

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `entityType` | string | Yes | - | Loại entity (VD: "Garden", "Vegetable", "User") |
| `entityId` | string | Yes | - | ID của entity |
| `limit` | number | No | 50 | Số lượng logs tối đa trả về |

**Request:**
```http
GET /audit/by-entity?entityType=Vegetable&entityId=5&limit=20
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": [
    {
      "id": 2,
      "action": "CREATE",
      "entityType": "Vegetable",
      "entityId": "5",
      "userId": 4,
      "changes": {
        "after": {
          "name": "Tomato",
          "price": 30000
        }
      },
      "requestId": "req-123457",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-12T06:55:00.000Z"
    },
    {
      "id": 3,
      "action": "UPDATE",
      "entityType": "Vegetable",
      "entityId": "5",
      "userId": 4,
      "changes": {
        "before": { "price": 30000 },
        "after": { "price": 35000 }
      },
      "requestId": "req-123458",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-12T06:50:00.000Z"
    }
  ],
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Thiếu `entityType` hoặc `entityId`
- `401 Unauthorized`: Token không hợp lệ
- `403 Forbidden`: User không có quyền ADMIN
- `500 Internal Server Error`: Lỗi server

---

### 4. Get Audit Logs by Request ID (ADMIN only)
**Endpoint:** `GET /audit/by-request`

**Authentication:** Required (Bearer Token)

**Authorization:** ADMIN role only

**Description:** Lấy tất cả audit logs của một request cụ thể (theo requestId)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `requestId` | string | Yes | - | Request ID để trace |

**Request:**
```http
GET /audit/by-request?requestId=req-123456
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "LOGIN",
      "entityType": "User",
      "entityId": "4",
      "userId": 4,
      "changes": {
        "email": "admin@example.com",
        "timestamp": "2026-01-12T07:00:00.000Z"
      },
      "requestId": "req-123456",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "errorMessage": null,
      "timestamp": "2026-01-12T07:00:00.000Z"
    }
  ],
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Thiếu `requestId`
- `401 Unauthorized`: Token không hợp lệ
- `403 Forbidden`: User không có quyền ADMIN
- `500 Internal Server Error`: Lỗi server

---

## 📊 Data Structure

### AuditLog Object

```typescript
interface AuditLog {
  id: number;                    // Unique ID
  action: string;                // Action type: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entityType?: string;            // Entity type: "User", "Garden", "Vegetable", etc.
  entityId?: string;             // Entity ID (as string)
  userId?: number;                // User ID who performed the action
  changes?: {                     // Changes object (JSON)
    before?: any;                 // Data before change (for UPDATE/DELETE)
    after?: any;                  // Data after change (for CREATE/UPDATE)
    [key: string]: any;           // Additional fields
  };
  requestId?: string;             // Request ID for tracing
  ipAddress?: string;             // IP address of the request
  userAgent?: string;             // User agent string
  success: boolean;                // Whether the action succeeded
  errorMessage?: string;          // Error message if success = false
  timestamp: string;              // ISO 8601 timestamp
}
```

### Action Types

| Action | Description | Changes Structure |
|--------|-------------|-------------------|
| `CREATE` | Tạo mới entity | `{ after: {...} }` |
| `UPDATE` | Cập nhật entity | `{ before: {...}, after: {...} }` |
| `DELETE` | Xóa entity | `{ before: {...} }` |
| `LOGIN` | Đăng nhập | `{ email: "...", timestamp: "..." }` |
| `LOGOUT` | Đăng xuất | `{}` hoặc `null` |
| `READ` | Đọc/Xem dữ liệu | `{}` hoặc `null` |

### Entity Types

Các entity types phổ biến:
- `User` - Người dùng
- `Garden` - Vườn
- `Vegetable` - Rau củ
- `Device` - Thiết bị
- `Sale` - Bán hàng
- `Notification` - Thông báo
- `Alert` - Cảnh báo

---

## 💻 Implementation Guide

### Bước 1: Cập Nhật AuditService

File `src/services/auditService.js` đã có sẵn các methods. Đảm bảo các methods sau đã được implement:

```javascript
import { config } from "../config";

const API_BASE = config.API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const auditService = {
  // Get recent audit logs (Admin only)
  async getRecentLogs(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);
    if (params.action) queryParams.append("action", params.action);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await fetch(`${API_BASE}/audit/recent?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch recent audit logs");
    }

    return response.json();
  },

  // Get audit logs for current user
  async getMyLogs(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);
    if (params.action) queryParams.append("action", params.action);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await fetch(`${API_BASE}/audit/my-logs?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch user audit logs");
    }

    return response.json();
  },

  // Get audit logs by entity (Admin only)
  async getLogsByEntity(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (!params.entityType || !params.entityId) {
      throw new Error("entityType and entityId are required");
    }
    
    queryParams.append("entityType", params.entityType);
    queryParams.append("entityId", params.entityId);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);

    const response = await fetch(`${API_BASE}/audit/by-entity?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch audit logs by entity");
    }

    return response.json();
  },

  // Get audit logs by request ID (Admin only)
  async getLogsByRequest(requestId, params = {}) {
    if (!requestId) {
      throw new Error("requestId is required");
    }

    const queryParams = new URLSearchParams();
    queryParams.append("requestId", requestId);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);

    const response = await fetch(`${API_BASE}/audit/by-request?${queryParams}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch audit logs by request");
    }

    return response.json();
  },
};
```

### Bước 2: Tạo Component AuditLogs

Component `src/components/AuditLogs.js` đã có sẵn. Đảm bảo component có các tính năng:

1. **Tabs**: Recent (Admin), My Logs, By Entity (Admin)
2. **Filters**: Action, Entity Type, Entity ID, Date Range
3. **Table Display**: Hiển thị logs trong bảng
4. **Pagination**: Phân trang cho danh sách logs
5. **Loading States**: Hiển thị loading khi fetch data
6. **Error Handling**: Hiển thị lỗi nếu có

---

## 💡 Code Examples

### Example 1: Fetch My Logs với Filters

```javascript
import { auditService } from "../services/auditService";

const fetchMyLogs = async () => {
  try {
    const params = {
      limit: 20,
      page: 1,
      action: "CREATE", // Filter by action
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    };

    const response = await auditService.getMyLogs(params);
    const logs = response.data || [];
    
    console.log("My logs:", logs);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

### Example 2: Fetch Recent Logs (Admin)

```javascript
import { auditService } from "../services/auditService";
import { useAuth } from "../contexts/AuthContext";

const AuditLogsComponent = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const fetchRecentLogs = async () => {
    if (!isAdmin) {
      console.error("Access denied: Admin only");
      return;
    }

    try {
      const response = await auditService.getRecentLogs({ limit: 50 });
      const logs = response.data || [];
      
      // Process logs...
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    // Component JSX...
  );
};
```

### Example 3: Fetch Logs by Entity

```javascript
const fetchLogsByEntity = async () => {
  try {
    const params = {
      entityType: "Vegetable",
      entityId: "5",
      limit: 20,
    };

    const response = await auditService.getLogsByEntity(params);
    const logs = response.data || [];
    
    // Logs sẽ chứa tất cả các thao tác trên Vegetable có ID = 5
    console.log("Entity logs:", logs);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

### Example 4: Format và Display Logs

```javascript
const formatAuditLog = (log) => {
  return {
    id: log.id,
    timestamp: formatDate(log.timestamp),
    user: log.userId || "Unknown",
    action: log.action,
    entity: log.entityType 
      ? `${log.entityType} #${log.entityId}` 
      : "-",
    ip: log.ipAddress || "-",
    success: log.success,
    details: log.changes ? JSON.stringify(log.changes, null, 2) : null,
  };
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

// Usage
const logs = response.data.map(formatAuditLog);
```

### Example 5: Filter Logs by Action Type

```javascript
const getActionBadgeColor = (action) => {
  const colorMap = {
    CREATE: "success",   // Green
    UPDATE: "warning",   // Yellow/Orange
    DELETE: "error",     // Red
    LOGIN: "info",       // Blue
    LOGOUT: "info",      // Blue
    READ: "default",     // Gray
  };
  return colorMap[action] || "default";
};

// Usage in component
<Chip
  label={log.action}
  color={getActionBadgeColor(log.action)}
  size="small"
/>
```

---

## 🔍 Filtering & Pagination

### Filtering Options

#### 1. Filter by Action
```javascript
const params = {
  action: "CREATE", // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
};
```

#### 2. Filter by Date Range
```javascript
const params = {
  startDate: "2026-01-01", // YYYY-MM-DD format
  endDate: "2026-01-31",
};
```

#### 3. Filter by Entity (Admin only)
```javascript
const params = {
  entityType: "Vegetable",
  entityId: "5",
};
```

### Pagination

**Note:** Backend hiện tại chỉ hỗ trợ `limit` parameter, không có pagination thực sự. Frontend cần implement pagination client-side hoặc yêu cầu backend thêm pagination.

**Client-side Pagination Example:**
```javascript
const [logs, setLogs] = useState([]);
const [pagination, setPagination] = useState({
  page: 1,
  limit: 20,
  total: 0,
});

const fetchLogs = async () => {
  try {
    // Fetch more than needed for pagination
    const response = await auditService.getMyLogs({ limit: 100 });
    const allLogs = response.data || [];
    
    // Calculate pagination
    const total = allLogs.length;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedLogs = allLogs.slice(startIndex, endIndex);
    
    setLogs(paginatedLogs);
    setPagination({
      ...pagination,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    });
  } catch (error) {
    console.error("Error:", error);
  }
};
```

---

## ⚠️ Error Handling

### Các Lỗi Thường Gặp:

1. **401 Unauthorized**
   - **Nguyên nhân:** Token không hợp lệ hoặc đã hết hạn
   - **Giải pháp:** Redirect về login page hoặc refresh token

2. **403 Forbidden**
   - **Nguyên nhân:** User không có quyền ADMIN để truy cập endpoint
   - **Giải pháp:** Ẩn các tab/button chỉ dành cho ADMIN

3. **400 Bad Request**
   - **Nguyên nhân:** Thiếu required parameters (entityType, entityId, requestId)
   - **Giải pháp:** Validate parameters trước khi gọi API

4. **Empty Response**
   - **Nguyên nhân:** Không có logs nào match với filters
   - **Giải pháp:** Hiển thị message "Không có dữ liệu"

### Error Handling Pattern:

```javascript
const fetchLogs = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await auditService.getMyLogs(params);
    const logs = response.data || [];
    
    if (logs.length === 0) {
      setMessage("Không có audit logs nào");
    } else {
      setLogs(logs);
    }
  } catch (error) {
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      // Token expired
      localStorage.removeItem("token");
      navigate("/login");
    } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
      setError("Bạn không có quyền truy cập tính năng này");
    } else {
      setError(error.message || "Không thể tải audit logs");
    }
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ Best Practices

### 1. UX/UI Recommendations

- ✅ **Loading States**: Hiển thị skeleton loader hoặc spinner khi đang fetch
- ✅ **Empty States**: Hiển thị message rõ ràng khi không có logs
- ✅ **Error States**: Hiển thị error message với option retry
- ✅ **Pagination**: Hiển thị pagination controls rõ ràng
- ✅ **Filters**: Đặt filters ở trên cùng, dễ nhìn thấy
- ✅ **Table**: Sử dụng table với sticky header khi scroll
- ✅ **Responsive**: Đảm bảo table responsive trên mobile

### 2. Performance Recommendations

- ✅ **Limit Results**: Luôn set limit hợp lý (20-50 items)
- ✅ **Debounce Filters**: Debounce filter inputs để tránh quá nhiều API calls
- ✅ **Cache**: Cache logs trong memory nếu user switch tabs
- ✅ **Lazy Load**: Load more khi scroll đến cuối (infinite scroll)

### 3. Security Recommendations

- ✅ **Check Permissions**: Luôn check `isAdmin` trước khi gọi admin endpoints
- ✅ **Hide Sensitive Data**: Ẩn sensitive information trong `changes` object
- ✅ **Sanitize Input**: Validate và sanitize filter inputs
- ✅ **Rate Limiting**: Respect rate limits từ backend

### 4. Code Organization

```javascript
// Tổ chức code theo cấu trúc:
src/
  services/
    auditService.js        // API calls
  components/
    AuditLogs.js           // Main component
    AuditLogTable.jsx      // Table component
    AuditLogFilters.jsx    // Filters component
    AuditLogDetail.jsx    // Detail modal/view
  utils/
    auditLogFormatter.js  // Format utilities
    dateFormatter.js       // Date formatting
```

### 5. Component Structure Example

```javascript
const AuditLogs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(isAdmin ? "recent" : "my");
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    entityId: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch logs when tab/filters/pagination change
  useEffect(() => {
    fetchLogs();
  }, [activeTab, filters, pagination.page]);

  const fetchLogs = async () => {
    // Implementation...
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4">Nhật Ký Hoạt Động</Typography>
      
      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
        {isAdmin && <Tab label="Gần Đây" value="recent" />}
        <Tab label="Của Tôi" value="my" />
        {isAdmin && <Tab label="Theo Đối Tượng" value="entity" />}
      </Tabs>
      
      {/* Filters */}
      <AuditLogFilters 
        filters={filters}
        onChange={setFilters}
        activeTab={activeTab}
      />
      
      {/* Table */}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <AuditLogTable logs={logs} />
      )}
      
      {/* Pagination */}
      <Pagination 
        page={pagination.page}
        count={pagination.totalPages}
        onChange={(e, page) => setPagination({...pagination, page})}
      />
    </Box>
  );
};
```

---

## 📝 Response Format

### Standard Response Structure

Tất cả endpoints đều trả về format chuẩn:

```json
{
  "HttpCode": 200,
  "success": true,
  "data": [...],  // Array of AuditLog objects
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

### Error Response Structure

```json
{
  "HttpCode": 401,
  "success": false,
  "message": "Unauthorized",
  "timestamp": "2026-01-12T07:00:00.000Z"
}
```

---

## 🔄 Usage Flow

### Flow 1: View My Logs
```
User navigates to /audit-logs
    ↓
1. Check user role (Admin/User)
    ↓
2. Set default tab (Admin: "recent", User: "my")
    ↓
3. Fetch logs based on active tab
    ↓
4. Display logs in table
    ↓
5. User can filter by action, date range
    ↓
6. User can paginate through results
```

### Flow 2: Admin View Recent Logs
```
Admin navigates to /audit-logs
    ↓
1. Check isAdmin = true
    ↓
2. Show "Recent" tab
    ↓
3. Fetch GET /audit/recent?limit=50
    ↓
4. Display all recent logs
    ↓
5. Admin can filter by action, date
```

### Flow 3: View Logs by Entity
```
Admin selects "By Entity" tab
    ↓
1. Admin enters entityType and entityId
    ↓
2. Fetch GET /audit/by-entity?entityType=Vegetable&entityId=5
    ↓
3. Display all logs for that entity
    ↓
4. Shows CREATE, UPDATE, DELETE history
```

---

## 🎨 UI Components Recommendations

### Table Columns

| Column | Width | Description |
|--------|-------|-------------|
| Timestamp | 180px | Thời gian thực hiện |
| User | 150px | User ID hoặc email |
| Action | 120px | Badge với màu theo action |
| Entity | 200px | Entity Type + ID |
| IP Address | 150px | IP của request |
| Details | Auto | Expandable details |

### Action Badge Colors

```javascript
const actionColors = {
  CREATE: "#4caf50",   // Green
  UPDATE: "#ff9800",  // Orange
  DELETE: "#f44336",  // Red
  LOGIN: "#2196f3",   // Blue
  LOGOUT: "#9e9e9e",  // Gray
  READ: "#607d8b",    // Blue Gray
};
```

---

## 🧪 Testing Checklist

- [ ] Fetch my logs thành công
- [ ] Fetch recent logs (Admin only)
- [ ] Fetch logs by entity (Admin only)
- [ ] Filter by action
- [ ] Filter by date range
- [ ] Pagination hoạt động đúng
- [ ] Error handling cho 401
- [ ] Error handling cho 403
- [ ] Empty state hiển thị đúng
- [ ] Loading state hiển thị đúng
- [ ] Format date đúng format
- [ ] Display changes object đúng cách

---

## 📚 Tài Liệu Tham Khảo

- [Audit Logging Best Practices](https://owasp.org/www-community/Auditing)
- [NestJS Audit Module](https://docs.nestjs.com/)
- [Prisma Audit Logging](https://www.prisma.io/docs/)

---

## 🆘 Support

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Backend có đang chạy không?
2. Token có hợp lệ không?
3. User có đúng role không? (ADMIN cho admin endpoints)
4. Network tab trong DevTools để xem request/response
5. Console logs để debug

---

**Last Updated:** 2026-01-12
**Version:** 1.0.0
