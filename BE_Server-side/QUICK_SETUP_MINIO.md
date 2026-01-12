# Hướng dẫn nhanh Setup MinIO trên Server

## 🚀 Các bước thực hiện trên server:

### 1. Chạy script setup MinIO (nếu chưa cài)
```bash
cd /var/web/Web_Technology/BE_Server-side
chmod +x scripts/setup-minio-server.sh
sudo bash scripts/setup-minio-server.sh
```

### 2. Tạo bucket
```bash
chmod +x scripts/configure-minio-bucket.sh
bash scripts/configure-minio-bucket.sh
```

### 3. Cập nhật .env
```bash
chmod +x scripts/update-env-minio.sh
bash scripts/update-env-minio.sh
```

### 4. Cài đặt packages
```bash
cd /var/web/Web_Technology/BE_Server-side
npm install minio @types/multer multer
```

### 5. Khởi động lại ứng dụng
```bash
# Nếu dùng PM2
pm2 restart be-server

# Hoặc restart service
sudo systemctl restart your-app-service
```

### 6. Kiểm tra MinIO đang chạy
```bash
sudo systemctl status minio
```

### 7. Test API (sau khi có token)
```bash
# Upload file
curl -X POST http://localhost:3000/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg" \
  -F "folder=test"

# List files
curl -X GET "http://localhost:3000/storage/list?folder=test" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 Thông tin truy cập MinIO Console

- URL: `http://YOUR_SERVER_IP:9001`
- Username: `minioadmin`
- Password: `minioadmin123`

## ⚠️ Lưu ý

1. Nếu MinIO đã được cài đặt, chỉ cần chạy bước 2-5
2. Kiểm tra firewall nếu cần truy cập từ bên ngoài
3. Đổi password mặc định cho production

## 🔍 Troubleshooting

```bash
# Xem logs MinIO
sudo journalctl -u minio -f

# Kiểm tra port
sudo netstat -tulpn | grep 9000
sudo netstat -tulpn | grep 9001

# Test kết nối MinIO
curl http://localhost:9000/minio/health/live
```
