#!/bin/bash

# Script để verify PayOS setup và restart backend

echo "🔍 Kiểm tra PayOS environment variables..."
echo ""

# Kiểm tra các biến trong .env
if grep -q "PAYOS_CLIENT_ID" .env && grep -q "PAYOS_API_KEY" .env && grep -q "PAYOS_CHECKSUM_KEY" .env; then
    echo "✅ PayOS variables đã được cấu hình trong .env"
    echo ""
    echo "📋 Giá trị hiện tại:"
    grep "PAYOS" .env | sed 's/=.*/=***/'  # Ẩn giá trị thực tế
    echo ""
    
    # Kiểm tra xem có giá trị placeholder không
    if grep -q "your_payos" .env; then
        echo "⚠️  CẢNH BÁO: Vẫn còn giá trị placeholder!"
        echo "   Vui lòng thay thế bằng credentials thực tế từ PayOS Dashboard"
        exit 1
    fi
    
    echo "✅ PayOS credentials đã được cấu hình đúng"
    echo ""
    echo "🔄 Đang restart backend..."
    echo ""
    
    # Restart với PM2 nếu có
    if command -v pm2 &> /dev/null; then
        echo "📦 Sử dụng PM2 để restart..."
        pm2 restart backend || pm2 restart all
        echo ""
        echo "⏳ Đợi 5 giây để backend khởi động..."
        sleep 5
        echo ""
        echo "📋 Kiểm tra logs để xác nhận PayOS service đã khởi tạo:"
        pm2 logs backend --lines 20 --nostream | grep -i payos || echo "   (Không thấy log PayOS, có thể cần xem toàn bộ logs)"
    else
        echo "⚠️  PM2 không được cài đặt"
        echo "   Vui lòng restart backend thủ công:"
        echo "   npm run start:prod"
    fi
    
    echo ""
    echo "✅ Hoàn tất!"
    echo ""
    echo "💡 Để xem logs chi tiết:"
    echo "   pm2 logs backend"
    echo ""
    echo "🔍 Tìm dòng này trong logs để xác nhận:"
    echo "   ✅ PayOS service initialized successfully"
    
else
    echo "❌ PayOS variables chưa được cấu hình đầy đủ"
    echo "   Vui lòng thêm các biến sau vào file .env:"
    echo "   - PAYOS_CLIENT_ID"
    echo "   - PAYOS_API_KEY"
    echo "   - PAYOS_CHECKSUM_KEY"
    exit 1
fi
