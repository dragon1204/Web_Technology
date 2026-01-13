# Hướng dẫn thêm PayOS Environment Variables trên Server

## Cách 1: Sử dụng script tự động (Khuyến nghị)

### Trên Linux/Mac (SSH vào server):

```bash
# 1. Di chuyển đến thư mục project
cd /path/to/Web_Technology/BE_Server-side

# 2. Cấp quyền thực thi cho script
chmod +x add-payos-env.sh

# 3. Chạy script
./add-payos-env.sh
```

### Trên Windows Server (PowerShell):

```powershell
# 1. Di chuyển đến thư mục project
cd C:\path\to\Web_Technology\BE_Server-side

# 2. Chạy script
.\add-payos-env.ps1
```

---

## Cách 2: Thêm thủ công

### Bước 1: Tìm file .env

```bash
# Tìm file .env
find /path/to/project -name ".env" -type f

# Hoặc nếu biết đường dẫn
cd /path/to/Web_Technology/BE_Server-side
ls -la .env
```

### Bước 2: Mở file .env

```bash
# Sử dụng nano (dễ dùng)
nano BE_Server-side/.env

# Hoặc sử dụng vi
vi BE_Server-side/.env
```

### Bước 3: Thêm các dòng sau vào cuối file

```env
# PayOS Payment Configuration
# Lấy credentials từ PayOS Dashboard: https://pay.payos.vn/
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
```

### Bước 4: Lưu file

**Nano**: 
- Nhấn `Ctrl + O` để save
- Nhấn `Enter` để confirm
- Nhấn `Ctrl + X` để exit

**Vi**:
- Nhấn `i` để vào insert mode
- Thêm các dòng
- Nhấn `Esc` để thoát insert mode
- Gõ `:wq` và nhấn `Enter` để save và exit

### Bước 5: Thay thế giá trị placeholder

Sau khi thêm, bạn cần thay thế các giá trị placeholder bằng credentials thực tế từ PayOS:

```bash
# Mở lại file để chỉnh sửa
nano BE_Server-side/.env

# Tìm và thay thế:
# PAYOS_CLIENT_ID=your_payos_client_id → PAYOS_CLIENT_ID=12345678-1234-1234-1234-123456789012
# PAYOS_API_KEY=your_payos_api_key → PAYOS_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
# PAYOS_CHECKSUM_KEY=your_payos_checksum_key → PAYOS_CHECKSUM_KEY=q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5
```

### Bước 6: Restart backend

```bash
# Nếu dùng PM2
pm2 restart backend

# Hoặc nếu chạy trực tiếp
cd BE_Server-side
npm run start:prod
```

---

## Cách 3: Sử dụng echo để thêm nhanh

```bash
# Di chuyển đến thư mục
cd /path/to/Web_Technology/BE_Server-side

# Thêm PayOS variables (thay thế YOUR_VALUES bằng giá trị thực tế)
cat >> .env << EOF

# PayOS Payment Configuration
PAYOS_CLIENT_ID=YOUR_CLIENT_ID_HERE
PAYOS_API_KEY=YOUR_API_KEY_HERE
PAYOS_CHECKSUM_KEY=YOUR_CHECKSUM_KEY_HERE
EOF

# Sau đó chỉnh sửa để thay thế YOUR_VALUES
nano .env
```

---

## Kiểm tra sau khi thêm

```bash
# Kiểm tra các biến đã được thêm
grep PAYOS BE_Server-side/.env

# Kiểm tra logs khi restart backend
pm2 logs backend

# Tìm dòng này trong logs:
# ✅ PayOS service initialized successfully
```

---

## Lưu ý quan trọng

1. **Không commit file .env vào Git**
2. **Backup file .env trước khi chỉnh sửa**
3. **Đảm bảo không có khoảng trắng thừa**
4. **Không có dấu ngoặc kép quanh giá trị** (trừ khi giá trị có khoảng trắng)
5. **Restart backend sau khi thay đổi**

---

## Troubleshooting

### Lỗi: "PayOS credentials not configured"
- Kiểm tra các biến đã được thêm vào .env chưa
- Kiểm tra tên biến có đúng chính xác không (PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY)
- Kiểm tra không có khoảng trắng thừa
- Restart backend

### Lỗi: "File .env not found"
- Kiểm tra đường dẫn đúng chưa
- File .env có thể bị ẩn (bắt đầu bằng dấu chấm)
- Sử dụng `ls -la` để xem file ẩn

### Lỗi khi restart backend
- Kiểm tra syntax của file .env (không có lỗi cú pháp)
- Kiểm tra logs: `pm2 logs backend` hoặc `npm run start:prod`
