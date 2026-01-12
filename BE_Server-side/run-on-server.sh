#!/bin/bash

# Script để fix lỗi trên server
# Copy và paste vào terminal SSH

echo "=========================================="
echo "  FIX LỖI TRÊN SERVER - TỰ ĐỘNG"
echo "=========================================="
echo ""

# Bước 1: Tìm thư mục project
echo "🔍 Bước 1: Tìm thư mục project..."
PROJECT_PATH=$(find /home /var/www /root /opt -name "BE_Server-side" -type d 2>/dev/null | head -1)

if [ -z "$PROJECT_PATH" ]; then
    echo "❌ Không tìm thấy thư mục BE_Server-side"
    echo "Vui lòng tìm thủ công:"
    echo "  find / -name 'BE_Server-side' -type d 2>/dev/null"
    exit 1
fi

echo "✅ Tìm thấy: $PROJECT_PATH"
cd "$PROJECT_PATH"
echo "📁 Đã vào thư mục: $(pwd)"
echo ""

# Bước 2: Pull code
echo "📥 Bước 2: Pull code mới nhất..."
git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "⚠️ Không pull được, tiếp tục..."
echo ""

# Bước 3: Xóa folder sensor
echo "🗑️ Bước 3: Xóa folder sensor..."
if [ -d "src/modules/sensor" ]; then
    rm -rf src/modules/sensor
    echo "✅ Đã xóa folder sensor"
else
    echo "ℹ️ Folder sensor không tồn tại (đã xóa rồi)"
fi
echo ""

# Bước 4: Xóa dist và cache
echo "🧹 Bước 4: Xóa dist và cache..."
rm -rf dist node_modules/.cache .next
echo "✅ Đã xóa dist và cache"
echo ""

# Bước 5: Generate Prisma
echo "🔧 Bước 5: Generate Prisma..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "✅ Prisma generate thành công"
else
    echo "❌ Prisma generate thất bại"
    exit 1
fi
echo ""

# Bước 6: Build
echo "🏗️ Bước 6: Build project..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build thành công"
else
    echo "❌ Build thất bại - kiểm tra lỗi ở trên"
    exit 1
fi
echo ""

# Bước 7: Restart server
echo "🔄 Bước 7: Restart server..."
if command -v pm2 &> /dev/null; then
    echo "📦 Đang dùng PM2..."
    pm2 restart all
    echo "✅ Đã restart với PM2"
    echo ""
    echo "📋 Logs (20 dòng cuối):"
    pm2 logs --lines 20 --nostream
elif systemctl list-units --type=service 2>/dev/null | grep -q node; then
    echo "📦 Đang dùng systemd..."
    SERVICE_NAME=$(systemctl list-units --type=service 2>/dev/null | grep node | awk '{print $1}' | head -1)
    if [ ! -z "$SERVICE_NAME" ]; then
        sudo systemctl restart "$SERVICE_NAME"
        echo "✅ Đã restart service: $SERVICE_NAME"
        sudo systemctl status "$SERVICE_NAME" --no-pager -l
    else
        echo "⚠️ Không tìm thấy service name"
    fi
else
    echo "⚠️ Không tìm thấy PM2 hoặc systemd"
    echo "Vui lòng restart server thủ công:"
    echo "  pm2 restart all"
    echo "  hoặc"
    echo "  npm run start:prod"
fi

echo ""
echo "=========================================="
echo "  ✅ HOÀN TẤT!"
echo "=========================================="
echo ""
echo "Kiểm tra server:"
echo "  pm2 logs"
echo "  hoặc"
echo "  curl http://localhost:3000/api"

