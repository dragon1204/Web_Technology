#!/bin/bash

# Script deploy NestJS lên server
# Chạy trên server: bash deploy.sh

set -e

echo "🚀 Bắt đầu deploy..."

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt. Đang cài đặt Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Kiểm tra PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Đang cài đặt PM2..."
    npm install -g pm2
fi

echo "✅ PM2 version: $(pm2 -v)"

# Cài đặt dependencies
echo "📦 Đang cài đặt dependencies..."
npm install

# Build project
echo "🔨 Đang build project..."

# Dọn sạch controller cũ nếu còn sót trên server (tránh lỗi GardenService)
if [ -d "src/modules/garden/controler" ]; then
  echo "🧹 Xoá thư mục cũ: src/modules/garden/controler"
  rm -rf src/modules/garden/controler
fi

npm run build

# Generate Prisma Client trước
echo "🔧 Đang generate Prisma Client..."
npx prisma generate

# Đồng bộ database schema
echo "🗄️  Đang đồng bộ database schema..."
echo "   Option 1: Dùng migrations (recommended)..."
npx prisma migrate deploy

# Nếu migrations fail, dùng db push
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Migrations failed. Dùng db push để đồng bộ trực tiếp..."
    npx prisma db push --accept-data-loss || echo "⚠️  Database sync có lỗi, kiểm tra lại"
fi

# Generate lại Prisma Client sau khi sync
echo ""
echo "🔧 Đang generate lại Prisma Client..."
npx prisma generate

# Dừng app cũ nếu đang chạy
echo "🛑 Dừng app cũ (nếu có)..."
pm2 stop be-server || echo "App chưa chạy"
pm2 delete be-server || echo "App chưa tồn tại"

# Khởi động app với PM2
echo "▶️  Khởi động app với PM2..."
# Nest build đang xuất file vào dist/src/main.js (theo cấu trúc dist hiện tại)
pm2 start dist/src/main.js --name be-server

# Lưu cấu hình PM2
pm2 save

# Thiết lập PM2 khởi động cùng hệ thống
pm2 startup || echo "⚠️  Cần chạy lệnh được hiển thị ở trên để thiết lập startup"

echo "✅ Deploy thành công!"
echo "📊 Kiểm tra status: pm2 status"
echo "📝 Xem logs: pm2 logs be-server"
echo "🔄 Restart: pm2 restart be-server"

