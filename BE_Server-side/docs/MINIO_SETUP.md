# Hướng dẫn cài đặt và cấu hình MinIO

## 1. Cài đặt MinIO Server

### Option 1: Chạy với Docker (Khuyến nghị)

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v minio-data:/data \
  minio/minio server /data --console-address ":9001"
```

### Option 2: Cài đặt trực tiếp

**Windows:**
1. Tải MinIO từ: https://min.io/download
2. Giải nén và chạy:
```powershell
minio.exe server D:\minio-data --console-address ":9001"
```

**Linux:**
```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
./minio server /data --console-address ":9001"
```

## 2. Truy cập MinIO Console

Mở trình duyệt và truy cập: `http://localhost:9001`

- Username: `minioadmin`
- Password: `minioadmin`

## 3. Tạo Bucket

1. Đăng nhập vào MinIO Console
2. Click "Create Bucket"
3. Tên bucket: `files` (hoặc tên bạn muốn)
4. Click "Create Bucket"

## 4. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=files
```

**Lưu ý cho Production:**
- Thay đổi `MINIO_ROOT_USER` và `MINIO_ROOT_PASSWORD` thành giá trị bảo mật
- Sử dụng SSL/TLS (`MINIO_USE_SSL=true`)
- Sử dụng Access Key và Secret Key riêng (tạo trong MinIO Console > Access Keys)

## 5. Cài đặt Dependencies

```bash
npm install minio @types/multer multer
```

## 6. Khởi động Server

```bash
npm run start:dev
```

## 7. Test API

### Upload file:
```bash
curl -X POST http://localhost:3000/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg" \
  -F "folder=test"
```

### Download file:
```bash
curl -X GET http://localhost:3000/storage/download/test/test.jpg \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output downloaded.jpg
```

## Troubleshooting

### Lỗi: "MinIO is not configured"
- Kiểm tra các biến môi trường trong `.env`
- Đảm bảo MinIO server đang chạy

### Lỗi: "Bucket does not exist"
- Bucket sẽ được tạo tự động khi khởi động service
- Hoặc tạo thủ công trong MinIO Console

### Lỗi: "Access Denied"
- Kiểm tra Access Key và Secret Key
- Đảm bảo user có quyền truy cập bucket

## Production Setup

### 1. Sử dụng MinIO với SSL

```env
MINIO_ENDPOINT=minio.yourdomain.com
MINIO_PORT=443
MINIO_USE_SSL=true
```

### 2. Tạo Access Key riêng

1. Vào MinIO Console > Access Keys
2. Tạo Access Key mới
3. Copy Access Key và Secret Key
4. Cập nhật vào `.env`

### 3. Cấu hình CORS (nếu cần)

Trong MinIO Console > Settings > CORS:
```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. Backup và Monitoring

- Sử dụng MinIO's built-in replication
- Monitor qua MinIO Console > Monitoring
- Setup alerts cho disk usage
