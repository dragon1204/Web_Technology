# 🔑 Lấy Password Database

Database đã được tạo thành công nhưng password không được hiển thị. Hãy chạy script sau để reset và lấy password:

## Cách 1: Chạy Script Tự Động

SSH vào server và chạy:

```bash
ssh root@159.223.61.25
```

Sau đó copy và paste toàn bộ nội dung file `get-password-now.sh` vào terminal.

## Cách 2: Chạy Thủ Công

```bash
# SSH vào server
ssh root@159.223.61.25

# Reset password
sudo -u postgres psql <<EOF
ALTER USER webtech_user WITH PASSWORD 'your_new_password_here';
EOF

# Hoặc để script tự generate:
NEW_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
sudo -u postgres psql -c "ALTER USER webtech_user WITH PASSWORD '$NEW_PASSWORD';"
echo "Password: $NEW_PASSWORD"
```

## Cách 3: Xem Password Từ File (Nếu đã lưu)

```bash
cat /root/db_credentials.txt
```

## Sau Khi Có Password

Cập nhật file `.env` trên server:

```bash
cd /var/web/Web_Technology/BE_Server-side
nano .env
```

Thêm hoặc cập nhật:
```
DATABASE_URL="postgresql://webtech_user:YOUR_PASSWORD@localhost:5432/web_technology?schema=public"
```

## Test Kết Nối

```bash
psql -U webtech_user -d web_technology -h localhost
# Nhập password khi được hỏi
```
