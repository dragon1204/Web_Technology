#!/bin/bash
# Script để tạo bucket trong MinIO

echo "🪣 Configuring MinIO bucket..."
echo ""

# Đợi MinIO khởi động
sleep 5

# Cài đặt MinIO client (mc) nếu chưa có
if ! command -v mc &> /dev/null; then
    echo "📥 Đang cài đặt MinIO Client (mc)..."
    wget https://dl.min.io/client/mc/release/linux-amd64/mc
    chmod +x mc
    sudo mv mc /usr/local/bin/
fi

# Cấu hình MinIO alias
MC_ALIAS="local"
ENDPOINT="http://localhost:9000"
ACCESS_KEY="minioadmin"
SECRET_KEY="minioadmin123"
BUCKET_NAME="files"

echo "🔗 Cấu hình MinIO alias..."
mc alias set $MC_ALIAS $ENDPOINT $ACCESS_KEY $SECRET_KEY

# Kiểm tra kết nối
if mc admin info $MC_ALIAS &> /dev/null; then
    echo "✅ Kết nối MinIO thành công"
else
    echo "❌ Không thể kết nối đến MinIO"
    echo "   Kiểm tra MinIO đã chạy chưa: sudo systemctl status minio"
    exit 1
fi

# Tạo bucket nếu chưa tồn tại
if mc ls $MC_ALIAS/$BUCKET_NAME &> /dev/null; then
    echo "✅ Bucket '$BUCKET_NAME' đã tồn tại"
else
    echo "📦 Tạo bucket '$BUCKET_NAME'..."
    mc mb $MC_ALIAS/$BUCKET_NAME
    echo "✅ Bucket '$BUCKET_NAME' đã được tạo"
fi

# Cấu hình policy cho bucket (public read nếu cần)
echo "⚙️  Cấu hình policy cho bucket..."
mc anonymous set download $MC_ALIAS/$BUCKET_NAME

echo ""
echo "✅ Cấu hình MinIO hoàn tất!"
echo ""
echo "📝 Thông tin bucket:"
echo "   Bucket name: $BUCKET_NAME"
echo "   Endpoint: $ENDPOINT"
echo "   Access Key: $ACCESS_KEY"
echo ""
