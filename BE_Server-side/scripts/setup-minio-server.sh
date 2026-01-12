#!/bin/bash
# Script để setup MinIO trên server

echo "🔧 Setting up MinIO on server..."
echo ""

# 1. Kiểm tra MinIO đã được cài đặt chưa
if ! command -v minio &> /dev/null; then
    echo "❌ MinIO chưa được cài đặt"
    echo "📥 Đang tải MinIO..."
    
    # Download MinIO
    wget https://dl.min.io/server/minio/release/linux-amd64/minio
    chmod +x minio
    sudo mv minio /usr/local/bin/
    
    echo "✅ MinIO đã được cài đặt"
else
    echo "✅ MinIO đã được cài đặt"
fi

# 2. Tạo thư mục lưu trữ
MINIO_DATA_DIR="/var/minio-data"
if [ ! -d "$MINIO_DATA_DIR" ]; then
    echo "📁 Tạo thư mục lưu trữ: $MINIO_DATA_DIR"
    sudo mkdir -p $MINIO_DATA_DIR
    sudo chown -R $USER:$USER $MINIO_DATA_DIR
fi

# 3. Tạo systemd service cho MinIO
echo "⚙️  Tạo MinIO service..."
sudo tee /etc/systemd/system/minio.service > /dev/null <<EOF
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$MINIO_DATA_DIR
ExecStart=/usr/local/bin/minio server $MINIO_DATA_DIR --console-address ":9001"
Restart=always
RestartSec=5

Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=minioadmin123"

[Install]
WantedBy=multi-user.target
EOF

# 4. Reload systemd và start MinIO
echo "🚀 Khởi động MinIO service..."
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio

# 5. Kiểm tra trạng thái
sleep 3
if sudo systemctl is-active --quiet minio; then
    echo "✅ MinIO đã khởi động thành công"
    echo ""
    echo "📝 Thông tin truy cập:"
    echo "   MinIO API: http://localhost:9000"
    echo "   MinIO Console: http://localhost:9001"
    echo "   Username: minioadmin"
    echo "   Password: minioadmin123"
    echo ""
    echo "🌐 Để truy cập từ bên ngoài, bạn cần:"
    echo "   1. Mở port 9000 và 9001 trong firewall"
    echo "   2. Hoặc sử dụng reverse proxy (nginx)"
else
    echo "❌ Lỗi khi khởi động MinIO"
    echo "📋 Kiểm tra logs: sudo journalctl -u minio -f"
fi
