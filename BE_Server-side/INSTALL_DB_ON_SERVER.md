# 🗄️ Hướng Dẫn Cài Đặt Database Trên Server

## Thông tin Server
- **SSH Host**: 159.223.61.25
- **SSH User**: root
- **SSH Password**: manhNPC7524web
- **Remote Path**: /var/web/Web_Technology/BE_Server-side

## Cách 1: Chạy Script Tự Động (Khuyến nghị)

### Trên Windows (PowerShell hoặc Git Bash):

```bash
# Kết nối SSH và chạy script
ssh root@159.223.61.25

# Sau khi kết nối, chạy các lệnh sau:
cd /var/web/Web_Technology/BE_Server-side
mkdir -p /var/web/Web_Technology/BE_Server-side
```

### Upload và chạy script:

**Option 1: Sử dụng SCP (nếu có Git Bash hoặc WSL):**
```bash
# Upload file setup-db-remote.sh
scp setup-db-remote.sh root@159.223.61.25:/var/web/Web_Technology/BE_Server-side/

# SSH vào server
ssh root@159.223.61.25

# Chạy script
cd /var/web/Web_Technology/BE_Server-side
chmod +x setup-db-remote.sh
./setup-db-remote.sh
```

**Option 2: Copy script trực tiếp qua SSH:**
```bash
# SSH vào server
ssh root@159.223.61.25

# Tạo file script
cat > /var/web/Web_Technology/BE_Server-side/setup-db-remote.sh << 'SCRIPT_END'
[paste nội dung của setup-db-remote.sh vào đây]
SCRIPT_END

# Chạy script
chmod +x /var/web/Web_Technology/BE_Server-side/setup-db-remote.sh
/var/web/Web_Technology/BE_Server-side/setup-db-remote.sh
```

## Cách 2: Chạy Thủ Công

### Bước 1: Kết nối SSH
```bash
ssh root@159.223.61.25
# Password: manhNPC7524web
```

### Bước 2: Cài đặt PostgreSQL
```bash
# Update package list
apt update -y

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Start và enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql
```

### Bước 3: Tạo Database và User
```bash
# Tạo database và user
sudo -u postgres psql <<EOF
CREATE DATABASE web_technology;
CREATE USER webtech_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE web_technology TO webtech_user;
\c web_technology
GRANT ALL ON SCHEMA public TO webtech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO webtech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO webtech_user;
EOF
```

### Bước 4: Cấu hình PostgreSQL
```bash
# Lấy version PostgreSQL
PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1,2)

# Cấu hình để chấp nhận kết nối local
PG_HBA_FILE="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
sed -i 's/local   all             all                                     peer/local   all             all                                     md5/' "$PG_HBA_FILE"

# Restart PostgreSQL
systemctl restart postgresql
```

### Bước 5: Tạo file .env
```bash
cd /var/web/Web_Technology/BE_Server-side

# Tạo hoặc cập nhật .env
cat >> .env <<ENVFILE
DATABASE_URL="postgresql://webtech_user:your_secure_password_here@localhost:5432/web_technology?schema=public"
JWT_SECRET="your_jwt_secret_here"
JWT_REFRESH_SECRET="your_refresh_secret_here"
PORT=3000
NODE_ENV=production
ENVFILE

chmod 600 .env
```

### Bước 6: Chạy Migrations
```bash
cd /var/web/Web_Technology/BE_Server-side

# Generate Prisma Client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

# (Optional) Seed database
npm run db:seed
```

## Kiểm Tra Kết Nối

```bash
# Test kết nối database
psql -U webtech_user -d web_technology -h localhost

# Hoặc từ ứng dụng
cd /var/web/Web_Technology/BE_Server-side
npm run db:test
```

## Lưu Ý Bảo Mật

1. **Đổi password database** sau khi cài đặt
2. **Lưu password** vào file an toàn (chmod 600)
3. **Không commit** file .env vào git
4. **Cấu hình firewall** nếu cần truy cập từ xa

## Troubleshooting

### Lỗi kết nối database:
```bash
# Kiểm tra PostgreSQL đang chạy
systemctl status postgresql

# Kiểm tra port
netstat -tlnp | grep 5432

# Xem logs
journalctl -u postgresql -f
```

### Reset password:
```bash
sudo -u postgres psql
ALTER USER webtech_user WITH PASSWORD 'new_password';
\q
```
