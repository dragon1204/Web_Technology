#!/bin/bash

# Script để thêm PayOS environment variables vào file .env
# Chạy script này trên server sau khi SSH vào

ENV_FILE="BE_Server-side/.env"

# Kiểm tra file .env có tồn tại không
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File .env không tìm thấy tại: $ENV_FILE"
    echo "📁 Đang tìm file .env..."
    find . -name ".env" -type f 2>/dev/null | head -5
    exit 1
fi

echo "✅ Tìm thấy file .env tại: $ENV_FILE"
echo ""

# Kiểm tra xem PayOS variables đã tồn tại chưa
if grep -q "PAYOS_CLIENT_ID" "$ENV_FILE"; then
    echo "⚠️  PayOS variables đã tồn tại trong file .env"
    echo ""
    echo "Các dòng PayOS hiện tại:"
    grep "PAYOS" "$ENV_FILE"
    echo ""
    read -p "Bạn có muốn cập nhật lại không? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Hủy bỏ."
        exit 0
    fi
    # Xóa các dòng PayOS cũ
    sed -i '/^PAYOS_/d' "$ENV_FILE"
    echo "✅ Đã xóa các PayOS variables cũ"
fi

echo ""
echo "📝 Thêm PayOS environment variables vào file .env..."
echo ""

# Thêm PayOS variables vào cuối file
cat >> "$ENV_FILE" << 'EOF'

# PayOS Payment Configuration
# Lấy credentials từ PayOS Dashboard: https://pay.payos.vn/
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
EOF

echo "✅ Đã thêm PayOS variables vào file .env"
echo ""
echo "📋 Nội dung PayOS variables vừa thêm:"
tail -4 "$ENV_FILE"
echo ""
echo "⚠️  QUAN TRỌNG: Bạn cần thay thế các giá trị placeholder:"
echo "   - PAYOS_CLIENT_ID=your_payos_client_id"
echo "   - PAYOS_API_KEY=your_payos_api_key"
echo "   - PAYOS_CHECKSUM_KEY=your_payos_checksum_key"
echo ""
echo "💡 Sử dụng lệnh sau để chỉnh sửa:"
echo "   nano $ENV_FILE"
echo "   hoặc"
echo "   vi $ENV_FILE"
echo ""
echo "🔄 Sau khi cập nhật, restart backend:"
echo "   pm2 restart backend"
echo "   hoặc"
echo "   npm run start:prod"
