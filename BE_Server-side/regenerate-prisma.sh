#!/bin/bash

# Script để regenerate Prisma client sau khi thêm payment fields

echo "🔄 Regenerating Prisma Client..."
echo ""

# Kiểm tra xem PM2 có đang chạy backend không
if command -v pm2 &> /dev/null; then
    echo "📋 Checking PM2 processes..."
    if pm2 list | grep -q "backend\|all"; then
        echo "⚠️  Backend is running. Stopping..."
        pm2 stop backend 2>/dev/null || pm2 stop all 2>/dev/null
        echo "✅ Backend stopped"
        echo ""
    fi
fi

# Regenerate Prisma client
echo "🔧 Running: npx prisma generate"
npx prisma generate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Prisma client regenerated successfully!"
    echo ""
    
    # Restart backend nếu có PM2
    if command -v pm2 &> /dev/null; then
        echo "🚀 Restarting backend..."
        pm2 start backend 2>/dev/null || pm2 restart all 2>/dev/null
        echo "✅ Backend restarted"
    fi
    
    echo ""
    echo "✅ Done! Payment fields should now be available in TypeScript."
else
    echo ""
    echo "❌ Failed to regenerate Prisma client"
    echo "   Please check the error above"
    exit 1
fi
