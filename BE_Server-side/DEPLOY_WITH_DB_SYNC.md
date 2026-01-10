# 🚀 Deploy Và Đồng Bộ Database

## ⚠️ Quan Trọng

**Push code lên Git KHÔNG tự động đồng bộ database!**

Database trên server là riêng biệt và cần chạy migrations thủ công sau mỗi lần deploy.

## 📋 Quy Trình Deploy Đúng

### Bước 1: Push Code Lên Git
```bash
git add .
git commit -m "your changes"
git push origin main
```

### Bước 2: SSH Vào Server Và Pull Code
```bash
ssh root@159.223.61.25
cd /var/web/Web_Technology/BE_Server-side
git pull origin main
```

### Bước 3: Đồng Bộ Database Schema
```bash
# Option 1: Dùng migrations (recommended)
npx prisma migrate deploy

# Nếu migrations fail, dùng db push
npx prisma db push --accept-data-loss

# Generate Prisma Client
npx prisma generate
```

### Bước 4: Build Và Restart App
```bash
npm install
npm run build
pm2 restart be-server
```

## 🔄 Script Tự Động

### Cách 1: Dùng Script Deploy Có Sẵn
```bash
cd /var/web/Web_Technology/BE_Server-side
bash deploy.sh
```

Script này sẽ tự động:
- Pull code
- Install dependencies
- Build project
- **Đồng bộ database schema**
- Generate Prisma Client
- Restart PM2

### Cách 2: Chỉ Đồng Bộ Database
```bash
cd /var/web/Web_Technology/BE_Server-side
bash sync-db-after-deploy.sh
```

## 📝 Lưu Ý

1. **Luôn chạy migrations sau khi pull code mới**
2. **Kiểm tra `.env` file có đúng DATABASE_URL không**
3. **Backup database trước khi chạy migrations quan trọng**
4. **Dùng `prisma migrate deploy` cho production (an toàn hơn)**
5. **Dùng `prisma db push` chỉ khi migrations không work**

## 🔍 Kiểm Tra Schema

```bash
# Xem migration status
npx prisma migrate status

# Xem schema hiện tại
npx prisma db pull
```

## ⚡ Quick Deploy

Copy và paste vào SSH terminal:

```bash
cd /var/web/Web_Technology/BE_Server-side && \
git pull origin main && \
npm install && \
npx prisma generate && \
npx prisma migrate deploy || npx prisma db push --accept-data-loss && \
npm run build && \
pm2 restart be-server
```
