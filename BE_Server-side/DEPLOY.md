# Hướng dẫn Deploy lên Server

## Server Info
- **IP**: 159.223.61.25
- **User**: root
- **Password**: manhNPC7524web

⚠️ **QUAN TRỌNG**: Đổi mật khẩu ngay sau khi đăng nhập!

---

## Bước 1: SSH vào server

```bash
ssh root@159.223.61.25
# Nhập mật khẩu: manhNPC7524web
```

**Đổi mật khẩu ngay:**
```bash
passwd
```

---

## Bước 2: Cài đặt các công cụ cần thiết

```bash
# Cập nhật hệ thống
apt update && apt upgrade -y

# Cài Git (nếu chưa có)
apt install -y git curl

# Cài Node.js LTS (20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Kiểm tra cài đặt
node -v
npm -v

# Cài PM2 (process manager)
npm install -g pm2

# Kiểm tra PM2
pm2 -v
```

---

## Bước 3: Upload code lên server

### Cách 1: Dùng Git (khuyến nghị)

```bash
cd /var
mkdir -p web && cd web

# Clone repo (thay URL bằng repo của bạn)
git clone <YOUR_REPO_URL> Web_Technology
cd Web_Technology/BE_Server-side
```

### Cách 2: Upload file trực tiếp

**Trên máy local (Windows PowerShell):**
```powershell
# Nén project
cd C:\Users\ASUS\Web_Technology
tar -czf Web_Technology.tar.gz BE_Server-side

# Upload lên server
scp Web_Technology.tar.gz root@159.223.61.25:/var/web/
```

**Trên server:**
```bash
cd /var/web
tar -xzf Web_Technology.tar.gz
cd BE_Server-side
```

---

## Bước 4: Tạo file .env

```bash
cd /var/web/Web_Technology/BE_Server-side
nano .env
```

**Nội dung file .env:**
```env
# DATABASE
DATABASE_URL="postgresql://neondb_owner:npg_iAMT6YpW9GBD@ep-billowing-truth-a19afis3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# AUTH - QUAN TRỌNG: Đổi các secret này!
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# APP
PORT=3000
NODE_ENV=production

# Google OAuth (nếu dùng)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Lưu file: `Ctrl + O`, `Enter`, `Ctrl + X`

---

## Bước 5: Deploy

### Cách 1: Dùng script tự động (khuyến nghị)

```bash
cd /var/web/Web_Technology/BE_Server-side
chmod +x deploy.sh
bash deploy.sh
```

### Cách 2: Deploy thủ công

```bash
cd /var/web/Web_Technology/BE_Server-side

# Cài dependencies
npm install

# Build project
npm run build

# Generate Prisma Client
npx prisma generate

# Chạy migrations (nếu cần)
npx prisma migrate deploy

# Khởi động với PM2
pm2 start dist/main.js --name be-server

# Hoặc dùng ecosystem file
pm2 start ecosystem.config.js

# Lưu cấu hình PM2
pm2 save

# Thiết lập PM2 khởi động cùng hệ thống
pm2 startup
# Chạy lệnh được hiển thị ở trên
```

---

## Bước 6: Cấu hình Nginx (Reverse Proxy)

```bash
# Cài Nginx
apt install -y nginx

# Tạo config
nano /etc/nginx/sites-available/be_server
```

**Nội dung config:**
```nginx
server {
    listen 80;
    server_name 159.223.61.25;

    # API endpoints
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Root và các routes khác
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Kích hoạt config:**
```bash
# Tạo symlink
ln -s /etc/nginx/sites-available/be_server /etc/nginx/sites-enabled/

# Xóa config mặc định (nếu cần)
rm /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload Nginx
systemctl reload nginx

# Khởi động Nginx
systemctl start nginx
systemctl enable nginx
```

---

## Bước 7: Cấu hình Firewall

```bash
# Cài UFW (nếu chưa có)
apt install -y ufw

# Cho phép SSH
ufw allow 22/tcp

# Cho phép HTTP
ufw allow 80/tcp

# Cho phép HTTPS (nếu cần)
ufw allow 443/tcp

# Kích hoạt firewall
ufw enable

# Kiểm tra
ufw status
```

---

## Quản lý ứng dụng

### PM2 Commands

```bash
# Xem status
pm2 status

# Xem logs
pm2 logs be-server

# Xem logs realtime
pm2 logs be-server --lines 50

# Restart app
pm2 restart be-server

# Stop app
pm2 stop be-server

# Start app
pm2 start be-server

# Xóa app khỏi PM2
pm2 delete be-server

# Xem thông tin chi tiết
pm2 info be-server

# Monitor
pm2 monit
```

### Kiểm tra ứng dụng

```bash
# Test local
curl http://localhost:3000

# Test qua Nginx
curl http://159.223.61.25

# Xem logs
pm2 logs be-server --lines 100
```

---

## Troubleshooting

### App không chạy

```bash
# Kiểm tra logs
pm2 logs be-server

# Kiểm tra port
netstat -tulpn | grep 3000

# Kiểm tra .env
cat .env
```

### Database connection error

```bash
# Test connection
npx prisma db pull

# Kiểm tra DATABASE_URL trong .env
cat .env | grep DATABASE_URL
```

### Port đã được sử dụng

```bash
# Tìm process đang dùng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

---

## Cập nhật code mới

```bash
cd /var/web/Web_Technology/BE_Server-side

# Pull code mới (nếu dùng Git)
git pull

# Hoặc upload code mới và giải nén

# Cài dependencies mới (nếu có)
npm install

# Build lại
npm run build

# Restart app
pm2 restart be-server
```

---

## Bảo mật

1. ✅ **Đổi mật khẩu root ngay**
2. ✅ **Tạo user mới thay vì dùng root**
3. ✅ **Cấu hình SSH key thay vì password**
4. ✅ **Đổi JWT_SECRET và REFRESH_SECRET**
5. ✅ **Cài SSL certificate (Let's Encrypt)**
6. ✅ **Cấu hình firewall**

---

## Liên kết hữu ích

- PM2 Docs: https://pm2.keymetrics.io/
- NestJS Deployment: https://docs.nestjs.com/recipes/deployment
- Nginx Docs: https://nginx.org/en/docs/

