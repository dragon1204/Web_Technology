#!/bin/bash

# Script để config .env trên server

PROJECT_DIR="/var/web/Web_Technology/BE_Server-side"
ENV_FILE="$PROJECT_DIR/.env"

echo "📁 Đang vào thư mục project..."
cd "$PROJECT_DIR" || exit 1

echo ""
echo "🔍 Kiểm tra file .env hiện tại..."
if [ -f "$ENV_FILE" ]; then
    echo "✅ File .env đã tồn tại"
    echo ""
    echo "📋 Nội dung hiện tại:"
    echo "----------------------------------------"
    cat "$ENV_FILE"
    echo "----------------------------------------"
else
    echo "⚠️ File .env chưa tồn tại, sẽ tạo mới"
fi

echo ""
echo "📝 Các biến môi trường cần thiết:"
echo ""
echo "1. DATABASE_URL - Connection string đến database"
echo "2. JWT_SECRET - Secret key cho JWT token"
echo "3. JWT_REFRESH_SECRET - Secret key cho refresh token (optional)"
echo "4. GOOGLE_CLIENT_ID - Google OAuth Client ID (optional)"
echo "5. GOOGLE_CLIENT_SECRET - Google OAuth Client Secret (optional)"
echo "6. MQTT_URL - MQTT broker URL"
echo "7. MQTT_USERNAME - MQTT username (optional)"
echo "8. MQTT_PASSWORD - MQTT password (optional)"
echo "9. PORT - Port để chạy server (default: 3000)"
echo "10. CORS_ORIGIN - CORS allowed origins (optional)"
echo "11. NODE_ENV - Environment (development/production)"
echo ""

echo "💡 Bạn có muốn chỉnh sửa file .env? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "📝 Mở file .env để chỉnh sửa..."
    echo "   Sử dụng: nano $ENV_FILE"
    echo "   Hoặc: vi $ENV_FILE"
    echo ""
    echo "   Sau khi chỉnh sửa, nhấn Ctrl+X, sau đó Y để lưu"
    echo ""
    echo "   Bạn muốn mở bằng editor nào? (nano/vi/skip)"
    read -r editor
    
    case $editor in
        nano)
            nano "$ENV_FILE"
            ;;
        vi)
            vi "$ENV_FILE"
            ;;
        *)
            echo "⚠️ Bỏ qua chỉnh sửa"
            ;;
    esac
fi

echo ""
echo "✅ Hoàn tất!"
echo ""
echo "📋 Kiểm tra lại file .env:"
cat "$ENV_FILE"

echo ""
echo "🔄 Sau khi cấu hình xong, restart PM2:"
echo "   pm2 restart be-server"

