#!/bin/bash

# Script fix lỗi trên server
# Project location: /var/web/Web_Technology/BE_Server-side

echo "📁 Đang vào thư mục project..."
cd /var/web/Web_Technology/BE_Server-side
pwd

echo ""
echo "📥 Bước 1: Pull code mới nhất..."
git pull origin main || git pull origin master || git pull origin develop

echo ""
echo "🗑️ Bước 2: Xóa folder sensor nếu còn..."
if [ -d "src/modules/sensor" ]; then
    rm -rf src/modules/sensor
    echo "✅ Đã xóa folder sensor"
else
    echo "ℹ️ Folder sensor không tồn tại"
fi

echo ""
echo "🧹 Bước 3: Xóa dist và cache..."
rm -rf dist
rm -rf node_modules/.cache
rm -rf .next
echo "✅ Đã xóa dist và cache"

echo ""
echo "🔧 Bước 4: Generate Prisma client..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "✅ Prisma generate thành công"
else
    echo "❌ Prisma generate thất bại"
    exit 1
fi

echo ""
echo "🏗️ Bước 5: Build project..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build thành công"
else
    echo "❌ Build thất bại"
    exit 1
fi

echo ""
echo "🔄 Bước 6: Restart PM2..."
pm2 restart be-server
pm2 save

echo ""
echo "📊 Bước 7: Kiểm tra status..."
pm2 status
pm2 logs be-server --lines 20

echo ""
echo "✅ Hoàn tất!"

