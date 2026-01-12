# Hướng Dẫn Tích Hợp User Management (Quản Lý Người Dùng)

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [API Endpoints](#api-endpoints)
3. [Data Structure](#data-structure)
4. [Implementation Guide](#implementation-guide)
5. [Code Examples](#code-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## 📖 Tổng Quan

Module **User Management** dùng để:
- **ADMIN**:
  - Xem danh sách tất cả user
  - Tạo user mới
  - Cập nhật thông tin / role của user
  - Xóa user
- **USER thường**:
  - Xem / chỉnh sửa **thông tin của chính mình** qua `/users/me` (được FE dùng cho profile)

### Base URL

```text
http://localhost:3000/users
```

### Authentication & Authorization

- Tất cả endpoints trong module `users` đều yêu cầu **Bearer Token** trong header:

```http
Authorization: Bearer <access_token>
```

- Phân quyền:
  - `GET /users` – **ADMIN** bắt buộc
  - `GET /users/:id` – ADMIN hoặc chính chủ (SELF)
  - `POST /users` – ADMIN
  - `PUT /users/:id` – ADMIN (hoặc SELF với một số field như name/email – tuỳ policy backend)
  - `DELETE /users/:id` – ADMIN
  - `GET /users/me` – bất kỳ user đã đăng nhập

---

## 🔌 API Endpoints

### 1. Get All Users (ADMIN)

**Endpoint:** `GET /users`  
**Auth:** Required (ADMIN)  
**Description:** Lấy danh sách tất cả user trong hệ thống.

**Request:**
```http
GET /users
Authorization: Bearer <access_token>
```

**Response (200 OK – dạng chuẩn backend):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": {
    "items": [
      {
        "id": 4,
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "ADMIN"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  },
  "timestamp": "2026-01-12T09:00:00.000Z"
}
```

FE nên lấy danh sách như sau:

```js
const items = res.data?.data?.items || res.data?.items || res.data?.data || [];
```

---

### 2. Get My Profile (SELF)

**Endpoint:** `GET /users/me`  
**Auth:** Required (any logged-in user)  
**Description:** Lấy thông tin user tương ứng với access token hiện tại.

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": {
    "id": 4,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  },
  "timestamp": "2026-01-12T09:00:00.000Z"
}
```

---

### 3. Get User By ID (ADMIN / SELF)

**Endpoint:** `GET /users/:id`  
**Auth:** Required  
**Description:** Lấy chi tiết một user cụ thể theo `id`.

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": {
    "id": 5,
    "name": "Normal User",
    "email": "user@example.com",
    "role": "USER"
  },
  "timestamp": "2026-01-12T09:00:00.000Z"
}
```

---

### 4. Create User (ADMIN)

**Endpoint:** `POST /users`  
**Auth:** Required (ADMIN)  
**Description:** Tạo mới một user.

**Request Body:**
```json
{
  "email": "new@example.com",
  "password": "Password123!",
  "name": "New User",
  "role": "USER"
}
```

**Response (201 Created):**
```json
{
  "HttpCode": 201,
  "success": true,
  "data": {
    "id": 6,
    "name": "New User",
    "email": "new@example.com",
    "role": "USER"
  },
  "timestamp": "2026-01-12T09:00:00.000Z"
}
```

---

### 5. Update User (ADMIN)

**Endpoint:** `PUT /users/:id`  
**Auth:** Required (ADMIN)  
**Description:** Cập nhật thông tin user.

**Request Body (ví dụ):**
```json
{
  "name": "Updated Name",
  "role": "ADMIN"
}
```

**Response (200 OK):**
```json
{
  "HttpCode": 200,
  "success": true,
  "data": {
    "id": 5,
    "name": "Updated Name",
    "email": "user@example.com",
    "role": "ADMIN"
  },
  "timestamp": "2026-01-12T09:05:00.000Z"
}
```

---

### 6. Delete User (ADMIN)

**Endpoint:** `DELETE /users/:id`  
**Auth:** Required (ADMIN)  
**Description:** Xóa user khỏi hệ thống.

**Response (200 OK hoặc 204 No Content – tùy backend):**
```json
{
  "HttpCode": 200,
  "success": true,
  "message": "User deleted successfully",
  "timestamp": "2026-01-12T09:10:00.000Z"
}
```

---

## 🧱 Data Structure

### User Model (FE dùng)

```ts
interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}
```

### List Response

```ts
interface UserListResponse {
  HttpCode: number;
  success: boolean;
  data: {
    items: User[];
    total: number;
    page: number;
    limit: number;
  };
  timestamp: string;
}
```

---

## 🧩 Implementation Guide

### 1. Lấy danh sách Users (User Management page)

- Gọi `GET /users` với Bearer token.
- FE (`UserList.jsx`) đã làm đúng pattern:

```js
const response = await userAPI.getAll();
const data =
  response.data?.data?.items ||
  response.data?.items ||
  response.data?.data ||
  response.data ||
  [];
setUsers(Array.isArray(data) ? data : []);
```

### 2. Form Tạo / Sửa User

Các field tối thiểu:

- **Create mode**:
  - `email` (bắt buộc)
  - `password` (bắt buộc)
  - `name`
  - `role` (`USER` | `ADMIN`) – dùng dropdown
- **Edit mode**:
  - `email` (tuỳ theo backend có cho sửa hay không)
  - `name`
  - `role`

### 3. Dropdown Role (đã khớp FE hiện tại)

Trong `UserList.jsx`:

```jsx
<TextField
  margin="dense"
  label="Role"
  select
  fullWidth
  variant="outlined"
  value={currentUser.role}
  onChange={(e) =>
    setCurrentUser({ ...currentUser, role: e.target.value })
  }
>
  <MenuItem value="USER">USER</MenuItem>
  <MenuItem value="ADMIN">ADMIN</MenuItem>
</TextField>
```

---

## 💻 Code Examples

Giả sử có `userAPI` wrapper trong `src/services/api.js`:

```js
// GET /users
export const userAPI = {
  async getAll() {
    const res = await api.get("/users");
    const data =
      res.data?.data?.items ||
      res.data?.items ||
      res.data?.data ||
      res.data ||
      [];
    return Array.isArray(data) ? data : [];
  },

  async create(payload) {
    const res = await api.post("/users", payload);
    return res.data?.data || res.data;
  },

  async update(userId, payload) {
    const res = await api.put(`/users/${userId}`, payload);
    return res.data?.data || res.data;
  },

  async remove(userId) {
    const res = await api.delete(`/users/${userId}`);
    return res.data || { success: true };
  },
};
```

---

## ⚠️ Error Handling

Các lỗi thường gặp:

- `401 Unauthorized` – thiếu/ sai token:
  - FE nên redirect về `/login` hoặc gọi `logout()`.
- `403 Forbidden` – không đủ quyền (USER gọi các API ADMIN):
  - Hiển thị thông báo: `"Bạn không có quyền thực hiện hành động này"`.
- `400 Bad Request` – payload không hợp lệ:
  - Ví dụ: email sai format, password quá ngắn.
- `404 Not Found` – user không tồn tại:
  - Hiển thị `"User không tồn tại hoặc đã bị xóa"`.

Ví dụ xử lý lỗi trên FE:

```js
try {
  await userAPI.create(formData);
  toast.success("Tạo user thành công");
  fetchUsers();
} catch (error) {
  const message =
    error.response?.data?.message ||
    error.message ||
    "Có lỗi xảy ra khi tạo user";
  toast.error(message);
}
```

---

## ✅ Best Practices

- **Không hiển thị password** trong bảng hoặc response FE.
- **Không gửi lại password** khi update nếu user không đổi mật khẩu.
- Luôn dùng enum `role` phía FE (`USER` / `ADMIN`) để tránh typo.
- Khi xóa user, nên hiển thị confirm:
  - `"Bạn có chắc chắn muốn xóa user này không?"`.
- Sau mỗi thao tác tạo/sửa/xóa:
  - Gọi lại `fetchUsers()` để đồng bộ danh sách.
- Kết hợp với **Audit Log**:
  - Các thao tác tạo/sửa/xóa user sẽ xuất hiện trong `AuditLogs`, FE có thể cross-check từ 2 màn hình.

