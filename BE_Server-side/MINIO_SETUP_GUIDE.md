# Hướng dẫn khởi động MinIO

## Vấn đề
Backend không thể kết nối đến MinIO vì MinIO chưa được khởi động.

## Giải pháp

### Cách 1: Khởi động MinIO trực tiếp (Khuyến nghị)

1. **Cài đặt MinIO (nếu chưa có):**
   ```powershell
   cd BE_Server-side
   .\setup-minio-direct.ps1
   ```
   Script này sẽ:
   - Tải MinIO (~15MB) nếu chưa có
   - Tạo thư mục data tại `C:\minio-data`
   - Khởi động MinIO

2. **Hoặc chỉ khởi động (nếu đã cài đặt):**
   ```powershell
   cd BE_Server-side
   .\start-minio.ps1
   ```

### Cách 2: Sử dụng Docker

```powershell
cd BE_Server-side
.\setup-minio-local.ps1
```

## Thông tin truy cập

Sau khi MinIO khởi động thành công:

- **MinIO API**: http://localhost:9000
- **MinIO Console**: http://localhost:9001
- **Username**: `minioadmin`
- **Password**: `minioadmin`

## Kiểm tra MinIO đã chạy

Mở browser và truy cập: http://localhost:9001

Nếu thấy giao diện đăng nhập MinIO → MinIO đã chạy thành công.

## Tạo bucket (nếu chưa có)

1. Đăng nhập vào MinIO Console (http://localhost:9001)
2. Click **"Create Bucket"**
3. Tên bucket: `files`
4. Click **"Create Bucket"**

## Cấu hình .env

File `.env` đã được cấu hình đúng:

```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=files
```

## Sau khi khởi động MinIO

1. **Restart backend NestJS:**
   ```powershell
   # Dừng backend hiện tại (Ctrl+C)
   # Sau đó chạy lại:
   npm run start:dev
   ```

2. **Kiểm tra log:**
   Bạn sẽ thấy log:
   ```
   ✅ Connected to MinIO at localhost:9000
   ```

## Lưu ý

- MinIO phải chạy **trước** khi khởi động backend
- Nếu MinIO dừng, backend sẽ không thể upload/download files
- Để dừng MinIO: Nhấn `Ctrl+C` trong terminal đang chạy MinIO

## Troubleshooting

### Lỗi: "Port 9000 already in use"
- Kiểm tra xem MinIO đã chạy chưa: `netstat -ano | findstr :9000`
- Nếu đã chạy, không cần khởi động lại

### Lỗi: "Cannot connect to MinIO"
- Đảm bảo MinIO đang chạy
- Kiểm tra firewall không chặn port 9000
- Kiểm tra lại credentials trong `.env`

### Lỗi: "Bucket not found"
- Đăng nhập vào MinIO Console (http://localhost:9001)
- Tạo bucket tên `files`
