# Hướng dẫn Setup MinIO trên Server

## Bước 1: Cài đặt và khởi động MinIO

### Option A: Sử dụng script tự động

```bash
cd /var/web/Web_Technology/BE_Server-side
chmod +x scripts/setup-minio-server.sh
sudo bash scripts/setup-minio-server.sh
```

### Option B: Cài đặt thủ công

```bash
# 1. Download và cài đặt MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# 2. Tạo thư mục lưu trữ
sudo mkdir -p /var/minio-data
sudo chown -R $USER:$USER /var/minio-data

# 3. Tạo systemd service
sudo nano /etc/systemd/system/minio.service
```

Nội dung file service:
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

```bash
# 4. Khởi động service
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio

# 5. Kiểm tra trạng thái
sudo systemctl status minio
```

## Bước 2: Tạo Bucket

### Sử dụng script:
```bash
chmod +x scripts/configure-minio-bucket.sh
bash scripts/configure-minio-bucket.sh
```

### Hoặc thủ công qua MinIO Console:
1. Mở trình duyệt: `http://YOUR_SERVER_IP:9001`
2. Đăng nhập:
   - Username: `minioadmin`
   - Password: `minioadmin123`
3. Click "Create Bucket"
4. Tên bucket: `files`
5. Click "Create Bucket"

### Hoặc dùng MinIO Client (mc):
```bash
# Cài đặt mc
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/

# Cấu hình alias
mc alias set local http://localhost:9000 minioadmin minioadmin123

# Tạo bucket
mc mb local/files
```

## Bước 3: Cấu hình Environment Variables

### Sử dụng script:
```bash
chmod +x scripts/update-env-minio.sh
bash scripts/update-env-minio.sh
```

### Hoặc thủ công:
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

## Bước 4: Cài đặt Dependencies

```bash
cd /var/web/Web_Technology/BE_Server-side
npm install minio @types/multer multer
```

## Bước 5: Khởi động lại Server

```bash
# Nếu dùng PM2
pm2 restart be-server

# Hoặc khởi động lại service
sudo systemctl restart your-app-service
```

## Bước 6: Mở Firewall (nếu cần truy cập từ bên ngoài)

```bash
# UFW
sudo ufw allow 9000/tcp
sudo ufw allow 9001/tcp

# Hoặc firewalld
sudo firewall-cmd --permanent --add-port=9000/tcp
sudo firewall-cmd --permanent --add-port=9001/tcp
sudo firewall-cmd --reload
```

## Bước 7: Test API

### Test upload:
```bash
curl -X POST http://localhost:3000/storage/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/test.jpg" \
  -F "folder=test"
```

### Test download:
```bash
curl -X GET http://localhost:3000/storage/download/test/test.jpg \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output downloaded.jpg
```

## Kiểm tra Logs

```bash
# MinIO logs
sudo journalctl -u minio -f

# Application logs (nếu dùng PM2)
pm2 logs be-server
```

## Troubleshooting

### MinIO không khởi động:
```bash
# Kiểm tra logs
sudo journalctl -u minio -n 50

# Kiểm tra port đã được sử dụng chưa
sudo netstat -tulpn | grep 9000
sudo netstat -tulpn | grep 9001

# Kiểm tra quyền thư mục
ls -la /var/minio-data
```

### Không kết nối được từ ứng dụng:
1. Kiểm tra .env có đúng cấu hình không
2. Kiểm tra MinIO đang chạy: `sudo systemctl status minio`
3. Test kết nối: `curl http://localhost:9000/minio/health/live`

### Bucket không tồn tại:
- Bucket sẽ được tạo tự động khi service khởi động
- Hoặc tạo thủ công qua Console hoặc mc command

## Security cho Production

1. **Đổi password mặc định:**
```bash
sudo nano /etc/systemd/system/minio.service
# Thay đổi MINIO_ROOT_PASSWORD
sudo systemctl daemon-reload
sudo systemctl restart minio
```

2. **Sử dụng SSL/TLS:**
- Cấu hình reverse proxy (nginx) với SSL
- Hoặc cấu hình MinIO với SSL certificates

3. **Tạo Access Key riêng:**
- Vào MinIO Console > Access Keys
- Tạo key mới với quyền hạn chế
- Cập nhật vào .env

4. **Giới hạn IP truy cập:**
- Cấu hình firewall chỉ cho phép IP cụ thể
- Hoặc sử dụng VPN

## Cấu hình Nginx Reverse Proxy (Optional)

```nginx
# /etc/nginx/sites-available/minio
server {
    listen 80;
    server_name minio.yourdomain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name minio-console.yourdomain.com;

    location / {
        proxy_pass http://localhost:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
