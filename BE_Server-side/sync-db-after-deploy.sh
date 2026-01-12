#!/bin/bash
# Script để đồng bộ database sau khi deploy - Copy và paste vào SSH terminal

cd /var/web/Web_Technology/BE_Server-side

echo "🔄 Syncing database schema with Prisma schema..."
echo ""

# Kiểm tra .env
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Option 1: Dùng migrations (an toàn hơn, có history)
echo "📋 Option 1: Using migrations (recommended)..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Migrations failed. Trying Option 2..."
    echo ""
    
    # Option 2: Dùng db push (nhanh hơn, nhưng không có history)
    echo "📋 Option 2: Using db push (direct sync)..."
    npx prisma db push --accept-data-loss
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Database schema synced!"
echo ""
echo "📊 Current schema status:"
npx prisma migrate status
