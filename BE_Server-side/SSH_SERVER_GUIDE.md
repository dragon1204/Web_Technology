# Hướng Dẫn SSH Vào Server và Fix Lỗi

## 📋 Mục Lục
1. [SSH vào Server](#ssh-vào-server)
2. [Các Lệnh Cần Chạy](#các-lệnh-cần-chạy)
3. [Kiểm Tra và Fix Lỗi](#kiểm-tra-và-fix-lỗi)
4. [Troubleshooting](#troubleshooting)

---

## 🔐 SSH Vào Server

### Cách 1: SSH với Username và IP
```bash
ssh username@server_ip
```

**Ví dụ:**
```bash
ssh root@192.168.1.100
# hoặc
ssh ubuntu@your-server.com
```

### Cách 2: SSH với Port Tùy Chỉnh
```bash
ssh -p PORT_NUMBER username@server_ip
```

**Ví dụ:**
```bash
ssh -p 2222 root@192.168.1.100
```

### Cách 3: SSH với Private Key
```bash
ssh -i /path/to/private_key username@server_ip
```

**Ví dụ:**
```bash
ssh -i ~/.ssh/id_rsa root@192.168.1.100
```

### Cách 4: SSH với Config File (Khuyên dùng)
Tạo file `~/.ssh/config` trên máy local:

```bash
Host myserver
    HostName your-server-ip-or-domain
    User your-username
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

Sau đó chỉ cần chạy:
```bash
ssh myserver
```

---

## 📍 Sau Khi SSH Vào Server

### 1. Di Chuyển Đến Thư Mục Project
```bash
cd /path/to/your/project
# Ví dụ:
cd /var/www/backend
# hoặc
cd ~/BE_Server-side
```

### 2. Kiểm Tra Git Status
```bash
git status
```

### 3. Pull Code Mới Nhất (Nếu Cần)
```bash
git pull origin main
# hoặc
git pull origin master
# hoặc branch của bạn
git pull origin your-branch-name
```

---

## 🔧 Các Lệnh Cần Chạy Để Fix Lỗi

### Bước 1: Xóa Folder Sensor Nếu Còn Tồn Tại
```bash
# Kiểm tra xem folder có tồn tại không
ls -la src/modules/ | grep sensor

# Nếu có, xóa nó
rm -rf src/modules/sensor
```

### Bước 2: Xóa Dist và Cache
```bash
# Xóa dist folder
rm -rf dist

# Xóa TypeScript cache
rm -rf node_modules/.cache

# Xóa .next cache (nếu có)
rm -rf .next
```

### Bước 3: Kiểm Tra Node Modules
```bash
# Nếu có vấn đề với dependencies, reinstall
rm -rf node_modules package-lock.json
npm install
```

### Bước 4: Generate Prisma Client
```bash
# Generate Prisma client lại
npx prisma generate
```

### Bước 5: Chạy Migrations (Nếu Cần)
```bash
# Kiểm tra migrations
npx prisma migrate status

# Chạy migrations nếu cần
npx prisma migrate deploy
# hoặc
npx prisma migrate dev
```

### Bước 6: Build Project
```bash
# Build project
npm run build

# Kiểm tra lỗi
npm run build 2>&1 | grep error
```

### Bước 7: Restart Server
```bash
# Nếu dùng PM2
pm2 restart all
# hoặc
pm2 restart your-app-name

# Nếu dùng systemd
sudo systemctl restart your-service-name

# Nếu chạy trực tiếp
npm run start:prod
# hoặc
npm run start:dev
```

---

## ✅ Kiểm Tra và Fix Lỗi

### Kiểm Tra Các File Đã Được Fix

#### 1. Kiểm Tra prisma/seed.ts
```bash
# Kiểm tra xem có area, location, description không
grep -n "area\|location\|description" prisma/seed.ts | grep -v "vegetable\|report"
```

**Kết quả mong đợi:** Không có kết quả (hoặc chỉ có trong vegetable/report)

#### 2. Kiểm Tra alert-rule.service.ts
```bash
# Kiểm tra xem có sensor trong include không
grep -A 5 "include:" src/modules/alert/alert-rule.service.ts | grep sensor
```

**Kết quả mong đợi:** Không có kết quả

#### 3. Kiểm Tra alert.service.ts
```bash
# Kiểm tra xem có sensor trong include không
grep -A 10 "include:" src/modules/alert/alert.service.ts | grep sensor
```

**Kết quả mong đợi:** Không có kết quả

#### 4. Kiểm Tra analytics.service.ts
```bash
# Kiểm tra xem có prisma.sensor không
grep -n "prisma\.sensor" src/modules/analytics/analytics.service.ts
```

**Kết quả mong đợi:** Không có kết quả

#### 5. Kiểm Tra Folder Sensor
```bash
# Kiểm tra xem folder sensor có tồn tại không
test -d src/modules/sensor && echo "Folder sensor tồn tại - CẦN XÓA!" || echo "Folder sensor không tồn tại - OK"
```

**Kết quả mong đợi:** "Folder sensor không tồn tại - OK"

---

## 🐛 Troubleshooting

### Lỗi: Permission Denied khi SSH
```bash
# Kiểm tra quyền của private key
chmod 600 ~/.ssh/id_rsa

# Kiểm tra quyền của .ssh folder
chmod 700 ~/.ssh
```

### Lỗi: Connection Refused
- Kiểm tra firewall: `sudo ufw status`
- Kiểm tra SSH service: `sudo systemctl status ssh`
- Kiểm tra port: `netstat -tuln | grep 22`

### Lỗi: Host Key Verification Failed
```bash
# Xóa old host key
ssh-keygen -R server_ip_or_hostname
```

### Lỗi: npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: Prisma generate fails
```bash
# Kiểm tra DATABASE_URL trong .env
cat .env | grep DATABASE_URL

# Generate lại
npx prisma generate --schema=./prisma/schema.prisma
```

### Lỗi: Build fails với TypeScript errors
```bash
# Xóa dist và rebuild
rm -rf dist
npm run build

# Nếu vẫn lỗi, kiểm tra TypeScript version
npx tsc --version

# Reinstall TypeScript
npm install typescript@latest --save-dev
```

---

## 📝 Checklist Hoàn Chỉnh

Sau khi SSH vào server, chạy các lệnh sau theo thứ tự:

```bash
# ✅ 1. Di chuyển đến project folder
cd /path/to/your/project

# ✅ 2. Pull code mới nhất
git pull origin main

# ✅ 3. Xóa folder sensor nếu có
rm -rf src/modules/sensor

# ✅ 4. Xóa dist và cache
rm -rf dist node_modules/.cache

# ✅ 5. Reinstall dependencies (nếu cần)
# rm -rf node_modules package-lock.json
# npm install

# ✅ 6. Generate Prisma
npx prisma generate

# ✅ 7. Run migrations (nếu cần)
# npx prisma migrate deploy

# ✅ 8. Build project
npm run build

# ✅ 9. Kiểm tra lỗi
npm run build 2>&1 | grep -i error

# ✅ 10. Restart server
pm2 restart all
# hoặc
sudo systemctl restart your-service-name
```

---

## 🔍 Kiểm Tra Logs Sau Khi Restart

### Nếu dùng PM2:
```bash
# Xem logs
pm2 logs

# Xem logs của app cụ thể
pm2 logs your-app-name

# Xem status
pm2 status
```

### Nếu dùng systemd:
```bash
# Xem logs
sudo journalctl -u your-service-name -f

# Xem status
sudo systemctl status your-service-name
```

### Nếu chạy trực tiếp:
```bash
# Logs sẽ hiển thị trực tiếp trong terminal
npm run start:prod
```

---

## 💡 Tips

1. **Luôn backup trước khi xóa:**
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

4. **Kiểm tra process đang chạy:**
   ```bash
   ps aux | grep node
   ```

5. **Tạo screen/tmux session để chạy lâu dài:**
   ```bash
   # Với screen
   screen -S backend
   npm run start:dev
   # Detach: Ctrl+A, D
   # Reattach: screen -r backend
   
   # Với tmux
   tmux new -s backend
   npm run start:dev
   # Detach: Ctrl+B, D
   # Reattach: tmux attach -t backend
   ```

---

## 📞 Nếu Vẫn Gặp Vấn Đề

1. Kiểm tra file `.env` có đầy đủ biến môi trường không
2. Kiểm tra database connection
3. Kiểm tra logs chi tiết
4. Kiểm tra version của Node.js và npm: `node -v` và `npm -v`

