# 📋 Template File .env Cho Server

## 🔐 Các Biến Môi Trường Cần Thiết

Copy nội dung sau vào file `.env` trên server:

```env
# ============================================
# Database Configuration
# ============================================
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Ví dụ với Neon:
# DATABASE_URL="postgresql://neondb_owner:password@ep-xxx-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# ============================================
# JWT Configuration
# ============================================
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# ============================================
# Google OAuth (Optional)
# ============================================
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ============================================
# MQTT Configuration (Cho IoT Devices)
# ============================================
MQTT_URL="mqtt://broker-url:1883"
# hoặc với SSL:
# MQTT_URL="mqtts://broker-url:8883"

MQTT_USERNAME="mqtt-username"
MQTT_PASSWORD="mqtt-password"

# ============================================
# Server Configuration
# ============================================
PORT=3000
NODE_ENV=production

# ============================================
# CORS Configuration (Optional)
# ============================================
# Cho phép một origin:
# CORS_ORIGIN="https://yourdomain.com"

# Cho phép nhiều origins (phân cách bằng dấu phẩy):
# CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

# Development (mặc định cho phép localhost:3000 và localhost:3001):
# Không cần set CORS_ORIGIN
```

## 📝 Hướng Dẫn Cấu Hình Trên Server

### Bước 1: Vào thư mục project
```bash
cd /var/web/Web_Technology/BE_Server-side
```

### Bước 2: Tạo hoặc chỉnh sửa file .env
```bash
nano .env
```

### Bước 3: Copy template trên vào file .env và điền thông tin

### Bước 4: Lưu file (nếu dùng nano: Ctrl+X, sau đó Y, Enter)

### Bước 5: Kiểm tra file .env
```bash
cat .env
```

### Bước 6: Restart PM2 để áp dụng thay đổi
```bash
pm2 restart be-server
pm2 logs be-server --lines 30
```

## ⚠️ Lưu Ý Quan Trọng

1. **Không commit file .env lên git** - File này chứa thông tin nhạy cảm
2. **Đổi tất cả các giá trị mặc định** - Đặc biệt là JWT_SECRET
3. **Kiểm tra DATABASE_URL** - Đảm bảo không có dấu ngoặc kép thừa hoặc khoảng trắng
4. **MQTT_URL** - Nếu không dùng MQTT, có thể để trống hoặc comment lại
5. **CORS_ORIGIN** - Chỉ định rõ ràng các domain được phép truy cập

## 🔍 Kiểm Tra Cấu Hình

### Kiểm tra biến môi trường đã load:
```bash
pm2 env be-server
```

### Kiểm tra logs để xem có lỗi config không:
```bash
pm2 logs be-server --lines 50
```

### Test kết nối database:
```bash
cd /var/web/Web_Technology/BE_Server-side
npx prisma db pull
```

### Test MQTT connection (nếu có):
```bash
# Xem logs để kiểm tra "MQTT Connected to Broker"
pm2 logs be-server | grep MQTT
```

