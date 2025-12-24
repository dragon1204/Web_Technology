# 🚀 Hướng dẫn nhanh - Cài PM2 và Deploy

## Vấn đề: PM2 chưa được cài đặt

## Giải pháp: Chạy các lệnh sau trên server

```bash
# 1. Cài Node.js (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Kiểm tra
node -v
npm -v

# 2. Cài PM2
npm install -g pm2

# Kiểm tra PM2 đã cài thành công
pm2 -v

# 3. Nếu gặp lỗi permission, dùng sudo
sudo npm install -g pm2

# Hoặc cài với quyền root (bạn đang dùng root nên không cần sudo)
npm install -g pm2
```

---

## Sau khi cài PM2 xong, tiếp tục deploy:

```bash
# Di chuyển đến thư mục project
cd /var/web/Web_Technology/BE_Server-side

# Hoặc nếu chưa có code, upload code lên trước

# Chạy script deploy tự động
chmod +x deploy.sh
bash deploy.sh

# Hoặc deploy thủ công:
npm install
npm run build
npx prisma generate
pm2 start dist/main.js --name be-server
pm2 save
pm2 startup
```

---

## Kiểm tra app đang chạy:

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs be-server

# Test API
curl http://localhost:3000
```

---

## Nếu vẫn gặp lỗi với PM2:

### Kiểm tra Node.js và npm:
```bash
which node
which npm
node -v
npm -v
```

### Cài lại PM2 với verbose:
```bash
npm install -g pm2 --verbose
```

### Kiểm tra PATH:
```bash
echo $PATH
which pm2
```

### Nếu PM2 không có trong PATH:
```bash
# Tìm đường dẫn PM2
find /usr -name pm2 2>/dev/null

# Thêm vào PATH (tạm thời)
export PATH=$PATH:/usr/local/bin

# Hoặc tạo symlink
ln -s /usr/local/lib/node_modules/pm2/bin/pm2 /usr/local/bin/pm2
```

