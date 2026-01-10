# Lệnh SSH và Các Bước Fix Lỗi Trên Server

## 🔐 Thông Tin Server
- **IP:** 159.223.61.25
- **Username:** root
- **Password:** 8dee5a15756d8f73d03b73fb83

## ⚠️ Lưu Ý Quan Trọng

Nếu gặp lỗi **"Permission denied (publickey,password)"**, xem file `SSH_TROUBLESHOOTING.md` để fix.

## 📝 Lệnh SSH

### Trên Windows (PowerShell hoặc CMD):
```bash
ssh root@159.223.61.25
```

Khi được hỏi password, nhập: `8dee5a15756d8f73d03b73fb83`

### Trên Linux/Mac:
```bash
ssh root@159.223.61.25
```

Khi được hỏi password, nhập: `8dee5a15756d8f73d03b73fb83`

### Hoặc dùng script:
```bash
# Windows PowerShell
.\ssh-to-server.ps1

# Linux/Mac
chmod +x ssh-to-server.sh
./ssh-to-server.sh
```

---

## 🚀 Các Bước Sau Khi SSH Vào Server

### Bước 1: Tìm Thư Mục Project
```bash
# Tìm thư mục project (thường là BE_Server-side hoặc tên tương tự)
find / -name "BE_Server-side" -type d 2>/dev/null
# hoặc
find /home -name "BE_Server-side" -type d 2>/dev/null
# hoặc
find /var/www -name "BE_Server-side" -type d 2>/dev/null

# Di chuyển đến thư mục project
cd /path/to/BE_Server-side
```

### Bước 2: Pull Code Mới Nhất
```bash
# Kiểm tra git status
git status

# Pull code mới nhất
git pull origin main
# hoặc branch của bạn
git pull origin master
git pull origin develop
```

### Bước 3: Xóa Folder Sensor Nếu Còn Tồn Tại
```bash
# Kiểm tra xem folder có tồn tại không
ls -la src/modules/ | grep sensor

# Nếu có, xóa nó
rm -rf src/modules/sensor

# Xác nhận đã xóa
ls -la src/modules/ | grep sensor
# Kết quả mong đợi: không có output
```

### Bước 4: Xóa Dist và Cache
```bash
# Xóa dist folder
rm -rf dist

# Xóa cache
rm -rf node_modules/.cache

# Xóa .next cache nếu có
rm -rf .next
```

### Bước 5: Reinstall Dependencies (Nếu Cần)
```bash
# Kiểm tra node_modules
ls -la node_modules | head -5

# Nếu có vấn đề, reinstall
rm -rf node_modules package-lock.json
npm install
```

### Bước 6: Generate Prisma Client
```bash
# Generate Prisma client
npx prisma generate

# Kiểm tra kết quả
echo $?
# Kết quả mong đợi: 0 (thành công)
```

### Bước 7: Build Project
```bash
# Build project
npm run build

# Kiểm tra lỗi
npm run build 2>&1 | grep -i error
# Kết quả mong đợi: không có output (không có lỗi)
```

### Bước 8: Restart Server
```bash
# Kiểm tra xem server đang chạy bằng gì
ps aux | grep node
pm2 list
systemctl status your-service-name

# Restart với PM2
pm2 restart all
# hoặc
pm2 restart your-app-name

# Restart với systemd
sudo systemctl restart your-service-name

# Hoặc kill và start lại
pkill -f "node.*nest"
npm run start:prod
```

---

## ✅ Script Tự Động (Copy và Paste)

```bash
#!/bin/bash

# Di chuyển đến project folder (THAY ĐỔI PATH NÀY)
cd /path/to/BE_Server-side

# Pull code mới nhất
git pull origin main

# Xóa folder sensor
rm -rf src/modules/sensor

# Xóa dist và cache
rm -rf dist node_modules/.cache

# Generate Prisma
npx prisma generate

# Build project
npm run build

# Restart với PM2
pm2 restart all

echo "✅ Hoàn tất!"
```

---

## 🔍 Kiểm Tra Sau Khi Fix

### Kiểm Tra Build Thành Công
```bash
# Kiểm tra dist folder đã được tạo
ls -la dist/

# Kiểm tra không có lỗi TypeScript
npm run build 2>&1 | grep -i "error\|failed"
```

### Kiểm Tra Server Đang Chạy
```bash
# Với PM2
pm2 status
pm2 logs --lines 50

# Với systemd
sudo systemctl status your-service-name
sudo journalctl -u your-service-name -n 50
```

### Kiểm Tra Port Đang Listen
```bash
# Kiểm tra port 3000 (hoặc port của bạn)
netstat -tuln | grep 3000
# hoặc
ss -tuln | grep 3000
```

---

## 🐛 Troubleshooting

### Nếu SSH bị từ chối:
```bash
# Kiểm tra firewall
sudo ufw status
sudo ufw allow 22

# Kiểm tra SSH service
sudo systemctl status ssh
sudo systemctl start ssh
```

### Nếu git pull fails:
```bash
# Kiểm tra git remote
git remote -v

# Reset và pull lại
git fetch origin
git reset --hard origin/main
```

### Nếu npm install fails:
```bash
# Clear npm cache
npm cache clean --force

# Kiểm tra Node version
node -v
npm -v

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Nếu Prisma generate fails:
```bash
# Kiểm tra .env file
cat .env | grep DATABASE_URL

# Generate với schema cụ thể
npx prisma generate --schema=./prisma/schema.prisma
```

---

## 📞 Lưu Ý Quan Trọng

1. **Backup trước khi xóa:**
   ```bash
   cp -r src/modules/sensor src/modules/sensor.backup
   ```

2. **Kiểm tra disk space:**
   ```bash
   df -h
   ```

3. **Kiểm tra memory:**
   ```bash
   free -h
   ```

4. **Xem logs real-time:**
   ```bash
   # PM2
   pm2 logs --lines 100
   
   # systemd
   sudo journalctl -u your-service-name -f
   ```

---

## 🎯 Quick Start - Copy Paste Tất Cả

Sau khi SSH vào server, chạy các lệnh sau (copy từng block):

### Block 1: Tìm và vào thư mục project
```bash
# Tìm thư mục project
find /home -name "BE_Server-side" -type d 2>/dev/null
find /var/www -name "BE_Server-side" -type d 2>/dev/null
find /root -name "BE_Server-side" -type d 2>/dev/null

# Vào thư mục (THAY ĐỔI PATH)
cd /root/BE_Server-side
# hoặc
cd /home/ubuntu/BE_Server-side
# hoặc
cd /var/www/BE_Server-side
```

### Block 2: Pull code và cleanup
```bash
git pull origin main
rm -rf src/modules/sensor
rm -rf dist node_modules/.cache
```

### Block 3: Generate và build
```bash
npx prisma generate
npm run build
```

### Block 4: Restart server
```bash
# Nếu dùng PM2
pm2 restart all
pm2 logs --lines 50

# Hoặc nếu chạy trực tiếp
npm run start:prod
```

---

## 📋 Checklist Nhanh

- [ ] SSH vào server: `ssh root@159.223.61.25`
- [ ] Tìm thư mục project
- [ ] `cd` vào thư mục project
- [ ] `git pull origin main`
- [ ] `rm -rf src/modules/sensor`
- [ ] `rm -rf dist node_modules/.cache`
- [ ] `npx prisma generate`
- [ ] `npm run build`
- [ ] `pm2 restart all` hoặc restart service
- [ ] Kiểm tra logs: `pm2 logs` hoặc `journalctl -u service-name -f`

