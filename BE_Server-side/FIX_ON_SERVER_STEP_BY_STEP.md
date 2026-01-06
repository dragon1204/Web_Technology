# Hướng Dẫn Fix Lỗi Trên Server - Từng Bước

## ✅ Bạn đã SSH vào server thành công!

Bây giờ làm theo các bước sau (copy từng block và chạy):

---

## 🔍 Bước 1: Tìm Thư Mục Project

```bash
# Tìm thư mục BE_Server-side
find /home -name "BE_Server-side" -type d 2>/dev/null
find /var/www -name "BE_Server-side" -type d 2>/dev/null
find /root -name "BE_Server-side" -type d 2>/dev/null
find /opt -name "BE_Server-side" -type d 2>/dev/null

# Hoặc tìm file package.json
find / -name "package.json" -path "*/BE_Server-side/*" 2>/dev/null | head -5
```

**Sau khi tìm thấy, copy đường dẫn và chạy:**
```bash
cd /path/to/BE_Server-side
# Ví dụ: cd /root/BE_Server-side
# hoặc: cd /home/ubuntu/BE_Server-side
```

---

## 📥 Bước 2: Pull Code Mới Nhất

```bash
# Kiểm tra git status
git status

# Pull code mới nhất
git pull origin main
# hoặc
git pull origin master
# hoặc branch của bạn
git pull origin develop
```

---

## 🗑️ Bước 3: Xóa Folder Sensor

```bash
# Kiểm tra xem folder có tồn tại không
ls -la src/modules/ | grep sensor

# Nếu có, backup trước (tùy chọn)
cp -r src/modules/sensor src/modules/sensor.backup 2>/dev/null

# Xóa folder sensor
rm -rf src/modules/sensor

# Xác nhận đã xóa
ls -la src/modules/ | grep sensor
# Kết quả mong đợi: không có output
```

---

## 🧹 Bước 4: Xóa Dist và Cache

```bash
# Xóa dist folder
rm -rf dist

# Xóa cache
rm -rf node_modules/.cache

# Xóa .next cache nếu có
rm -rf .next

# Kiểm tra
ls -la | grep -E "dist|cache|\.next"
```

---

## 📦 Bước 5: Reinstall Dependencies (Nếu Cần)

```bash
# Kiểm tra node_modules
ls -la node_modules | head -5

# Nếu có vấn đề hoặc muốn đảm bảo clean, reinstall
rm -rf node_modules package-lock.json
npm install
```

**Lưu ý:** Bước này có thể mất thời gian. Chỉ chạy nếu cần thiết.

---

## 🔧 Bước 6: Generate Prisma Client

```bash
# Generate Prisma client
npx prisma generate

# Kiểm tra kết quả (exit code = 0 nghĩa là thành công)
echo "Exit code: $?"
```

---

## 🏗️ Bước 7: Build Project

```bash
# Build project
npm run build

# Kiểm tra lỗi
npm run build 2>&1 | grep -i "error\|failed"

# Nếu không có output từ lệnh trên = không có lỗi ✅
```

---

## 🔄 Bước 8: Restart Server

### Kiểm tra xem server đang chạy bằng gì:

```bash
# Kiểm tra PM2
pm2 list

# Kiểm tra systemd
systemctl list-units --type=service | grep -i node
systemctl list-units --type=service | grep -i nest

# Kiểm tra process đang chạy
ps aux | grep node
ps aux | grep nest
```

### Restart theo cách phù hợp:

**Nếu dùng PM2:**
```bash
# Restart tất cả
pm2 restart all

# Hoặc restart app cụ thể
pm2 restart your-app-name

# Xem logs
pm2 logs --lines 50
```

**Nếu dùng systemd:**
```bash
# Tìm service name
systemctl list-units --type=service | grep -i node

# Restart service
sudo systemctl restart your-service-name

# Xem logs
sudo journalctl -u your-service-name -n 50 -f
```

**Nếu chạy trực tiếp:**
```bash
# Kill process cũ
pkill -f "node.*nest"
pkill -f "nest start"

# Start lại
npm run start:prod
# hoặc
npm run start:dev
```

---

## ✅ Bước 9: Kiểm Tra Server Đã Chạy

```bash
# Kiểm tra port đang listen
netstat -tuln | grep 3000
# hoặc
ss -tuln | grep 3000

# Kiểm tra process
ps aux | grep node

# Test API (từ server)
curl http://localhost:3000/api
# hoặc
curl http://localhost:3000
```

---

## 📋 Script Tự Động (Copy Tất Cả)

```bash
#!/bin/bash

# ============================================
# Script Fix Lỗi Trên Server
# ============================================

echo "🔍 Bước 1: Tìm thư mục project..."
PROJECT_PATH=$(find /home /var/www /root /opt -name "BE_Server-side" -type d 2>/dev/null | head -1)

if [ -z "$PROJECT_PATH" ]; then
    echo "❌ Không tìm thấy thư mục BE_Server-side"
    echo "Vui lòng tìm thủ công và cd vào thư mục project"
    exit 1
fi

echo "✅ Tìm thấy: $PROJECT_PATH"
cd "$PROJECT_PATH"
echo "📁 Đã vào thư mục: $(pwd)"
echo ""

echo "📥 Bước 2: Pull code mới nhất..."
git pull origin main || git pull origin master
echo ""

echo "🗑️ Bước 3: Xóa folder sensor..."
rm -rf src/modules/sensor
echo "✅ Đã xóa folder sensor"
echo ""

echo "🧹 Bước 4: Xóa dist và cache..."
rm -rf dist node_modules/.cache .next
echo "✅ Đã xóa dist và cache"
echo ""

echo "🔧 Bước 5: Generate Prisma..."
npx prisma generate
if [ $? -eq 0 ]; then
    echo "✅ Prisma generate thành công"
else
    echo "❌ Prisma generate thất bại"
    exit 1
fi
echo ""

echo "🏗️ Bước 6: Build project..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build thành công"
else
    echo "❌ Build thất bại"
    exit 1
fi
echo ""

echo "🔄 Bước 7: Restart server..."
if command -v pm2 &> /dev/null; then
    echo "Đang dùng PM2..."
    pm2 restart all
    pm2 logs --lines 20
elif systemctl list-units --type=service | grep -q node; then
    echo "Đang dùng systemd..."
    SERVICE_NAME=$(systemctl list-units --type=service | grep node | awk '{print $1}' | head -1)
    sudo systemctl restart "$SERVICE_NAME"
    sudo systemctl status "$SERVICE_NAME"
else
    echo "⚠️ Không tìm thấy PM2 hoặc systemd service"
    echo "Vui lòng restart server thủ công"
fi

echo ""
echo "✅ Hoàn tất!"
```

---

## 🎯 Quick Commands (Copy Từng Dòng)

Nếu bạn đã biết đường dẫn project, chạy các lệnh sau:

```bash
cd /root/BE_Server-side
git pull origin main
rm -rf src/modules/sensor dist node_modules/.cache
npx prisma generate
npm run build
pm2 restart all
```

---

## 🔍 Kiểm Tra Kết Quả

Sau khi restart, kiểm tra:

```bash
# Xem logs
pm2 logs --lines 50

# Hoặc
sudo journalctl -u your-service-name -n 50 -f

# Test API
curl http://localhost:3000/api
```

---

## ❓ Nếu Gặp Lỗi

### Lỗi: "command not found: pm2"
```bash
# Cài PM2
npm install -g pm2
```

### Lỗi: "Permission denied"
```bash
# Thêm sudo
sudo npm run build
sudo pm2 restart all
```

### Lỗi: "Cannot find module"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "Prisma generate failed"
```bash
# Kiểm tra .env
cat .env | grep DATABASE_URL

# Generate lại
npx prisma generate --schema=./prisma/schema.prisma
```

