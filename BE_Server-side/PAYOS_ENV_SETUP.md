# Hướng dẫn cấu hình PayOS Environment Variables

## Bước 1: Lấy PayOS Credentials

1. Đăng ký/Đăng nhập tài khoản tại [PayOS Dashboard](https://pay.payos.vn/)
2. Tạo ứng dụng mới hoặc chọn ứng dụng hiện có
3. Lấy các thông tin sau:
   - **Client ID**: ID ứng dụng
   - **API Key**: Key để gọi API
   - **Checksum Key**: Key để verify webhook

## Bước 2: Thêm vào file .env

Thêm các dòng sau vào file `.env` trong thư mục `BE_Server-side/`:

```env
# PayOS Payment Configuration
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
```

### Ví dụ:

```env
# PayOS Payment Configuration
PAYOS_CLIENT_ID=12345678-1234-1234-1234-123456789012
PAYOS_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
PAYOS_CHECKSUM_KEY=q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5
```

## Bước 3: Restart Backend

Sau khi thêm environment variables, cần restart backend:

```bash
# Nếu dùng PM2
pm2 restart backend

# Hoặc nếu chạy trực tiếp
npm run start:prod
```

## Bước 4: Cấu hình Webhook (Quan trọng!)

1. Đăng nhập PayOS Dashboard
2. Vào **Settings** > **Webhook**
3. Thêm Webhook URL:
   ```
   https://yourdomain.com/payment/webhook
   ```
4. Lưu lại

**Lưu ý**: 
- Webhook URL phải là **HTTPS** (không hỗ trợ HTTP)
- Webhook URL phải accessible từ internet
- Có thể dùng ngrok để test local: `ngrok http 3000`

## Kiểm tra cấu hình

Sau khi cấu hình, kiểm tra logs khi start backend:

```
✅ PayOS service initialized successfully
```

Nếu thấy warning:
```
⚠️ PayOS credentials not configured. Payment features will be disabled.
```

→ Kiểm tra lại các biến môi trường đã được set đúng chưa.

## Testing với PayOS Sandbox

Để test trong môi trường development:

1. Đăng ký tài khoản PayOS Sandbox
2. Lấy Sandbox credentials
3. Sử dụng Sandbox credentials trong `.env`
4. Test với PayOS Sandbox webhook URL

## Security Notes

- **KHÔNG** commit file `.env` vào Git
- **KHÔNG** expose API keys trong code
- Sử dụng environment variables cho tất cả credentials
- Rotate keys định kỳ
