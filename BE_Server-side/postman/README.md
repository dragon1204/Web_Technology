# Postman Collection - Storage API

## 📋 Hướng dẫn sử dụng

### 1. Import Collection và Environment

1. Mở Postman
2. Click **Import** button
3. Import 2 files:
   - `Storage_API.postman_collection.json` - Collection chứa tất cả API endpoints
   - `Storage_API.postman_environment.json` - Environment variables

### 2. Cấu hình Environment

1. Chọn environment **"Storage API Environment"** ở góc trên bên phải
2. Cập nhật các variables:
   - `base_url`: `http://localhost:3000` (hoặc URL server của bạn)
   - `access_token`: Token từ API login (lấy từ `/auth/login`)
   - `user_id`: ID của user (dùng cho ví dụ)

### 3. Lấy Access Token

Trước khi test Storage API, cần đăng nhập để lấy token:

**POST** `/auth/login`

```json
{
  "email": "customer1@example.com",
  "password": "password123"
}
```

Response sẽ có `access_token`, copy và paste vào environment variable `access_token`.

### 4. Test các API

#### Upload File
1. Chọn request **"1. Upload Single File"**
2. Trong tab **Body**, chọn file cần upload
3. Điều chỉnh `folder` nếu cần (avatars, products, documents)
4. Click **Send**

#### Download File
1. Chọn request **"3. Download File"**
2. Cập nhật `fileName` trong path variable (lấy từ response của upload)
3. Click **Send**
4. File sẽ được download

#### Get Presigned URL
1. Chọn request **"4. Get Presigned URL"**
2. Cập nhật `fileName`
3. Điều chỉnh `expiry` nếu cần (mặc định 7 ngày)
4. Click **Send**
5. Copy URL từ response để dùng trong frontend

## 📁 Cấu trúc Collection

### Main Endpoints
- ✅ **1. Upload Single File** - Upload 1 file
- ✅ **2. Upload Multiple Files** - Upload nhiều files
- ✅ **3. Download File** - Download file
- ✅ **4. Get Presigned URL** - Lấy URL tạm thời
- ✅ **5. Get File Info** - Thông tin file
- ✅ **6. List Files** - Danh sách files
- ✅ **7. Delete File** - Xóa file (USER, ADMIN)
- ✅ **8. Delete Multiple Files** - Xóa nhiều files (USER, ADMIN)
- ✅ **9. Check File Exists** - Kiểm tra file tồn tại

### Examples
- **Examples - Upload Avatar** - Ví dụ upload avatar
- **Examples - Product Images** - Ví dụ upload ảnh sản phẩm

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | Base URL của API | `http://localhost:3000` |
| `access_token` | JWT access token | Lấy từ `/auth/login` |
| `user_id` | User ID (dùng cho ví dụ) | `1` |
| `test_file_name` | Tên file test | `uploads/1704067200000-test.jpg` |

## 📝 Test Flow

### Flow 1: Upload và Download
1. **Upload Single File** → Lấy `fileName` từ response
2. **Get File Info** → Kiểm tra thông tin file
3. **Get Presigned URL** → Lấy URL để hiển thị
4. **Download File** → Download file về máy

### Flow 2: Upload Multiple và List
1. **Upload Multiple Files** → Upload nhiều files
2. **List Files** → Xem danh sách files đã upload
3. **Delete Multiple Files** → Xóa các files không cần

### Flow 3: Avatar Upload
1. **Upload User Avatar** → Upload avatar
2. **Get Avatar URL** → Lấy URL để hiển thị trong profile

## ⚠️ Lưu ý

1. **Token Expiry**: Token có thể hết hạn, cần login lại
2. **File Size**: Kiểm tra file size limit (mặc định không giới hạn)
3. **Role Permissions**: 
   - CUSTOMER: Chỉ upload/download
   - USER, ADMIN: Có thể xóa files
4. **Bucket Name**: Mặc định là `files` (đã cấu hình trong .env)

## 🐛 Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra `access_token` còn hợp lệ
- Login lại để lấy token mới

### Lỗi 400 Bad Request
- Kiểm tra file đã được chọn
- Kiểm tra MinIO đã được cấu hình và đang chạy

### Lỗi 404 Not Found
- Kiểm tra `fileName` đúng chưa
- File có thể đã bị xóa

### Download không hoạt động
- Kiểm tra `fileName` trong path variable
- Đảm bảo file tồn tại (dùng Check File Exists)

## 📚 Tham khảo

Xem thêm tài liệu chi tiết tại: `docs/API_STORAGE_MODULE.md`
