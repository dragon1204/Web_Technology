# Setup MinIO trực tiếp trên Server (Không cần script)

## Bước 1: Kiểm tra MinIO đã cài chưa

```bash
which minio
```

Nếu chưa có, cài đặt:

```bash
# Download MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Kiểm tra
minio --version
```

## Bước 2: Tạo thư mục lưu trữ

```bash
sudo mkdir -p /var/minio-data
sudo chown -R $USER:$USER /var/minio-data
```

## Bước 3: Tạo Systemd Service

```bash
sudo nano /etc/systemd/system/minio.service
```

Copy nội dung sau vào:

```ini
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/minio-data
ExecStart=/usr/local/bin/minio server /var/minio-data --console-address ":9001"
Restart=always
RestartSec=5

Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=minioadmin123"

[Install]
WantedBy=multi-user.target
```

Lưu và thoát (Ctrl+X, Y, Enter)

## Bước 4: Khởi động MinIO

```bash
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio
sudo systemctl status minio
```

## Bước 5: Tạo Bucket

### Cách 1: Dùng MinIO Client (mc)

```bash
# Cài đặt mc
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# Cấu hình alias
mc alias set local http://localhost:9000 minioadmin minioadmin123

# Tạo bucket
mc mb local/files

# Kiểm tra
mc ls local
```

### Cách 2: Qua MinIO Console

1. Mở trình duyệt: `http://YOUR_SERVER_IP:9001`
2. Đăng nhập:
   - Username: `minioadmin`
   - Password: `minioadmin123`
3. Click "Create Bucket"
4. Tên: `files`
5. Click "Create Bucket"

## Bước 6: Cập nhật .env

```bash
cd /var/web/Web_Technology/BE_Server-side
nano .env
```

Thêm vào cuối file:

```env
# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=files
```

Lưu và thoát (Ctrl+X, Y, Enter)

## Bước 7: Cài đặt packages

```bash
cd /var/web/Web_Technology/BE_Server-side
npm install minio @types/multer multer
```

## Bước 8: Khởi động lại ứng dụng

```bash
# Nếu dùng PM2
pm2 restart be-server

# Hoặc nếu dùng systemd
sudo systemctl restart your-app-service

# Hoặc restart thủ công
pm2 restart all
```

## Bước 9: Kiểm tra

```bash
# Kiểm tra MinIO
sudo systemctl status minio
curl http://localhost:9000/minio/health/live

# Kiểm tra logs ứng dụng
pm2 logs be-server --lines 50
```

## Test API

Sau khi có token, test:

```bash
# Upload file
curl -X POST http://localhost:3000/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/tmp/test.jpg" \
  -F "folder=test"
```

## Troubleshooting

### MinIO không khởi động:
```bash
sudo journalctl -u minio -n 50
```

### Port đã được sử dụng:
```bash
sudo netstat -tulpn | grep 9000
sudo netstat -tulpn | grep 9001
```

### Không kết nối được:
```bash
# Test kết nối
curl http://localhost:9000/minio/health/live

# Kiểm tra firewall
sudo ufw status
```
