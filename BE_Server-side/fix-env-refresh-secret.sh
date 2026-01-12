#!/bin/bash
# Script để fix lỗi REFRESH_SECRET - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🔧 Fixing REFRESH_SECRET environment variable..."
echo ""

# Backup .env
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up .env"
fi

# Kiểm tra và thêm REFRESH_SECRET (code đang tìm biến này)
if ! grep -q "^REFRESH_SECRET" .env; then
    echo "REFRESH_SECRET=\"Long1204@\"" >> .env
    echo "✅ Added REFRESH_SECRET"
else
    echo "✅ REFRESH_SECRET already exists"
    # Kiểm tra xem có giá trị không
    if grep -q "REFRESH_SECRET=\"\"" .env || grep -q "^REFRESH_SECRET=$" .env; then
        sed -i 's|^REFRESH_SECRET=.*|REFRESH_SECRET="Long1204@"|' .env
        echo "✅ Updated REFRESH_SECRET value"
    fi
fi

# Kiểm tra và thêm JWT_REFRESH_SECRET (nếu cần)
if ! grep -q "^JWT_REFRESH_SECRET" .env; then
    echo "JWT_REFRESH_SECRET=\"Long1204@\"" >> .env
    echo "✅ Added JWT_REFRESH_SECRET"
fi

# Kiểm tra JWT_SECRET
if ! grep -q "JWT_SECRET" .env; then
    echo "JWT_SECRET=\"Long1204@\"" >> .env
    echo "✅ Added JWT_SECRET"
fi

echo ""
echo "📋 Current JWT variables:"
grep -E "JWT_SECRET|JWT_REFRESH_SECRET" .env

echo ""
echo "🔄 Restarting server..."
pm2 restart be-server

echo ""
echo "✅ Done! Check logs: pm2 logs be-server"
