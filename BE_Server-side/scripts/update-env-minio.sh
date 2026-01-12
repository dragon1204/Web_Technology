#!/bin/bash
# Script để cập nhật .env với cấu hình MinIO

ENV_FILE=".env"
PROJECT_DIR="/var/web/Web_Technology/BE_Server-side"

cd $PROJECT_DIR || exit 1

echo "📝 Cập nhật cấu hình MinIO trong .env..."
echo ""

# Kiểm tra file .env tồn tại
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  File .env không tồn tại, đang tạo mới..."
    touch $ENV_FILE
fi

# Backup .env
cp $ENV_FILE "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Thêm hoặc cập nhật MinIO config
if grep -q "MINIO_ENDPOINT" $ENV_FILE; then
    echo "🔄 Cập nhật cấu hình MinIO hiện có..."
    sed -i 's|MINIO_ENDPOINT=.*|MINIO_ENDPOINT=localhost|g' $ENV_FILE
    sed -i 's|MINIO_PORT=.*|MINIO_PORT=9000|g' $ENV_FILE
    sed -i 's|MINIO_USE_SSL=.*|MINIO_USE_SSL=false|g' $ENV_FILE
    sed -i 's|MINIO_ACCESS_KEY=.*|MINIO_ACCESS_KEY=minioadmin|g' $ENV_FILE
    sed -i 's|MINIO_SECRET_KEY=.*|MINIO_SECRET_KEY=minioadmin123|g' $ENV_FILE
    sed -i 's|MINIO_BUCKET_NAME=.*|MINIO_BUCKET_NAME=files|g' $ENV_FILE
else
    echo "➕ Thêm cấu hình MinIO mới..."
    echo "" >> $ENV_FILE
    echo "# MinIO Configuration" >> $ENV_FILE
    echo "MINIO_ENDPOINT=localhost" >> $ENV_FILE
    echo "MINIO_PORT=9000" >> $ENV_FILE
    echo "MINIO_USE_SSL=false" >> $ENV_FILE
    echo "MINIO_ACCESS_KEY=minioadmin" >> $ENV_FILE
    echo "MINIO_SECRET_KEY=minioadmin123" >> $ENV_FILE
    echo "MINIO_BUCKET_NAME=files" >> $ENV_FILE
fi

echo "✅ Đã cập nhật .env"
echo ""
echo "📋 Cấu hình MinIO trong .env:"
grep "MINIO_" $ENV_FILE
echo ""
